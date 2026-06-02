<script setup lang="ts">
import { ref, computed } from 'vue'

// ─── Types ────────────────────────────────────────────────────────────────────

export interface DisciplineConfig {
    id: number
    name: string
    color: string
    /** 1 = baixa, 2 = média, 3 = alta, 4 = muito alta */
    priority: 1 | 2 | 3 | 4
    /** 1 = iniciante, 2 = básico, 3 = intermediário, 4 = avançado */
    knowledgeLevel: 1 | 2 | 3 | 4
}

export interface PlannerSettings {
    revisionMode: 'auto' | 'manual'
    revisionRhythm: 'intense' | 'normal' | 'soft'
    studyDays: number[]          // 0=Dom … 6=Sáb
    hoursPerDay: number
    subjectsPerDay: number
    disciplines: DisciplineConfig[]
}

// ─── Props / Emits ────────────────────────────────────────────────────────────

const props = defineProps<{
    open: boolean
    settings: PlannerSettings
}>()

const emit = defineEmits<{
    'update:open': [value: boolean]
    'update:settings': [value: PlannerSettings]
    'generate': []
}>()

// ─── Internal state (cópia local para edição) ─────────────────────────────────

const local = ref<PlannerSettings>(structuredClone(toRaw(props.settings)))

// Sincroniza quando o pai atualiza settings
import { watch, toRaw } from 'vue'
watch(() => props.settings, (v) => { local.value = structuredClone(toRaw(v)) }, { deep: true })

function close() { emit('update:open', false) }
function save()  {
    emit('update:settings', structuredClone(toRaw(local.value)))
    emit('generate')
    close()
}

// ─── Dias da semana ───────────────────────────────────────────────────────────

const WEEK_DAYS = [
    { label: 'D', full: 'Domingo',    value: 0 },
    { label: 'S', full: 'Segunda',    value: 1 },
    { label: 'T', full: 'Terça',      value: 2 },
    { label: 'Q', full: 'Quarta',     value: 3 },
    { label: 'Q', full: 'Quinta',     value: 4 },
    { label: 'S', full: 'Sexta',      value: 5 },
    { label: 'S', full: 'Sábado',     value: 6 },
]

function toggleDay(val: number) {
    const idx = local.value.studyDays.indexOf(val)
    if (idx >= 0) local.value.studyDays.splice(idx, 1)
    else           local.value.studyDays.push(val)
}

function isDayActive(val: number) { return local.value.studyDays.includes(val) }

// ─── Ritmos de revisão ────────────────────────────────────────────────────────

const RHYTHMS = [
    { value: 'intense', label: 'Intenso',  desc: '1 · 3 · 7 dias',   icon: 'pi-bolt' },
    { value: 'normal',  label: 'Normal',   desc: '1 · 7 · 14 dias',  icon: 'pi-clock' },
    { value: 'soft',    label: 'Suave',    desc: '3 · 10 · 20 dias', icon: 'pi-leaf' },
] as const

// ─── Disciplinas — expandir/colapsar ─────────────────────────────────────────

const expandedDiscipline = ref<number | null>(null)

function toggleDiscipline(id: number) {
    expandedDiscipline.value = expandedDiscipline.value === id ? null : id
}

const PRIORITY_LABELS: Record<number, string> = {
    1: 'Baixa',
    2: 'Média',
    3: 'Alta',
    4: 'Muito Alta',
}

const KNOWLEDGE_LABELS: Record<number, string> = {
    1: 'Iniciante',
    2: 'Básico',
    3: 'Intermediário',
    4: 'Avançado',
}

function priorityColor(p: number): string {
    return ['#595f67','#735c00','#e65100','#ba1a1a'][p - 1]
}

function knowledgeColor(k: number): string {
    return ['#ba1a1a','#e65100','#735c00','#2e7d32'][k - 1]
}
</script>

