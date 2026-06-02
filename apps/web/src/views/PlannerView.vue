<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import PlannerCalendar from '../components/features/planner/PlannerCalendar.vue'
import PlannerSettingsPanel from '../components/features/planner/PlannerSettingsPanel.vue'
import type { PlannerSettings, DisciplineConfig } from '../components/features/planner/PlannerSettingsPanel.vue'
import { generateMonthlySchedule } from '../helpers/scheduler'
import { useDisciplinesQuery } from '../hooks/useDisciplines'

// ─── API: disciplines ─────────────────────────────────────────────────────────

const { data: apiDisciplines, isLoading: disciplinesLoading } = useDisciplinesQuery()

// ─── Persisted non-discipline settings ────────────────────────────────────────
// We only persist the scheduler options (studyDays, hoursPerDay, etc.) and
// per-discipline knowledgeLevel overrides. The discipline list itself comes
// from the API so it is never stale.

const STORAGE_KEY = 'vincis_planner_settings_v2'

interface PersistedSettings {
    revisionMode: PlannerSettings['revisionMode']
    revisionRhythm: PlannerSettings['revisionRhythm']
    studyDays: number[]
    hoursPerDay: number
    subjectsPerDay: number
    /** knowledgeLevel overrides keyed by discipline id */
    knowledgeLevels: Record<number, 1 | 2 | 3 | 4>
}

const DEFAULT_PERSISTED: PersistedSettings = {
    revisionMode: 'auto',
    revisionRhythm: 'normal',
    studyDays: [1, 2, 3, 4, 5],
    hoursPerDay: 4,
    subjectsPerDay: 3,
    knowledgeLevels: {},
}

function loadPersisted(): PersistedSettings {
    try {
        const raw = localStorage.getItem(STORAGE_KEY)
        if (raw) return { ...DEFAULT_PERSISTED, ...JSON.parse(raw) }
    } catch { /* private mode */ }
    return { ...DEFAULT_PERSISTED }
}

function savePersisted(s: PersistedSettings) {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(s)) } catch { /* ignore */ }
}

const persisted = ref<PersistedSettings>(loadPersisted())

// ─── Map API disciplines → DisciplineConfig ───────────────────────────────────
// API Discipline.weight (1–4) maps directly to DisciplineConfig.priority.
// knowledgeLevel is taken from the user's saved override (defaults to 2 = Básico).

const disciplineConfigs = computed((): DisciplineConfig[] => {
    if (!apiDisciplines.value?.length) return []
    return apiDisciplines.value.map(d => ({
        id: d.id,
        name: d.name,
        color: d.color,
        priority: (Math.min(4, Math.max(1, d.weight)) as 1 | 2 | 3 | 4),
        knowledgeLevel: persisted.value.knowledgeLevels[d.id] ?? 2,
    }))
})

// ─── Full settings object (reactive, merged) ──────────────────────────────────

const settings = computed((): PlannerSettings => ({
    revisionMode: persisted.value.revisionMode,
    revisionRhythm: persisted.value.revisionRhythm,
    studyDays: persisted.value.studyDays,
    hoursPerDay: persisted.value.hoursPerDay,
    subjectsPerDay: persisted.value.subjectsPerDay,
    disciplines: disciplineConfigs.value,
}))

// ─── Calendar view state ──────────────────────────────────────────────────────

const viewDate = ref(new Date())

// ─── Computed schedule ────────────────────────────────────────────────────────

const computedSchedule = computed(() =>
    generateMonthlySchedule(viewDate.value, settings.value)
)

// ─── Settings panel handlers ──────────────────────────────────────────────────

const settingsOpen = ref(false)

function onSettingsUpdate(newSettings: PlannerSettings) {
    // Extract per-discipline knowledgeLevel overrides before saving
    const knowledgeLevels: Record<number, 1 | 2 | 3 | 4> = {}
    for (const disc of newSettings.disciplines) {
        knowledgeLevels[disc.id] = disc.knowledgeLevel
    }

    persisted.value = {
        revisionMode: newSettings.revisionMode,
        revisionRhythm: newSettings.revisionRhythm,
        studyDays: newSettings.studyDays,
        hoursPerDay: newSettings.hoursPerDay,
        subjectsPerDay: newSettings.subjectsPerDay,
        knowledgeLevels,
    }
    savePersisted(persisted.value)
}

function onGenerate() {
    // Schedule is already reactive — no action needed.
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
            <!-- Loading -->
            <div v-if="disciplinesLoading" class="flex items-center justify-center h-full gap-3 text-on-surface-variant">
                <i class="pi pi-spin pi-spinner" style="font-size: 1.5rem" />
                <span class="font-sans text-sm">Carregando disciplinas...</span>
            </div>

            <!-- No disciplines yet -->
            <div v-else-if="!disciplineConfigs.length" class="flex flex-col items-center justify-center h-full gap-4 text-on-surface-variant">
                <i class="pi pi-book-open" style="font-size: 2.5rem; opacity: 0.4" />
                <p class="font-sans text-sm text-center max-w-xs leading-relaxed">
                    Nenhuma disciplina cadastrada. Acesse a página de
                    <strong class="text-primary">Disciplinas</strong> para adicionar as matérias do seu plano.
                </p>
            </div>

            <!-- Calendar -->
            <PlannerCalendar v-else :schedule="computedSchedule" />
        </main>


    </div>

    <!-- ── Painel de configurações (teleport para evitar overflow/z-index) -->
    <Teleport to="body">
        <PlannerSettingsPanel
            v-model:open="settingsOpen"
            :settings="settings"
            @update:settings="onSettingsUpdate"
            @generate="onGenerate"
        />
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