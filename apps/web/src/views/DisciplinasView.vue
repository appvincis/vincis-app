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
const topicsQuery = useTopicsQuery(selectedDisciplineId)
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
        <DisciplinesHeader :error-msg="errorMsg" @create-discipline="showCreateForm = !showCreateForm" />

        <CreateDisciplineForm :showCreateForm="showCreateForm" @create-discipline="createDiscipline"
            @cancel-create="showCreateForm = false" />

        <!-- Loading -->
        <VSpinner v-if="isLoading" class="h-64" />

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
            <DisciplineCard v-for="disc in disciplines" :key="disc.id" :discipline="disc"
                :is-active="selectedDiscipline?.id === disc.id" @click="openPanel(disc)"
                @delete="deleteDiscipline(disc.id)" />
        </div>

        <!-- Fixed Right Panel -->
        <DisciplineDetails :is-open="isPanelOpen" :discipline="selectedDiscipline"
            @update:is-open="isPanelOpen = $event" @update:discipline="handleDisciplineUpdate" />
    </div>
</template>

<style scoped>
/* ─── Layout ─────────────────────────────────────────────────────────────── */
.disciplinas-view {
    width: 100%;
}

/* ─── Grid ───────────────────────────────────────────────────────────────── */
.discipline-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
    gap: 1.25rem;
    margin-top: 2rem;
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
</style>
