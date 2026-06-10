<script setup lang="ts">
import { ref, computed, nextTick, watch } from 'vue'
import { useStudyPlanStore } from '../../stores/study-plan'
import {
  useStudyPlansQuery,
  useCreateStudyPlanMutation,
  useSelectStudyPlanMutation,
  useDeleteStudyPlanMutation
} from '../../hooks/useStudyPlans'
import DsModal from '../ui/DsModal.vue'

const studyPlanStore = useStudyPlanStore()

const { data: studyPlansData, isLoading } = useStudyPlansQuery()
const studyPlans = computed(() => studyPlansData.value || [])

const { mutateAsync: createStudyPlan, isPending: isCreating } = useCreateStudyPlanMutation()
const { mutateAsync: selectStudyPlan } = useSelectStudyPlanMutation()
const { mutateAsync: deleteStudyPlan } = useDeleteStudyPlanMutation()

// ─── Auto-select logic ────────────────────────────────────────────────────────
let hasSyncedInitialPlan = false

watch(studyPlans, (plans) => {
  // Se a lista está vazia e não está carregando, limpa o plano ativo
  if (!plans.length) {
    if (!isLoading.value) studyPlanStore.clearPlan()
    return
  }

  // Garante que a auto-seleção / sincronização com o backend rode apenas uma vez no carregamento
  if (hasSyncedInitialPlan) return
  hasSyncedInitialPlan = true

  // Se já há um plano salvo no localStorage e ele existe na lista do usuário
  if (studyPlanStore.activePlanId) {
    const savedPlan = plans.find(p => p.id === studyPlanStore.activePlanId)
    if (savedPlan) {
      selectStudyPlan({ id: savedPlan.id, name: savedPlan.name })
      return
    }
  }

  // Fallback: se não há plano salvo (ou o salvo foi deletado), seleciona o primeiro
  const defaultPlan = plans[0]
  if (defaultPlan) {
    selectStudyPlan({ id: defaultPlan.id, name: defaultPlan.name })
  }
}, { immediate: true })

// ─── Dropdown state ───────────────────────────────────────────────────────────
const isOpen = ref(false)
const nameInput = ref<HTMLInputElement | null>(null)

const openModal = async () => {
  isOpen.value = true
  showCreateForm.value = false
  createError.value = ''
}

const closeModal = () => {
  isOpen.value = false
  showCreateForm.value = false
  createError.value = ''
}

defineExpose({
  open: openModal
})

// ─── Create form ──────────────────────────────────────────────────────────────
const showCreateForm = ref(false)
const newPlanName = ref('')
const newPlanDesc = ref('')
const createError = ref('')

const openCreateForm = async () => {
  showCreateForm.value = true
  await nextTick()
  nameInput.value?.focus()
}

const cancelCreate = () => {
  showCreateForm.value = false
  newPlanName.value = ''
  newPlanDesc.value = ''
  createError.value = ''
}

const handleSelectPlan = async (id: number, name: string) => {
  await selectStudyPlan({ id, name })
  closeModal()
}

const handleDeletePlan = async (id: number) => {
  if (!confirm('Tem certeza que deseja excluir este plano de estudos? Esta ação não pode ser desfeita.')) return
  
  await deleteStudyPlan(id)
  
  if (studyPlanStore.activePlanId === id) {
    const remainingPlans = studyPlans.value.filter(p => p.id !== id)
    if (remainingPlans.length > 0 && remainingPlans[0]) {
      await selectStudyPlan({ id: remainingPlans[0].id, name: remainingPlans[0].name })
    } else {
      studyPlanStore.clearPlan()
    }
  }
}

const handleCreatePlan = async () => {
  if (!newPlanName.value.trim()) {
    createError.value = 'Informe o nome do plano.'
    return
  }
  createError.value = ''
  const newPlan = await createStudyPlan({
    name: newPlanName.value.trim(),
    description: newPlanDesc.value.trim(),
    is_active: true,
  })
  await selectStudyPlan({ id: newPlan.id, name: newPlan.name })
  newPlanName.value = ''
  newPlanDesc.value = ''
  showCreateForm.value = false
  closeModal()
}
</script>

