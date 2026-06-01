<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
    selectedDiscipline: any
    phaseColor: string
    phaseLabel: string
    formattedTime: string
    currentCycle: number
    settings: any
    currentPhase: string
    isPaused: boolean
    totalElapsed: number
    strokeDashoffset: number
    radius: number
    circumference: number
}>()

defineEmits<{
    (e: 'stop'): void
    (e: 'pauseResume'): void
    (e: 'skip'): void
}>()

function formatDuration(seconds: number): string {
    const h = Math.floor(seconds / 3600)
    const m = Math.floor((seconds % 3600) / 60)
    if (h > 0) return `${h}h ${m}min`
    return `${m}min`
}
</script>

<template>
    <div class="flex flex-col items-center gap-10">
        <!-- Discipline Badge -->
        <div
            class="flex items-center gap-3 px-5 py-2.5 rounded-full bg-surface-container-low border border-outline-variant/20">
            <div class="w-3 h-3 rounded-full" :style="{ backgroundColor: selectedDiscipline?.color }"></div>
            <span class="text-sm font-bold text-on-surface">{{ selectedDiscipline?.name }}</span>
        </div>

        <!-- Phase Indicator -->
        <div class="phase-indicator" :style="{ '--phase-color': phaseColor }">
            <div class="phase-dot"></div>
            <span class="text-sm font-bold uppercase tracking-widest">{{ phaseLabel }}</span>
        </div>

        <!-- Circular Timer -->
        <div class="timer-container">
            <svg class="timer-svg" viewBox="0 0 320 320">
                <!-- Background circle -->
                <circle cx="160" cy="160" :r="radius" fill="none" stroke="var(--color-outline-variant)" stroke-width="6"
                    opacity="0.15" />
                <!-- Progress circle -->
                <circle cx="160" cy="160" :r="radius" fill="none" :stroke="phaseColor" stroke-width="6"
                    stroke-linecap="round" :stroke-dasharray="circumference" :stroke-dashoffset="strokeDashoffset"
                    class="timer-progress" />
            </svg>
            <!-- Timer Text -->
            <div class="timer-text">
                <span class="timer-digits" :style="{ color: phaseColor }">
                    {{ formattedTime }}
                </span>
                <span class="timer-cycle">
                    Ciclo {{ Math.min(currentCycle, settings.cycles) }} de {{ settings.cycles }}
                </span>
            </div>
        </div>

        <!-- Cycle Dots -->
        <div class="flex gap-2">
            <div v-for="i in settings.cycles" :key="i" class="cycle-dot" :class="{
                'cycle-dot--completed': i < currentCycle,
                'cycle-dot--active': i === currentCycle && currentPhase === 'focus'
            }" :style="i < currentCycle ? { backgroundColor: phaseColor } : {}">
            </div>
        </div>

        <!-- Controls -->
        <div class="flex items-center gap-4">
            <button @click="$emit('stop')" class="control-btn control-btn--stop" title="Encerrar sessão">
                <i class="pi pi-stop-circle text-lg"></i>
            </button>

            <button @click="$emit('pauseResume')" class="control-btn control-btn--main"
                :style="{ '--btn-color': phaseColor }">
                <i class="pi text-xl" :class="isPaused ? 'pi-play' : 'pi-pause'"></i>
            </button>

            <button @click="$emit('skip')" class="control-btn control-btn--skip" title="Pular fase">
                <i class="pi pi-forward text-lg"></i>
            </button>
        </div>

        <!-- Elapsed Time -->
        <p class="text-xs text-on-surface-muted">
            Tempo total: {{ formatDuration(totalElapsed) }}
        </p>
    </div>
</template>

<style scoped>
/* ─── Phase Indicator ──────────────────────────────────────────────────────── */
.phase-indicator {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    color: var(--phase-color);
}

.phase-dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: var(--phase-color);
    animation: pulseDot 2s ease-in-out infinite;
}

@keyframes pulseDot {

    0%,
    100% {
        opacity: 1;
        transform: scale(1);
    }

    50% {
        opacity: 0.5;
        transform: scale(1.3);
    }
}

/* ─── Circular Timer ───────────────────────────────────────────────────────── */
.timer-container {
    position: relative;
    width: 320px;
    height: 320px;
}

.timer-svg {
    width: 100%;
    height: 100%;
    transform: rotate(-90deg);
}

.timer-progress {
    transition: stroke-dashoffset 0.5s ease, stroke 0.4s ease;
}

.timer-text {
    position: absolute;
    inset: 0;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 0.25rem;
}

.timer-digits {
    font-size: 4rem;
    font-weight: 800;
    font-variant-numeric: tabular-nums;
    letter-spacing: -0.02em;
    line-height: 1;
    transition: color 0.4s ease;
}

.timer-cycle {
    font-size: 0.75rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.15em;
    color: var(--color-on-surface-muted);
}

/* ─── Cycle Dots ───────────────────────────────────────────────────────────── */
.cycle-dot {
    width: 10px;
    height: 10px;
    border-radius: 50%;
    background: var(--color-outline-variant);
    opacity: 0.3;
    transition: all 0.3s ease;
}

.cycle-dot--completed {
    opacity: 1;
    transform: scale(1.1);
}

.cycle-dot--active {
    opacity: 1;
    background: var(--color-primary);
    animation: pulseDot 2s ease-in-out infinite;
}

/* ─── Control Buttons ──────────────────────────────────────────────────────── */
.control-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
    transition: all 0.2s ease;
    cursor: pointer;
}

.control-btn--main {
    width: 64px;
    height: 64px;
    background: var(--btn-color);
    color: white;
    box-shadow: 0 4px 16px color-mix(in srgb, var(--btn-color) 30%, transparent);
}

.control-btn--main:hover {
    transform: scale(1.08);
    box-shadow: 0 6px 24px color-mix(in srgb, var(--btn-color) 40%, transparent);
}

.control-btn--main:active {
    transform: scale(0.95);
}

.control-btn--stop,
.control-btn--skip {
    width: 48px;
    height: 48px;
    background: var(--color-surface-container-low);
    color: var(--color-on-surface-muted);
    border: 1.5px solid var(--color-outline-variant);
}

.control-btn--stop:hover {
    background: var(--color-error);
    color: white;
    border-color: var(--color-error);
}

.control-btn--skip:hover {
    background: var(--color-primary-container);
    color: var(--color-primary);
    border-color: var(--color-primary);
}
</style>
