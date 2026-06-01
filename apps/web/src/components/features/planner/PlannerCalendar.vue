<script setup lang="ts">
import { ref, computed } from 'vue'
import PlannerDayModal from './PlannerDayModal.vue'

// ─── Types ────────────────────────────────────────────────────────────────────

export interface StudySession {
  id: number
  disciplineName: string
  color: string       // hex or CSS color
  durationMin: number
}

export interface DayData {
  date: Date
  sessions: StudySession[]
}

// ─── Props ────────────────────────────────────────────────────────────────────

const props = defineProps<{
  /** Map of YYYY-MM-DD → sessions */
  schedule?: Record<string, StudySession[]>
}>()

// ─── State ────────────────────────────────────────────────────────────────────

const today = new Date()
const viewYear = ref(today.getFullYear())
const viewMonth = ref(today.getMonth())

const selectedDay = ref<DayData | null>(null)

// ─── Navigation ──────────────────────────────────────────────────────────────

function prevMonth() {
  if (viewMonth.value === 0) { viewMonth.value = 11; viewYear.value-- }
  else viewMonth.value--
}

function nextMonth() {
  if (viewMonth.value === 11) { viewMonth.value = 0; viewYear.value++ }
  else viewMonth.value++
}

function goToToday() {
  viewYear.value = today.getFullYear()
  viewMonth.value = today.getMonth()
}

// ─── Calendar grid ────────────────────────────────────────────────────────────

const WEEK_DAYS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']

const monthLabel = computed(() =>
  new Date(viewYear.value, viewMonth.value, 1)
    .toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })
)

function toKey(date: Date): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

function sessionsFor(date: Date): StudySession[] {
  return props.schedule?.[toKey(date)] ?? []
}

const calendarDays = computed((): DayData[] => {
  const year = viewYear.value
  const month = viewMonth.value
  const firstDay = new Date(year, month, 1)
  const lastDay = new Date(year, month + 1, 0)
  const startPad = firstDay.getDay()
  const endPad = 6 - lastDay.getDay()

  const days: DayData[] = []
  for (let i = startPad - 1; i >= 0; i--)
    days.push({ date: new Date(year, month, -i), sessions: sessionsFor(new Date(year, month, -i)) })
  for (let d = 1; d <= lastDay.getDate(); d++) {
    const date = new Date(year, month, d)
    days.push({ date, sessions: sessionsFor(date) })
  }
  for (let i = 1; i <= endPad; i++)
    days.push({ date: new Date(year, month + 1, i), sessions: sessionsFor(new Date(year, month + 1, i)) })

  return days
})

// ─── Helpers ─────────────────────────────────────────────────────────────────

function isToday(date: Date): boolean {
  return toKey(date) === toKey(today)
}

function isCurrentMonth(date: Date): boolean {
  return date.getMonth() === viewMonth.value && date.getFullYear() === viewYear.value
}

function sessionStyle(color: string) {
  return { backgroundColor: color + '22', borderLeftColor: color, color }
}
</script>

