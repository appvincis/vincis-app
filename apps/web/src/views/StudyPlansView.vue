<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { VCard, VButton, VInput, VSelect } from '../components/ui'
import { useStudyPlanStore } from '../stores/study-plan'
import { useStudyPlansQuery, useCreateStudyPlanMutation, useSelectStudyPlanMutation } from '../hooks/useStudyPlans'

const studyPlanStore = useStudyPlanStore()

// ─── Queries ──────────────────────────────────────────────────────────────────
const { data: studyPlansData, isLoading, error } = useStudyPlansQuery()
const studyPlans = computed(() => studyPlansData.value || [])

const { mutateAsync: createStudyPlan, isPending: isCreating } = useCreateStudyPlanMutation()
const { mutateAsync: selectStudyPlan } = useSelectStudyPlanMutation()

// ─── State ────────────────────────────────────────────────────────────────────
const currentStudyPlanId = ref<number | null>(studyPlanStore.activePlanId)
const studyPlanName = ref("")
const studyPlanDesc = ref("")
const errorMsg = ref("")

// Sync dropdown with store if store changes externally
watch(() => studyPlanStore.activePlanId, (newId) => {
    if (newId !== currentStudyPlanId.value) {
        currentStudyPlanId.value = newId
    }
})

// ─── Actions ──────────────────────────────────────────────────────────────────
async function handleCreateStudyPlan() {
    if (!studyPlanName.value.trim()) return errorMsg.value = 'Nome do plano de estudo é obrigatório.'
    if (!studyPlanDesc.value.trim()) return errorMsg.value = 'Descrição do plano de estudo é obrigatória.'
    
    errorMsg.value = ""
    const newPlan = await createStudyPlan({
        name: studyPlanName.value.trim(),
        description: studyPlanDesc.value.trim(),
        is_active: true
    })
    
    // Automatically select the new plan
    await handleSelectPlan(newPlan.id, newPlan.name)
    
    studyPlanName.value = ''
    studyPlanDesc.value = ''
}

async function handleSelectPlan(id: number, name: string) {
    await selectStudyPlan({ id, name })
}

watch(currentStudyPlanId, (newId) => {
    const plan = (studyPlans.value || []).find((p: any) => p.id === newId)
    if (plan && newId !== studyPlanStore.activePlanId) {
        handleSelectPlan(plan.id, plan.name)
    }
})

</script>

<template>
  <div class="study-plans-view">
    <header class="view-header">
      <h1 class="text-4xl font-serif font-bold text-on-surface">Planos de Estudo</h1>
      <p class="text-secondary mt-2">Gerencie seus roteiros de aprendizado e escolha qual seguir.</p>
    </header>

    <div v-if="isLoading" class="flex justify-center items-center h-64">
      <div class="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
    </div>

    <div v-else-if="error" class="mt-8 p-4 bg-error/10 border border-error/20 rounded-lg text-error">
        Erro ao carregar planos de estudo. Por favor, tente novamente mais tarde.
    </div>
    
    <div v-else class="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8 animate-fade-in">
      
      <!-- Selection Card -->
      <div class="lg:col-span-2 space-y-6">
        <VCard class="p-8">
            <h3 class="text-xl font-serif font-bold text-on-surface mb-6">Selecione seu Plano Ativo</h3>
            
            <div v-if="!studyPlans?.length" class="text-center py-12 border-2 border-dashed border-outline-variant/20 rounded-xl">
                <span class="material-symbols-outlined text-5xl text-outline-variant mb-4">auto_stories</span>
                <p class="text-secondary">Você ainda não possui planos de estudo criados.</p>
            </div>

            <div v-else class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <button 
                    v-for="plan in studyPlans" 
                    :key="plan.id"
                    @click="handleSelectPlan(plan.id, plan.name)"
                    class="plan-card"
                    :class="{ 'plan-card--active': studyPlanStore.activePlanId === plan.id }"
                >
                    <div class="flex justify-between items-start mb-2">
                        <h4 class="font-bold text-on-surface">{{ plan.name }}</h4>
                        <span v-if="studyPlanStore.activePlanId === plan.id" class="active-badge">Ativo</span>
                    </div>
                    <p class="text-sm text-secondary line-clamp-2 text-left">{{ plan.description }}</p>
                </button>
            </div>
        </VCard>

        <!-- Current Status -->
        <VCard v-if="studyPlanStore.hasActivePlan" class="p-6 bg-primary/5 border-primary/10">
            <div class="flex items-center gap-4">
                <div class="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                    <span class="material-symbols-outlined">check_circle</span>
                </div>
                <div>
                    <p class="text-xs font-bold uppercase tracking-widest text-primary">Plano em Foco</p>
                    <h3 class="text-lg font-serif font-bold text-on-surface">{{ studyPlanStore.activePlanName }}</h3>
                </div>
            </div>
        </VCard>
      </div>

      <!-- Creation Column -->
      <div class="lg:col-span-1">
        <VCard class="p-6 sticky top-6">
            <h3 class="text-lg font-serif font-bold text-on-surface mb-4">Novo Plano</h3>
            <div class="space-y-4">
                <VInput v-model="studyPlanName" label="Nome do Plano" placeholder="Ex: OAB 2025, Vestibular..." icon="edit_note" />
                <VInput v-model="studyPlanDesc" label="Descrição" placeholder="Uma breve descrição do objetivo..." icon="notes" />
                
                <div v-if="errorMsg" class="p-3 bg-error/10 text-error text-xs rounded-lg">
                    {{ errorMsg }}
                </div>

                <VButton 
                    @click="handleCreateStudyPlan" 
                    class="w-full"
                    :disabled="isCreating"
                >
                    {{ isCreating ? 'Criando...' : 'Criar Plano de Estudo' }}
                </VButton>
            </div>
        </VCard>
      </div>

    </div>
  </div>
</template>

<style scoped>
.study-plans-view {
  width: 100%;
}

.view-header {
  margin-bottom: 2rem;
}

.animate-fade-in {
  animation: fadeIn 0.5s ease-out;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

.plan-card {
    background: var(--surface-container-low);
    border: 1px solid var(--outline-variant);
    padding: 1.5rem;
    border-radius: 1rem;
    transition: all 0.2s ease;
    text-align: left;
    cursor: pointer;
}

.plan-card:hover {
    border-color: var(--primary);
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0,0,0,0.05);
}

.plan-card--active {
    background: var(--primary-container);
    border-color: var(--primary);
    box-shadow: 0 4px 20px rgba(var(--primary-rgb), 0.15);
}

.active-badge {
    background: var(--primary);
    color: var(--on-primary);
    font-size: 0.65rem;
    font-weight: 800;
    text-transform: uppercase;
    padding: 2px 8px;
    border-radius: 100px;
}
</style>
