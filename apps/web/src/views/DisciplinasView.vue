<script setup lang="ts">
import { ref, computed } from 'vue'
import { VCard, VButton, VInput } from '../components/ui'
import { useStudyPlanStore } from '../stores/study-plan'
import { 
    useDisciplinesQuery, 
    useCreateDisciplineMutation, 
    useUpdateDisciplineMutation, 
    useDeleteDisciplineMutation,
    useTopicsQuery,
    useCreateTopicMutation,
    useUpdateTopicMutation,
    useDeleteTopicMutation
} from '../hooks/useDisciplines'

const studyPlanStore = useStudyPlanStore()

// ─── Queries ──────────────────────────────────────────────────────────────────
const disciplinesQuery = useDisciplinesQuery()
const disciplines = computed(() => disciplinesQuery.data.value || [])
const isLoading = computed(() => disciplinesQuery.isLoading.value)
const disciplinesError = computed(() => disciplinesQuery.error.value)

const createDisciplineMutation = useCreateDisciplineMutation()
const updateDisciplineMutation = useUpdateDisciplineMutation()
const deleteDisciplineMutation = useDeleteDisciplineMutation()

// ─── State ────────────────────────────────────────────────────────────────────
// Create discipline form
const showCreateForm = ref(false)
const newName = ref('')
const newColor = ref('#6366f1')
const newWeight = ref<number>(1.0)

// Selected discipline panel
const selectedDisciplineId = ref<number | null>(null)
const selectedDiscipline = computed(() => disciplines.value.find(d => d.id === selectedDisciplineId.value))
const isPanelOpen = ref(false)
const panelWeight = ref<number>(1.0)
const panelName = ref('')
const panelColor = ref('')

// Topics query
const topicsQuery = useTopicsQuery(selectedDisciplineId.value ?? undefined)
const topics = computed(() => topicsQuery.data.value || [])
const isLoadingTopics = computed(() => topicsQuery.isLoading.value)

const createTopicMutation = useCreateTopicMutation()
const updateTopicMutation = useUpdateTopicMutation()
const deleteTopicMutation = useDeleteTopicMutation()

const newTopicName = ref('')
const newTopicDesc = ref('')

// Topic inline edit
const editingTopicId = ref<number | null>(null)
const editTopicName = ref('')
const editTopicDesc = ref('')

// ─── Helpers ──────────────────────────────────────────────────────────────────
const PRESET_COLORS = [
    '#6366f1', '#8b5cf6', '#ec4899', '#ef4444',
    '#f97316', '#eab308', '#22c55e', '#14b8a6', '#3b82f6',
]

const errorMsg = computed(() => {
    if (disciplinesError.value) return 'Erro ao carregar disciplinas.'
    return ''
})

// ─── Discipline CRUD ──────────────────────────────────────────────────────────
async function createDiscipline() {
    if (!newName.value.trim()) return
    await createDisciplineMutation.mutateAsync({
        name: newName.value.trim(),
        color: newColor.value,
        weight: newWeight.value
    })
    newName.value = ''
    newColor.value = '#6366f1'
    newWeight.value = 1.0
    showCreateForm.value = false
}

async function deleteDiscipline(id: number) {
    await deleteDisciplineMutation.mutateAsync(id)
    if (selectedDisciplineId.value === id) closePanel()
}

// ─── Panel (Discipline Detail) ────────────────────────────────────────────────
function openPanel(discipline: any) {
    selectedDisciplineId.value = discipline.id
    isPanelOpen.value = true
    panelWeight.value = discipline.weight ?? 1.0
    panelName.value = discipline.name
    panelColor.value = discipline.color
    newTopicName.value = ''
    newTopicDesc.value = ''
    editingTopicId.value = null
}

function closePanel() {
    isPanelOpen.value = false
    selectedDisciplineId.value = null
}

async function addTopic() {
    if (!newTopicName.value.trim() || !selectedDisciplineId.value) return
    await createTopicMutation.mutateAsync({
        name: newTopicName.value.trim(),
        description: newTopicDesc.value.trim() || undefined,
        disciplineId: selectedDisciplineId.value
    })
    newTopicName.value = ''
    newTopicDesc.value = ''
}

async function toggleTopic(topic: any) {
    await updateTopicMutation.mutateAsync({
        id: topic.id,
        isCompleted: !topic.isCompleted,
        disciplineId: topic.disciplineId
    })
}

