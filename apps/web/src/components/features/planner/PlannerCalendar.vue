<script setup lang="ts">
import { ref, computed } from 'vue'

// ─── Types ────────────────────────────────────────────────────────────────────

export interface StudySession {
  id: number
  disciplineName: string
  color: string       // hex ou css color para o badge da matéria
  durationMin: number // duração em minutos
}

export interface DayData {
  date: Date
  sessions: StudySession[]
}

// ─── Props ────────────────────────────────────────────────────────────────────

const props = defineProps<{
  /** Mapa de data (YYYY-MM-DD) → sessões do dia */
  schedule?: Record<string, StudySession[]>
}>()

// ─── State ────────────────────────────────────────────────────────────────────

const today = new Date()
const viewYear  = ref(today.getFullYear())
const viewMonth = ref(today.getMonth()) // 0-indexed

// ─── Navegação ────────────────────────────────────────────────────────────────

function prevMonth() {
  if (viewMonth.value === 0) { viewMonth.value = 11; viewYear.value-- }
  else viewMonth.value--
}

function nextMonth() {
  if (viewMonth.value === 11) { viewMonth.value = 0; viewYear.value++ }
  else viewMonth.value++
}

function goToToday() {
  viewYear.value  = today.getFullYear()
  viewMonth.value = today.getMonth()
}

// ─── Computed: grid de dias ───────────────────────────────────────────────────

const WEEK_DAYS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']

const monthLabel = computed(() => {
  return new Date(viewYear.value, viewMonth.value, 1)
    .toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })
})

/** Retorna todos os dias que aparecem no grid (incluindo dias do mês anterior/próximo para completar semanas) */
const calendarDays = computed((): DayData[] => {
  const year  = viewYear.value
  const month = viewMonth.value

  const firstDay = new Date(year, month, 1)
  const lastDay  = new Date(year, month + 1, 0)

  // Quantos dias do mês anterior preencher (domingo = 0)
  const startPad = firstDay.getDay()
  // Quantos dias do mês seguinte preencher para completar a última semana
  const endPad = 6 - lastDay.getDay()

  const days: DayData[] = []

  // Dias do mês anterior
  for (let i = startPad - 1; i >= 0; i--) {
    const d = new Date(year, month, -i)
    days.push({ date: d, sessions: sessionsFor(d) })
  }

  // Dias do mês atual
  for (let d = 1; d <= lastDay.getDate(); d++) {
    const date = new Date(year, month, d)
    days.push({ date, sessions: sessionsFor(date) })
  }

  // Dias do mês seguinte
  for (let i = 1; i <= endPad; i++) {
    const d = new Date(year, month + 1, i)
    days.push({ date: d, sessions: sessionsFor(d) })
  }

  return days
})

function toKey(date: Date): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

function sessionsFor(date: Date): StudySession[] {
  return props.schedule?.[toKey(date)] ?? []
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function isToday(date: Date): boolean {
  return toKey(date) === toKey(today)
}

function isCurrentMonth(date: Date): boolean {
  return date.getMonth() === viewMonth.value && date.getFullYear() === viewYear.value
}

function sessionStyle(color: string) {
  return { backgroundColor: color + '22', borderLeftColor: color, color: color }
}
</script>

<template>
  <div class="calendar-root">

    <!-- ── Toolbar ─────────────────────────────────────────────────────── -->
    <div class="calendar-toolbar">
      <div class="toolbar-left">
        <h2 class="month-label">{{ monthLabel }}</h2>
        <button class="today-btn" @click="goToToday">Hoje</button>
      </div>
      <div class="toolbar-nav">
        <button class="nav-btn" @click="prevMonth" title="Mês anterior">
          <i class="pi pi-chevron-left" />
        </button>
        <button class="nav-btn" @click="nextMonth" title="Próximo mês">
          <i class="pi pi-chevron-right" />
        </button>
      </div>
    </div>

    <!-- ── Grid ───────────────────────────────────────────────────────── -->
    <div class="calendar-grid-wrapper">

      <!-- Cabeçalho dos dias da semana -->
      <div class="weekday-header">
        <div v-for="day in WEEK_DAYS" :key="day" class="weekday-cell">
          {{ day }}
        </div>
      </div>

      <!-- Células dos dias -->
      <div class="days-grid">
        <div
          v-for="dayData in calendarDays"
          :key="toKey(dayData.date)"
          class="day-cell"
          :class="{
            'day-cell--today':         isToday(dayData.date),
            'day-cell--other-month':   !isCurrentMonth(dayData.date),
            'day-cell--has-sessions':  dayData.sessions.length > 0,
          }"
        >
          <!-- Número do dia -->
          <span class="day-number" :class="{ 'day-number--today': isToday(dayData.date) }">
            {{ dayData.date.getDate() }}
          </span>

          <!-- Cards das matérias -->
          <div class="sessions-list">
            <div
              v-for="session in dayData.sessions.slice(0, 3)"
              :key="session.id"
              class="session-chip"
              :style="sessionStyle(session.color)"
              :title="`${session.disciplineName} — ${session.durationMin} min`"
            >
              <span class="session-dot" :style="{ backgroundColor: session.color }" />
              <span class="session-name">{{ session.disciplineName }}</span>
              <span class="session-duration">{{ session.durationMin }}m</span>
            </div>

            <!-- Indicador de overflow -->
            <div v-if="dayData.sessions.length > 3" class="session-overflow">
              +{{ dayData.sessions.length - 3 }} mais
            </div>
          </div>
        </div>
      </div>

    </div>
  </div>
