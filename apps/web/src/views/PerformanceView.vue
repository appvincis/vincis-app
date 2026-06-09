<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { VSpinner } from '../components/ui'
import { useErrorLogsQuery, DIAGNOSTICO_OPTIONS, type ErrorLog } from '../hooks/useErrorLogs'
import { useFocusSessionsQuery, type FocusSession } from '../hooks/useFocusSessions'
import { useDisciplinesQuery } from '../hooks/useDisciplines'

// ─── Período ──────────────────────────────────────────────────────────────────
type Period = '7d' | '30d' | '90d' | 'all'
const selectedPeriod = ref<Period>('30d')

const periodOptions: { label: string; value: Period }[] = [
  { label: '7 dias',   value: '7d'  },
  { label: '30 dias',  value: '30d' },
  { label: '90 dias',  value: '90d' },
  { label: 'Tudo',     value: 'all' },
]

function periodStart(p: Period): Date | null {
  if (p === 'all') return null
  const d = new Date()
  const days = p === '7d' ? 7 : p === '30d' ? 30 : 90
  d.setDate(d.getDate() - days)
  return d
}

// ─── Queries ──────────────────────────────────────────────────────────────────
const { data: sessionsData, isLoading: loadingSessions } = useFocusSessionsQuery()
const { data: errorsData,   isLoading: loadingErrors   } = useErrorLogsQuery(ref({}))
const { data: disciplinesData                           } = useDisciplinesQuery()

const isLoading = computed(() => loadingSessions.value || loadingErrors.value)

// ─── Tarefas (localStorage) ───────────────────────────────────────────────────
interface Task { id: string; title: string; status: 'todo' | 'in-progress' | 'done'; createdAt: string }
const tasks = ref<Task[]>([])
onMounted(() => {
  try {
    const raw = localStorage.getItem('vincis_tasks')
    if (raw) tasks.value = JSON.parse(raw)
  } catch { /* ignore */ }
})

// ─── Filtro por período ───────────────────────────────────────────────────────
function inPeriod(dateStr: string): boolean {
  const start = periodStart(selectedPeriod.value)
  if (!start) return true
  return new Date(dateStr) >= start
}

const sessions    = computed((): FocusSession[] => (sessionsData.value  || []).filter((s: FocusSession)  => inPeriod(s.startedAt)))
const errorLogs   = computed((): ErrorLog[]     => (errorsData.value    || []).filter((e: ErrorLog)     => inPeriod(e.createdAt)))
const disciplines = computed(()                 =>  disciplinesData.value || [])
const doneTasks   = computed(()                 =>  tasks.value.filter(t => t.status === 'done' && inPeriod(t.createdAt)))

// ─── KPIs Principais ──────────────────────────────────────────────────────────
const totalStudySeconds = computed(() => sessions.value.reduce((acc, s) => acc + (s.duration ?? 0), 0))
const totalStudyHours   = computed(() => (totalStudySeconds.value / 3600).toFixed(1))
const totalSessions     = computed(() => sessions.value.length)
const completedSessions = computed(() => sessions.value.filter(s => s.isCompleted).length)
const completionRate    = computed(() => totalSessions.value ? Math.round((completedSessions.value / totalSessions.value) * 100) : 0)
const totalErrors       = computed(() => errorLogs.value.length)
const resolvedErrors    = computed(() => errorLogs.value.filter(e => e.isResolved).length)
const errorResolutionRate = computed(() => totalErrors.value ? Math.round((resolvedErrors.value / totalErrors.value) * 100) : 0)
const totalDoneTasks    = computed(() => doneTasks.value.length)

const avgSessionMinutes = computed(() => {
  if (!totalSessions.value) return 0
  return Math.round(totalStudySeconds.value / totalSessions.value / 60)
})

// ─── Streak de dias ───────────────────────────────────────────────────────────
const studyStreak = computed(() => {
  const allSessions: FocusSession[] = sessionsData.value || []
  if (!allSessions.length) return 0
  const days = new Set(allSessions.map(s => s.startedAt.slice(0, 10)))
  const sorted = Array.from(days).sort().reverse()
  const today = new Date().toISOString().slice(0, 10)
  let streak = 0
  let cursor = new Date(today)
  for (let i = 0; i < 365; i++) {
    const key = cursor.toISOString().slice(0, 10)
    if (days.has(key)) {
      streak++
      cursor.setDate(cursor.getDate() - 1)
    } else {
      break
    }
  }
  return streak
})