<template>
    <!-- Backdrop -->
    <Transition name="backdrop">
        <div v-if="open" class="settings-backdrop" @click="close" />
    </Transition>

    <!-- Panel -->
    <Transition name="panel-slide">
        <aside v-if="open" class="settings-panel" role="dialog" aria-label="Configurações do Planner">

            <!-- ── Cabeçalho ───────────────────────────────────────────── -->
            <div class="panel-header">
                <div class="panel-header-title">
                    <i class="pi pi-sliders-h panel-header-icon" />
                    <span>Configurações do Planner</span>
                </div>
                <button class="close-btn" @click="close" title="Fechar">
                    <i class="pi pi-times" />
                </button>
            </div>

            <!-- ── Conteúdo rolável ────────────────────────────────────── -->
            <div class="panel-body">

                <!-- ══ 1. Revisões ════════════════════════════════════════ -->
                <section class="settings-section">
                    <h3 class="section-title">
                        <i class="pi pi-refresh" />
                        Revisões
                    </h3>

                    <!-- Modo auto / manual -->
                    <div class="toggle-group">
                        <button
                            class="mode-pill"
                            :class="{ active: local.revisionMode === 'auto' }"
                            @click="local.revisionMode = 'auto'"
                        >
                            <i class="pi pi-sparkles" />
                            Automáticas
                        </button>
                        <button
                            class="mode-pill"
                            :class="{ active: local.revisionMode === 'manual' }"
                            @click="local.revisionMode = 'manual'"
                        >
                            <i class="pi pi-sliders-v" />
                            Manuais
                        </button>
                    </div>

                    <p class="section-hint">
                        <template v-if="local.revisionMode === 'auto'">
                            O app calcula automaticamente o melhor espaçamento de revisões com base no seu desempenho.
                        </template>
                        <template v-else>
                            Escolha o ritmo de espaçamento entre cada revisão:
                        </template>
                    </p>

                    <!-- Ritmo (só quando manual) -->
                    <Transition name="fade-down">
                        <div v-if="local.revisionMode === 'manual'" class="rhythm-cards">
                            <button
                                v-for="r in RHYTHMS"
                                :key="r.value"
                                class="rhythm-card"
                                :class="{ active: local.revisionRhythm === r.value }"
                                @click="local.revisionRhythm = r.value"
                            >
                                <i :class="['pi', r.icon, 'rhythm-icon']" />
                                <span class="rhythm-label">{{ r.label }}</span>
                                <span class="rhythm-desc">{{ r.desc }}</span>
                            </button>
                        </div>
                    </Transition>
                </section>

                <div class="divider" />

                <!-- ══ 2. Dias de estudo ══════════════════════════════════ -->
                <section class="settings-section">
                    <h3 class="section-title">
                        <i class="pi pi-calendar" />
                        Dias de estudo
                    </h3>
                    <div class="day-pills">
                        <button
                            v-for="d in WEEK_DAYS"
                            :key="d.value"
                            class="day-pill"
                            :class="{ active: isDayActive(d.value) }"
                            :title="d.full"
                            @click="toggleDay(d.value)"
                        >
                            {{ d.label }}
                        </button>
                    </div>
                    <p class="section-hint">
                        {{ local.studyDays.length === 0
                            ? 'Nenhum dia selecionado.'
                            : WEEK_DAYS.filter(d => isDayActive(d.value)).map(d => d.full).join(', ') }}
                    </p>
                </section>

                <div class="divider" />

                <!-- ══ 3. Carga diária ════════════════════════════════════ -->
                <section class="settings-section">
                    <h3 class="section-title">
                        <i class="pi pi-clock" />
                        Carga diária
                    </h3>

                    <div class="field-group">
                        <label class="field-label">Horas por dia</label>
                        <div class="stepper">
                            <button class="stepper-btn" @click="local.hoursPerDay = Math.max(1, local.hoursPerDay - 1)">
                                <i class="pi pi-minus" />
                            </button>
                            <span class="stepper-value">{{ local.hoursPerDay }}h</span>
                            <button class="stepper-btn" @click="local.hoursPerDay = Math.min(12, local.hoursPerDay + 1)">
                                <i class="pi pi-plus" />
                            </button>
                        </div>
                    </div>

                    <div class="field-group">
                        <label class="field-label">Matérias por dia</label>
                        <div class="stepper">
                            <button class="stepper-btn" @click="local.subjectsPerDay = Math.max(1, local.subjectsPerDay - 1)">
                                <i class="pi pi-minus" />
                            </button>
                            <span class="stepper-value">{{ local.subjectsPerDay }}</span>
                            <button class="stepper-btn" @click="local.subjectsPerDay = Math.min(8, local.subjectsPerDay + 1)">
                                <i class="pi pi-plus" />
                            </button>
                        </div>
                    </div>
                </section>

                <div class="divider" />

                <!-- ══ 4. Disciplinas ═════════════════════════════════════ -->
                <section class="settings-section">
                    <h3 class="section-title">
                        <i class="pi pi-book" />
                        Configurar disciplinas
                    </h3>
                    <p class="section-hint mb-3">Clique em uma disciplina para ajustar prioridade e nível.</p>

                    <div class="discipline-list">
                        <div
                            v-for="disc in local.disciplines"
                            :key="disc.id"
                            class="discipline-item"
                        >
                            <!-- Linha clicável -->
                            <button
                                class="discipline-row"
                                :class="{ expanded: expandedDiscipline === disc.id }"
                                @click="toggleDiscipline(disc.id)"
                            >
                                <span
                                    class="discipline-dot"
                                    :style="{ backgroundColor: disc.color }"
                                />
                                <span class="discipline-name">{{ disc.name }}</span>
                                <span class="discipline-badges">
                                    <span class="disc-badge" :style="{ color: priorityColor(disc.priority), borderColor: priorityColor(disc.priority) + '44', backgroundColor: priorityColor(disc.priority) + '12' }">
                                        {{ PRIORITY_LABELS[disc.priority] }}
                                    </span>
                                    <span class="disc-badge" :style="{ color: knowledgeColor(disc.knowledgeLevel), borderColor: knowledgeColor(disc.knowledgeLevel) + '44', backgroundColor: knowledgeColor(disc.knowledgeLevel) + '12' }">
                                        {{ KNOWLEDGE_LABELS[disc.knowledgeLevel] }}
                                    </span>
                                </span>
                                <i :class="['pi', expandedDiscipline === disc.id ? 'pi-chevron-up' : 'pi-chevron-down', 'disc-chevron']" />
                            </button>

                            <!-- Menu expandido -->
                            <Transition name="fade-down">
                                <div v-if="expandedDiscipline === disc.id" class="discipline-config">

                                    <!-- Prioridade no edital -->
                                    <div class="config-field">
                                        <label class="config-label">Prioridade no edital</label>
                                        <div class="rating-row">
                                            <button
                                                v-for="lvl in 4"
                                                :key="lvl"
                                                class="rating-btn"
                                                :class="{ active: disc.priority >= lvl }"
                                                :style="disc.priority >= lvl
                                                    ? { backgroundColor: priorityColor(disc.priority) + '22', borderColor: priorityColor(disc.priority), color: priorityColor(disc.priority) }
                                                    : {}"
                                                @click="disc.priority = lvl as 1|2|3|4"
                                                :title="PRIORITY_LABELS[lvl]"
                                            >
                                                {{ PRIORITY_LABELS[lvl] }}
                                            </button>
                                        </div>
                                    </div>

                                    <!-- Nível de conhecimento -->
                                    <div class="config-field">
                                        <label class="config-label">Nível de conhecimento</label>
                                        <div class="rating-row">
                                            <button
                                                v-for="lvl in 4"
                                                :key="lvl"
                                                class="rating-btn"
                                                :class="{ active: disc.knowledgeLevel >= lvl }"
                                                :style="disc.knowledgeLevel >= lvl
                                                    ? { backgroundColor: knowledgeColor(disc.knowledgeLevel) + '22', borderColor: knowledgeColor(disc.knowledgeLevel), color: knowledgeColor(disc.knowledgeLevel) }
                                                    : {}"
                                                @click="disc.knowledgeLevel = lvl as 1|2|3|4"
                                                :title="KNOWLEDGE_LABELS[lvl]"
                                            >
                                                {{ KNOWLEDGE_LABELS[lvl] }}
                                            </button>
                                        </div>
                                    </div>

                                </div>
                            </Transition>
                        </div>
                    </div>
                </section>

            </div>

            <!-- ── Footer ─────────────────────────────────────────────── -->
            <div class="panel-footer">
                <button class="btn-ghost" @click="close">Cancelar</button>
                <button class="btn-primary" @click="save">
                    <i class="pi pi-sparkles" />
                    Gerar Planner
                </button>
            </div>

        </aside>
    </Transition>
