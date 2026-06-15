import { ref, computed, onMounted } from 'vue'
import type { Ref, ComputedRef } from 'vue'
import type { FocusSession } from './useFocusSessions'
import type { ErrorLog } from './useErrorLogs'

// ─── Types ────────────────────────────────────────────────────────────────────
export type Period = '7d' | '30d' | '90d' | 'all'

export interface DisciplineStat { id: number; name: string; color: string; hours: number; sessions: number }
export interface DiagStat { label: string; count: number; color: string; pct: number }
export interface ErrorByDisc { name: string; color: string; total: number; resolved: number }
export interface WeekBar { label: string; hours: number }
export interface DayHeatBar { day: string; hours: number }

export const PERIOD_OPTIONS: { label: string; value: Period }[] = [
  { label: '7 dias',  value: '7d'  },
  { label: '30 dias', value: '30d' },
  { label: '90 dias', value: '90d' },
  { label: 'Tudo',    value: 'all' },
]

const DIAG_COLORS: Record<string, string> = {
  'Lacuna Teórica':   '#3b82f6',
  'Falta de Atenção': '#f97316',
  'Interpretação':    '#a855f7',
  'Pegadinha':        '#ec4899',
  'Falta de Tempo':   '#eab308',
}

const DAY_NAMES = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']

// ─── Helpers ──────────────────────────────────────────────────────────────────
function periodStart(p: Period): Date | null {
  if (p === 'all') return null
  const d = new Date()
  const days = p === '7d' ? 7 : p === '30d' ? 30 : 90
  d.setDate(d.getDate() - days)
  return d
}

export function fmtHours(h: number): string {
  if (h < 1) return `${Math.round(h * 60)}min`
  return `${h.toFixed(1)}h`
}

// ─── SVG Donut helpers ────────────────────────────────────────────────────────
export function polarToCartesian(cx: number, cy: number, r: number, angleDeg: number) {
  const rad = (angleDeg - 90) * (Math.PI / 180)
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) }
}

export function donutArc(cx: number, cy: number, r: number, startDeg: number, endDeg: number): string {
  if (endDeg - startDeg >= 360) endDeg = 359.99
  const s = polarToCartesian(cx, cy, r, startDeg)
  const e = polarToCartesian(cx, cy, r, endDeg)
  const largeArc = endDeg - startDeg > 180 ? 1 : 0
  return `M ${s.x} ${s.y} A ${r} ${r} 0 ${largeArc} 1 ${e.x} ${e.y}`
}