// ─── Horas por disciplina ─────────────────────────────────────────────────────
interface DisciplineStat { id: number; name: string; color: string; hours: number; sessions: number }

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

// ─── Diagnóstico de erros ─────────────────────────────────────────────────────
const DIAG_COLORS: Record<string, string> = {
  'Lacuna Teórica':   '#3b82f6',
  'Falta de Atenção': '#f97316',
  'Interpretação':    '#a855f7',
  'Pegadinha':        '#ec4899',
  'Falta de Tempo':   '#eab308',
}

interface DiagStat { label: string; count: number; color: string; pct: number }

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
      label,
      count,
      color: DIAG_COLORS[label] ?? '#94a3b8',
      pct: Math.round((count / total) * 100),
    }))
})

// ─── Erros por disciplina ─────────────────────────────────────────────────────
interface ErrorByDisc { name: string; color: string; total: number; resolved: number }

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

// ─── Gráfico de barras semanal (últimas 8 semanas) ────────────────────────────
interface WeekBar { label: string; hours: number }

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

// ─── Horas por dia da semana ──────────────────────────────────────────────────
const DAY_NAMES = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']
interface DayHeatBar { day: string; hours: number }

const dayOfWeekChart = computed((): DayHeatBar[] => {
  const acc = Array.from({ length: 7 }, (_, i) => ({ day: DAY_NAMES[i], hours: 0 }))
  for (const s of sessions.value) {
    const dow = new Date(s.startedAt).getDay()
    acc[dow].hours += (s.duration ?? 0) / 3600
  }
  return acc
})
const maxDayHours = computed(() => Math.max(...dayOfWeekChart.value.map(d => d.hours), 0.1))

// ─── Donut Chart (diagnóstico) ────────────────────────────────────────────────
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

function polarToCartesian(cx: number, cy: number, r: number, angleDeg: number) {
  const rad = (angleDeg - 90) * (Math.PI / 180)
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) }
}

