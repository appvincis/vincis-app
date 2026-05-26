<script setup lang="ts">
import { ref, computed, nextTick } from 'vue'
import { useStudyPlanStore } from '../../stores/study-plan'
import {
  useStudyPlansQuery,
  useCreateStudyPlanMutation,
  useSelectStudyPlanMutation,
} from '../../hooks/useStudyPlans'

const studyPlanStore = useStudyPlanStore()

const { data: studyPlansData, isLoading } = useStudyPlansQuery()
const studyPlans = computed(() => studyPlansData.value || [])

const { mutateAsync: createStudyPlan, isPending: isCreating } = useCreateStudyPlanMutation()
const { mutateAsync: selectStudyPlan } = useSelectStudyPlanMutation()

// ─── Dropdown state ───────────────────────────────────────────────────────────
const isOpen = ref(false)
const triggerRef = ref<HTMLElement | null>(null)
const nameInput = ref<HTMLInputElement | null>(null)

// Position computed from trigger's bounding rect (for Teleport into body)
const dropdownStyle = ref<Record<string, string>>({})

const updatePosition = () => {
  if (!triggerRef.value) return
  const rect = triggerRef.value.getBoundingClientRect()
  dropdownStyle.value = {
    top: `${rect.bottom + 6}px`,
    left: `${rect.left}px`,
    width: `${rect.width}px`,
  }
}

const openDropdown = async () => {
  updatePosition()
  isOpen.value = true
  showCreateForm.value = false
  createError.value = ''
}

const closeDropdown = () => {
  isOpen.value = false
  showCreateForm.value = false
  createError.value = ''
}

const toggleDropdown = () => {
  isOpen.value ? closeDropdown() : openDropdown()
}

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
  closeDropdown()
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
  closeDropdown()
}
</script>

<template>
  <div>
    <!-- Trigger -->
    <button
      ref="triggerRef"
      @click="toggleDropdown"
      :aria-expanded="isOpen"
      class="w-full flex items-center justify-between gap-2 px-3 py-2.5 rounded-xl border transition-all duration-200 cursor-pointer"
      :class="isOpen
        ? 'border-primary/40 bg-surface-container-high shadow-sm'
        : 'border-outline-variant/30 bg-surface-container hover:bg-surface-container-high'"
    >
      <div class="flex items-center gap-2 min-w-0">
        <div class="w-6 h-6 rounded-md bg-primary-container flex-shrink-0 flex items-center justify-center">
          <i class="pi pi-briefcase text-[10px] text-on-primary-container"></i>
        </div>
        <div class="min-w-0 text-left">
          <p class="text-[9px] font-bold uppercase tracking-widest text-on-surface-muted leading-none mb-0.5">
            Plano Ativo
          </p>
          <p class="text-[13px] font-bold text-on-surface font-sans truncate leading-tight">
            {{ studyPlanStore.activePlanName || 'Selecionar plano' }}
          </p>
        </div>
      </div>
      <i
        class="pi pi-chevron-down text-[11px] text-on-surface-muted flex-shrink-0 transition-transform duration-200"
        :class="isOpen ? 'rotate-180' : ''"
      ></i>
    </button>

    <!-- Dropdown teleportado para o body — escapa do stacking context do sidebar -->
    <Teleport to="body">
      <!-- Backdrop invisível fecha o dropdown ao clicar fora -->
      <div v-if="isOpen" class="fixed inset-0 z-[9998]" @mousedown="closeDropdown" />

      <Transition name="dropdown">
        <div
          v-if="isOpen"
          id="plan-switcher-dropdown"
          class="fixed z-[9999] rounded-xl border border-outline-variant/30 bg-surface-container-lowest shadow-lg overflow-hidden"
          :style="dropdownStyle"
        >
          <!-- Header -->
          <div class="px-4 py-2.5 border-b border-outline-variant/20">
            <p class="text-[9px] font-bold uppercase tracking-widest text-on-surface-muted">
              Planos de Estudo
            </p>
          </div>

          <!-- List -->
          <div class="max-h-48 overflow-y-auto py-1">
            <div v-if="isLoading" class="flex justify-center py-4">
              <i class="pi pi-spin pi-spinner text-on-surface-muted text-sm"></i>
            </div>
            <p v-else-if="!studyPlans.length" class="px-4 py-3 text-xs text-on-surface-muted text-center">
              Nenhum plano criado ainda.
            </p>
            <button
              v-else
              v-for="plan in studyPlans"
              :key="plan.id"
              @click="handleSelectPlan(plan.id, plan.name)"
              class="w-full flex items-center gap-2.5 px-3 py-2.5 hover:bg-surface-container-low transition-colors duration-150 cursor-pointer text-left"
            >
              <div class="w-4 flex-shrink-0 flex items-center justify-center">
                <i
                  v-if="studyPlanStore.activePlanId === plan.id"
                  class="pi pi-check text-[11px] text-primary"
                ></i>
              </div>
              <span
                class="text-[13px] font-sans truncate"
                :class="studyPlanStore.activePlanId === plan.id
                  ? 'font-bold text-on-surface'
                  : 'font-medium text-on-surface-muted'"
              >
                {{ plan.name }}
              </span>
            </button>
          </div>

          <!-- Create section -->
          <div class="border-t border-outline-variant/20">
            <button
              v-if="!showCreateForm"
              @click="openCreateForm"
              class="w-full flex items-center gap-2.5 px-3 py-2.5 hover:bg-surface-container-low transition-colors duration-150 cursor-pointer text-left"
            >
              <div class="w-4 flex-shrink-0 flex items-center justify-center">
                <i class="pi pi-plus text-[11px] text-primary"></i>
              </div>
              <span class="text-[13px] font-medium text-on-surface-muted font-sans">Novo plano</span>
            </button>

            <div v-else class="px-3 py-3 space-y-2">
              <input
                ref="nameInput"
                v-model="newPlanName"
                type="text"
                placeholder="Nome do plano"
                class="w-full text-[13px] px-3 py-2 rounded-lg border border-outline-variant/40 bg-surface-container-low text-on-surface placeholder:text-on-surface-muted/50 focus:outline-none focus:border-primary/50 transition-colors"
                @keyup.enter="handleCreatePlan"
              />
              <input
                v-model="newPlanDesc"
                type="text"
                placeholder="Descrição (opcional)"
                class="w-full text-[13px] px-3 py-2 rounded-lg border border-outline-variant/40 bg-surface-container-low text-on-surface placeholder:text-on-surface-muted/50 focus:outline-none focus:border-primary/50 transition-colors"
                @keyup.enter="handleCreatePlan"
              />
              <p v-if="createError" class="text-[11px] text-error pl-1">{{ createError }}</p>
              <div class="flex gap-2">
                <button
                  @click="cancelCreate"
                  class="flex-1 text-xs font-bold py-1.5 rounded-lg border border-outline-variant/40 text-on-surface-muted hover:bg-surface-container transition-colors duration-150 cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  @click="handleCreatePlan"
                  :disabled="isCreating"
                  class="flex-1 text-xs font-bold py-1.5 rounded-lg bg-primary text-on-primary hover:bg-primary-hover transition-colors duration-150 cursor-pointer disabled:opacity-60"
                >
                  {{ isCreating ? 'Criando…' : 'Criar' }}
                </button>
              </div>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<style scoped>
.dropdown-enter-active,
.dropdown-leave-active {
  transition: opacity 0.15s ease, transform 0.15s ease;
}

.dropdown-enter-from,
.dropdown-leave-to {
  opacity: 0;
  transform: translateY(-6px);
}
</style>
