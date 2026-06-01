/**
 * scheduler.ts
 *
 * Pure-TypeScript study schedule generator — no Vue dependency.
 *
 * Algorithm (ported from React DynamicSchedule / generateMonthlySchedule):
 *  1. Build a weighted discipline pool: weight = priority × (5 − knowledgeLevel)
 *     → high-priority + weak knowledge = appears more often.
 *  2. Deterministically shuffle the pool (seeded by year+month) for stable output.
 *  3. For each study day in the month, pick `subjectsPerDay` unique disciplines
 *     via a cycling pointer over the shuffled pool.
 *  4. Theory time = 75 % of dailyMinutes (100 % when SRS is off), split equally.
 *  5. If SRS is enabled, schedule review "echoes" at spaced offsets from first study:
 *       intense → 1, 3, 7 days
 *       normal  → 1, 7, 14 days
 *       soft    → 3, 10, 20 days
 *  6. Reviews are injected only on study days that don't already teach that discipline.
 */

import type { DisciplineConfig, PlannerSettings } from '../components/features/planner/PlannerSettingsPanel.vue'
import type { StudySession } from '../components/features/planner/PlannerCalendar.vue'

// ─── Internal helpers ──────────────────────────────────────────────────────────

function toKey(date: Date): string {
    const y = date.getFullYear()
    const m = String(date.getMonth() + 1).padStart(2, '0')
    const d = String(date.getDate()).padStart(2, '0')
    return `${y}-${m}-${d}`
}

/**
 * Deterministic Fisher-Yates shuffle driven by a 32-bit LCG.
 * Same seed → same order every time (stable calendar across re-renders).
 */
function seededShuffle<T>(arr: T[], seed: number): T[] {
    const a = [...arr]
    let s = seed >>> 0
    for (let i = a.length - 1; i > 0; i--) {
        s = (Math.imul(s, 1664525) + 1013904223) >>> 0
        const j = s % (i + 1)
            ;[a[i], a[j]] = [a[j], a[i]]
    }
    return a
}

function srsIntervals(rhythm: PlannerSettings['revisionRhythm']): number[] {
    if (rhythm === 'intense') return [1, 3, 7]
    if (rhythm === 'soft') return [3, 10, 20]
    return [1, 7, 14] // normal
}

// ─── Public API ────────────────────────────────────────────────────────────────

/**
 * Generate a complete monthly schedule.
 *
 * @param viewDate      Any date within the target month.
 * @param settings      Full PlannerSettings (disciplines, studyDays, SRS config…).
 * @param dailyMinutes  Override for minutes per day; defaults to settings.hoursPerDay × 60.
 * @returns             Map of "YYYY-MM-DD" → StudySession[].
 *                      Days outside studyDays are absent from the map.
 */
