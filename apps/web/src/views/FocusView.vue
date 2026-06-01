<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { onBeforeRouteLeave } from 'vue-router'
import { VModal, VSpinner } from '../components/ui'
import { useStudyPlanStore } from '../stores/study-plan'
import { useDisciplinesQuery } from '../hooks/useDisciplines'
import { useCreateFocusSessionMutation } from '../hooks/useFocusSessions'
import { usePomodoroTimer } from '../hooks/usePomodoroTimer'
import { useToast } from 'primevue/usetoast'

import FocusHeader from '../components/features/focus/FocusHeader.vue'
import FocusEmptyState from '../components/features/focus/FocusEmptyState.vue'
import FocusConfig from '../components/features/focus/FocusConfig.vue'
import FocusActiveTimer from '../components/features/focus/FocusActiveTimer.vue'

const studyPlanStore = useStudyPlanStore()
const toast = useToast()

// ─── Data ─────────────────────────────────────────────────────────────────────
const { data: disciplinesData, isLoading: isLoadingDisciplines } = useDisciplinesQuery()
const disciplines = computed(() => disciplinesData.value || [])
const { mutateAsync: saveFocusSession } = useCreateFocusSessionMutation()

// ─── Timer ────────────────────────────────────────────────────────────────────
const {
    settings,
    isRunning,
    isPaused,
    currentPhase,
    currentCycle,
    formattedTime,
    phaseLabel,
    phaseColor,
    progress,
    isSessionComplete,
    sessionStartedAt,
    totalElapsed,
    startTimer,
    pauseTimer,
    resumeTimer,
    skipPhase,
    stopTimer,
    resetTimer,
} = usePomodoroTimer()

// ─── Local State ──────────────────────────────────────────────────────────────
const selectedDisciplineId = ref<number | null>(null)
const showLeaveDialog = ref(false)
const pendingNavigation = ref<any>(null)

const selectedDiscipline = computed(() =>
    disciplines.value.find((d: any) => d.id === selectedDisciplineId.value)
)

// ─── SVG Timer ────────────────────────────────────────────────────────────────
const RADIUS = 140
const CIRCUMFERENCE = 2 * Math.PI * RADIUS
const strokeDashoffset = computed(() => {
    return CIRCUMFERENCE - (progress.value / 100) * CIRCUMFERENCE
})

// ─── Session Complete Watcher ─────────────────────────────────────────────────
watch(isSessionComplete, async (completed) => {
    if (completed && sessionStartedAt.value) {
        await saveSession(true)
        resetTimer()
        toast.add({
            severity: 'success',
            summary: 'Sessão Completa! 🎉',
            detail: 'Parabéns! Todos os ciclos foram concluídos.',
            life: 5000,
        })
    }
})

// ─── Actions ──────────────────────────────────────────────────────────────────
function handleStart() {
    if (!selectedDisciplineId.value) return
    startTimer()
}

function handlePauseResume() {
    if (isPaused.value) {
        resumeTimer()
    } else {
        pauseTimer()
    }
}

async function handleStop() {
    if (sessionStartedAt.value) {
        await saveSession(false)
    }
    resetTimer()
    toast.add({
        severity: 'info',
        summary: 'Sessão Encerrada',
        detail: 'A sessão foi encerrada e salva.',
        life: 3000,
    })
}

async function saveSession(completed: boolean) {
    if (!selectedDisciplineId.value || !sessionStartedAt.value) return

    const cyclesCompleted = completed
        ? settings.value.cycles
        : Math.max(0, currentCycle.value - 1)

    try {
        await saveFocusSession({
            disciplineId: selectedDisciplineId.value,
            duration: totalElapsed.value,
            focusTime: settings.value.focusTime * 60,
            breakTime: settings.value.breakTime * 60,
            longBreakTime: settings.value.longBreakTime * 60,
            cyclesTarget: settings.value.cycles,
            cyclesCompleted,
            isCompleted: completed,
            startedAt: sessionStartedAt.value.toISOString(),
            finishedAt: new Date().toISOString(),
        })
    } catch (err) {
        console.error('Erro ao salvar sessão de foco:', err)
    }
}

