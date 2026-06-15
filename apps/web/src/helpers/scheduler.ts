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
    const y = date.getUTCFullYear()
    const m = String(date.getUTCMonth() + 1).padStart(2, '0')
    const d = String(date.getUTCDate()).padStart(2, '0')
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
        const temp = a[i]!
        a[i] = a[j]!
        a[j] = temp
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
    scheduleSeed: number = 0,
): Record<string, StudySession[]> {
    const { disciplines: allDisciplines, studyDays, subjectsPerDay, revisionMode, revisionRhythm, selectedDisciplineIds } = settings
    const totalMinutes = dailyMinutes ?? settings.hoursPerDay * 60

    const disciplines = allDisciplines.filter(d => (selectedDisciplineIds || []).includes(d.id))
    if (!disciplines.length || !studyDays.length) return {}

    const year = viewDate.getFullYear()
    const month = viewDate.getMonth()
    const daysInMonth = new Date(Date.UTC(year, month + 1, 0)).getUTCDate()
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
    const shuffled = seededShuffle(pool, year * 100 + month + 7 + scheduleSeed)
    let ptr = 0

    // ── 3. Topic cursors & SRS review ledger ───────────────────────────────────
    const topicCursors: Record<number, number> = {}
    for (const d of disciplines) {
        const firstPendingIndex = (d.topics || []).findIndex(t => !t.isCompleted)
        topicCursors[d.id] = firstPendingIndex === -1 ? 0 : firstPendingIndex
    }

    // pendingReviews: dateKey → Set of discipline IDs to review that day
    const pendingReviews = new Map<string, Set<number>>()
    const intervals = srsIntervals(revisionRhythm)

    function queueReviews(disc: DisciplineConfig, studiedOnDay: number) {
        for (const offset of intervals) {
            const target = studiedOnDay + offset
            if (target > daysInMonth) continue
            const k = toKey(new Date(Date.UTC(year, month, target)))
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
        const weekday = new Date(Date.UTC(year, month, day)).getUTCDay()
        if (!studyDays.includes(weekday)) continue

        const key = toKey(new Date(Date.UTC(year, month, day)))

        // Pick unique disciplines for today
        const todayDiscs: DisciplineConfig[] = []
        const seen = new Set<number>()
        let guard = 0

        while (todayDiscs.length < subjectsPerDay && guard < shuffled.length * 3) {
            const d = shuffled[ptr % shuffled.length]!
            ptr++
            guard++
            if (!seen.has(d.id)) {
                seen.add(d.id)
                todayDiscs.push(d)
                if (srsOn) queueReviews(d, day)
            }
        }

        result[key] = todayDiscs.map(d => {
            let sessionTopicId: number | undefined = undefined
            let sessionTopicName: string | undefined = undefined

            if (d.topics && d.topics.length > 0) {
                const idx = topicCursors[d.id] ?? 0
                let foundTopic = null
                let nextIdx = idx
                while (nextIdx < d.topics.length) {
                    const t = d.topics[nextIdx]
                    if (t && !t.isCompleted) {
                        foundTopic = t
                        topicCursors[d.id] = nextIdx + 1 // Advance cursor in simulation
                        break
                    }
                    nextIdx++
                }

                if (foundTopic) {
                    sessionTopicId = foundTopic.id
                    sessionTopicName = foundTopic.name
                } else {
                    sessionTopicName = "Revisão Geral (Todos os tópicos concluídos)"
                }
            }

            return {
                id: nextId++,
                disciplineName: d.name,
                color: d.color,
                durationMin: perTheory,
                topicId: sessionTopicId,
                topicName: sessionTopicName,
                isReview: false
            }
        })
    }

    // ── 5. Inject SRS reviews ──────────────────────────────────────────────────
    if (srsOn) {
        // Placeholder duration — step 6 will redistribute across all sessions.
        const reviewBudget = totalMinutes * 0.25

        for (const [key, discIds] of pendingReviews) {
            // ⚠️ IMPORTANT: new Date(Date.UTC(y, m, d)) stays strictly in UTC.
            const [ky, km, kd] = key.split('-').map(Number) as [number, number, number]
            const weekday = new Date(Date.UTC(ky, km - 1, kd)).getUTCDay()
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

            // ⚠️ Limitar a no máximo 3 revisões por dia para evitar o "efeito bola de neve"
            const limitedReviews = reviewDiscs.slice(0, 3)

            const perReview = Math.max(15, Math.floor(reviewBudget / limitedReviews.length))

            if (!result[key]) result[key] = []
            for (const d of limitedReviews) {
                const completedTopics = (d.topics || []).filter(t => t.isCompleted)
                const reviewTopicName = completedTopics.length > 0
                    ? `Revisão: ${completedTopics.map(t => t.name).join(', ')}`
                    : 'Revisão Geral / Resolução de Questões'

                result[key].push({
                    id: nextId++,
                    disciplineName: `↻ ${d.name}`,
                    color: d.color,
                    durationMin: perReview,
                    topicId: undefined,
                    topicName: reviewTopicName,
                    isReview: true
                })
            }
        }
    }

    // ── 6. Fill all available daily minutes proportionally ───────────────────────
    //
    // Divide totalMinutes proportionally based on the discipline's weight.
    // Reviews get half the weight of a theory session.
    const disciplineWeights = new Map(disciplines.map(d => [d.name, d.priority * (5 - d.knowledgeLevel)]))

    for (const sessions of Object.values(result)) {
        if (!sessions.length) continue

        let totalWeight = 0
        const sessionWeights = new Map<typeof sessions[0], number>()

        for (const s of sessions) {
            const isReview = s.disciplineName.startsWith('↻ ')
            const rawName = isReview ? s.disciplineName.substring(2) : s.disciplineName
            const baseWeight = disciplineWeights.get(rawName) || 1
            const weight = isReview ? baseWeight * 0.5 : baseWeight
            sessionWeights.set(s, weight)
            totalWeight += weight
        }

        for (const s of sessions) {
            const w = sessionWeights.get(s)!
            const rawMinutes = totalMinutes * (w / totalWeight)
            s.durationMin = Math.max(15, Math.round(rawMinutes / 15) * 15)
        }

        // Squeeze if the sum strictly exceeds totalMinutes (prevents silent overflow)
        const dayTotal = sessions.reduce((acc, s) => acc + s.durationMin, 0)
        if (dayTotal > totalMinutes && sessions.length > 0) {
            for (const s of sessions) {
                const w = sessionWeights.get(s)!
                s.durationMin = Math.max(5, Math.round(totalMinutes * (w / totalWeight)))
            }
        }
    }

    return result
}