async function deleteTopic(id: number) {
    if (!selectedDisciplineId.value) return
    await deleteTopicMutation.mutateAsync({ id, disciplineId: selectedDisciplineId.value })
}

const completedCount = computed(() => topics.value.filter((t) => t.isCompleted).length)
const progress = computed(() =>
    topics.value.length ? Math.round((completedCount.value / topics.value.length) * 100) : 0
)

async function saveDisciplineInfo() {
    if (!selectedDisciplineId.value || !panelName.value.trim()) return
    await updateDisciplineMutation.mutateAsync({
        id: selectedDisciplineId.value,
        name: panelName.value.trim(),
        color: panelColor.value,
        weight: panelWeight.value,
    })
}

function startEditTopic(topic: any) {
    editingTopicId.value = topic.id
    editTopicName.value = topic.name
    editTopicDesc.value = topic.description ?? ''
}

function cancelTopicEdit() {
    editingTopicId.value = null
    editTopicName.value = ''
    editTopicDesc.value = ''
}

async function saveTopicEdit(topicId: number) {
    if (!editTopicName.value.trim() || !selectedDisciplineId.value) return
    await updateTopicMutation.mutateAsync({
        id: topicId,
        name: editTopicName.value.trim(),
        description: editTopicDesc.value.trim() || undefined,
        disciplineId: selectedDisciplineId.value
    })
    cancelTopicEdit()
}
</script>