function donutArc(cx: number, cy: number, r: number, startDeg: number, endDeg: number): string {
  if (endDeg - startDeg >= 360) endDeg = 359.99
  const s = polarToCartesian(cx, cy, r, startDeg)
  const e = polarToCartesian(cx, cy, r, endDeg)
  const largeArc = endDeg - startDeg > 180 ? 1 : 0
  return `M ${s.x} ${s.y} A ${r} ${r} 0 ${largeArc} 1 ${e.x} ${e.y}`
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function fmtHours(h: number): string {
  if (h < 1) return `${Math.round(h * 60)}min`
  return `${h.toFixed(1)}h`
}
</script>

<template>
  <div class="p-6 lg:p-8 max-w-7xl mx-auto space-y-8 animate-fade-in pb-12">

    <!-- ─── Header ─────────────────────────────────────────────────────────── -->
    <header class="flex flex-col md:flex-row md:items-end justify-between gap-4">
      <div class="space-y-2">
        <p class="font-label text-xs uppercase tracking-[0.2em] text-primary font-bold">Análise de Dados</p>
        <h2 class="text-3xl lg:text-4xl font-headline font-bold text-on-surface tracking-tight relative inline-block">
          Desempenho
          <div class="absolute -bottom-2 left-0 w-24 h-1 bg-primary/30 rounded-full"></div>
        </h2>
        <p class="text-on-surface-muted max-w-xl text-sm leading-relaxed">
          Acompanhe sua evolução, horas de estudo, tipos de erros e eficiência por disciplina.
        </p>
      </div>

      <!-- Seletor de período -->
      <div class="period-selector">
        <button
          v-for="opt in periodOptions"
          :key="opt.value"
          class="period-btn"
          :class="{ 'period-btn--active': selectedPeriod === opt.value }"
          @click="selectedPeriod = opt.value"
        >
          {{ opt.label }}
        </button>
      </div>
    </header>

    <!-- ─── Loading ────────────────────────────────────────────────────────── -->
    <div v-if="isLoading" class="flex justify-center items-center h-64">
      <VSpinner />
    </div>

    <template v-else>

      <!-- ─── KPI Cards ───────────────────────────────────────────────────── -->
      <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">

        <div class="kpi-card">
          <div class="kpi-icon kpi-icon--blue">
            <i class="pi pi-clock"></i>
          </div>
          <div>
            <p class="kpi-value">{{ totalStudyHours }}h</p>
            <p class="kpi-label">Horas Estudadas</p>
          </div>
        </div>

        <div class="kpi-card">
          <div class="kpi-icon kpi-icon--purple">
            <i class="pi pi-bolt"></i>
          </div>
          <div>
            <p class="kpi-value">{{ totalSessions }}</p>
            <p class="kpi-label">Sessões de Foco</p>
          </div>
        </div>

        <div class="kpi-card">
          <div class="kpi-icon kpi-icon--red">
            <i class="pi pi-exclamation-circle"></i>
          </div>
          <div>
            <p class="kpi-value">{{ totalErrors }}</p>
            <p class="kpi-label">Erros Registrados</p>
          </div>
        </div>

        <div class="kpi-card">
          <div class="kpi-icon kpi-icon--green">
            <i class="pi pi-check-circle"></i>
          </div>
          <div>
            <p class="kpi-value">{{ totalDoneTasks }}</p>
            <p class="kpi-label">Tarefas Concluídas</p>
          </div>
        </div>

      </div>

      <!-- ─── Métricas de Eficiência ──────────────────────────────────────── -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">

        <!-- Taxa de Conclusão de Sessões -->
        <div class="metric-card">
          <div class="flex items-center justify-between mb-3">
            <p class="metric-title">Sessões Completas</p>
            <span class="metric-badge metric-badge--blue">{{ completedSessions }}/{{ totalSessions }}</span>
          </div>
          <div class="metric-bar-track">
            <div class="metric-bar-fill metric-bar-fill--blue" :style="{ width: completionRate + '%' }"></div>
          </div>
          <p class="metric-pct">{{ completionRate }}%</p>
        </div>

        <!-- Taxa de Resolução de Erros -->
        <div class="metric-card">
          <div class="flex items-center justify-between mb-3">
            <p class="metric-title">Erros Resolvidos</p>
            <span class="metric-badge metric-badge--green">{{ resolvedErrors }}/{{ totalErrors }}</span>
          </div>
          <div class="metric-bar-track">
            <div class="metric-bar-fill metric-bar-fill--green" :style="{ width: errorResolutionRate + '%' }"></div>
          </div>
          <p class="metric-pct">{{ errorResolutionRate }}%</p>
        </div>

        <!-- Streak e Média -->
        <div class="metric-card metric-card--accent flex flex-row md:flex-col gap-4 md:gap-2">
          <div class="flex-1">
            <p class="metric-title">Sequência de dias</p>
            <p class="text-3xl font-headline font-bold text-primary mt-1">
              {{ studyStreak }}
              <span class="text-base font-sans text-on-surface-muted">dias</span>
            </p>
          </div>
          <div class="flex-1 border-l md:border-l-0 md:border-t border-outline-variant/20 pl-4 md:pl-0 md:pt-3">
            <p class="metric-title">Duração média</p>
            <p class="text-3xl font-headline font-bold text-amber-500 mt-1">
              {{ avgSessionMinutes }}
              <span class="text-base font-sans text-on-surface-muted">min</span>
            </p>
          </div>
        </div>

      </div>

      <!-- ─── Gráfico Semanal ─────────────────────────────────────────────── -->
      <div class="chart-card">
        <h3 class="chart-title">
          <i class="pi pi-chart-bar text-primary mr-2"></i>
          Horas estudadas por semana
        </h3>

        <div v-if="!sessions.length && !(sessionsData?.length)" class="chart-empty">
          <i class="pi pi-chart-bar text-3xl text-on-surface-muted/30 mb-2"></i>
          <p>Nenhuma sessão de foco registrada ainda.</p>
        </div>

        <div v-else class="weekly-chart">
          <div
            v-for="(bar, i) in weeklyChart"
            :key="i"
            class="weekly-bar-col"
            :title="`${fmtHours(bar.hours)}`"
          >
            <span class="weekly-bar-val">{{ bar.hours > 0 ? fmtHours(bar.hours) : '' }}</span>
            <div class="weekly-bar-track">
              <div
                class="weekly-bar-fill"
                :style="{
                  height: (bar.hours / maxWeeklyHours * 100) + '%',
                  opacity: bar.hours > 0 ? 1 : 0.15
                }"
              ></div>
            </div>
            <span class="weekly-bar-label">{{ bar.label }}</span>
          </div>
        </div>
      </div>

      <!-- ─── Disciplinas + Dia da Semana ────────────────────────────────── -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">

        <!-- Horas por disciplina -->
        <div class="chart-card">
          <h3 class="chart-title">
            <i class="pi pi-book text-primary mr-2"></i>
            Horas por disciplina
          </h3>

          <div v-if="!disciplineStats.length" class="chart-empty">
            <p>Nenhuma sessão por disciplina registrada.</p>
          </div>

          <div v-else class="space-y-3 mt-4">
            <div v-for="disc in disciplineStats" :key="disc.id" class="disc-row">
              <div class="flex items-center justify-between mb-1">
                <div class="flex items-center gap-2">
                  <div class="w-2.5 h-2.5 rounded-full shrink-0" :style="{ background: disc.color }"></div>
                  <span class="disc-name">{{ disc.name }}</span>
                </div>
                <span class="disc-hours">{{ fmtHours(disc.hours) }}</span>
              </div>
              <div class="disc-bar-track">
                <div
                  class="disc-bar-fill"
                  :style="{
                    width: (disc.hours / maxDisciplineHours * 100) + '%',
                    background: disc.color
                  }"
                ></div>
              </div>
              <p class="disc-sessions">{{ disc.sessions }} sessão{{ disc.sessions !== 1 ? 'ões' : '' }}</p>
            </div>
          </div>
        </div>

        <!-- Heatmap dia da semana -->
        <div class="chart-card">
          <h3 class="chart-title">
            <i class="pi pi-calendar text-primary mr-2"></i>
            Foco por dia da semana
          </h3>

          <div v-if="!sessions.length" class="chart-empty">
            <p>Nenhuma sessão registrada no período.</p>
          </div>

          <div v-else class="dow-chart mt-4">
            <div
              v-for="(bar, i) in dayOfWeekChart"
              :key="i"
              class="dow-col"
            >
              <span class="dow-val">{{ bar.hours > 0 ? fmtHours(bar.hours) : '' }}</span>
              <div class="dow-track">
                <div
                  class="dow-fill"
                  :style="{
                    height: (bar.hours / maxDayHours * 100) + '%',
                    opacity: bar.hours > 0 ? 0.85 + (bar.hours / maxDayHours * 0.15) : 0.12,
                  }"
                ></div>
              </div>
              <span class="dow-label">{{ bar.day }}</span>
            </div>
          </div>
        </div>

      </div>

      <!-- ─── Erros: Donut + Por disciplina ──────────────────────────────── -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">

        <!-- Donut de diagnóstico -->
        <div class="chart-card">
          <h3 class="chart-title">
            <i class="pi pi-exclamation-triangle text-primary mr-2"></i>
            Diagnóstico de erros
          </h3>

          <div v-if="!errorLogs.length" class="chart-empty">
            <i class="pi pi-check-circle text-3xl text-on-surface-muted/30 mb-2"></i>
            <p>Nenhum erro registrado no período.</p>
          </div>

          <div v-else class="flex flex-col sm:flex-row items-center gap-6 mt-4">
            <!-- SVG Donut -->
            <div class="shrink-0">
              <svg viewBox="0 0 120 120" width="140" height="140" class="overflow-visible">
                <circle cx="60" cy="60" r="40" fill="none" stroke="var(--color-surface-container-high)" stroke-width="18" />
                <template v-if="donutSegments.length === 1">
                  <circle
                    cx="60" cy="60" r="40"
                    fill="none"
                    :stroke="donutSegments[0].color"
                    stroke-width="18"
                    stroke-dasharray="251.2"
                    stroke-dashoffset="0"
                    transform="rotate(-90 60 60)"
                  />
                </template>
                <template v-else>
                  <path
                    v-for="(seg, i) in donutSegments"
                    :key="i"
                    :d="donutArc(60, 60, 40, seg.startDeg, seg.endDeg)"
                    :stroke="seg.color"
                    stroke-width="18"
                    fill="none"
                    stroke-linecap="butt"
                  />
                </template>
                <text x="60" y="57" text-anchor="middle" class="donut-center-num" font-size="16" font-weight="800" fill="var(--color-on-surface)">{{ totalErrors }}</text>
                <text x="60" y="70" text-anchor="middle" font-size="7" fill="var(--color-on-surface-muted)">erros</text>
              </svg>
            </div>

            <!-- Legenda -->
            <div class="flex-1 space-y-2 w-full">
              <div
                v-for="seg in diagStats"
                :key="seg.label"
                class="diag-legend-row"
              >
                <div class="flex items-center gap-2 min-w-0">
                  <div class="w-2.5 h-2.5 rounded-full shrink-0" :style="{ background: seg.color }"></div>
                  <span class="diag-legend-label truncate">{{ seg.label }}</span>
                </div>
                <div class="flex items-center gap-2 shrink-0">
                  <span class="diag-legend-count">{{ seg.count }}</span>
                  <span class="diag-legend-pct">{{ seg.pct }}%</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Erros por disciplina -->
        <div class="chart-card">
          <h3 class="chart-title">
            <i class="pi pi-layer text-primary mr-2"></i>
            Erros por disciplina
          </h3>

          <div v-if="!errorsByDiscipline.length" class="chart-empty">
            <p>Nenhum erro com disciplina associada.</p>
          </div>

          <div v-else class="space-y-3 mt-4">
            <div
              v-for="ebd in errorsByDiscipline"
              :key="ebd.name"
              class="ebd-row"
            >
              <div class="flex items-center justify-between mb-1">
                <div class="flex items-center gap-2">
                  <div class="w-2.5 h-2.5 rounded-full shrink-0" :style="{ background: ebd.color }"></div>
                  <span class="disc-name">{{ ebd.name }}</span>
                </div>
                <div class="flex items-center gap-3 text-xs font-sans">
                  <span class="text-red-500 font-bold">{{ ebd.total - ebd.resolved }} pend.</span>
                  <span class="text-green-600 font-bold">{{ ebd.resolved }} resol.</span>
                </div>
              </div>
              <div class="ebd-bar-track">
                <div
                  class="ebd-bar-resolved"
                  :style="{
                    width: ebd.total ? (ebd.resolved / ebd.total * 100) + '%' : '0%',
                    background: ebd.color
                  }"
                ></div>
              </div>
              <p class="disc-sessions">{{ ebd.total }} erro{{ ebd.total !== 1 ? 's' : '' }} no total</p>
            </div>
          </div>
        </div>

      </div>

      <!-- ─── Estado vazio global ─────────────────────────────────────────── -->
      <div
        v-if="!isLoading && !totalSessions && !totalErrors && !totalDoneTasks"
        class="flex flex-col items-center justify-center py-20 px-4 border border-dashed rounded-3xl bg-surface-container-low/30 space-y-4 text-center"
      >
        <div class="w-16 h-16 rounded-full bg-primary/5 flex items-center justify-center text-primary">
          <i class="pi pi-chart-bar text-3xl"></i>
        </div>
        <div class="space-y-1">
          <h3 class="text-lg font-bold">Sem dados de desempenho</h3>
          <p class="text-xs text-on-surface-muted max-w-xs leading-relaxed">
            Complete sessões de foco, registre erros ou conclua tarefas para gerar estatísticas detalhadas.
          </p>
        </div>
      </div>

    </template>
  </div>