</template>

<style scoped>
/* ── Backdrop ──────────────────────────────────────────────────────────────── */
.settings-backdrop {
    position: fixed;
    inset: 0;
    background: rgba(28, 27, 26, 0.35);
    backdrop-filter: blur(2px);
    z-index: 40;
}

/* ── Panel ─────────────────────────────────────────────────────────────────── */
.settings-panel {
    position: fixed;
    top: 0;
    right: 0;
    height: 100dvh;
    width: 100%;
    max-width: 420px;
    background: var(--surface-container-lowest);
    border-left: 1px solid var(--outline-variant);
    display: flex;
    flex-direction: column;
    z-index: 50;
    box-shadow: -8px 0 32px rgba(28, 27, 26, 0.12);
}

/* ── Transitions ───────────────────────────────────────────────────────────── */
.backdrop-enter-active, .backdrop-leave-active { transition: opacity 0.25s ease; }
.backdrop-enter-from, .backdrop-leave-to { opacity: 0; }

.panel-slide-enter-active, .panel-slide-leave-active { transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1); }
.panel-slide-enter-from, .panel-slide-leave-to { transform: translateX(100%); }

.fade-down-enter-active, .fade-down-leave-active { transition: opacity 0.2s ease, transform 0.2s ease; }
.fade-down-enter-from, .fade-down-leave-to { opacity: 0; transform: translateY(-6px); }