<template>
    <div class="disciplinas-view">

        <!-- Header -->
        <header class="view-header">
            <div class="flex items-center justify-between">
                <div>
                    <h1 class="text-4xl font-serif font-bold text-on-surface">Disciplinas</h1>
                    <p class="text-secondary mt-2">Organize suas matérias e adicione tópicos de estudo.</p>
                </div>
                <VButton @click="showCreateForm = !showCreateForm" variant="primary"
                    :disabled="!studyPlanStore.hasActivePlan"
                    :title="!studyPlanStore.hasActivePlan ? 'Selecione um plano de estudo primeiro' : ''">
                    <span class="material-symbols-outlined"
                        style="font-size:1.1rem;vertical-align:-3px;margin-right:6px">add</span>
                    Nova Disciplina
                </VButton>
            </div>

            <!-- No active plan warning -->
            <div v-if="!studyPlanStore.activePlanId"
                class="mt-4 p-3 rounded-lg bg-error/10 border border-error/30 text-error text-sm flex items-center gap-2">
                <span class="material-symbols-outlined text-sm">warning</span>
                Nenhum plano de estudo ativo. Selecione um plano no Dashboard.
            </div>

            <!-- Error -->
            <div v-if="errorMsg" class="mt-3 p-3 rounded-lg bg-error/10 border border-error/30 text-error text-sm">
                {{ errorMsg }}
            </div>
        </header>

        <!-- Create Form -->
        <Transition name="slide-down">
            <VCard v-if="showCreateForm" class="p-6 mb-6 border border-outline-variant/20">
                <h3 class="text-base font-serif font-bold text-on-surface mb-4">Nova Disciplina</h3>
                <div class="flex flex-col gap-4">
                    <VInput v-model="newName" label="Nome" placeholder="Ex: Direito Constitucional..." icon="subject" />

                    <!-- Color Picker -->
                    <div>
                        <p class="text-xs font-bold uppercase tracking-widest text-secondary mb-2">Cor</p>
                        <div class="flex gap-2 flex-wrap">
                            <button v-for="color in PRESET_COLORS" :key="color" class="color-swatch"
                                :class="{ 'color-swatch--active': newColor === color }" :style="{ background: color }"
                                @click="newColor = color" />
                        </div>
                    </div>

                    <!-- Weight Slider -->
                    <div>
                        <div class="flex justify-between items-center mb-2">
                            <p class="text-xs font-bold uppercase tracking-widest text-secondary">Peso / Importância</p>
                            <span class="weight-badge" :style="{ background: newColor }">{{ newWeight.toFixed(1)
                                }}</span>
                        </div>
                        <input type="range" v-model.number="newWeight" min="0.5" max="5" step="0.5"
                            class="weight-slider" />
                        <div class="flex justify-between text-xs text-secondary mt-1">
                            <span>Baixo</span><span>Alto</span>
                        </div>
                    </div>

                    <div class="flex gap-3 justify-end pt-2">
                        <VButton variant="secondary" @click="showCreateForm = false">Cancelar</VButton>
                        <VButton variant="primary" :disabled="createDisciplineMutation.isPending.value || !newName.trim()" @click="createDiscipline">
                            {{ createDisciplineMutation.isPending.value ? 'Criando...' : 'Criar Disciplina' }}
                        </VButton>
                    </div>
                </div>
            </VCard>
        </Transition>

        <!-- Loading -->
        <div v-if="isLoading" class="flex justify-center items-center h-64">
            <div class="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        </div>

        <!-- Empty State -->
        <div v-else-if="!disciplines.length" class="mt-8">
            <VCard class="p-12 text-center border-dashed border-2 border-outline-variant/30">
                <span class="material-symbols-outlined text-6xl text-outline-variant mb-4"
                    style="display:block">subject</span>
                <h3 class="text-xl font-serif font-bold text-on-surface">Nenhuma disciplina cadastrada</h3>
                <p class="text-secondary mt-2 max-w-md mx-auto">
                    Crie sua primeira disciplina para começar a organizar sua jornada acadêmica.
                </p>
                <VButton class="mt-6" @click="showCreateForm = true" :disabled="!studyPlanStore.hasActivePlan"
                    :title="!studyPlanStore.hasActivePlan ? 'Selecione um plano de estudo primeiro' : ''">Criar primeira
                    disciplina</VButton>
            </VCard>
        </div>

        <!-- Discipline Grid -->
        <div v-else class="discipline-grid animate-fade-in">
            <button v-for="disc in disciplines" :key="disc.id" class="discipline-card" @click="openPanel(disc)"
                :class="{ 'discipline-card--active': selectedDiscipline?.id === disc.id }">
                <div class="discipline-card__color-bar" :style="{ background: disc.color }" />
                <div class="discipline-card__body">
                    <div class="flex items-start justify-between gap-2">
                        <h3 class="discipline-card__name">{{ disc.name }}</h3>
                        <button class="discipline-card__delete" @click.stop="deleteDiscipline(disc.id)"
                            title="Remover disciplina">
                            <span class="material-symbols-outlined">delete</span>
                        </button>
                    </div>
                    <div class="flex items-center justify-between mt-2">
                        <p class="discipline-card__hint">Clique para ver os tópicos</p>
                        <span class="weight-badge" :style="{ background: disc.color }">
                            {{ (disc.weight ?? 1).toFixed(1) }}
                        </span>
                    </div>
                </div>
            </button>
        </div>

        <!-- Fixed Right Panel -->
        <Transition name="panel">
            <div v-if="isPanelOpen" class="panel-overlay" @click.self="closePanel">
                <div class="panel">

                    <!-- Panel Header -->
                    <div class="detail__header" :style="{ borderLeftColor: panelColor }">
                        <div class="flex items-center gap-3 flex-1 min-w-0">
                            <span class="detail__dot" :style="{ background: panelColor }" />
                            <div class="min-w-0">
                                <h2 class="detail__title">{{ selectedDiscipline?.name }}</h2>
                                <p class="detail__subtitle">{{ topics.length }} tópico{{ topics.length !== 1 ? 's'
                                    : '' }}</p>
                            </div>
                        </div>
                        <button class="detail__close" @click="closePanel" title="Fechar">
                            <span class="material-symbols-outlined">close</span>
                        </button>
                    </div>

                    <!-- Progress Bar -->
                    <div v-if="topics.length" class="detail__progress-wrap">
                        <div class="flex justify-between text-xs text-secondary mb-1">
                            <span>Progresso</span>
                            <span>{{ completedCount }}/{{ topics.length }} ({{ progress }}%)</span>
                        </div>
                        <div class="detail__progress-track">
                            <div class="detail__progress-fill"
                                :style="{ width: progress + '%', background: panelColor }" />
                        </div>
                    </div>

                    <!-- Edit Discipline (collapsible) -->
                    <details class="detail__edit-section">
                        <summary class="detail__edit-summary">
                            <span class="material-symbols-outlined"
                                style="font-size:1rem;vertical-align:-2px">tune</span>
                            Editar Disciplina
                        </summary>
                        <div class="detail__edit-body">
                            <VInput v-model="panelName" label="Nome" icon="subject" />
                            <div>
                                <p class="text-xs text-secondary mb-2">Cor</p>
                                <div class="flex gap-2 flex-wrap">
                                    <button v-for="color in PRESET_COLORS" :key="color" class="color-swatch"
                                        :class="{ 'color-swatch--active': panelColor === color }"
                                        :style="{ background: color }" @click="panelColor = color" />
                                </div>
                            </div>
                            <div>
                                <div class="flex justify-between items-center mb-1">
                                    <p class="text-xs text-secondary">Peso / Import&#226;ncia</p>
                                    <span class="weight-badge" :style="{ background: panelColor }">{{
                                        panelWeight.toFixed(1) }}</span>
                                </div>
                                <input type="range" v-model.number="panelWeight" min="0.5" max="5" step="0.5"
                                    class="weight-slider" />
                                <div class="flex justify-between text-xs text-secondary mt-1">
                                    <span>Baixo</span><span>Alto</span>
                                </div>
                            </div>
                            <VButton variant="secondary" :disabled="updateDisciplineMutation.isPending.value" @click="saveDisciplineInfo"
                                style="width:100%">
                                {{ updateDisciplineMutation.isPending.value ? 'Salvando...' : 'Salvar Altera&#231;&#245;es' }}
                            </VButton>
                        </div>
                    </details>

                    <!-- Topics List -->
                    <div class="detail__topics">
                        <div v-if="isLoadingTopics" class="flex justify-center py-8">
                            <div
                                class="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                        </div>
                        <div v-else-if="!topics.length" class="detail__empty">
                            <span class="material-symbols-outlined text-4xl text-outline-variant mb-2"
                                style="display:block">article</span>
                            <p class="text-secondary text-sm">Nenhum tópico ainda. Adicione abaixo.</p>
                        </div>
                        <ul v-else class="topic-list">
                            <li v-for="topic in topics" :key="topic.id" class="topic-item"
                                :class="{ 'topic-item--done': topic.isCompleted && editingTopicId !== topic.id }">
                                <template v-if="editingTopicId !== topic.id">
                                    <button class="topic-item__check" @click="toggleTopic(topic)">
                                        <span class="material-symbols-outlined">
                                            {{ topic.isCompleted ? 'check_circle' : 'radio_button_unchecked' }}
                                        </span>
                                    </button>
                                    <div class="topic-item__text">
                                        <span class="topic-item__name">{{ topic.name }}</span>
                                        <span v-if="topic.description" class="topic-item__desc">{{ topic.description
                                        }}</span>
                                    </div>
                                    <button class="topic-item__action" @click="startEditTopic(topic)" title="Editar">
                                        <span class="material-symbols-outlined">edit</span>
                                    </button>
                                    <button class="topic-item__delete" @click="deleteTopic(topic.id)" title="Deletar">
                                        <span class="material-symbols-outlined">delete</span>
                                    </button>
                                </template>
                                <template v-else>
                                    <div class="topic-edit-form">
                                        <VInput v-model="editTopicName" placeholder="Nome do tópico..."
                                            icon="edit_note" />
                                        <VInput v-model="editTopicDesc" placeholder="Descri&#231;&#227;o (opcional)..."
                                            icon="notes" />
                                        <div class="flex gap-2">
                                            <VButton variant="primary"
                                                :disabled="updateTopicMutation.isPending.value || !editTopicName.trim()"
                                                @click="saveTopicEdit(topic.id)" style="flex:1">
                                                {{ updateTopicMutation.isPending.value ? 'Salvando...' : 'Salvar' }}
                                            </VButton>
                                            <VButton variant="secondary" @click="cancelTopicEdit" style="flex:1">
                                                Cancelar</VButton>
                                        </div>
                                    </div>
                                </template>
                            </li>
                        </ul>
                    </div>

                    <!-- Add Topic -->
                    <div class="detail__add-topic">
                        <h4 class="text-xs font-bold uppercase tracking-widest text-secondary mb-3">Adicionar
                            Tópico</h4>
                        <div class="flex flex-col gap-3">
                            <VInput v-model="newTopicName" placeholder="Nome do tópico..." icon="edit_note" />
                            <VInput v-model="newTopicDesc" placeholder="Descri&#231;&#227;o (opcional)..."
                                icon="notes" />
                            <VButton variant="primary" :disabled="createTopicMutation.isPending.value || !newTopicName.trim()"
                                @click="addTopic">
                                {{ createTopicMutation.isPending.value ? 'Adicionando...' : 'Adicionar Tópico' }}
                            </VButton>
                        </div>
                    </div>

                </div>
            </div>
        </Transition>

    </div>
