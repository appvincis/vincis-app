<script setup lang="ts">
import { ref } from 'vue'
import PlannerCalendar from '../components/features/planner/PlannerCalendar.vue'
import PlannerSettingsPanel from '../components/features/planner/PlannerSettingsPanel.vue'
import type { StudySession } from '../components/features/planner/PlannerCalendar.vue'
import type { PlannerSettings } from '../components/features/planner/PlannerSettingsPanel.vue'

// ─── Painel de configurações ──────────────────────────────────────────────────

const settingsOpen = ref(false)

const settings = ref<PlannerSettings>({
    revisionMode: 'auto',
    revisionRhythm: 'normal',
    studyDays: [1, 2, 3, 4, 5],   // seg–sex por padrão
    hoursPerDay: 4,
    subjectsPerDay: 3,
    disciplines: [
        { id: 1, name: 'Cálculo II', color: '#735c00', priority: 3, knowledgeLevel: 2 },
        { id: 2, name: 'Álgebra Linear', color: '#595f67', priority: 2, knowledgeLevel: 3 },
        { id: 3, name: 'Física III', color: '#2e7d32', priority: 3, knowledgeLevel: 1 },
        { id: 4, name: 'Prog. Funcional', color: '#e65100', priority: 1, knowledgeLevel: 3 },
        { id: 5, name: 'Estatística', color: '#ba1a1a', priority: 2, knowledgeLevel: 2 },
    ],
})

function onGenerate() {
    // TODO: chamar API/store com settings.value para gerar o cronograma
    console.log('Gerando planner com:', settings.value)
}

// ─── Mock: sessões de demonstração ────────────────────────────────────────────

function today(offset = 0) {
    const d = new Date()
    d.setDate(d.getDate() + offset)
    const y = d.getFullYear()
    const m = String(d.getMonth() + 1).padStart(2, '0')
    const day = String(d.getDate()).padStart(2, '0')
    return `${y}-${m}-${day}`
}

const mockSchedule: Record<string, StudySession[]> = {
    [today(0)]: [
        { id: 1, disciplineName: 'Cálculo II', color: '#735c00', durationMin: 90 },
        { id: 2, disciplineName: 'Álgebra Linear', color: '#595f67', durationMin: 60 },
    ],
    [today(1)]: [
        { id: 3, disciplineName: 'Física III', color: '#2e7d32', durationMin: 120 },
    ],
    [today(2)]: [
        { id: 4, disciplineName: 'Cálculo II', color: '#735c00', durationMin: 90 },
        { id: 5, disciplineName: 'Prog. Funcional', color: '#e65100', durationMin: 45 },
        { id: 6, disciplineName: 'Física III', color: '#2e7d32', durationMin: 60 },
        { id: 7, disciplineName: 'Estatística', color: '#ba1a1a', durationMin: 30 },
    ],
    [today(4)]: [
        { id: 8, disciplineName: 'Álgebra Linear', color: '#595f67', durationMin: 60 },
    ],
    [today(6)]: [
        { id: 9, disciplineName: 'Cálculo II', color: '#735c00', durationMin: 90 },
        { id: 10, disciplineName: 'Estatística', color: '#ba1a1a', durationMin: 60 },
    ],
    [today(-2)]: [
        { id: 11, disciplineName: 'Física III', color: '#2e7d32', durationMin: 90 },
        { id: 12, disciplineName: 'Prog. Funcional', color: '#e65100', durationMin: 45 },
    ],
    [today(-5)]: [
        { id: 13, disciplineName: 'Álgebra Linear', color: '#595f67', durationMin: 60 },
    ],
}
</script>

<template>
    <div class="planner-shell">

        <!-- ── Header ──────────────────────────────────────────────────── -->
        <header class="planner-header">
            <div class="header-row">
                <h1 class="text-4xl font-headline font-bold text-on-surface tracking-tight relative inline-block">
                    Planner
                    <div class="absolute -bottom-2 left-0 w-24 h-1 bg-primary-container/70 rounded-full"></div>
                </h1>

                <button id="planner-settings-btn" class="settings-btn" :class="{ active: settingsOpen }"
                    @click="settingsOpen = true" title="Configurações do Planner">
                    <i class="pi pi-sliders-h" />
                    <span>Configurações</span>
                </button>
            </div>
        </header>

        <!-- ── Calendário ──────────────────────────────────────────────── -->
        <main class="planner-calendar-area">
            <PlannerCalendar :schedule="mockSchedule" />
        </main>

    </div>

    <!-- ── Painel de configurações (teleport para evitar overflow/z-index) -->
    <Teleport to="body">
        <PlannerSettingsPanel v-model:open="settingsOpen" v-model:settings="settings" @generate="onGenerate" />
    </Teleport>
</template>

<style scoped>
.planner-shell {
    display: flex;
    flex-direction: column;
    height: calc(100vh - 4rem);
    gap: 1.5rem;
}

.planner-header {
    flex-shrink: 0;
}

.header-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
}

/* ── Botão de configurações ──────────────────────────────────────────────── */
.settings-btn {
    display: flex;
    align-items: center;
    gap: 0.45rem;
    padding: 0.5rem 1rem;
    border-radius: 10px;
    border: 1.5px solid var(--color-outline-variant);
    background: var(--color-surface-container-low);
    font-family: var(--font-family-sans);
    font-size: 0.82rem;
    font-weight: 600;
    color: var(--color-on-surface-variant);
    cursor: pointer;
    transition: all 0.18s ease;
    flex-shrink: 0;
}

.settings-btn i {
    font-size: 0.9rem;
}

.settings-btn:hover {
    border-color: var(--color-primary);
    color: var(--color-primary);
    background: color-mix(in srgb, var(--color-primary) 6%, transparent);
}

.settings-btn.active {
    border-color: var(--color-primary);
    color: var(--color-primary);
    background: color-mix(in srgb, var(--color-primary) 10%, transparent);
}

/* ── Calendário ──────────────────────────────────────────────────────────── */
.planner-calendar-area {
    flex: 1;
    min-height: 0;
}
</style>