<template>
  <DsModal v-model:visible="isOpen" header="Trocar Plano de Estudo" :style="{ width: '420px' }" :pt="{
    root: { class: 'bg-surface-container-lowest border border-outline-variant/30 rounded-2xl shadow-2xl overflow-hidden font-sans' },
    header: { class: 'px-5 py-4 border-b border-outline-variant/20 flex justify-between items-center bg-surface-container-lowest' },
    title: { class: 'text-base font-bold text-on-surface tracking-tight' },
    content: { class: 'p-0 bg-surface-container-lowest' },
    closeButton: { class: 'w-8 h-8 flex items-center justify-center rounded-full hover:bg-surface-container-low transition-colors text-on-surface-muted focus:outline-none' },
    closeButtonIcon: { class: 'w-3.5 h-3.5' }
  }">
    <div class="flex flex-col">
      <!-- List -->
      <div class="max-h-[50vh] overflow-y-auto p-2 space-y-1 custom-scrollbar">
        <div v-if="isLoading" class="flex justify-center py-6">
          <i class="pi pi-spin pi-spinner text-primary text-xl"></i>
        </div>
        <p v-else-if="!studyPlans.length" class="px-4 py-6 text-sm text-on-surface-muted text-center">
          Nenhum plano criado ainda.
        </p>
        <button v-else v-for="plan in studyPlans" :key="plan.id"
          class="w-full flex items-center justify-between px-2 py-1.5 hover:bg-surface-container-low transition-colors duration-150 rounded-xl group"
          :class="studyPlanStore.activePlanId === plan.id ? 'bg-primary-container/30' : ''"
          @click="handleSelectPlan(plan.id, plan.name)">
          <div class="flex items-center gap-2 flex-1 min-w-0">
            <div class="w-5 flex-shrink-0 flex items-center justify-center">
              <i v-if="studyPlanStore.activePlanId === plan.id" class="pi pi-check text-[14px] text-primary"></i>
              <div v-else
                class="w-1.5 h-1.5 rounded-full bg-outline-variant/40 group-hover:bg-primary/40 transition-colors"></div>
            </div>
            <span class="text-[14px] font-sans truncate transition-colors text-left" :class="studyPlanStore.activePlanId === plan.id
              ? 'font-bold text-on-surface'
              : 'font-medium text-on-surface-muted group-hover:text-on-surface'">
              {{ plan.name }}
            </span>
          </div>
          <div @click.stop="handleDeletePlan(plan.id)" title="Excluir plano"
            class="opacity-0 group-hover:opacity-100 p-1.5 hover:bg-error/10 text-error/70 hover:text-error rounded-md transition-all cursor-pointer">
            <i class="pi pi-trash text-[12px]"></i>
          </div>
        </button>
      </div>

      <!-- Create section -->
      <div class="p-3 border-t border-outline-variant/20 bg-surface-container/20">
        <button v-if="!showCreateForm" @click="openCreateForm"
          class="w-full flex items-center justify-center gap-2 px-4 py-3 bg-surface-container-lowest hover:bg-surface-container transition-all duration-200 cursor-pointer rounded-xl border border-outline-variant/30 text-on-surface shadow-sm">
          <i class="pi pi-plus text-[12px] text-primary"></i>
          <span class="text-[13px] font-bold font-sans tracking-wide">Criar Novo Plano</span>
        </button>

        <div v-else
          class="p-4 space-y-3 bg-surface-container-lowest rounded-xl border border-outline-variant/30 shadow-sm">
          <h3 class="text-xs font-bold uppercase tracking-widest text-on-surface-muted mb-2">Novo Plano de Estudos</h3>
          <input ref="nameInput" v-model="newPlanName" type="text" placeholder="Nome do plano"
            class="w-full text-sm px-3 py-2.5 rounded-lg border border-outline-variant/40 bg-surface-container-low text-on-surface placeholder:text-on-surface-muted/50 focus:outline-none focus:border-primary/50 transition-colors"
            @keyup.enter="handleCreatePlan" />
          <input v-model="newPlanDesc" type="text" placeholder="Descrição (opcional)"
            class="w-full text-sm px-3 py-2.5 rounded-lg border border-outline-variant/40 bg-surface-container-low text-on-surface placeholder:text-on-surface-muted/50 focus:outline-none focus:border-primary/50 transition-colors"
            @keyup.enter="handleCreatePlan" />
          <p v-if="createError" class="text-[11px] text-error pl-1">{{ createError }}</p>
          <div class="flex gap-2 pt-2">
            <button @click="cancelCreate"
              class="flex-1 text-xs font-bold py-2.5 rounded-lg border border-outline-variant/40 text-on-surface-muted hover:bg-surface-container transition-colors duration-150 cursor-pointer">
              Cancelar
            </button>
            <button @click="handleCreatePlan" :disabled="isCreating"
              class="flex-1 text-xs font-bold py-2.5 rounded-lg bg-primary text-on-primary hover:bg-primary-hover transition-colors duration-150 cursor-pointer disabled:opacity-60">
              {{ isCreating ? 'Criando…' : 'Criar Plano' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </DsModal>
</template>

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
  width: 4px;
}

.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}

.custom-scrollbar::-webkit-scrollbar-thumb {
  background: color-mix(in srgb, var(--color-on-surface) 10%, transparent);
  border-radius: 10px;
}

.custom-scrollbar:hover::-webkit-scrollbar-thumb {
  background: color-mix(in srgb, var(--color-on-surface) 20%, transparent);
}
</style>