</template>

<style scoped>
/* ─── Layout ─────────────────────────────────────────────────────────────── */
.disciplinas-view {
    width: 100%;
}

.view-header {
    margin-bottom: 2rem;
}

/* ─── Grid ───────────────────────────────────────────────────────────────── */
.discipline-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
    gap: 1.25rem;
    margin-top: 2rem;
}

/* ─── Discipline Card ────────────────────────────────────────────────────── */
.discipline-card {
    display: flex;
    flex-direction: column;
    background: var(--surface-container-lowest);
    border: 1px solid rgba(208, 197, 175, 0.1);
    border-radius: 0.75rem;
    overflow: hidden;
    cursor: pointer;
    text-align: left;
    transition: transform 0.18s ease, box-shadow 0.18s ease, border-color 0.2s;
}

.discipline-card:hover {
    transform: translateY(-3px);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
}

.discipline-card--active {
    box-shadow: 0 8px 28px rgba(0, 0, 0, 0.18);
    transform: translateY(-2px);
}

.discipline-card__color-bar {
    height: 5px;
    width: 100%;
    flex-shrink: 0;
}

.discipline-card__body {
    padding: 1.25rem;
    flex: 1;
}

.discipline-card__name {
    font-family: var(--ds-font-serif);
    font-size: 1rem;
    font-weight: 700;
    color: var(--on-surface);
    line-height: 1.3;
    flex: 1;
}