// ─── Composable ───────────────────────────────────────────────────────────────
export function usePerformanceStats(
  sessionsData: Ref<FocusSession[] | undefined>,
  errorsData: Ref<ErrorLog[] | undefined>,
  disciplinesData: Ref<any[] | undefined>,
) {
  const selectedPeriod = ref<Period>('30d')

  // Period filter
  function inPeriod(dateStr: string): boolean {
    const start = periodStart(selectedPeriod.value)
    if (!start) return true
    return new Date(dateStr) >= start
  }

  const sessions    = computed((): FocusSession[] => (sessionsData.value || []).filter(s => inPeriod(s.startedAt)))
  const errorLogs   = computed((): ErrorLog[]     => (errorsData.value || []).filter(e => inPeriod(e.createdAt)))
  const disciplines = computed(() => disciplinesData.value || [])

  // Tasks from localStorage
  interface Task { id: string; title: string; status: 'todo' | 'in-progress' | 'done'; createdAt: string }
  const tasks = ref<Task[]>([])
  onMounted(() => {
    try {
      const raw = localStorage.getItem('vincis_tasks')
      if (raw) tasks.value = JSON.parse(raw)
    } catch { /* ignore */ }
  })
  const doneTasks = computed(() => tasks.value.filter(t => t.status === 'done' && inPeriod(t.createdAt)))

  // ─── KPIs ─────────────────────────────────────────────────────────────────
  const totalStudySeconds  = computed(() => sessions.value.reduce((acc, s) => acc + (s.duration ?? 0), 0))
  const totalStudyHours    = computed(() => (totalStudySeconds.value / 3600).toFixed(1))
  const totalSessions      = computed(() => sessions.value.length)
  const completedSessions  = computed(() => sessions.value.filter(s => s.isCompleted).length)
  const completionRate     = computed(() => totalSessions.value ? Math.round((completedSessions.value / totalSessions.value) * 100) : 0)
  const totalErrors        = computed(() => errorLogs.value.length)
  const resolvedErrors     = computed(() => errorLogs.value.filter(e => e.isResolved).length)
  const errorResolutionRate = computed(() => totalErrors.value ? Math.round((resolvedErrors.value / totalErrors.value) * 100) : 0)
  const totalDoneTasks     = computed(() => doneTasks.value.length)
  const avgSessionMinutes  = computed(() => totalSessions.value ? Math.round(totalStudySeconds.value / totalSessions.value / 60) : 0)

  // ─── Streak ───────────────────────────────────────────────────────────────
  const studyStreak = computed(() => {
    const allSessions: FocusSession[] = sessionsData.value || []
    if (!allSessions.length) return 0
    const days = new Set(allSessions.map(s => s.startedAt.slice(0, 10)))
    const today = new Date().toISOString().slice(0, 10)
    let streak = 0
    let cursor = new Date(today)
    for (let i = 0; i < 365; i++) {
      const key = cursor.toISOString().slice(0, 10)
      if (days.has(key)) { streak++; cursor.setDate(cursor.getDate() - 1) } else break
    }
    return streak
  })

  // ─── Discipline stats ─────────────────────────────────────────────────────
  const disciplineStats = computed((): DisciplineStat[] => {
    const map = new Map<number, DisciplineStat>()
    for (const s of sessions.value) {
      const disc = disciplines.value.find((d: any) => d.id === s.disciplineId)
      if (!disc) continue
      const cur = map.get(disc.id) ?? { id: disc.id, name: disc.name, color: disc.color ?? '#6366f1', hours: 0, sessions: 0 }
      cur.hours    += (s.duration ?? 0) / 3600
      cur.sessions += 1
      map.set(disc.id, cur)
    }
    return Array.from(map.values()).sort((a, b) => b.hours - a.hours)
  })
  const maxDisciplineHours = computed(() => Math.max(...disciplineStats.value.map(d => d.hours), 0.01))

  // ─── Error diagnostics ────────────────────────────────────────────────────
  const diagStats = computed((): DiagStat[] => {
    const map = new Map<string, number>()
    for (const e of errorLogs.value) {
      const key = e.diagnostico || 'Sem diagnóstico'
      map.set(key, (map.get(key) ?? 0) + 1)
    }
    const total = errorLogs.value.length || 1
    return Array.from(map.entries())
      .sort((a, b) => b[1] - a[1])
      .map(([label, count]) => ({
        label, count,
        color: DIAG_COLORS[label] ?? '#94a3b8',
        pct: Math.round((count / total) * 100),
      }))
  })

  // ─── Errors by discipline ─────────────────────────────────────────────────
  const errorsByDiscipline = computed((): ErrorByDisc[] => {
    const map = new Map<string, ErrorByDisc>()
    for (const e of errorLogs.value) {
      const disc = e.topic?.discipline
      const key  = disc?.name ?? 'Sem disciplina'
      const col  = disc?.color ?? '#94a3b8'
      const cur  = map.get(key) ?? { name: key, color: col, total: 0, resolved: 0 }
      cur.total++
      if (e.isResolved) cur.resolved++
      map.set(key, cur)
    }
    return Array.from(map.values()).sort((a, b) => b.total - a.total).slice(0, 6)
  })

  // ─── Weekly chart (last 7 weeks) ──────────────────────────────────────────
  const weeklyChart = computed((): WeekBar[] => {
    const allSessions: FocusSession[] = sessionsData.value || []
    const bars: WeekBar[] = []
    for (let i = 6; i >= 0; i--) {
      const start = new Date(); start.setDate(start.getDate() - i * 7 - 6); start.setHours(0,0,0,0)
      const end   = new Date(); end.setDate(end.getDate() - i * 7);         end.setHours(23,59,59,999)
      const hours = allSessions
        .filter(s => { const d = new Date(s.startedAt); return d >= start && d <= end })
        .reduce((acc, s) => acc + (s.duration ?? 0) / 3600, 0)
      const label = start.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })
      bars.push({ label, hours })
    }
    return bars
  })
  const maxWeeklyHours = computed(() => Math.max(...weeklyChart.value.map(b => b.hours), 0.5))

  // ─── Day of week ──────────────────────────────────────────────────────────
  const dayOfWeekChart = computed((): DayHeatBar[] => {
    const acc: DayHeatBar[] = Array.from({ length: 7 }, (_, i) => ({ day: DAY_NAMES[i]!, hours: 0 }))
    for (const s of sessions.value) {
      const dow = new Date(s.startedAt).getDay()
      if (acc[dow]) acc[dow].hours += (s.duration ?? 0) / 3600
    }
    return acc
  })
  const maxDayHours = computed(() => Math.max(...dayOfWeekChart.value.map(d => d.hours), 0.1))

  // ─── Donut segments ───────────────────────────────────────────────────────
  const donutSegments = computed(() => {
    if (!diagStats.value.length) return []
    const total = diagStats.value.reduce((a, d) => a + d.count, 0)
    let cumPct = 0
    return diagStats.value.map(d => {
      const startDeg = cumPct * 3.6
      cumPct += (d.count / total) * 100
      const endDeg = cumPct * 3.6
      return { ...d, startDeg, endDeg }
    })
  })

  // ─── Insights ─────────────────────────────────────────────────────────────
  const topDiagnostic = computed(() => {
    return diagStats.value.length > 0 ? diagStats.value[0]?.label : null
  })

  const topErrorDiscipline = computed(() => {
    return errorsByDiscipline.value.length > 0 ? errorsByDiscipline.value[0]?.name : null
  })

  return {
    selectedPeriod,
    sessions,
    errorLogs,
    // KPIs
    totalStudyHours,
    totalSessions,
    completedSessions,
    completionRate,
    totalErrors,
    resolvedErrors,
    errorResolutionRate,
    totalDoneTasks,
    avgSessionMinutes,
    studyStreak,
    // Charts
    disciplineStats,
    maxDisciplineHours,
    diagStats,
    errorsByDiscipline,
    weeklyChart,
    maxWeeklyHours,
    dayOfWeekChart,
    maxDayHours,
    donutSegments,
    // Insights
    topDiagnostic,
    topErrorDiscipline,
  }
}