</template>

<style scoped>
/* ─── Fade ───────────────────────────────────────────────────────────────────── */
.animate-fade-in {
  animation: fadeIn 0.4s ease-out;
}
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(8px); }
  to   { opacity: 1; transform: translateY(0);   }
}

/* ─── Period Selector ────────────────────────────────────────────────────────── */
.period-selector {
  display: flex;
  gap: 0.25rem;
  background: var(--color-surface-container-low);
  border: 1px solid var(--color-outline-variant);
  border-radius: 0.75rem;
  padding: 0.25rem;
}
.period-btn {
  padding: 0.375rem 0.875rem;
  border-radius: 0.5rem;
  font-size: 0.75rem;
  font-weight: 700;
  font-family: inherit;
  color: var(--color-on-surface-muted);
  background: transparent;
  border: none;
  cursor: pointer;
  transition: all 0.18s ease;
  white-space: nowrap;
}
.period-btn:hover { color: var(--color-on-surface); background: var(--color-surface-container); }
.period-btn--active {
  background: var(--color-primary);
  color: var(--color-on-primary);
}

/* ─── KPI Cards ──────────────────────────────────────────────────────────────── */
.kpi-card {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1.25rem 1.5rem;
  background: var(--color-surface-container-lowest);
  border: 1px solid var(--color-outline-variant);
  border-radius: 1.25rem;
  transition: box-shadow 0.2s;
}
.kpi-card:hover { box-shadow: 0 4px 16px rgba(0,0,0,0.06); }