<template>
  <div class="flex flex-col w-full h-full min-h-0 bg-surface-container-lowest border border-outline-variant rounded-2xl overflow-hidden">

    <!-- ── Toolbar ──────────────────────────────────────────────────────── -->
    <div class="flex items-center justify-between px-5 py-4 border-b border-outline-variant bg-surface-container-low flex-shrink-0">
      <div class="flex items-center gap-3">
        <h2 class="font-serif text-lg font-semibold text-on-surface capitalize m-0">{{ monthLabel }}</h2>
        <button
          class="font-sans text-xs font-semibold uppercase tracking-wide text-primary bg-transparent
                 border border-primary rounded-md px-2.5 py-1 cursor-pointer
                 transition-colors hover:bg-primary hover:text-white"
          @click="goToToday"
        >
          Hoje
        </button>
      </div>
      <div class="flex gap-1.5">
        <button
          class="flex items-center justify-center w-8 h-8 rounded-full border border-outline-variant
                 bg-transparent text-on-surface-variant text-xs cursor-pointer
                 transition-all hover:bg-surface-container hover:border-outline hover:text-on-surface"
          title="Mês anterior"
          @click="prevMonth"
        >
          <i class="pi pi-chevron-left" />
        </button>
        <button
          class="flex items-center justify-center w-8 h-8 rounded-full border border-outline-variant
                 bg-transparent text-on-surface-variant text-xs cursor-pointer
                 transition-all hover:bg-surface-container hover:border-outline hover:text-on-surface"
          title="Próximo mês"
          @click="nextMonth"
        >
          <i class="pi pi-chevron-right" />
        </button>
      </div>
    </div>

    <!-- ── Grid ────────────────────────────────────────────────────────── -->
    <div class="flex-1 flex flex-col min-h-0">

      <!-- Weekday header -->
      <div class="grid grid-cols-7 border-b border-outline-variant flex-shrink-0">
        <div
          v-for="day in WEEK_DAYS"
          :key="day"
          class="font-sans text-[0.65rem] font-bold uppercase tracking-widest text-outline text-center py-2"
        >
          {{ day }}
        </div>
      </div>

      <!-- Day cells -->
      <div class="flex-1 grid grid-cols-7 auto-rows-fr min-h-0">
        <div
          v-for="dayData in calendarDays"
          :key="toKey(dayData.date)"
          class="day-cell flex flex-col gap-1 p-1.5 border-r border-b border-outline-variant min-h-0 overflow-hidden transition-colors"
          :class="{
            'bg-primary/5': isToday(dayData.date),
            'bg-surface-container-highest/30': !isCurrentMonth(dayData.date),
            'cursor-pointer hover:bg-primary/5': dayData.sessions.length > 0,
            'hover:bg-surface-container-low': dayData.sessions.length === 0,
          }"
          @click="dayData.sessions.length > 0 && (selectedDay = dayData)"
        >
          <!-- Day number -->
          <span
            class="inline-flex items-center justify-center w-6 h-6 rounded-full flex-shrink-0
                   font-sans text-[0.78rem] font-medium transition-colors"
            :class="
              isToday(dayData.date)
                ? 'bg-primary text-white font-bold'
                : !isCurrentMonth(dayData.date)
                  ? 'text-outline opacity-50'
                  : 'text-on-surface-variant'
            "
          >
            {{ dayData.date.getDate() }}
          </span>

          <!-- Session chips -->
          <div class="flex flex-col gap-0.5 flex-1 min-h-0 overflow-hidden">
            <div
              v-for="session in dayData.sessions.slice(0, 3)"
              :key="session.id"
              class="flex items-center gap-1 rounded border-l-[3px] px-1.5 py-0.5
                     font-sans text-[0.68rem] font-semibold whitespace-nowrap overflow-hidden
                     flex-shrink-0 cursor-pointer transition-[filter] hover:brightness-95"
              :style="sessionStyle(session.color)"
              :title="`${session.disciplineName} — ${session.durationMin} min`"
            >
              <span class="w-1.5 h-1.5 rounded-full flex-shrink-0" :style="{ backgroundColor: session.color }" />
              <span class="flex-1 overflow-hidden text-ellipsis">{{ session.disciplineName }}</span>
              <span class="opacity-70 text-[0.6rem] flex-shrink-0">{{ session.durationMin }}m</span>
            </div>

            <div
              v-if="dayData.sessions.length > 3"
              class="font-sans text-[0.62rem] font-semibold text-outline pl-1.5"
            >
              +{{ dayData.sessions.length - 3 }} mais
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- ── Day-detail modal ─────────────────────────────────────────────── -->
  <PlannerDayModal
    v-if="selectedDay"
    :day="selectedDay"
    @close="selectedDay = null"
  />
</template>

<style scoped>
/* Remove right border from every 7th cell — nth-child can't be expressed as static Tailwind utilities */
.day-cell:nth-child(7n) {
  border-right: none;
}
</style>