</template>

<style scoped>
/* ── Root ──────────────────────────────────────────────────────────────────── */
.calendar-root {
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  min-height: 0;
  background: var(--surface-container-lowest);
  border: 1px solid var(--outline-variant);
  border-radius: 1rem;
  overflow: hidden;
}

/* ── Toolbar ───────────────────────────────────────────────────────────────── */
.calendar-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 1.25rem;
  border-bottom: 1px solid var(--outline-variant);
  flex-shrink: 0;
  background: var(--surface-container-low);
}

.toolbar-left {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.month-label {
  font-family: var(--font-family-serif);
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--on-surface);
  text-transform: capitalize;
  margin: 0;
}

.today-btn {
  font-family: var(--font-family-sans);
  font-size: 0.75rem;
  font-weight: 600;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  color: var(--primary);
  background: transparent;
  border: 1px solid var(--primary);
  border-radius: 6px;
  padding: 0.25rem 0.625rem;
  cursor: pointer;
  transition: background 0.15s, color 0.15s;
}

.today-btn:hover {
  background: var(--primary);
  color: #fff;
}

.toolbar-nav {
  display: flex;
  gap: 0.375rem;
}

.nav-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2rem;
  height: 2rem;
  border-radius: 50%;
  border: 1px solid var(--outline-variant);
  background: transparent;
  color: var(--on-surface-variant);
  cursor: pointer;
  transition: background 0.15s, color 0.15s, border-color 0.15s;
  font-size: 0.75rem;
}

.nav-btn:hover {
  background: var(--surface-container);
  border-color: var(--outline);
  color: var(--on-surface);
}

/* ── Grid wrapper ──────────────────────────────────────────────────────────── */
.calendar-grid-wrapper {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
}

/* ── Weekday header ────────────────────────────────────────────────────────── */
.weekday-header {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  border-bottom: 1px solid var(--outline-variant);
  flex-shrink: 0;
}

.weekday-cell {
  font-family: var(--font-family-sans);
  font-size: 0.65rem;
  font-weight: 700;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--outline);
  text-align: center;
  padding: 0.5rem 0.25rem;
}

/* ── Days grid ─────────────────────────────────────────────────────────────── */
.days-grid {
  flex: 1;
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  /* 5 ou 6 linhas; auto-fill garante que cada linha cresça igualmente */
  grid-auto-rows: 1fr;
  min-height: 0;
}

/* ── Day cell ──────────────────────────────────────────────────────────────── */
.day-cell {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  padding: 0.375rem 0.4rem 0.4rem;
  border-right: 1px solid var(--outline-variant);
  border-bottom: 1px solid var(--outline-variant);
  min-height: 0;
  overflow: hidden;
  transition: background 0.12s;
}

.day-cell:nth-child(7n) {
  border-right: none;
}

.day-cell:hover {
  background: var(--surface-container-low);
}

.day-cell--other-month {
  background: color-mix(in srgb, var(--surface-container-highest) 30%, transparent);
}

.day-cell--other-month .day-number {
  color: var(--outline);
  opacity: 0.5;
}

.day-cell--today {
  background: color-mix(in srgb, var(--primary) 5%, transparent);
}

/* ── Day number ────────────────────────────────────────────────────────────── */
.day-number {
  font-family: var(--font-family-sans);
  font-size: 0.78rem;
  font-weight: 500;
  color: var(--on-surface-variant);
  line-height: 1;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 1.5rem;
  height: 1.5rem;
  border-radius: 50%;
  flex-shrink: 0;
  transition: background 0.12s;
}

.day-number--today {
  background: var(--primary);
  color: #fff;
  font-weight: 700;
}

/* ── Session chips ─────────────────────────────────────────────────────────── */
.sessions-list {
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
  overflow: hidden;
  flex: 1;
  min-height: 0;
}

.session-chip {
  display: flex;
  align-items: center;
  gap: 0.3rem;
  border-radius: 4px;
  border-left: 3px solid;
  padding: 0.18rem 0.35rem;
  font-family: var(--font-family-sans);
  font-size: 0.68rem;
  font-weight: 600;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  flex-shrink: 0;
  cursor: default;
  transition: filter 0.12s;
}

.session-chip:hover {
  filter: brightness(0.95);
}

.session-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  flex-shrink: 0;
}

.session-name {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
}

.session-duration {
  opacity: 0.7;
  font-size: 0.6rem;
  flex-shrink: 0;
}

.session-overflow {
  font-family: var(--font-family-sans);
  font-size: 0.62rem;
  color: var(--outline);
  font-weight: 600;
  padding-left: 0.35rem;
}
</style>
