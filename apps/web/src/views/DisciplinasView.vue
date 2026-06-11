<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { VSpinner, VButton, VModal, VInput } from '../components/ui'
import { useStudyPlanStore } from '../stores/study-plan'
import { useQueryClient } from '@tanstack/vue-query'
import { api as axiosApi } from '../lib/axios'
import {
    useDisciplinesQuery,
    useCreateDisciplineMutation,
    useUpdateDisciplineMutation,
    useDeleteDisciplineMutation,
    useBulkDeleteDisciplinesMutation,
    useBulkWeightUpdateDisciplinesMutation,
    useBulkCreateDisciplinesMutation,
    useBulkStatusUpdateDisciplinesMutation,
    useGenerateTopicsForDisciplineMutation,
} from '../hooks/useDisciplines'
import { useStudyPlansQuery } from '../hooks/useStudyPlans'
import { usePlan } from '../hooks/usePlan'

import DisciplinesHeader from '../components/features/disciplines/DisciplinesHeader.vue'
import CreateDisciplineForm from '../components/features/disciplines/CreateDisciplineForm.vue'
import DisciplineCard from '../components/features/disciplines/DisciplineCard.vue'
import DisciplineDetails from '../components/features/disciplines/DisciplineDetails.vue'

const studyPlanStore = useStudyPlanStore()
const queryClient = useQueryClient()
const { plan } = usePlan()

const { data: disciplinesData, isLoading, error: disciplinesError } = useDisciplinesQuery()
const disciplines = computed(() => disciplinesData.value || [])

const { mutateAsync: createDiscipline, isPending: isCreatingDiscipline } = useCreateDisciplineMutation()
const { mutateAsync: deleteDisciplineMutationCall } = useDeleteDisciplineMutation()
const { mutateAsync: updateDiscipline } = useUpdateDisciplineMutation()
const bulkDelete = useBulkDeleteDisciplinesMutation()
const bulkWeight = useBulkWeightUpdateDisciplinesMutation()
const bulkImport = useBulkCreateDisciplinesMutation()
const bulkStatusUpdate = useBulkStatusUpdateDisciplinesMutation()
const generateTopics = useGenerateTopicsForDisciplineMutation()

// Study plans query for Clonar feature
const { data: plansData } = useStudyPlansQuery()
const otherPlans = computed(() => {
    const activeId = studyPlanStore.activePlanId
    return (plansData.value || []).filter(p => p.id !== activeId)
})

// ─── State ────────────────────────────────────────────────────────────────────
const showCreateForm = ref(false)
const selectedDisciplineId = ref<number | null>(null)
const selectedDiscipline = computed(() => disciplines.value.find(d => d.id === selectedDisciplineId.value))
const isPanelOpen = ref(false)

const selectedIds = ref<Set<number>>(new Set())
const showBulkWeightModal = ref(false)
const bulkWeightValue = ref(1.0)
const fileInputRef = ref<HTMLInputElement | null>(null)

// Toggles format/view mode
const displayFormat = ref<'GRID' | 'LIST'>('GRID')
const viewMode = ref<'ACTIVE' | 'ARCHIVED'>('ACTIVE')

// Cloning modal state
const showCloneModal = ref(false)
const selectedSourcePlanId = ref<number | null>(null)
const sourcePlanDisciplines = ref<any[]>([])
const isLoadingSourcePlan = ref(false)
const selectedCloneIds = ref<Set<number>>(new Set())

// Exporting modal state
const showExportModal = ref(false)
const selectedTargetPlanId = ref<number | null>(null)
const exportingDisciplineId = ref<number | null>(null)

// Undo action state
const lastAction = ref<{
    type: 'delete' | 'archive';
    disciplines: any[];
} | null>(null)
const showUndoToast = ref(false)
let undoTimeout: any = null

const searchTerm = ref('')

const disciplinesByMode = computed(() => {
    return disciplines.value.filter(d => {
        if (viewMode.value === 'ACTIVE') {
            return d.isActive !== false
        } else {
            return d.isActive === false
        }
    })
})

const filteredDisciplines = computed(() => {
    return disciplinesByMode.value.filter(d => 
        d.name.toLowerCase().includes(searchTerm.value.toLowerCase())
    )
})

const errorMsg = computed(() => disciplinesError.value ? 'Erro ao carregar disciplinas.' : '')