/* ── Header ────────────────────────────────────────────────────────────────── */
.panel-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 1.125rem 1.25rem;
    border-bottom: 1px solid var(--outline-variant);
    flex-shrink: 0;
    background: var(--surface-container-low);
}

.panel-header-title {
    display: flex;
    align-items: center;
    gap: 0.625rem;
    font-family: var(--font-family-sans);
    font-size: 0.9rem;
    font-weight: 700;
    color: var(--on-surface);
    letter-spacing: 0.01em;
}

.panel-header-icon {
    color: var(--primary);
    font-size: 1rem;
}

.close-btn {
    width: 2rem;
    height: 2rem;
    border-radius: 50%;
    border: 1px solid var(--outline-variant);
    background: transparent;
    color: var(--on-surface-variant);
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 0.75rem;
    transition: background 0.15s, color 0.15s;
}
.close-btn:hover { background: var(--surface-container-high); color: var(--on-surface); }

/* ── Body ──────────────────────────────────────────────────────────────────── */
.panel-body {
    flex: 1;
    overflow-y: auto;
    padding: 1.25rem;
    display: flex;
    flex-direction: column;
    gap: 0;
}

/* ── Section ───────────────────────────────────────────────────────────────── */
.settings-section { padding: 0.25rem 0 1rem; }

.section-title {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-family: var(--font-family-sans);
    font-size: 0.78rem;
    font-weight: 700;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: var(--primary);
    margin: 0 0 0.875rem;
}

.section-hint {
    font-family: var(--font-family-sans);
    font-size: 0.78rem;
    color: var(--on-surface-variant);
    line-height: 1.5;
    margin-top: 0.5rem;
}

.divider {
    height: 1px;
    background: var(--outline-variant);
    opacity: 0.5;
    margin: 0.5rem 0 1.25rem;
}