.discipline-card__hint {
    font-size: 0.75rem;
    color: var(--secondary);
    margin-top: 0.5rem;
}

.discipline-card__delete {
    color: var(--secondary);
    opacity: 0;
    transition: opacity 0.15s;
    background: none;
    border: none;
    cursor: pointer;
    padding: 0;
    line-height: 1;
}

.discipline-card:hover .discipline-card__delete {
    opacity: 1;
}

.discipline-card__delete:hover {
    color: var(--error, #ef4444);
}

/* ─── Overlay Panel ──────────────────────────────────────────────────────── */
.panel-overlay {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.45);
    backdrop-filter: blur(2px);
    z-index: 100;
    display: flex;
    justify-content: flex-end;
}

.panel {
    width: min(480px, 95vw);
    height: 100%;
    background: var(--surface-container-lowest);
    display: flex;
    flex-direction: column;
    overflow: hidden;
}

/* ─── Color Swatches ─────────────────────────────────────────────────────── */
.color-swatch {
    width: 1.75rem;
    height: 1.75rem;
    border-radius: 50%;
    border: 2px solid transparent;
    cursor: pointer;
    transition: transform 0.15s, border-color 0.15s;
}

.color-swatch:hover {
    transform: scale(1.15);
}

.color-swatch--active {
    border-color: var(--on-surface);
    transform: scale(1.15);
}

/* ─── Slide-down transition ──────────────────────────────────────────────── */
.slide-down-enter-active,
.slide-down-leave-active {
    transition: all 0.25s ease;
}

.slide-down-enter-from,
.slide-down-leave-to {
    opacity: 0;
    transform: translateY(-12px);
}

/* ─── Fade-in ────────────────────────────────────────────────────────────── */
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

/* ─── Master-Detail Layout ───────────────────────────────────────────────── */
.master-detail {
    display: flex;
    gap: 1.5rem;
    align-items: flex-start;
    margin-top: 1.5rem;
}

.master-col {
    flex: 1 1 0;
    min-width: 0;
    transition: flex 0.35s cubic-bezier(0.4, 0, 0.2, 1);
}

.master-detail--split .master-col {
    flex: 0 0 280px;
}

/* ─── Discipline List (left column) ─────────────────────────────────────── */
.discipline-list {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
}

.discipline-row {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    width: 100%;
    padding: 0.875rem 1rem;
    background: var(--surface-container-lowest);
    border: 1px solid rgba(208, 197, 175, 0.1);
    border-left: 3px solid transparent;
    border-radius: 0.75rem;
    cursor: pointer;
    text-align: left;
    transition: background 0.15s, border-left-color 0.2s, transform 0.15s;
}

.discipline-row:hover {
    background: rgba(208, 197, 175, 0.07);
    transform: translateX(2px);
}

.discipline-row--active {
    background: rgba(208, 197, 175, 0.1);
    border-left-width: 3px;
}

.discipline-row__dot {
    width: 10px;
    height: 10px;
    border-radius: 50%;
    flex-shrink: 0;
}

.discipline-row__info {
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: 0.1rem;
}