// ─── Navigation Guard ─────────────────────────────────────────────────────────
onBeforeRouteLeave((to, from, next) => {
    if (isRunning.value) {
        pendingNavigation.value = next
        showLeaveDialog.value = true
        return false
    }
    next()
})

async function confirmLeave() {
    if (sessionStartedAt.value) {
        await saveSession(false)
    }
    stopTimer()
    showLeaveDialog.value = false
    if (pendingNavigation.value) {
        pendingNavigation.value()
        pendingNavigation.value = null
    }
}

function cancelLeave() {
    showLeaveDialog.value = false
    pendingNavigation.value = null
}
</script>

<template>
    <div class="pb-12 animate-fade-in">
        <FocusHeader />

        <!-- Loading -->
        <div v-if="isLoadingDisciplines" class="flex justify-center items-center h-64">
            <VSpinner />
        </div>

        <!-- No Study Plan -->
        <FocusEmptyState v-else-if="!studyPlanStore.hasActivePlan" />

        <!-- Main Content -->
        <div v-else>
            <!-- ═══════════ CONFIGURATION STATE ═══════════ -->
            <transition name="phase-fade" mode="out-in">
                <FocusConfig v-if="!isRunning" key="config" :disciplines="disciplines"
                    v-model:selectedDisciplineId="selectedDisciplineId" :settings="settings" @start="handleStart" />

                <!-- ═══════════ TIMER ACTIVE STATE ═══════════ -->
                <FocusActiveTimer v-else key="timer" :selectedDiscipline="selectedDiscipline" :phaseColor="phaseColor"
                    :phaseLabel="phaseLabel" :formattedTime="formattedTime" :currentCycle="currentCycle"
                    :settings="settings" :currentPhase="currentPhase" :isPaused="isPaused" :totalElapsed="totalElapsed"
                    :strokeDashoffset="strokeDashoffset" :radius="RADIUS" :circumference="CIRCUMFERENCE"
                    @stop="handleStop" @pauseResume="handlePauseResume" @skip="skipPhase" />
            </transition>
        </div>

        <!-- ═══════════ LEAVE CONFIRMATION DIALOG ═══════════ -->
        <VModal :visible="showLeaveDialog" @update:visible="cancelLeave" header="Sessão em andamento">
            <template #default>
                <p class="text-on-surface-muted text-sm leading-relaxed">
                    Você tem uma sessão de foco em andamento. Deseja encerrá-la? A sessão parcial será salva
                    automaticamente.
                </p>
            </template>
            <template #footer>
                <div class="flex gap-3 justify-end">
                    <button @click="cancelLeave"
                        class="px-4 py-2 rounded-lg text-sm font-bold text-on-surface-muted hover:bg-surface-container-highest transition-colors">
                        Cancelar
                    </button>
                    <button @click="confirmLeave"
                        class="px-4 py-2 rounded-lg text-sm font-bold bg-error text-white hover:bg-error/90 transition-colors">
                        Encerrar e Sair
                    </button>
                </div>
            </template>
        </VModal>
    </div>
</template>

<style scoped>
/* ─── Animations ───────────────────────────────────────────────────────────── */
.animate-fade-in {
    animation: fadeIn 0.4s ease-out;
}

@keyframes fadeIn {
    from {
        opacity: 0;
        transform: translateY(8px);
    }

    to {
        opacity: 1;
        transform: translateY(0);
    }
}

.phase-fade-enter-active,
.phase-fade-leave-active {
    transition: opacity 0.4s ease, transform 0.4s ease;
}

.phase-fade-enter-from {
    opacity: 0;
    transform: translateY(20px) scale(0.98);
}

.phase-fade-leave-to {
    opacity: 0;
    transform: translateY(-20px) scale(0.98);
}
</style>