// ─── Selection Handlers ───────────────────────────────────────────────────────
function toggleSelection(id: number, checked: boolean) {
    const next = new Set(selectedIds.value)
    if (checked) {
        next.add(id)
    } else {
        next.delete(id)
    }
    selectedIds.value = next
}

function selectAll() {
    if (selectedIds.value.size === filteredDisciplines.value.length) {
        selectedIds.value = new Set()
    } else {
        selectedIds.value = new Set(filteredDisciplines.value.map(d => d.id))
    }
}

// ─── Discipline CRUD ──────────────────────────────────────────────────────────
async function handleCreateDiscipline(payload: { name: string, description?: string, color: string, weight: number, syllabusText?: string }) {
    const newDisc = await createDiscipline({ name: payload.name, description: payload.description, color: payload.color, weight: payload.weight })
    if (payload.syllabusText && payload.syllabusText.trim() && newDisc) {
        try {
            await generateTopics.mutateAsync({
                id: newDisc.id,
                syllabusText: payload.syllabusText.trim()
            })
        } catch (err: any) {
            console.error('Erro ao gerar tópicos com IA na criação:', err)
            alert('Disciplina criada, mas houve um erro ao gerar os tópicos com IA.')
        }
    }
    showCreateForm.value = false
}

async function deleteDiscipline(id: number) {
    const disc = disciplines.value.find(d => d.id === id)
    if (!disc) return
    if (!confirm(`Tem certeza de que deseja excluir a disciplina "${disc.name}"?`)) return
    
    // Save for Undo
    try {
        const topicsRes = await axiosApi.get(`/topics/discipline/${disc.id}`)
        lastAction.value = {
            type: 'delete',
            disciplines: [{
                name: disc.name,
                description: disc.description,
                color: disc.color,
                weight: disc.weight,
                topics: topicsRes.data.map((t: any) => ({ name: t.name, description: t.description }))
            }]
        }
        
        await deleteDisciplineMutationCall(id)
        if (selectedDisciplineId.value === id) closePanel()
        triggerUndoToast()
    } catch (e) {
        alert('Erro ao excluir disciplina.')
    }
}

async function toggleDisciplineActive(disc: any) {
    try {
        await updateDiscipline({
            id: disc.id,
            isActive: !disc.isActive
        })
        queryClient.invalidateQueries({ queryKey: ['disciplines'] })
    } catch (e) {
        alert('Erro ao alterar status da disciplina.')
    }
}

// ─── Bulk Operations ──────────────────────────────────────────────────────────
async function handleBulkDelete() {
    if (selectedIds.value.size === 0) return
    if (!confirm(`Tem certeza de que deseja excluir as ${selectedIds.value.size} disciplinas selecionadas?`)) return
    
    try {
        // Save for Undo before delete
        const disciplinesToSave = []
        for (const id of selectedIds.value) {
            const disc = disciplines.value.find(d => d.id === id)
            if (disc) {
                const topicsRes = await axiosApi.get(`/topics/discipline/${disc.id}`)
                disciplinesToSave.push({
                    name: disc.name,
                    description: disc.description,
                    color: disc.color,
                    weight: disc.weight,
                    topics: topicsRes.data.map((t: any) => ({ name: t.name, description: t.description }))
                })
            }
        }
        lastAction.value = {
            type: 'delete',
            disciplines: disciplinesToSave
        }
        
        await bulkDelete.mutateAsync(Array.from(selectedIds.value))
        selectedIds.value = new Set()
        queryClient.invalidateQueries({ queryKey: ['disciplines'] })
        triggerUndoToast()
    } catch (e: any) {
        alert('Erro ao excluir disciplinas em lote.')
    }
}

async function handleBulkWeightUpdate() {
    if (selectedIds.value.size === 0) return
    try {
        await bulkWeight.mutateAsync({
            ids: Array.from(selectedIds.value),
            weight: bulkWeightValue.value
        })
        selectedIds.value = new Set()
        showBulkWeightModal.value = false
        queryClient.invalidateQueries({ queryKey: ['disciplines'] })
    } catch (e: any) {
        alert('Erro ao atualizar pesos das disciplinas.')
    }
}