.kpi-icon {
  width: 44px; height: 44px;
  border-radius: 0.875rem;
  display: flex; align-items: center; justify-content: center;
  font-size: 1.1rem;
  flex-shrink: 0;
}
.kpi-icon--blue   { background: #3b82f615; color: #3b82f6; }
.kpi-icon--purple { background: #a855f715; color: #a855f7; }
.kpi-icon--red    { background: #ef444415; color: #ef4444; }
.kpi-icon--green  { background: #22c55e15; color: #22c55e; }

.kpi-value {
  font-size: 1.75rem;
  font-weight: 800;
  font-family: var(--font-headline, inherit);
  color: var(--color-on-surface);
  line-height: 1.1;
}
.kpi-label {
  font-size: 0.7rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: var(--color-on-surface-muted);
  margin-top: 0.15rem;
}

/* ─── Metric Cards ───────────────────────────────────────────────────────────── */
.metric-card {
  padding: 1.25rem 1.5rem;
  background: var(--color-surface-container-lowest);
  border: 1px solid var(--color-outline-variant);
  border-radius: 1.25rem;
}
.metric-card--accent { background: color-mix(in srgb, var(--color-primary) 4%, var(--color-surface-container-lowest)); }

.metric-title {
  font-size: 0.7rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: var(--color-on-surface-muted);
}
.metric-badge {
  font-size: 0.65rem; font-weight: 800;
  padding: 0.2rem 0.5rem; border-radius: 999px;
}
.metric-badge--blue  { background: #3b82f615; color: #3b82f6; }
.metric-badge--green { background: #22c55e15; color: #22c55e; }

.metric-bar-track {
  height: 8px; border-radius: 999px;
  background: var(--color-surface-container-high);
  overflow: hidden;
}
.metric-bar-fill {
  height: 100%; border-radius: 999px;
  transition: width 0.6s cubic-bezier(0.34, 1.56, 0.64, 1);
}
.metric-bar-fill--blue  { background: #3b82f6; }
.metric-bar-fill--green { background: #22c55e; }

.metric-pct {
  font-size: 0.7rem; font-weight: 700;
  color: var(--color-on-surface-muted);
  margin-top: 0.35rem; text-align: right;
}

/* ─── Chart Card ─────────────────────────────────────────────────────────────── */
.chart-card {
  padding: 1.5rem;
  background: var(--color-surface-container-lowest);
  border: 1px solid var(--color-outline-variant);
  border-radius: 1.25rem;
}
.chart-title {
  font-size: 0.8rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: var(--color-on-surface);
  display: flex; align-items: center;
}
.chart-empty {
  display: flex; flex-direction: column;
  align-items: center; justify-content: center;
  min-height: 120px; gap: 0.5rem;
  color: var(--color-on-surface-muted);
  font-size: 0.8rem; font-style: italic;
  text-align: center; margin-top: 1rem;
}

/* ─── Weekly Chart ───────────────────────────────────────────────────────────── */
.weekly-chart {
  display: flex;
  align-items: flex-end;
  gap: 0.5rem;
  height: 160px;
  margin-top: 1.25rem;
  padding: 0 0.25rem;
}
.weekly-bar-col {
  flex: 1;
  display: flex; flex-direction: column;
  align-items: center; gap: 0.25rem;
  height: 100%;
}
.weekly-bar-val {
  font-size: 0.6rem; font-weight: 700;
  color: var(--color-on-surface-muted);
  min-height: 16px; text-align: center;
}
.weekly-bar-track {
  flex: 1; width: 100%;
  background: var(--color-surface-container-high);
  border-radius: 0.375rem;
  display: flex; align-items: flex-end; overflow: hidden;
}
.weekly-bar-fill {
  width: 100%;
  background: linear-gradient(180deg, var(--color-primary) 0%, color-mix(in srgb, var(--color-primary) 60%, transparent) 100%);
  border-radius: 0.375rem 0.375rem 0 0;
  transition: height 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
  min-height: 3px;
}
.weekly-bar-label {
  font-size: 0.58rem; font-weight: 600;
  color: var(--color-on-surface-muted);
  white-space: nowrap;
}

/* ─── Discipline Bars ────────────────────────────────────────────────────────── */
.disc-row { }
.disc-name {
  font-size: 0.8rem; font-weight: 600;
  color: var(--color-on-surface);
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
  max-width: 160px;
}
.disc-hours {
  font-size: 0.78rem; font-weight: 800;
  color: var(--color-on-surface); white-space: nowrap;
}
.disc-bar-track {
  height: 7px; border-radius: 999px;
  background: var(--color-surface-container-high); overflow: hidden;
}
.disc-bar-fill {
  height: 100%; border-radius: 999px;
  transition: width 0.6s cubic-bezier(0.34, 1.56, 0.64, 1);
  opacity: 0.85;
}
.disc-sessions {
  font-size: 0.65rem; color: var(--color-on-surface-muted); margin-top: 0.2rem;
}

/* ─── Day-of-Week Chart ──────────────────────────────────────────────────────── */
.dow-chart {
  display: flex; align-items: flex-end;
  gap: 0.5rem; height: 140px;
}
.dow-col {
  flex: 1; display: flex; flex-direction: column;
  align-items: center; gap: 0.25rem; height: 100%;
}
.dow-val {
  font-size: 0.58rem; font-weight: 700;
  color: var(--color-on-surface-muted); min-height: 14px; text-align: center;
}
.dow-track {
  flex: 1; width: 100%;
  background: var(--color-surface-container-high);
  border-radius: 0.375rem;
  display: flex; align-items: flex-end; overflow: hidden;
}
.dow-fill {
  width: 100%;
  background: linear-gradient(180deg, #f59e0b 0%, #f97316 100%);
  border-radius: 0.375rem 0.375rem 0 0;
  transition: height 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
  min-height: 3px;
}
.dow-label {
  font-size: 0.65rem; font-weight: 700;
  color: var(--color-on-surface-muted);
}

/* ─── Donut legend ───────────────────────────────────────────────────────────── */
.diag-legend-row {
  display: flex; align-items: center;
  justify-content: space-between; gap: 0.5rem;
}
.diag-legend-label {
  font-size: 0.78rem; font-weight: 600;
  color: var(--color-on-surface);
}
.diag-legend-count {
  font-size: 0.78rem; font-weight: 800; color: var(--color-on-surface);
}
.diag-legend-pct {
  font-size: 0.65rem; font-weight: 700; color: var(--color-on-surface-muted);
  min-width: 2.5rem; text-align: right;
}

/* ─── Errors by discipline ───────────────────────────────────────────────────── */
.ebd-bar-track {
  height: 7px; border-radius: 999px;
  background: color-mix(in srgb, #ef4444 12%, var(--color-surface-container-high)); overflow: hidden;
}
.ebd-bar-resolved {
  height: 100%; border-radius: 999px;
  transition: width 0.6s cubic-bezier(0.34, 1.56, 0.64, 1);
}
</style>