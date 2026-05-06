<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { api } from '../lib/axios'
import { VCard, VButton, VSpinner } from '../components/ui'
import { useStudyPlanStore } from '../stores/study-plan'
import DisciplinesHeader from '../components/features/disciplines/DisciplinesHeader.vue'
import CreateDisciplineForm from '../components/features/disciplines/CreateDisciplineForm.vue'
import DisciplineCard from '../components/features/disciplines/DisciplineCard.vue'
import DisciplineDetails from '../components/features/disciplines/DisciplineDetails.vue'

const studyPlanStore = useStudyPlanStore()

// ─── State ────────────────────────────────────────────────────────────────────
const isLoading = ref(true)
const disciplines = ref<any[]>([])
const errorMsg = ref('')
const showCreateForm = ref(false)

// Selected discipline panel
const selectedDiscipline = ref<any>(null)
const isPanelOpen = ref(false)

// ─── Lifecycle ────────────────────────────────────────────────────────────────
onMounted(fetchDisciplines)

async function fetchDisciplines() {
    if (!studyPlanStore.hasActivePlan) {
        isLoading.value = false
        return
    }

    isLoading.value = true
    try {
        const res = await api.get('/disciplines')
        disciplines.value = res.data
    } catch (e: any) {
        errorMsg.value = 'Erro ao carregar disciplinas.'
    } finally {
        isLoading.value = false
    }
}

// ─── Discipline CRUD ──────────────────────────────────────────────────────────
async function createDiscipline(payload: { name: string; color: string; weight: number }) {
    try {
        const res = await api.post('/disciplines', payload)
        disciplines.value.push(res.data.discipline)
        showCreateForm.value = false
    } catch (e: any) {
        errorMsg.value = 'Erro ao criar disciplina.'
    }
}

async function deleteDiscipline(id: number) {
    try {
        await api.delete(`/disciplines/${id}`)
        disciplines.value = disciplines.value.filter((d) => d.id !== id)
        if (selectedDiscipline.value?.id === id) {
            isPanelOpen.value = false
            selectedDiscipline.value = null
        }
    } catch (e: any) {
        errorMsg.value = 'Erro ao deletar disciplina.'
    }
}

// ─── Panel (Discipline Detail) ────────────────────────────────────────────────
async function openPanel(discipline: any) {
    selectedDiscipline.value = discipline
    isPanelOpen.value = true
}

function handleDisciplineUpdate(updatedDiscipline: any) {
    const idx = disciplines.value.findIndex((d) => d.id === updatedDiscipline.id)
    if (idx !== -1) disciplines.value[idx] = updatedDiscipline
    if (selectedDiscipline.value?.id === updatedDiscipline.id) {
        selectedDiscipline.value = updatedDiscipline
    }
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