/* ── Revisão: modo pills ───────────────────────────────────────────────────── */
.toggle-group {
    display: flex;
    gap: 0.5rem;
}

.mode-pill {
    display: flex;
    align-items: center;
    gap: 0.4rem;
    padding: 0.45rem 0.875rem;
    border-radius: 99px;
    border: 1.5px solid var(--outline-variant);
    background: transparent;
    font-family: var(--font-family-sans);
    font-size: 0.8rem;
    font-weight: 600;
    color: var(--on-surface-variant);
    cursor: pointer;
    transition: all 0.18s ease;
}
.mode-pill:hover { border-color: var(--primary); color: var(--primary); background: color-mix(in srgb, var(--primary) 6%, transparent); }
.mode-pill.active { border-color: var(--primary); color: var(--primary); background: color-mix(in srgb, var(--primary) 10%, transparent); }

/* ── Ritmo: cards ──────────────────────────────────────────────────────────── */
.rhythm-cards {
    display: flex;
    gap: 0.5rem;
    margin-top: 0.875rem;
}

.rhythm-card {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.25rem;
    padding: 0.75rem 0.5rem;
    border-radius: 10px;
    border: 1.5px solid var(--outline-variant);
    background: var(--surface-container-low);
    cursor: pointer;
    transition: all 0.18s ease;
}
.rhythm-card:hover { border-color: var(--primary); background: color-mix(in srgb, var(--primary) 5%, transparent); }
.rhythm-card.active { border-color: var(--primary); background: color-mix(in srgb, var(--primary) 10%, transparent); }

.rhythm-icon {
    font-size: 1.125rem;
    color: var(--on-surface-muted);
    transition: color 0.18s;
}
.rhythm-card.active .rhythm-icon, .rhythm-card:hover .rhythm-icon { color: var(--primary); }

.rhythm-label {
    font-family: var(--font-family-sans);
    font-size: 0.78rem;
    font-weight: 700;
    color: var(--on-surface);
}

.rhythm-desc {
    font-family: var(--font-family-sans);
    font-size: 0.65rem;
    color: var(--on-surface-muted);
    letter-spacing: 0.03em;
}

/* ── Dias da semana ────────────────────────────────────────────────────────── */
.day-pills {
    display: flex;
    gap: 0.375rem;
}