export function generateMonthlySchedule(
    viewDate: Date,
    settings: PlannerSettings,
    dailyMinutes?: number,
): Record<string, StudySession[]> {
    const { disciplines, studyDays, subjectsPerDay, revisionMode, revisionRhythm } = settings
    const totalMinutes = dailyMinutes ?? settings.hoursPerDay * 60

    if (!disciplines.length || !studyDays.length) return {}

    const year = viewDate.getFullYear()
    const month = viewDate.getMonth()
    const daysInMonth = new Date(year, month + 1, 0).getDate()
    const srsOn = revisionMode === 'auto' || revisionMode === 'manual'

    // ── 1. Weighted pool ───────────────────────────────────────────────────────
    //
    // Weight formula: priority (1–4) × (5 − knowledgeLevel)
    //   knowledgeLevel 1 (Iniciante)   → factor 4  (needs most work)
    //   knowledgeLevel 4 (Avançado)    → factor 1  (already solid)
    const pool: DisciplineConfig[] = []
    for (const d of disciplines) {
        const w = d.priority * (5 - d.knowledgeLevel)
        for (let i = 0; i < Math.max(1, w); i++) pool.push(d)
    }

    // ── 2. Deterministic shuffle ───────────────────────────────────────────────
    const shuffled = seededShuffle(pool, year * 100 + month + 7)
    let ptr = 0

    // ── 3. SRS review ledger ───────────────────────────────────────────────────
    // pendingReviews: dateKey → Set of discipline IDs to review that day
    const pendingReviews = new Map<string, Set<number>>()
    const intervals = srsIntervals(revisionRhythm)

    function queueReviews(disc: DisciplineConfig, studiedOnDay: number) {
        for (const offset of intervals) {
            const target = studiedOnDay + offset
            if (target > daysInMonth) continue
            const k = toKey(new Date(year, month, target))
            if (!pendingReviews.has(k)) pendingReviews.set(k, new Set())
            pendingReviews.get(k)!.add(disc.id)
        }
    }

    // ── 4. Theory sessions ─────────────────────────────────────────────────────
    const result: Record<string, StudySession[]> = {}
    let nextId = 1

    // Initial placeholder duration — the final redistribution pass (step 6)
    // will overwrite this to fill the full dailyMinutes budget.
    const perTheory = Math.max(15, Math.floor(totalMinutes / subjectsPerDay))

    for (let day = 1; day <= daysInMonth; day++) {
        const weekday = new Date(year, month, day).getDay()
        if (!studyDays.includes(weekday)) continue

        const key = toKey(new Date(year, month, day))

        // Pick unique disciplines for today
        const todayDiscs: DisciplineConfig[] = []
        const seen = new Set<number>()
        let guard = 0

        while (todayDiscs.length < subjectsPerDay && guard < shuffled.length * 3) {
            const d = shuffled[ptr % shuffled.length]
            ptr++
            guard++
            if (!seen.has(d.id)) {
                seen.add(d.id)
                todayDiscs.push(d)
                if (srsOn) queueReviews(d, day)
            }
        }

        result[key] = todayDiscs.map(d => ({
            id: nextId++,
            disciplineName: d.name,
            color: d.color,
            durationMin: perTheory,
        }))
    }

    // ── 5. Inject SRS reviews ──────────────────────────────────────────────────
    if (srsOn) {
        // Placeholder duration — step 6 will redistribute across all sessions.
        const reviewBudget = totalMinutes * 0.25

        for (const [key, discIds] of pendingReviews) {
            // ⚠️ IMPORTANT: new Date("YYYY-MM-DD") parses as UTC midnight.
            // In negative-offset timezones (e.g. UTC-3) that shifts to the
            // previous calendar day, so getDay() would return the wrong weekday.
            // Parse manually with the Date(y,m,d) constructor to stay in local time.
            const [ky, km, kd] = key.split('-').map(Number)
            const weekday = new Date(ky, km - 1, kd).getDay()
            if (!studyDays.includes(weekday)) continue   // skip non-study days


            // Resolve discipline objects (preserve original order for determinism)
            const toReview = disciplines.filter(d => discIds.has(d.id))
            if (!toReview.length) continue

            // Don't duplicate: skip if theory already covers this discipline today
            const theoryNames = new Set(
                (result[key] ?? [])
                    .filter(s => !s.disciplineName.startsWith('↻'))
                    .map(s => s.disciplineName),
            )
            const reviewDiscs = toReview.filter(d => !theoryNames.has(d.name))
            if (!reviewDiscs.length) continue

            const perReview = Math.max(15, Math.floor(reviewBudget / reviewDiscs.length))

            if (!result[key]) result[key] = []
            for (const d of reviewDiscs) {
                result[key].push({
                    id: nextId++,
                    disciplineName: `↻ ${d.name}`,
                    color: d.color,
                    durationMin: perReview,
                })
            }
        }
    }

    // ── 6. Fill all available daily minutes ──────────────────────────────────────
    //
    // Divide totalMinutes equally across every session in each study day.
    // This ensures the user's full available time is always consumed, regardless
    // of how many theory + review sessions landed on that day.
    for (const sessions of Object.values(result)) {
        if (!sessions.length) continue
        const perSession = Math.max(15, Math.floor(totalMinutes / sessions.length))
        for (const s of sessions) s.durationMin = perSession
    }

    return result
}
