<script setup lang="ts">
import { ref, computed } from 'vue'
import { VSpinner } from '../components/ui'
import { useStudyPlanStore } from '../stores/study-plan'
import { useQueryClient } from '@tanstack/vue-query'
import {
    useDisciplinesQuery,
    useCreateDisciplineMutation,
    useUpdateDisciplineMutation,
    useDeleteDisciplineMutation,
} from '../hooks/useDisciplines'

import DisciplinesHeader from '../components/features/disciplines/DisciplinesHeader.vue'
import CreateDisciplineForm from '../components/features/disciplines/CreateDisciplineForm.vue'
import DisciplineCard from '../components/features/disciplines/DisciplineCard.vue'
import DisciplineDetails from '../components/features/disciplines/DisciplineDetails.vue'

const studyPlanStore = useStudyPlanStore()
const queryClient = useQueryClient()

const { data: disciplinesData, isLoading, error: disciplinesError } = useDisciplinesQuery()
const disciplines = computed(() => disciplinesData.value || [])

const { mutateAsync: createDiscipline, isPending: isCreatingDiscipline } = useCreateDisciplineMutation()
const { mutateAsync: deleteDisciplineMutationCall } = useDeleteDisciplineMutation()

// ─── State ────────────────────────────────────────────────────────────────────
const showCreateForm = ref(false)
const selectedDisciplineId = ref<number | null>(null)
const selectedDiscipline = computed(() => disciplines.value.find(d => d.id === selectedDisciplineId.value))
const isPanelOpen = ref(false)

const errorMsg = computed(() => disciplinesError.value ? 'Erro ao carregar disciplinas.' : '')

// ─── Discipline CRUD ──────────────────────────────────────────────────────────
async function handleCreateDiscipline(payload: { name: string, description?: string, color: string, weight: number }) {
    await createDiscipline({ name: payload.name, description: payload.description, color: payload.color, weight: payload.weight })
    showCreateForm.value = false
}

async function deleteDiscipline(id: number) {
    await deleteDisciplineMutationCall(id)
    if (selectedDisciplineId.value === id) closePanel()
}

// ─── Panel ────────────────────────────────────────────────────────────────────
function openPanel(discipline: any) {
    selectedDisciplineId.value = discipline.id
    isPanelOpen.value = true
}

function closePanel() {
    isPanelOpen.value = false
    selectedDisciplineId.value = null
}

function handleDisciplineUpdate() {
    queryClient.invalidateQueries({ queryKey: ['disciplines'] })
}
</script>

<template>
    <div class="pb-12">
        <DisciplinesHeader :error-msg="errorMsg" @create-discipline="showCreateForm = !showCreateForm" />

        <CreateDisciplineForm
            :showCreateForm="showCreateForm"
            :isCreating="isCreatingDiscipline"
            @create-discipline="handleCreateDiscipline"
            @cancel-create="showCreateForm = false"
        />

        <!-- Loading -->
        <div v-if="isLoading" class="flex justify-center items-center h-64">
            <VSpinner />
        </div>

        <!-- Bento Grid -->
        <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 animate-fade-in">
            <DisciplineCard
                v-for="disc in disciplines"
                :key="disc.id"
                :discipline="disc"
                :is-active="selectedDiscipline?.id === disc.id"
                @click="openPanel(disc)"
                @delete="deleteDiscipline(disc.id)"
            />

            <!-- Add Discipline card -->
            <button
                v-if="studyPlanStore.hasActivePlan"
                @click="showCreateForm = true"
                class="group bg-surface-container-low border-2 border-dashed border-outline-variant/30 p-6 rounded-xl hover:bg-surface-container hover:border-primary-container transition-all duration-300 flex flex-col items-center justify-center min-h-[220px] gap-4 cursor-pointer w-full"
            >
                <div class="w-14 h-14 rounded-full bg-surface-container-lowest flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                    <i class="pi pi-plus text-primary" style="font-size: 1.5rem"></i>
                </div>
                <span class="font-headline text-base font-semibold text-on-surface-muted group-hover:text-primary transition-colors">
                    Adicionar Disciplina
                </span>
            </button>
        </div>

        <!-- Right Panel -->
        <DisciplineDetails
            :is-open="isPanelOpen"
            :discipline="selectedDiscipline"
            @update:is-open="isPanelOpen = $event"
            @update:discipline="handleDisciplineUpdate"
        />
    </div>
</template>

<style scoped>
.animate-fade-in {
    animation: fadeIn 0.4s ease-out;
}

@keyframes fadeIn {
    from { opacity: 0; transform: translateY(8px); }
    to { opacity: 1; transform: translateY(0); }
}
</style>