.day-pill {
    width: 2.25rem;
    height: 2.25rem;
    border-radius: 50%;
    border: 1.5px solid var(--outline-variant);
    background: transparent;
    font-family: var(--font-family-sans);
    font-size: 0.72rem;
    font-weight: 700;
    color: var(--on-surface-variant);
    cursor: pointer;
    transition: all 0.15s;
    display: flex;
    align-items: center;
    justify-content: center;
}
.day-pill:hover { border-color: var(--primary); color: var(--primary); }
.day-pill.active { background: var(--primary); border-color: var(--primary); color: #fff; }

/* ── Stepper ───────────────────────────────────────────────────────────────── */
.field-group {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0.625rem 0;
}
.field-group + .field-group { border-top: 1px solid color-mix(in srgb, var(--outline-variant) 50%, transparent); }

.field-label {
    font-family: var(--font-family-sans);
    font-size: 0.82rem;
    font-weight: 500;
    color: var(--on-surface);
}

.stepper {
    display: flex;
    align-items: center;
    gap: 0.625rem;
}

.stepper-btn {
    width: 1.875rem;
    height: 1.875rem;
    border-radius: 50%;
    border: 1.5px solid var(--outline-variant);
    background: var(--surface-container-low);
    color: var(--on-surface-variant);
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 0.65rem;
    transition: all 0.15s;
}
.stepper-btn:hover { border-color: var(--primary); color: var(--primary); background: color-mix(in srgb, var(--primary) 8%, transparent); }

.stepper-value {
    font-family: var(--font-family-sans);
    font-size: 0.9rem;
    font-weight: 700;
    color: var(--on-surface);
    min-width: 2rem;
    text-align: center;
}

/* ── Discipline list ───────────────────────────────────────────────────────── */
.discipline-list {
    display: flex;
    flex-direction: column;
    gap: 0.375rem;
}

.discipline-item {
    border-radius: 10px;
    border: 1px solid var(--outline-variant);
    overflow: hidden;
    transition: border-color 0.15s;
}
.discipline-item:hover { border-color: color-mix(in srgb, var(--primary) 60%, transparent); }

.discipline-row {
    width: 100%;
    display: flex;
    align-items: center;
    gap: 0.6rem;
    padding: 0.625rem 0.75rem;
    background: var(--surface-container-low);
    border: none;
    cursor: pointer;
    text-align: left;
    transition: background 0.15s;
}
.discipline-row:hover, .discipline-row.expanded { background: var(--surface-container); }

.discipline-dot {
    width: 10px;
    height: 10px;
    border-radius: 50%;
    flex-shrink: 0;
}

.discipline-name {
    font-family: var(--font-family-sans);
    font-size: 0.82rem;
    font-weight: 600;
    color: var(--on-surface);
    flex: 1;
}

.discipline-badges {
    display: flex;
    gap: 0.35rem;
}

.disc-badge {
    font-family: var(--font-family-sans);
    font-size: 0.6rem;
    font-weight: 700;
    padding: 0.15rem 0.45rem;
    border-radius: 99px;
    border: 1px solid;
    letter-spacing: 0.03em;
    text-transform: uppercase;
}

.disc-chevron {
    font-size: 0.65rem;
    color: var(--on-surface-muted);
    flex-shrink: 0;
    transition: transform 0.2s;
}

/* ── Discipline config panel ───────────────────────────────────────────────── */
.discipline-config {
    padding: 0.875rem 0.75rem;
    background: var(--surface-container-lowest);
    border-top: 1px solid var(--outline-variant);
    display: flex;
    flex-direction: column;
    gap: 0.875rem;
}

.config-field { display: flex; flex-direction: column; gap: 0.45rem; }

.config-label {
    font-family: var(--font-family-sans);
    font-size: 0.72rem;
    font-weight: 700;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    color: var(--on-surface-muted);
}

.rating-row {
    display: flex;
    gap: 0.375rem;
}

.rating-btn {
    flex: 1;
    padding: 0.35rem 0.25rem;
    border-radius: 6px;
    border: 1.5px solid var(--outline-variant);
    background: transparent;
    font-family: var(--font-family-sans);
    font-size: 0.65rem;
    font-weight: 600;
    color: var(--on-surface-muted);
    cursor: pointer;
    transition: all 0.15s;
    text-align: center;
}
.rating-btn:hover { border-color: var(--outline); color: var(--on-surface); }

/* ── Footer ────────────────────────────────────────────────────────────────── */
.panel-footer {
    flex-shrink: 0;
    display: flex;
    gap: 0.625rem;
    padding: 1rem 1.25rem;
    border-top: 1px solid var(--outline-variant);
    background: var(--surface-container-low);
}

.btn-ghost {
    flex: 1;
    padding: 0.625rem;
    border-radius: 8px;
    border: 1.5px solid var(--outline-variant);
    background: transparent;
    font-family: var(--font-family-sans);
    font-size: 0.82rem;
    font-weight: 600;
    color: var(--on-surface-variant);
    cursor: pointer;
    transition: all 0.15s;
}
.btn-ghost:hover { border-color: var(--outline); color: var(--on-surface); background: var(--surface-container); }

.btn-primary {
    flex: 2;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    padding: 0.625rem;
    border-radius: 8px;
    border: none;
    background: var(--primary);
    color: #fff;
    font-family: var(--font-family-sans);
    font-size: 0.82rem;
    font-weight: 700;
    cursor: pointer;
    transition: background 0.15s, transform 0.1s;
}
.btn-primary:hover { background: var(--primary-hover, #554300); }
.btn-primary:active { transform: scale(0.98); }
</style>