async function handleBulkArchiveToggle(isActive: boolean) {
    if (selectedIds.value.size === 0) return
    const actionName = isActive ? 'restaurar' : 'arquivar'
    try {
        const affectedIds = Array.from(selectedIds.value)
        lastAction.value = {
            type: 'archive',
            disciplines: disciplines.value.filter(d => affectedIds.includes(d.id))
        }
        
        await bulkStatusUpdate.mutateAsync({
            ids: affectedIds,
            isActive
        })
        selectedIds.value = new Set()
        queryClient.invalidateQueries({ queryKey: ['disciplines'] })
        triggerUndoToast()
    } catch (e) {
        alert(`Erro ao ${actionName} disciplinas em lote.`)
    }
}

// ─── Undo Toast Logic ────────────────────────────────────────────────────────
function triggerUndoToast() {
    showUndoToast.value = true
    if (undoTimeout) clearTimeout(undoTimeout)
    undoTimeout = setTimeout(() => {
        showUndoToast.value = false
    }, 8000)
}

async function handleUndo() {
    if (!lastAction.value) return
    try {
        if (lastAction.value.type === 'archive') {
            await bulkStatusUpdate.mutateAsync({
                ids: lastAction.value.disciplines.map(d => d.id),
                isActive: true
            })
        } else {
            await bulkImport.mutateAsync({
                disciplines: lastAction.value.disciplines
            })
        }
        queryClient.invalidateQueries({ queryKey: ['disciplines'] })
        showUndoToast.value = false
        lastAction.value = null
    } catch (e) {
        alert('Erro ao desfazer ação.')
    }
}

