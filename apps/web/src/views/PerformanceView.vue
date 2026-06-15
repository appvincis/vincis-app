<script setup lang="ts">
import { ref } from 'vue'
import { VSpinner } from '../components/ui'
import { useErrorLogsQuery } from '../hooks/useErrorLogs'
import { useFocusSessionsQuery } from '../hooks/useFocusSessions'
import { useDisciplinesQuery } from '../hooks/useDisciplines'
import {
  usePerformanceStats,
  PERIOD_OPTIONS,
  fmtHours,
  donutArc,
} from '../hooks/usePerformanceStats'
import { computed } from 'vue'

// ─── Queries ──────────────────────────────────────────────────────────────────
const { data: sessionsData, isLoading: loadingSessions } = useFocusSessionsQuery()
const { data: errorsData,   isLoading: loadingErrors   } = useErrorLogsQuery(ref({}))
const { data: disciplinesData                           } = useDisciplinesQuery()

const isLoading = computed(() => loadingSessions.value || loadingErrors.value)

// ─── All stats from composable ────────────────────────────────────────────────
const {
  selectedPeriod,
  sessions,
  errorLogs,
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
  disciplineStats,
  maxDisciplineHours,
  diagStats,
  errorsByDiscipline,
  weeklyChart,
  maxWeeklyHours,
  dayOfWeekChart,
  maxDayHours,
  donutSegments,
  topDiagnostic,
  topErrorDiscipline,
} = usePerformanceStats(sessionsData, errorsData, disciplinesData)
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
          v-for="opt in PERIOD_OPTIONS"
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
          <div class="kpi-icon kpi-icon--blue"><i class="pi pi-clock"></i></div>
          <div>
            <p class="kpi-value">{{ totalStudyHours }}h</p>
            <p class="kpi-label">Horas Estudadas</p>
          </div>
        </div>
        <div class="kpi-card">
          <div class="kpi-icon kpi-icon--purple"><i class="pi pi-bolt"></i></div>
          <div>
            <p class="kpi-value">{{ totalSessions }}</p>
            <p class="kpi-label">Sessões de Foco</p>
          </div>
        </div>
        <div class="kpi-card">
          <div class="kpi-icon kpi-icon--red"><i class="pi pi-exclamation-circle"></i></div>
          <div>
            <p class="kpi-value">{{ totalErrors }}</p>
            <p class="kpi-label">Erros Registrados</p>
          </div>
        </div>
        <div class="kpi-card">
          <div class="kpi-icon kpi-icon--green"><i class="pi pi-check-circle"></i></div>
          <div>
            <p class="kpi-value">{{ totalDoneTasks }}</p>
            <p class="kpi-label">Tarefas Concluídas</p>
          </div>
        </div>
      </div>

      <!-- ─── Métricas de Eficiência ──────────────────────────────────────── -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
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
          <div v-for="(bar, i) in weeklyChart" :key="i" class="weekly-bar-col" :title="fmtHours(bar.hours)">
            <span class="weekly-bar-val">{{ bar.hours > 0 ? fmtHours(bar.hours) : '' }}</span>
            <div class="weekly-bar-track">
              <div class="weekly-bar-fill" :style="{ height: (bar.hours / maxWeeklyHours * 100) + '%', opacity: bar.hours > 0 ? 1 : 0.15 }"></div>
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
                <div class="disc-bar-fill" :style="{ width: (disc.hours / maxDisciplineHours * 100) + '%', background: disc.color }"></div>
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
            <div v-for="(bar, i) in dayOfWeekChart" :key="i" class="dow-col">
              <span class="dow-val">{{ bar.hours > 0 ? fmtHours(bar.hours) : '' }}</span>
              <div class="dow-track">
                <div class="dow-fill" :style="{ height: (bar.hours / maxDayHours * 100) + '%', opacity: bar.hours > 0 ? 0.85 + (bar.hours / maxDayHours * 0.15) : 0.12 }"></div>
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
                  <circle cx="60" cy="60" r="40" fill="none" :stroke="donutSegments[0]?.color" stroke-width="18" stroke-dasharray="251.2" stroke-dashoffset="0" transform="rotate(-90 60 60)" />
                </template>
                <template v-else>
                  <path v-for="(seg, i) in donutSegments" :key="i" :d="donutArc(60, 60, 40, seg.startDeg, seg.endDeg)" :stroke="seg.color" stroke-width="18" fill="none" stroke-linecap="butt" />
                </template>
                <text x="60" y="57" text-anchor="middle" class="donut-center-num" font-size="16" font-weight="800" fill="var(--color-on-surface)">{{ totalErrors }}</text>
                <text x="60" y="70" text-anchor="middle" font-size="7" fill="var(--color-on-surface-muted)">erros</text>
              </svg>
            </div>
            <!-- Legenda -->
            <div class="flex-1 space-y-2 w-full">
              <div v-for="seg in diagStats" :key="seg.label" class="diag-legend-row">
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
            <div v-for="ebd in errorsByDiscipline" :key="ebd.name" class="ebd-row">
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
                <div class="ebd-bar-resolved" :style="{ width: ebd.total ? (ebd.resolved / ebd.total * 100) + '%' : '0%', background: ebd.color }"></div>
              </div>
              <p class="disc-sessions">{{ ebd.total }} erro{{ ebd.total !== 1 ? 's' : '' }} no total</p>
            </div>
          </div>
        </div>

      </div>

      <!-- ─── Insight do Diagnóstico ─────────────────────────────────────── -->
      <div v-if="topErrorDiscipline && topDiagnostic" class="insight-card">
        <div class="insight-icon">
          <i class="pi pi-compass text-xl"></i>
        </div>
        <div>
          <h3 class="insight-title">Ponto de Atenção</h3>
          <p class="insight-text">
            Seu maior volume de erros ocorre em <strong>{{ topErrorDiscipline }}</strong> 
            com predominância no diagnóstico de <strong>{{ topDiagnostic }}</strong>. 
            É recomendado focar nesta área antes de prosseguir com conteúdos novos.
          </p>
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
.animate-fade-in { animation: fadeIn 0.4s ease-out; }
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(8px); }
  to   { opacity: 1; transform: translateY(0);   }
}