.discipline-row__name {
    font-family: var(--ds-font-serif);
    font-size: 0.9rem;
    font-weight: 700;
    color: var(--on-surface);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.discipline-row__meta {
    font-size: 0.7rem;
    color: var(--secondary);
}

.discipline-row__delete {
    background: none;
    border: none;
    cursor: pointer;
    color: var(--secondary);
    padding: 0;
    opacity: 0;
    transition: opacity 0.15s;
    line-height: 1;
    flex-shrink: 0;
}

.discipline-row:hover .discipline-row__delete {
    opacity: 1;
}

.discipline-row__delete:hover {
    color: var(--error, #ef4444);
}

/* ─── Detail Column (right) ──────────────────────────────────────────────── */
.detail-col {
    flex: 0 0 420px;
    max-width: 420px;
    background: var(--surface-container-lowest);
    border: 1px solid rgba(208, 197, 175, 0.12);
    border-radius: 1rem;
    display: flex;
    flex-direction: column;
    max-height: calc(100vh - 220px);
    overflow: hidden;
    position: sticky;
    top: 1.5rem;
}

.detail__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 1.25rem 1.25rem 1rem;
    border-left: 4px solid transparent;
    flex-shrink: 0;
    background: rgba(208, 197, 175, 0.04);
}

.detail__dot {
    width: 12px;
    height: 12px;
    border-radius: 50%;
    flex-shrink: 0;
}

.detail__title {
    font-family: var(--ds-font-serif);
    font-size: 1.1rem;
    font-weight: 700;
    color: var(--on-surface);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.detail__subtitle {
    font-size: 0.72rem;
    color: var(--secondary);
    margin-top: 0.1rem;
}

.detail__close {
    background: none;
    border: none;
    cursor: pointer;
    color: var(--secondary);
    padding: 0.2rem;
    border-radius: 0.375rem;
    transition: background 0.15s, color 0.15s;
    flex-shrink: 0;
}

.detail__close:hover {
    background: rgba(208, 197, 175, 0.12);
    color: var(--on-surface);
}

/* Progress */
.detail__progress-wrap {
    padding: 0.75rem 1.25rem 0;
    flex-shrink: 0;
}

.detail__progress-track {
    height: 5px;
    border-radius: 999px;
    background: rgba(208, 197, 175, 0.15);
    overflow: hidden;
    margin-top: 0.375rem;
}

.detail__progress-fill {
    height: 100%;
    border-radius: 999px;
    transition: width 0.4s ease;
}

/* Edit section (collapsible) */
.detail__edit-section {
    flex-shrink: 0;
    border-top: 1px solid rgba(208, 197, 175, 0.1);
    border-bottom: 1px solid rgba(208, 197, 175, 0.1);
}

.detail__edit-summary {
    display: flex;
    align-items: center;
    gap: 0.4rem;
    padding: 0.75rem 1.25rem;
    font-size: 0.72rem;
    font-weight: 700;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: var(--secondary);
    cursor: pointer;
    user-select: none;
    list-style: none;
    transition: color 0.15s;
}

.detail__edit-summary:hover {
    color: var(--on-surface);
}

.detail__edit-summary::-webkit-details-marker {
    display: none;
}

.detail__edit-body {
    padding: 0 1.25rem 1rem;
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
}

/* Topics */
.detail__topics {
    flex: 1;
    overflow-y: auto;
    padding: 1rem 1.25rem;
}

.detail__empty {
    text-align: center;
    padding: 2.5rem 0;
}

.topic-list {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    list-style: none;
    margin: 0;
    padding: 0;
}

.topic-item {
    display: flex;
    align-items: flex-start;
    gap: 0.75rem;
    padding: 0.75rem;
    border-radius: 0.5rem;
    background: rgba(208, 197, 175, 0.05);
    border: 1px solid rgba(208, 197, 175, 0.08);
    transition: background 0.15s;
}

.topic-item:hover {
    background: rgba(208, 197, 175, 0.1);
}

.topic-item--done .topic-item__name {
    text-decoration: line-through;
    opacity: 0.5;
}

.topic-item__check {
    background: none;
    border: none;
    cursor: pointer;
    padding: 0;
    color: var(--primary);
    flex-shrink: 0;
    line-height: 1;
}

.topic-item__text {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 0.2rem;
}

.topic-item__name {
    font-size: 0.875rem;
    color: var(--on-surface);
    font-weight: 500;
    transition: opacity 0.2s;
}

.topic-item__desc {
    font-size: 0.72rem;
    color: var(--secondary);
}

.topic-item__delete,
.topic-item__action {
    background: none;
    border: none;
    cursor: pointer;
    color: var(--secondary);
    padding: 0;
    opacity: 0;
    transition: opacity 0.15s;
    line-height: 1;
    font-size: 1rem;
    flex-shrink: 0;
}

.topic-item:hover .topic-item__delete,
.topic-item:hover .topic-item__action {
    opacity: 1;
}

.topic-item__delete:hover {
    color: var(--error, #ef4444);
}

.topic-item__action:hover {
    color: var(--primary);
}

.topic-edit-form {
    width: 100%;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
}

/* Add topic */
.detail__add-topic {
    padding: 1rem 1.25rem;
    border-top: 1px solid rgba(208, 197, 175, 0.1);
    flex-shrink: 0;
}

/* Weight */
.weight-badge {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    font-size: 0.68rem;
    font-weight: 700;
    color: #fff;
    border-radius: 999px;
    padding: 0.1rem 0.45rem;
    min-width: 1.8rem;
    line-height: 1.4;
    flex-shrink: 0;
}

.weight-slider {
    width: 100%;
    accent-color: var(--primary);
    cursor: pointer;
}

/* ─── Detail slide-in transition ─────────────────────────────────────────── */
.detail-slide-enter-active {
    transition: opacity 0.25s ease, transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.detail-slide-leave-active {
    transition: opacity 0.2s ease, transform 0.25s cubic-bezier(0.4, 0, 0.2, 1);
}

.detail-slide-enter-from {
    opacity: 0;
    transform: translateX(24px);
}

.detail-slide-leave-to {
    opacity: 0;
    transform: translateX(24px);
}


/* ─── Grid ───────────────────────────────────────────────────────────────── */
.discipline-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
    gap: 1.25rem;
    margin-top: 2rem;
}

/* ─── Discipline Card ────────────────────────────────────────────────────── */
.discipline-card {
    display: flex;
    flex-direction: column;
    background: var(--surface-container-lowest);
    border: 1px solid rgba(208, 197, 175, 0.1);
    border-radius: 0.75rem;
    overflow: hidden;
    cursor: pointer;
    text-align: left;
    transition: transform 0.18s ease, box-shadow 0.18s ease;
}

.discipline-card:hover {
    transform: translateY(-3px);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
}

.discipline-card__color-bar {
    height: 5px;
    width: 100%;
    flex-shrink: 0;
}

.discipline-card__body {
    padding: 1.25rem;
    flex: 1;
}

.discipline-card__name {
    font-family: var(--ds-font-serif);
    font-size: 1rem;
    font-weight: 700;
    color: var(--on-surface);
    line-height: 1.3;
    flex: 1;
}

.discipline-card__hint {
    font-size: 0.75rem;
    color: var(--secondary);
    margin-top: 0.5rem;
}

.discipline-card__delete {
    color: var(--secondary);
    opacity: 0;
    transition: opacity 0.15s;
    background: none;
    border: none;
    cursor: pointer;
    padding: 0;
    line-height: 1;
}

.discipline-card:hover .discipline-card__delete {
    opacity: 1;
}

.discipline-card__delete:hover {
    color: var(--error, #ef4444);
}

/* ─── Color Swatches ─────────────────────────────────────────────────────── */
.color-swatch {
    width: 1.75rem;
    height: 1.75rem;
    border-radius: 50%;
    border: 2px solid transparent;
    cursor: pointer;
    transition: transform 0.15s, border-color 0.15s;
}

.color-swatch:hover {
    transform: scale(1.15);
}

.color-swatch--active {
    border-color: var(--on-surface);
    transform: scale(1.15);
}

/* ─── Slide-down transition ──────────────────────────────────────────────── */
.slide-down-enter-active,
.slide-down-leave-active {
    transition: all 0.25s ease;
}

.slide-down-enter-from,
.slide-down-leave-to {
    opacity: 0;
    transform: translateY(-12px);
}

/* ─── Fade-in ────────────────────────────────────────────────────────────── */
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

/* ─── Panel ──────────────────────────────────────────────────────────────── */
.panel-overlay {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.45);
    backdrop-filter: blur(2px);
    z-index: 100;
    display: flex;
    justify-content: flex-end;
}

.panel {
    width: min(480px, 95vw);
    height: 100%;
    background: var(--surface-container-lowest);
    display: flex;
    flex-direction: column;
    overflow: hidden;
}

.panel__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 1.5rem;
    border-bottom: 2px solid;
    flex-shrink: 0;
}

.panel__color-dot {
    width: 14px;
    height: 14px;
    border-radius: 50%;
    flex-shrink: 0;
}

.panel__title {
    font-family: var(--ds-font-serif);
    font-size: 1.25rem;
    font-weight: 700;
    color: var(--on-surface);
}

.panel__subtitle {
    font-size: 0.75rem;
    color: var(--secondary);
    margin-top: 0.125rem;
}

.panel__close {
    background: none;
    border: none;
    cursor: pointer;
    color: var(--secondary);
    padding: 0.25rem;
    border-radius: 0.375rem;
    transition: background 0.15s, color 0.15s;
}

.panel__close:hover {
    background: rgba(208, 197, 175, 0.12);
    color: var(--on-surface);
}

/* Progress */
.panel__progress-wrap {
    padding: 1rem 1.5rem 0;
    flex-shrink: 0;
}

.panel__progress-track {
    height: 6px;
    border-radius: 999px;
    background: rgba(208, 197, 175, 0.15);
    overflow: hidden;
}

.panel__progress-fill {
    height: 100%;
    border-radius: 999px;
    transition: width 0.4s ease;
}

/* Topics */
.panel__topics {
    flex: 1;
    overflow-y: auto;
    padding: 1.25rem 1.5rem;
}

.panel__empty {
    text-align: center;
    padding: 3rem 0;
}

.topic-list {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    list-style: none;
    margin: 0;
    padding: 0;
}

.topic-item {
    display: flex;
    align-items: flex-start;
    gap: 0.75rem;
    padding: 0.75rem;
    border-radius: 0.5rem;
    background: rgba(208, 197, 175, 0.05);
    border: 1px solid rgba(208, 197, 175, 0.08);
    transition: background 0.15s;
}

.topic-item:hover {
    background: rgba(208, 197, 175, 0.1);
}

.topic-item--done .topic-item__name {
    text-decoration: line-through;
    opacity: 0.5;
}

.topic-item__check {
    background: none;
    border: none;
    cursor: pointer;
    padding: 0;
    color: var(--primary);
    flex-shrink: 0;
    line-height: 1;
}

.topic-item__text {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 0.2rem;
}

.topic-item__name {
    font-size: 0.9rem;
    color: var(--on-surface);
    font-weight: 500;
    transition: opacity 0.2s;
}

.topic-item__desc {
    font-size: 0.75rem;
    color: var(--secondary);
}

.topic-item__delete {
    background: none;
    border: none;
    cursor: pointer;
    color: var(--secondary);
    padding: 0;
    opacity: 0;
    transition: opacity 0.15s;
    line-height: 1;
    font-size: 1rem;
}

.topic-item:hover .topic-item__delete {
    opacity: 1;
}

.topic-item__delete:hover {
    color: var(--error, #ef4444);
}

.topic-item__action {
    background: none;
    border: none;
    cursor: pointer;
    color: var(--secondary);
    padding: 0;
    opacity: 0;
    transition: opacity 0.15s;
    line-height: 1;
    font-size: 1rem;
}

.topic-item:hover .topic-item__action {
    opacity: 1;
}

.topic-item__action:hover {
    color: var(--primary);
}

.topic-edit-form {
    width: 100%;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
}

/* Weight */
.weight-badge {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    font-size: 0.7rem;
    font-weight: 700;
    color: #fff;
    border-radius: 999px;
    padding: 0.1rem 0.5rem;
    min-width: 2rem;
    line-height: 1.4;
}

.weight-slider {
    width: 100%;
    accent-color: var(--primary);
    cursor: pointer;
}

.panel__weight-section {
    padding: 1rem 1.5rem;
    border-bottom: 1px solid rgba(208, 197, 175, 0.1);
    flex-shrink: 0;
}

/* Add topic form */
.panel__add-topic {
    padding: 1.25rem 1.5rem;
    border-top: 1px solid rgba(208, 197, 175, 0.1);
    background: var(--surface-container-lowest);
    flex-shrink: 0;
}

/* Panel slide transition */
.panel-enter-active,
.panel-leave-active {
    transition: opacity 0.25s ease;
}

.panel-enter-active .panel,
.panel-leave-active .panel {
    transition: transform 0.3s cubic-bezier(0.32, 0, 0.15, 1);
}

.panel-enter-from {
    opacity: 0;
}

.panel-enter-from .panel {
    transform: translateX(100%);
}

.panel-leave-to {
    opacity: 0;
}

.panel-leave-to .panel {
    transform: translateX(100%);
}
</style>
