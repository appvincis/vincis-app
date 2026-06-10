import { computed } from 'vue'
import type { Ref, ComputedRef } from 'vue'
import type { FocusSession } from './useFocusSessions'

export function useDashboardStats(focusSessions: Ref<FocusSession[] | undefined>) {
  const successRate = computed(() => {
    if (!focusSessions.value || focusSessions.value.length === 0) return 0
    const totalTarget = focusSessions.value.reduce((acc, s) => acc + s.cyclesTarget, 0)
    const totalCompleted = focusSessions.value.reduce((acc, s) => acc + s.cyclesCompleted, 0)
    return totalTarget > 0 ? Math.round((totalCompleted / totalTarget) * 100) : 0
  })

  const mediumFocusPoints = computed(() => {
    if (!focusSessions.value || focusSessions.value.length === 0) return 0
    const totalFocusSeconds = focusSessions.value.reduce((acc, s) => acc + s.focusTime, 0)
    return Math.round((totalFocusSeconds / focusSessions.value.length) / 60)
  })

  const weeklyGoalHours = computed(() => {
    try {
      const raw = localStorage.getItem('vincis_planner_settings_v2')
      if (raw) {
        const settings = JSON.parse(raw)
        if (settings.studyDays && settings.hoursPerDay) {
          return settings.studyDays.length * settings.hoursPerDay
        }
      }
    } catch {
      // Ignore error
    }
    return 24 // Fallback
  })

  const totalWeekStudyHours = computed(() => {
    if (!focusSessions.value) return 0
    const now = new Date()
    const day = now.getDay()
    const diff = now.getDate() - day + (day === 0 ? -6 : 1)
    const startOfWeek = new Date(now)
    startOfWeek.setDate(diff)
    startOfWeek.setHours(0, 0, 0, 0)

    const thisWeekSessions = focusSessions.value.filter(s => new Date(s.startedAt) >= startOfWeek)
    const totalSeconds = thisWeekSessions.reduce((acc, s) => acc + s.focusTime, 0)
    return Math.round(totalSeconds / 3600)
  })

  const weeklyProgressPercent = computed(() => {
    return Math.min(100, Math.round((totalWeekStudyHours.value / weeklyGoalHours.value) * 100))
  })

  const recentSessions = computed(() => {
    if (!focusSessions.value) return []
    return [...focusSessions.value]
      .sort((a, b) => new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime())
      .slice(0, 5)
  })

  return {
    successRate,
    mediumFocusPoints,
    weeklyGoalHours,
    totalWeekStudyHours,
    weeklyProgressPercent,
    recentSessions,
  }
}

export function formatDuration(seconds: number): string {
  if (!seconds) return '0 min'
  const mins = Math.round(seconds / 60)
  if (mins < 60) return `${mins} min`
  const h = Math.floor(mins / 60)
  const m = mins % 60
  return m > 0 ? `${h}h ${m}m` : `${h}h`
}

export function sessionStatus(session: FocusSession): 'Completo' | 'Em Andamento' | 'Pausado' {
  if (session.isCompleted) return 'Completo'
  return 'Em Andamento'
}