// ─── JSON Export/Import ──────────────────────────────────────────────────────
async function handleExport() {
    try {
        const dataToExport = []
        for (const disc of filteredDisciplines.value) {
            const res = await axiosApi.get(`/topics/discipline/${disc.id}`)
            dataToExport.push({
                name: disc.name,
                description: disc.description,
                color: disc.color,
                weight: disc.weight,
                topics: res.data.map((t: any) => ({ name: t.name, description: t.description }))
            })
        }

        const dataStr = JSON.stringify({
            version: '1.0',
            type: 'vincis-disciplines',
            exportedAt: new Date().toISOString(),
            disciplines: dataToExport
        }, null, 2)

        const blob = new Blob([dataStr], { type: 'application/json' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `vincis_disciplinas_${viewMode.value.toLowerCase()}_${Date.now()}.json`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(url)
    } catch (e) {
        alert('Erro ao exportar disciplinas.')
    }
}

function triggerImportFile() {
    fileInputRef.value?.click()
}

async function handleImportFile(e: Event) {
    const target = e.target as HTMLInputElement
    if (!target.files || target.files.length === 0) return
    const file = target.files[0]
    if (!file) return
    try {
        const text = await file.text()
        const data = JSON.parse(text)
        if (data.type !== 'vincis-disciplines' || !Array.isArray(data.disciplines)) {
            throw new Error('Formato de arquivo inválido. Use um arquivo JSON exportado do Vincis.')
        }
        if (!confirm(`Deseja importar ${data.disciplines.length} disciplinas para o plano atual?`)) return
        
        await bulkImport.mutateAsync({ disciplines: data.disciplines })
        queryClient.invalidateQueries({ queryKey: ['disciplines'] })
        alert('Importação concluída com sucesso.')
    } catch (err: any) {
        alert(err.message || 'Erro ao importar disciplinas.')
    } finally {
        if (fileInputRef.value) fileInputRef.value.value = ''
    }
}

// ─── Clonar Plan Logic ───────────────────────────────────────────────────────
watch(selectedSourcePlanId, async (newVal) => {
    if (!newVal) {
        sourcePlanDisciplines.value = []
        selectedCloneIds.value = new Set()
        return
    }
    isLoadingSourcePlan.value = true
    try {
        const res = await axiosApi.get<any[]>('/disciplines', {
            params: { study_plan_id: newVal },
            headers: { 'x-study-plan-id': newVal }
        })
        
        sourcePlanDisciplines.value = res.data
        selectedCloneIds.value = new Set(res.data.map(d => d.id))
    } catch (e) {
        alert('Erro ao buscar disciplinas do plano selecionado.')
    } finally {
        isLoadingSourcePlan.value = false
    }
})

function toggleCloneSelection(id: number) {
    const next = new Set(selectedCloneIds.value)
    if (next.has(id)) {
        next.delete(id)
    } else {
        next.add(id)
    }
    selectedCloneIds.value = next
}

function toggleAllCloneSelection() {
    if (selectedCloneIds.value.size === sourcePlanDisciplines.value.length) {
        selectedCloneIds.value = new Set()
    } else {
        selectedCloneIds.value = new Set(sourcePlanDisciplines.value.map(d => d.id))
    }
}

async function handleClone() {
    if (selectedCloneIds.value.size === 0 || !selectedSourcePlanId.value) return
    try {
        await axiosApi.post('/disciplines/export', {
            sourcePlanId: selectedSourcePlanId.value,
            targetPlanId: studyPlanStore.activePlanId,
            disciplineIds: Array.from(selectedCloneIds.value)
        })
        showCloneModal.value = false
        selectedSourcePlanId.value = null
        queryClient.invalidateQueries({ queryKey: ['disciplines'] })
        alert('Disciplinas clonadas com sucesso.')
    } catch (e) {
        alert('Erro ao clonar disciplinas.')
    }
}

function handleHeaderClone() {
    if (selectedIds.value.size > 0) {
        showExportModal.value = true
    } else {
        showCloneModal.value = true
    }
}

async function handleExportToPlan() {
    const ids = exportingDisciplineId.value 
        ? [exportingDisciplineId.value] 
        : Array.from(selectedIds.value)

    if (ids.length === 0 || !selectedTargetPlanId.value) return
    try {
        await axiosApi.post('/disciplines/export', {
            sourcePlanId: studyPlanStore.activePlanId,
            targetPlanId: selectedTargetPlanId.value,
            disciplineIds: ids
        })
        closeExportModal()
        selectedIds.value = new Set()
        queryClient.invalidateQueries({ queryKey: ['disciplines'] })
        alert('Disciplinas clonadas com sucesso.')
    } catch (e) {
        alert('Erro ao clonar disciplinas.')
    }
}

function handleSingleCloneInit(id: number) {
    exportingDisciplineId.value = id
    showExportModal.value = true
}

function closeExportModal() {
    showExportModal.value = false
    selectedTargetPlanId.value = null
    exportingDisciplineId.value = null
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
    <div class="pb-12 text-left">
        <DisciplinesHeader 
            :error-msg="errorMsg" 
            v-model:viewMode="viewMode"
            v-model:displayFormat="displayFormat"
            :has-other-plans="otherPlans.length > 0"
            :selected-count="selectedIds.size"
            @create-discipline="showCreateForm = !showCreateForm"
            @export-disciplines="handleExport"
            @import-disciplines="triggerImportFile"
            @clone-disciplines="handleHeaderClone"
        />

        <input 
            type="file" 
            ref="fileInputRef" 
            accept=".json" 
            class="hidden" 
            @change="handleImportFile" 
        />

        <!-- Search bar -->
        <div v-if="studyPlanStore.hasActivePlan" class="mb-2 max-w-md animate-fade-in">
            <VInput 
                v-model="searchTerm" 
                placeholder="Buscar disciplinas pelo nome..." 
                icon="search" 
            />
        </div>

        <CreateDisciplineForm
            :showCreateForm="showCreateForm"
            :isCreating="isCreatingDiscipline"
            :isPremium="plan.isPremium"
            @create-discipline="handleCreateDiscipline"
            @cancel-create="showCreateForm = false"
        />

        <!-- Loading -->
        <div v-if="isLoading" class="flex justify-center items-center h-64">
            <VSpinner />
        </div>

        <div v-else-if="filteredDisciplines.length === 0" class="flex flex-col items-center justify-center py-20 text-center border-2 border-dashed border-outline-variant/20 rounded-2xl bg-surface-container-low max-w-xl mx-auto">
            <i class="pi pi-folder-open text-5xl text-on-surface-muted mb-2"></i>
            <h3 class="text-lg font-headline font-bold text-on-surface mb-1">
                {{ viewMode === 'ACTIVE' ? 'Nenhuma disciplina ativa' : 'Nenhuma disciplina arquivada' }}
            </h3>
            <p class="text-sm text-on-surface-muted max-w-sm mb-6">
                {{ viewMode === 'ACTIVE' ? 'Crie uma disciplina nova ou clone matérias de outro plano de estudos para começar.' : 'Disciplinas arquivadas aparecerão aqui.' }}
            </p>
            <div class="flex gap-2">
                <VButton v-if="otherPlans.length > 0" variant="secondary" @click="showCloneModal = true">
                    Clonar de outro plano
                </VButton>
                <VButton variant="primary" @click="showCreateForm = true">
                    Criar Disciplina
                </VButton>
            </div>
        </div>

        <!-- Layout Rendering -->
        <div v-else>
            <!-- Select all control (common to Grid and List views) -->
            <div 
                v-if="filteredDisciplines.length > 0"
                class="flex items-center gap-3 px-4 py-2 border border-outline-variant/20 rounded-xl bg-surface-container-low text-xs font-bold text-on-surface-muted uppercase tracking-wider mb-6 max-w-sm cursor-pointer select-none"
                @click="selectAll"
            >
                <input 
                    type="checkbox" 
                    :checked="selectedIds.size === filteredDisciplines.length && filteredDisciplines.length > 0" 
                    @change.stop="selectAll"
                    class="w-4 h-4 rounded border-outline/30 text-primary focus:ring-primary cursor-pointer"
                />
                <span>Selecionar Todas ({{ filteredDisciplines.length }})</span>
            </div>

            <!-- Bento Grid View -->
            <div v-if="displayFormat === 'GRID'" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 animate-fade-in">
                <DisciplineCard
                    v-for="disc in filteredDisciplines"
                    :key="disc.id"
                    :discipline="disc"
                    :is-active="selectedDiscipline?.id === disc.id"
                    :is-selected="selectedIds.has(disc.id)"
                    @click="openPanel(disc)"
                    @delete="deleteDiscipline(disc.id)"
                    @clone="handleSingleCloneInit(disc.id)"
                    @select="toggleSelection(disc.id, $event)"
                />

                <!-- Add Discipline card (only in ACTIVE view) -->
                <button
                    v-if="studyPlanStore.hasActivePlan && viewMode === 'ACTIVE'"
                    @click="showCreateForm = true"
                    class="group bg-surface-container-low border-2 border-dashed border-outline-variant/30 p-6 rounded-xl hover:bg-surface-container hover:border-primary-container transition-all duration-300 flex flex-col items-center justify-center min-h-[220px] gap-4 cursor-pointer w-90"
                >
                    <div class="w-14 h-14 rounded-full bg-surface-container-lowest flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                        <i class="pi pi-plus text-primary" style="font-size: 1.5rem"></i>
                    </div>
                    <span class="font-headline text-base font-semibold text-on-surface-muted group-hover:text-primary transition-colors">
                        Adicionar Disciplina
                    </span>
                </button>
            </div>

            <!-- List View -->
            <div v-else class="space-y-3 animate-fade-in max-w-4xl">

                <div 
                    v-for="disc in filteredDisciplines" 
                    :key="disc.id"
                    @click="openPanel(disc)"
                    class="group flex items-center justify-between gap-4 p-4 bg-surface-container-lowest hover:bg-surface-container-low border border-outline-variant/20 hover:border-primary-container/40 rounded-xl transition-all duration-200 cursor-pointer"
                    :class="[
                        selectedDiscipline?.id === disc.id ? 'border-primary-container bg-surface-container-low shadow-sm' : '',
                        disc.isActive === false ? 'opacity-65 grayscale-[30%] hover:opacity-100 hover:grayscale-0' : ''
                    ]"
                >
                    <div class="flex items-center gap-4 flex-1 min-w-0">
                        <!-- Checkbox -->
                        <div @click.stop>
                            <input 
                                type="checkbox" 
                                :checked="selectedIds.has(disc.id)" 
                                @change="toggleSelection(disc.id, ($event.target as HTMLInputElement).checked)"
                                class="w-4 h-4 rounded border-outline/30 text-primary focus:ring-primary cursor-pointer"
                            />
                        </div>

                        <!-- Color Dot -->
                        <div class="w-3.5 h-3.5 rounded-full flex-shrink-0" :style="{ background: disc.color }" />

                        <!-- Text Details -->
                        <div class="min-w-0 text-left">
                            <h3 class="font-headline font-bold text-base text-on-surface group-hover:text-primary transition-colors truncate">
                                {{ disc.name }}
                            </h3>
                            <span class="text-xs text-on-surface-muted">
                                {{ disc.topics?.length ?? 0 }} tópico{{ (disc.topics?.length ?? 0) !== 1 ? 's' : '' }}
                            </span>
                        </div>
                    </div>

                    <div class="flex items-center gap-6">
                        <!-- Weight Badge -->
                        <span class="text-[10px] font-label font-bold tracking-wider uppercase bg-surface-container-high border border-outline-variant/30 px-2 py-0.5 rounded-md text-on-surface-muted">
                            Peso {{ (disc.weight ?? 1.0).toFixed(1) }}
                        </span>

                        <!-- Actions -->
                        <div class="flex gap-1" @click.stop>
                            <button 
                                v-if="otherPlans.length > 0"
                                class="w-8 h-8 rounded-lg flex items-center justify-center text-on-surface-muted hover:bg-primary-container/20 hover:text-primary transition-colors cursor-pointer"
                                @click="handleSingleCloneInit(disc.id)"
                                title="Copiar para outro plano"
                            >
                                <i class="pi pi-clone text-xs"></i>
                            </button>
                            <button 
                                class="w-8 h-8 rounded-lg flex items-center justify-center text-on-surface-muted hover:bg-primary-container/20 hover:text-primary transition-colors cursor-pointer"
                                @click="openPanel(disc)"
                                title="Ver Tópicos / Detalhes"
                            >
                                <i class="pi pi-eye text-xs"></i>
                            </button>
                            <button 
                                class="w-8 h-8 rounded-lg flex items-center justify-center text-on-surface-muted hover:bg-error/10 hover:text-error transition-colors cursor-pointer"
                                @click="deleteDiscipline(disc.id)"
                                title="Excluir disciplina"
                            >
                                <i class="pi pi-trash text-xs"></i>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Floating Bulk Action Bar -->
        <div 
            v-if="selectedIds.size > 0"
            class="fixed bottom-6 left-1/2 -translate-x-1/2 bg-surface-container-high/95 backdrop-blur-md px-4 py-2.5 rounded-xl border border-outline-variant/30 shadow-2xl flex items-center gap-4 z-50 animate-fade-in"
        >
            <span class="text-xs font-label font-bold text-on-surface">
                {{ selectedIds.size }} selecionada{{ selectedIds.size !== 1 ? 's' : '' }}
            </span>
            <div class="h-4 w-px bg-outline-variant/30" />
            <div class="flex gap-1.5">
                <VButton 
                    v-if="otherPlans.length > 0"
                    variant="secondary" 
                    size="small"
                    @click="showExportModal = true"
                >
                    <i class="pi pi-clone text-xs mr-1.5"></i>
                    Clonar para outro plano
                </VButton>
                <VButton v-if="viewMode === 'ACTIVE'" variant="secondary" size="small" @click="showBulkWeightModal = true">
                    <i class="pi pi-sliders-h text-xs mr-1.5"></i>
                    Alterar Peso
                </VButton>
                <!-- Archive/Restore Action -->
                <VButton 
                    variant="secondary" 
                    size="small"
                    @click="handleBulkArchiveToggle(viewMode !== 'ACTIVE')"
                >
                    <i class="pi text-xs mr-1.5" :class="viewMode === 'ACTIVE' ? 'pi-folder' : 'pi-folder-open'"></i>
                    {{ viewMode === 'ACTIVE' ? 'Arquivar' : 'Restaurar' }}
                </VButton>
                <VButton variant="error" size="small" @click="handleBulkDelete">
                    <i class="pi pi-trash text-xs mr-1.5"></i>
                    Excluir
                </VButton>
                <VButton variant="secondary" size="small" @click="selectedIds = new Set()">
                    Cancelar
                </VButton>
            </div>
        </div>

        <!-- Undo Toast Notification -->
        <div 
            v-if="showUndoToast && lastAction"
            class="fixed bottom-6 right-6 z-50 bg-surface-container-high border border-outline-variant/30 p-4 rounded-xl shadow-2xl flex items-center gap-4 animate-fade-in text-left"
        >
            <div class="flex flex-col">
                <span class="text-xs font-bold text-on-surface">
                    {{ lastAction.disciplines.length }} disciplina{{ lastAction.disciplines.length !== 1 ? 's' : '' }} {{ lastAction.type === 'archive' ? 'arquivada(s)' : 'excluída(s)' }}
                </span>
                <span class="text-[10px] text-on-surface-muted mt-0.5">Ação pode ser desfeita</span>
            </div>
            <VButton variant="primary" @click="handleUndo" class="px-3 py-1.5 text-xs">
                Desfazer
            </VButton>
            <button @click="showUndoToast = false" class="text-on-surface-muted hover:text-on-surface transition-colors cursor-pointer">
                <i class="pi pi-times text-xs"></i>
            </button>
        </div>

        <!-- Modal Bulk Weight -->
        <VModal v-model:visible="showBulkWeightModal" header="Alterar Pesos em Lote" :style="{ width: '400px' }">
            <div class="space-y-4 text-left my-4">
                <p class="text-xs text-on-surface-muted">Defina o novo peso para as {{ selectedIds.size }} disciplinas selecionadas.</p>
                <div class="flex justify-between items-center mb-1">
                    <p class="text-xs text-secondary">Peso / Importância</p>
                    <span class="px-2.5 py-0.5 rounded-full text-xs font-bold text-white bg-primary">
                        {{ bulkWeightValue.toFixed(1) }}
                    </span>
                </div>
                <input type="range" v-model.number="bulkWeightValue" min="0.5" max="5" step="0.5" class="w-full accent-primary cursor-pointer animate-fade-in" />
                <div class="flex justify-between text-xs text-secondary mt-1">
                    <span>Baixo</span><span>Alto</span>
                </div>
            </div>
            <template #footer>
                <div class="flex justify-end gap-2 mt-4">
                    <VButton variant="secondary" @click="showBulkWeightModal = false">Cancelar</VButton>
                    <VButton variant="primary" :disabled="bulkWeight.isPending.value" @click="handleBulkWeightUpdate">
                        {{ bulkWeight.isPending.value ? 'Salvando...' : 'Confirmar' }}
                    </VButton>
                </div>
            </template>
        </VModal>

        <!-- Modal Clonar de Outro Plano -->
        <VModal v-model:visible="showCloneModal" header="Clonar Disciplinas de Outro Plano" :style="{ width: '500px' }">
            <div class="space-y-5 text-left my-4">
                <div class="flex flex-col gap-1.5">
                    <label class="text-xs font-bold uppercase text-on-surface-muted">Selecione o Plano de Origem</label>
                    <select 
                        v-model="selectedSourcePlanId"
                        class="w-full p-2.5 rounded-lg border border-outline-variant/60 bg-surface-container-low text-on-surface text-sm outline-none focus:border-primary"
                    >
                        <option :value="null">Selecione um plano...</option>
                        <option v-for="plan in otherPlans" :key="plan.id" :value="plan.id">
                            {{ plan.name }}
                        </option>
                    </select>
                </div>

                <div v-if="isLoadingSourcePlan" class="flex justify-center py-6">
                    <VSpinner size="sm" />
                </div>

                <div v-else-if="selectedSourcePlanId && sourcePlanDisciplines.length === 0" class="text-center py-6 text-xs text-on-surface-muted">
                    Nenhuma disciplina disponível para clonagem neste plano.
                </div>

                <div v-else-if="selectedSourcePlanId" class="space-y-3">
                    <div class="flex justify-between items-center pb-2 border-b border-outline-variant/20">
                        <label class="text-xs font-bold uppercase text-on-surface-muted">Escolha as Disciplinas ({{ selectedCloneIds.size }} / {{ sourcePlanDisciplines.length }})</label>
                        <button @click="toggleAllCloneSelection" class="text-xs text-primary font-bold hover:underline cursor-pointer">
                            {{ selectedCloneIds.size === sourcePlanDisciplines.length ? 'Desmarcar Todas' : 'Selecionar Todas' }}
                        </button>
                    </div>

                    <div class="max-h-60 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
                        <div 
                            v-for="sub in sourcePlanDisciplines" 
                            :key="sub.id"
                            @click="toggleCloneSelection(sub.id)"
                            class="flex items-center gap-3 p-3 rounded-lg hover:bg-surface-container-low border border-transparent hover:border-outline-variant/20 transition-all cursor-pointer"
                        >
                            <input 
                                type="checkbox" 
                                :checked="selectedCloneIds.has(sub.id)" 
                                @change.stop="toggleCloneSelection(sub.id)"
                                class="w-4 h-4 rounded border-outline/30 text-primary focus:ring-primary cursor-pointer"
                            />
                            <div class="w-3.5 h-3.5 rounded-full flex-shrink-0" :style="{ background: sub.color }" />
                            <span class="text-sm font-semibold text-on-surface flex-1">{{ sub.name }}</span>
                            <span class="text-xs text-on-surface-muted">{{ sub.topics?.length ?? 0 }} tópicos</span>
                        </div>
                    </div>
                </div>
            </div>
            <template #footer>
                <div class="flex justify-end gap-2 mt-4">
                    <VButton variant="secondary" @click="showCloneModal = false">Cancelar</VButton>
                    <VButton 
                        variant="primary" 
                        :disabled="bulkImport.isPending.value || !selectedSourcePlanId || selectedCloneIds.size === 0" 
                        @click="handleClone"
                    >
                        {{ bulkImport.isPending.value ? 'Clonando...' : 'Clonar Disciplinas' }}
                    </VButton>
                </div>
            </template>
        </VModal>

        <!-- Modal Exportar para Outro Plano -->
        <VModal v-model:visible="showExportModal" header="Clonar Disciplinas para Outro Plano" :style="{ width: '500px' }" @close="closeExportModal">
            <div class="space-y-5 text-left my-4">
                <div class="flex flex-col gap-1.5">
                    <label class="text-xs font-bold uppercase text-on-surface-muted">Selecione o Plano de Destino</label>
                    <select 
                        v-model="selectedTargetPlanId"
                        class="w-full p-2.5 rounded-lg border border-outline-variant/60 bg-surface-container-low text-on-surface text-sm outline-none focus:border-primary"
                    >
                        <option :value="null">Selecione um plano...</option>
                        <option v-for="plan in otherPlans" :key="plan.id" :value="plan.id">
                            {{ plan.name }}
                        </option>
                    </select>
                </div>

                <div class="space-y-2">
                    <label class="text-xs font-bold uppercase text-on-surface-muted">
                        {{ exportingDisciplineId ? 'Disciplina a ser clonada' : 'Disciplinas a serem clonadas (' + selectedIds.size + ')' }}
                    </label>
                    <div class="max-h-60 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
                        <template v-if="exportingDisciplineId">
                            <div class="flex items-center gap-3 p-3 rounded-lg bg-surface-container-low border border-outline-variant/20">
                                <div class="w-3.5 h-3.5 rounded-full flex-shrink-0" :style="{ background: disciplines.find(d => d.id === exportingDisciplineId)?.color || '#3b82f6' }" />
                                <span class="text-sm font-semibold text-on-surface flex-1">
                                    {{ disciplines.find(d => d.id === exportingDisciplineId)?.name || '' }}
                                </span>
                            </div>
                        </template>
                        <template v-else>
                            <div 
                                v-for="id in selectedIds" 
                                :key="id"
                                class="flex items-center gap-3 p-3 rounded-lg bg-surface-container-low border border-outline-variant/20"
                            >
                                <div class="w-3.5 h-3.5 rounded-full flex-shrink-0" :style="{ background: disciplines.find(d => d.id === id)?.color || '#3b82f6' }" />
                                <span class="text-sm font-semibold text-on-surface flex-1">
                                    {{ disciplines.find(d => d.id === id)?.name || '' }}
                                </span>
                            </div>
                        </template>
                    </div>
                </div>
            </div>
            <template #footer>
                <div class="flex justify-end gap-2 mt-4">
                    <VButton variant="secondary" @click="closeExportModal">Cancelar</VButton>
                    <VButton 
                        variant="primary" 
                        :disabled="!selectedTargetPlanId || (exportingDisciplineId === null && selectedIds.size === 0)" 
                        @click="handleExportToPlan"
                    >
                        Clonar
                    </VButton>
                </div>
            </template>
        </VModal>

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

.custom-scrollbar::-webkit-scrollbar {
    width: 6px;
    height: 6px;
}
.custom-scrollbar::-webkit-scrollbar-track {
    background: transparent;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
    background: rgba(0, 0, 0, 0.15);
    border-radius: 99px;
}
.custom-scrollbar::-webkit-scrollbar-thumb:hover {
    background: rgba(0, 0, 0, 0.3);
}
</style>
