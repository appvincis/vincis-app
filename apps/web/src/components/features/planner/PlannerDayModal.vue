<script setup lang="ts">
import type { DayData, StudySession } from './PlannerCalendar.vue'

// ─── Props / Emits ────────────────────────────────────────────────────────────

const props = defineProps<{ day: DayData }>()
const emit = defineEmits<{ close: [] }>()

// ─── Helpers ─────────────────────────────────────────────────────────────────

function dateLabel(date: Date): string {
  return date.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })
}

function totalTime(sessions: StudySession[]): string {
  const total = sessions.reduce((acc, s) => acc + s.durationMin, 0)
  const h = Math.floor(total / 60)
  const m = total % 60
  return h > 0 ? `${h}h${m > 0 ? ` ${m}min` : ''}` : `${m}min`
}

function isReview(s: StudySession): boolean {
  return s.disciplineName.startsWith('↻')
}

function cleanName(s: StudySession): string {
  return s.disciplineName.replace(/^↻\s*/, '')
}
</script>

<template>
  <Teleport to="body">
    <Transition name="day-modal">
      <div
        class="fixed inset-0 z-[100] flex items-end justify-center sm:items-center sm:p-6 bg-black/45 backdrop-blur-sm"
        @click.self="emit('close')"
      >
        <div
          class="modal-panel w-full max-w-lg max-h-[88dvh] flex flex-col overflow-hidden
                 bg-surface-container-lowest border border-outline-variant
                 rounded-t-2xl sm:rounded-2xl
                 shadow-[0_-4px_32px_rgba(28,27,26,0.12)] sm:shadow-[0_8px_48px_rgba(28,27,26,0.18)]"
          role="dialog"
          :aria-label="`Detalhes do dia ${day.date.getDate()}`"
        >
          <!-- Header -->
          <div class="flex items-start justify-between gap-4 px-5 pt-5 pb-4 border-b border-outline-variant bg-surface-container-low flex-shrink-0">
            <div class="flex flex-col gap-0.5">
              <h2 class="font-serif text-lg font-semibold text-on-surface capitalize m-0">
                {{ dateLabel(day.date) }}
              </h2>
              <span class="text-xs text-on-surface-variant font-medium">
                {{ day.sessions.length }} {{ day.sessions.length === 1 ? 'sessão' : 'sessões' }}
                &middot; {{ totalTime(day.sessions) }} total
              </span>
            </div>
            <button
              class="w-8 h-8 flex-shrink-0 flex items-center justify-center rounded-full
                     border border-outline-variant bg-transparent text-on-surface-variant text-[0.7rem]
                     cursor-pointer transition-colors hover:bg-surface-container-high hover:text-on-surface"
              title="Fechar"
              @click="emit('close')"
            >
              <i class="pi pi-times" />
            </button>
          </div>

          <!-- Session list -->
          <div class="flex-1 overflow-y-auto flex flex-col gap-2.5 p-5">
            <div
              v-for="session in day.sessions"
              :key="session.id"
              class="flex items-center justify-between gap-3.5 px-4 py-3.5 rounded-xl border-l-4 transition-[filter] hover:brightness-95"
              :style="{
                borderLeftColor: session.color,
                backgroundColor: session.color + '14',
              }"
            >
              <!-- Dot + info -->
              <div class="flex items-center gap-3 flex-1 min-w-0">
                <span
                  class="w-2.5 h-2.5 rounded-full flex-shrink-0"
                  :style="{ backgroundColor: session.color }"
                />
                <div class="flex flex-col gap-0.5 min-w-0">
                  <span class="font-sans text-[0.9rem] font-bold text-on-surface truncate">
                    {{ cleanName(session) }}
                  </span>
                  <!-- Badges -->
                  <span
                    v-if="isReview(session)"
                    class="inline-flex items-center gap-1 text-[0.65rem] font-bold uppercase tracking-wide
                           px-2 py-0.5 rounded-full border
                           bg-warning/10 text-warning border-warning/30"
                  >
                    <i class="pi pi-refresh" /> Revisão
                  </span>
                  <span
                    v-else
                    class="inline-flex items-center gap-1 text-[0.65rem] font-bold uppercase tracking-wide
                           px-2 py-0.5 rounded-full border
                           bg-primary/10 text-primary border-primary/25"
                  >
                    <i class="pi pi-book" /> Novo conteúdo
                  </span>
                </div>
              </div>

              <!-- Duration pill -->
              <div
                class="flex flex-col items-center justify-center flex-shrink-0 min-w-12
                       px-2 py-1.5 rounded-lg bg-white/40"
                :style="{ color: session.color }"
              >
                <span class="font-sans text-base font-extrabold leading-none">{{ session.durationMin }}</span>
                <span class="font-sans text-[0.6rem] font-semibold opacity-70 uppercase tracking-wide">min</span>
              </div>
            </div>
          </div>

          <!-- Footer -->
          <div class="flex-shrink-0 flex justify-end px-5 py-3.5 border-t border-outline-variant bg-surface-container-low">
            <button
              class="font-sans text-[0.82rem] font-bold px-5 py-2 rounded-lg cursor-pointer
                     border-[1.5px] border-outline-variant bg-transparent text-on-surface-variant
                     transition-all hover:border-primary hover:text-primary hover:bg-primary/5"
              @click="emit('close')"
            >
              Fechar
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
/* Slide-up on mobile, scale-fade on desktop.
   Must target .modal-panel as a child of the transitioning root —
   this isn't expressible as static Tailwind utilities. */
.day-modal-enter-active,
.day-modal-leave-active {
  transition: opacity 0.25s ease;
}
.day-modal-enter-active .modal-panel,
.day-modal-leave-active .modal-panel {
  transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.25s ease;
}
.day-modal-enter-from,
.day-modal-leave-to {
  opacity: 0;
}
.day-modal-enter-from .modal-panel,
.day-modal-leave-to .modal-panel {
  transform: translateY(40px);
  opacity: 0;
}
@media (min-width: 640px) {
  .day-modal-enter-from .modal-panel,
  .day-modal-leave-to .modal-panel {
    transform: scale(0.95) translateY(10px);
  }
}
</style>
