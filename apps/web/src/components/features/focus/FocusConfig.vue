<script setup lang="ts">
import { VCard } from '@/components/ui'

defineProps<{
    disciplines: any[]
    selectedDisciplineId: number | null
    settings: any
}>()

defineEmits<{
    (e: 'update:selectedDisciplineId', val: number): void
    (e: 'start'): void
}>()
</script>

<template>
    <div class="grid grid-cols-1 lg:grid-cols-5 gap-8">
        <!-- Left: Discipline Selection -->
        <div class="lg:col-span-3">
            <VCard class="p-8">
                <h3 class="text-xl font-headline font-bold text-on-surface mb-6">
                    Selecione a Disciplina
                </h3>

                <div v-if="!disciplines.length"
                    class="text-center py-12 border-2 border-dashed border-outline-variant/20 rounded-xl">
                    <i class="pi pi-book text-5xl text-outline-variant mb-4"></i>
                    <p class="text-secondary">Nenhuma disciplina cadastrada neste plano.</p>
                </div>

                <div v-else class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <button v-for="disc in disciplines" :key="disc.id"
                        @click="$emit('update:selectedDisciplineId', disc.id)" class="discipline-card"
                        :class="{ 'discipline-card--active': selectedDisciplineId === disc.id }">
                        <div class="flex items-center gap-3">
                            <div class="w-4 h-4 rounded-full shrink-0" :style="{ backgroundColor: disc.color }"></div>
                            <span class="font-bold text-on-surface text-left">{{ disc.name }}</span>
                        </div>
                        <p v-if="disc.description" class="text-xs text-on-surface-muted mt-2 line-clamp-2 text-left">
                            {{ disc.description }}
                        </p>
                    </button>
                </div>
            </VCard>
        </div>

        <!-- Right: Timer Settings -->
        <div class="lg:col-span-2 space-y-6">
            <VCard class="p-6">
                <h3 class="text-lg font-headline font-bold text-on-surface mb-6">
                    <i class="pi pi-cog text-primary mr-2"></i>
                    Configurações
                </h3>
                <div class="space-y-5">
                    <div class="setting-field">
                        <label class="setting-label">Tempo de Foco</label>
                        <div class="setting-input-group">
                            <button class="setting-btn"
                                @click="settings.focusTime = Math.max(1, settings.focusTime - 5)">−</button>
                            <span class="setting-value">{{ settings.focusTime }} min</span>
                            <button class="setting-btn"
                                @click="settings.focusTime = Math.min(120, settings.focusTime + 5)">+</button>
                        </div>
                    </div>
                    <div class="setting-field">
                        <label class="setting-label">Pausa Curta</label>
                        <div class="setting-input-group">
                            <button class="setting-btn"
                                @click="settings.breakTime = Math.max(1, settings.breakTime - 1)">−</button>
                            <span class="setting-value">{{ settings.breakTime }} min</span>
                            <button class="setting-btn"
                                @click="settings.breakTime = Math.min(30, settings.breakTime + 1)">+</button>
                        </div>
                    </div>
                    <div class="setting-field">
                        <label class="setting-label">Pausa Longa</label>
                        <div class="setting-input-group">
                            <button class="setting-btn"
                                @click="settings.longBreakTime = Math.max(1, settings.longBreakTime - 5)">−</button>
                            <span class="setting-value">{{ settings.longBreakTime }} min</span>
                            <button class="setting-btn"
                                @click="settings.longBreakTime = Math.min(60, settings.longBreakTime + 5)">+</button>
                        </div>
                    </div>
                    <div class="setting-field">
                        <label class="setting-label">Ciclos</label>
                        <div class="setting-input-group">
                            <button class="setting-btn"
                                @click="settings.cycles = Math.max(1, settings.cycles - 1)">−</button>
                            <span class="setting-value">{{ settings.cycles }}</span>
                            <button class="setting-btn"
                                @click="settings.cycles = Math.min(12, settings.cycles + 1)">+</button>
                        </div>
                    </div>
                </div>
            </VCard>

            <!-- Start Button -->
            <button @click="$emit('start')" :disabled="!selectedDisciplineId" class="start-button"
                :class="{ 'start-button--disabled': !selectedDisciplineId }">
                <i class="pi pi-play text-lg"></i>
                <span>Iniciar Sessão</span>
            </button>
        </div>
    </div>
</template>

<style scoped>
/* ─── Discipline Cards ─────────────────────────────────────────────────────── */
.discipline-card {
    background: var(--color-surface-container-low);
    border: 1.5px solid var(--color-outline-variant);
    padding: 1.25rem;
    border-radius: 1rem;
    transition: all 0.2s ease;
    cursor: pointer;
}

.discipline-card:hover {
    border-color: var(--color-primary);
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}

.discipline-card--active {
    background: var(--color-primary-container);
    border-color: var(--color-primary);
    box-shadow: 0 4px 20px color-mix(in srgb, var(--color-primary) 15%, transparent);
}

/* ─── Settings ─────────────────────────────────────────────────────────────── */
.setting-field {
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.setting-label {
    font-size: 0.875rem;
    font-weight: 600;
    color: var(--color-on-surface);
}

.setting-input-group {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    background: var(--color-surface-container-low);
    border-radius: 0.75rem;
    padding: 0.25rem;
}

.setting-btn {
    width: 32px;
    height: 32px;
    border-radius: 0.5rem;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1rem;
    font-weight: 700;
    color: var(--color-on-surface-muted);
    transition: all 0.15s ease;
    cursor: pointer;
}

.setting-btn:hover {
    background: var(--color-primary-container);
    color: var(--color-primary);
}

.setting-value {
    min-width: 56px;
    text-align: center;
    font-size: 0.875rem;
    font-weight: 700;
    color: var(--color-on-surface);
    font-variant-numeric: tabular-nums;
}

/* ─── Start Button ─────────────────────────────────────────────────────────── */
.start-button {
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.75rem;
    padding: 1rem 2rem;
    border-radius: 1rem;
    font-size: 1rem;
    font-weight: 700;
    background: var(--color-on-surface);
    color: var(--color-surface);
    transition: all 0.2s ease;
    cursor: pointer;
}

.start-button:hover:not(.start-button--disabled) {
    transform: translateY(-2px);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
}

.start-button:active:not(.start-button--disabled) {
    transform: scale(0.98);
}

.start-button--disabled {
    opacity: 0.4;
    cursor: not-allowed;
}
</style>