/* ─── Period Selector ────────────────────────────────────────────────────────── */
.period-selector {
  display: flex; gap: 0.25rem;
  background: var(--color-surface-container-low);
  border: 1px solid var(--color-outline-variant);
  border-radius: 0.75rem; padding: 0.25rem;
}
.period-btn {
  padding: 0.375rem 0.875rem; border-radius: 0.5rem;
  font-size: 0.75rem; font-weight: 700; font-family: inherit;
  color: var(--color-on-surface-muted); background: transparent;
  border: none; cursor: pointer; transition: all 0.18s ease; white-space: nowrap;
}
.period-btn:hover { color: var(--color-on-surface); background: var(--color-surface-container); }
.period-btn--active { background: var(--color-primary); color: var(--color-on-primary); }

/* ─── KPI Cards ──────────────────────────────────────────────────────────────── */
.kpi-card {
  display: flex; align-items: center; gap: 1rem; padding: 1.25rem 1.5rem;
  background: var(--color-surface-container-lowest);
  border: 1px solid var(--color-outline-variant); border-radius: 1.25rem;
  transition: box-shadow 0.2s;
}
.kpi-card:hover { box-shadow: 0 4px 16px rgba(0,0,0,0.06); }
.kpi-icon {
  width: 44px; height: 44px; border-radius: 0.875rem;
  display: flex; align-items: center; justify-content: center;
  font-size: 1.1rem; flex-shrink: 0;
}
.kpi-icon--blue   { background: #3b82f615; color: #3b82f6; }
.kpi-icon--purple { background: #a855f715; color: #a855f7; }
.kpi-icon--red    { background: #ef444415; color: #ef4444; }
.kpi-icon--green  { background: #22c55e15; color: #22c55e; }
.kpi-value { font-size: 1.75rem; font-weight: 800; font-family: var(--font-headline, inherit); color: var(--color-on-surface); line-height: 1.1; }
.kpi-label { font-size: 0.7rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.06em; color: var(--color-on-surface-muted); margin-top: 0.15rem; }

/* ─── Metric Cards ───────────────────────────────────────────────────────────── */
.metric-card {
  padding: 1.25rem 1.5rem; background: var(--color-surface-container-lowest);
  border: 1px solid var(--color-outline-variant); border-radius: 1.25rem;
}
.metric-card--accent { background: color-mix(in srgb, var(--color-primary) 4%, var(--color-surface-container-lowest)); }
.metric-title { font-size: 0.7rem; font-weight: 800; text-transform: uppercase; letter-spacing: 0.06em; color: var(--color-on-surface-muted); }
.metric-badge { font-size: 0.65rem; font-weight: 800; padding: 0.2rem 0.5rem; border-radius: 999px; }
.metric-badge--blue  { background: #3b82f615; color: #3b82f6; }
.metric-badge--green { background: #22c55e15; color: #22c55e; }
.metric-bar-track { height: 8px; border-radius: 999px; background: var(--color-surface-container-high); overflow: hidden; }
.metric-bar-fill { height: 100%; border-radius: 999px; transition: width 0.6s cubic-bezier(0.34, 1.56, 0.64, 1); }
.metric-bar-fill--blue  { background: #3b82f6; }
.metric-bar-fill--green { background: #22c55e; }
.metric-pct { font-size: 0.7rem; font-weight: 700; color: var(--color-on-surface-muted); margin-top: 0.35rem; text-align: right; }

/* ─── Chart Card ─────────────────────────────────────────────────────────────── */
.chart-card { padding: 1.5rem; background: var(--color-surface-container-lowest); border: 1px solid var(--color-outline-variant); border-radius: 1.25rem; }
.chart-title { font-size: 0.8rem; font-weight: 800; text-transform: uppercase; letter-spacing: 0.06em; color: var(--color-on-surface); display: flex; align-items: center; }
.chart-empty { display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 120px; gap: 0.5rem; color: var(--color-on-surface-muted); font-size: 0.8rem; font-style: italic; text-align: center; margin-top: 1rem; }

/* ─── Weekly Chart ───────────────────────────────────────────────────────────── */
.weekly-chart { display: flex; align-items: flex-end; gap: 0.5rem; height: 160px; margin-top: 1.25rem; padding: 0 0.25rem; }
.weekly-bar-col { flex: 1; display: flex; flex-direction: column; align-items: center; gap: 0.25rem; height: 100%; }
.weekly-bar-val { font-size: 0.6rem; font-weight: 700; color: var(--color-on-surface-muted); min-height: 16px; text-align: center; }
.weekly-bar-track { flex: 1; width: 100%; background: var(--color-surface-container-high); border-radius: 0.375rem; display: flex; align-items: flex-end; overflow: hidden; }
.weekly-bar-fill { width: 100%; background: linear-gradient(180deg, var(--color-primary) 0%, color-mix(in srgb, var(--color-primary) 60%, transparent) 100%); border-radius: 0.375rem 0.375rem 0 0; transition: height 0.5s cubic-bezier(0.34, 1.56, 0.64, 1); min-height: 3px; }
.weekly-bar-label { font-size: 0.58rem; font-weight: 600; color: var(--color-on-surface-muted); white-space: nowrap; }

/* ─── Discipline Bars ────────────────────────────────────────────────────────── */
.disc-name { font-size: 0.8rem; font-weight: 600; color: var(--color-on-surface); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 160px; }
.disc-hours { font-size: 0.78rem; font-weight: 800; color: var(--color-on-surface); white-space: nowrap; }
.disc-bar-track { height: 7px; border-radius: 999px; background: var(--color-surface-container-high); overflow: hidden; }
.disc-bar-fill { height: 100%; border-radius: 999px; transition: width 0.6s cubic-bezier(0.34, 1.56, 0.64, 1); opacity: 0.85; }
.disc-sessions { font-size: 0.65rem; color: var(--color-on-surface-muted); margin-top: 0.2rem; }

/* ─── Day-of-Week Chart ──────────────────────────────────────────────────────── */
.dow-chart { display: flex; align-items: flex-end; gap: 0.5rem; height: 140px; }
.dow-col { flex: 1; display: flex; flex-direction: column; align-items: center; gap: 0.25rem; height: 100%; }
.dow-val { font-size: 0.58rem; font-weight: 700; color: var(--color-on-surface-muted); min-height: 14px; text-align: center; }
.dow-track { flex: 1; width: 100%; background: var(--color-surface-container-high); border-radius: 0.375rem; display: flex; align-items: flex-end; overflow: hidden; }
.dow-fill { width: 100%; background: linear-gradient(180deg, #f59e0b 0%, #f97316 100%); border-radius: 0.375rem 0.375rem 0 0; transition: height 0.5s cubic-bezier(0.34, 1.56, 0.64, 1); min-height: 3px; }
.dow-label { font-size: 0.65rem; font-weight: 700; color: var(--color-on-surface-muted); }

/* ─── Donut legend ───────────────────────────────────────────────────────────── */
.diag-legend-row { display: flex; align-items: center; justify-content: space-between; gap: 0.5rem; }
.diag-legend-label { font-size: 0.78rem; font-weight: 600; color: var(--color-on-surface); }
.diag-legend-count { font-size: 0.78rem; font-weight: 800; color: var(--color-on-surface); }
.diag-legend-pct { font-size: 0.65rem; font-weight: 700; color: var(--color-on-surface-muted); min-width: 2.5rem; text-align: right; }

/* ─── Errors by discipline ───────────────────────────────────────────────────── */
.ebd-bar-track { height: 7px; border-radius: 999px; background: color-mix(in srgb, #ef4444 12%, var(--color-surface-container-high)); overflow: hidden; }
.ebd-bar-resolved { height: 100%; border-radius: 999px; transition: width 0.6s cubic-bezier(0.34, 1.56, 0.64, 1); }

/* ─── Insight Card ───────────────────────────────────────────────────────────── */
.insight-card {
  margin-top: 1.5rem;
  padding: 1.5rem;
  background: color-mix(in srgb, var(--color-error) 2%, var(--color-surface-container-lowest));
  border: 1px dashed color-mix(in srgb, var(--color-error) 30%, transparent);
  border-radius: 1.25rem;
  display: flex;
  align-items: flex-start;
  gap: 1.25rem;
}
.insight-icon {
  width: 3rem;
  height: 3rem;
  border-radius: 50%;
  background: color-mix(in srgb, var(--color-error) 10%, transparent);
  color: var(--color-error);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.insight-title {
  font-size: 0.8rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--color-on-surface);
  margin-bottom: 0.35rem;
}
.insight-text {
  font-size: 0.85rem;
  line-height: 1.6;
  color: var(--color-on-surface-muted);
}
.insight-text strong {
  color: var(--color-on-surface);
  font-weight: 800;
}
</style>