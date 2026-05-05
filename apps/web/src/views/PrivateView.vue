<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { VCard, VButton, VBadge, VSelect } from '../components/ui'
import { useStudyPlanStore } from '../stores/study-plan'
import { useAuthMeQuery, useStudyPlansQuery, useSelectStudyPlanMutation } from '../hooks/useStudyPlans'
import { api } from '../lib/axios'

const studyPlanStore = useStudyPlanStore()

// ─── Queries ──────────────────────────────────────────────────────────────────
const userQuery = useAuthMeQuery()
const user = computed(() => userQuery.data.value)
const isLoadingUser = computed(() => userQuery.isLoading.value)

const studyPlansQuery = useStudyPlansQuery()
const studyPlans = computed(() => studyPlansQuery.data.value || [])
const isLoadingPlans = computed(() => studyPlansQuery.isLoading.value)

const selectStudyPlanMutation = useSelectStudyPlanMutation()

const isLoading = computed(() => isLoadingUser.value || isLoadingPlans.value)

// ─── State ────────────────────────────────────────────────────────────────────
const currentStudyPlanId = ref<number | null>(studyPlanStore.activePlanId)

// Sync local ref with store
watch(() => studyPlanStore.activePlanId, (newId) => {
  currentStudyPlanId.value = newId
})

// Auto-select first plan if none active
watch(() => studyPlans.value, (plans) => {
  if (plans && plans.length > 0 && !studyPlanStore.activePlanId) {
    const firstPlan = plans[0]
    if (firstPlan) handleSelectPlan(firstPlan.id, firstPlan.name)
  }
}, { immediate: true })

async function handleSelectPlan(id: number, name: string) {
  await selectStudyPlanMutation.mutateAsync({ id, name })
}

watch(currentStudyPlanId, (newId) => {
  if (newId && newId !== studyPlanStore.activePlanId) {
    const plan = (studyPlans.value || []).find((p: any) => p.id === newId)
    if (plan) handleSelectPlan(plan.id, plan.name)
  }
})

// ─── Test Middleware ──────────────────────────────────────────────────────────
const testResult = ref<any>(null)
const isTesting = ref(false)

const testMiddleware = async () => {
  isTesting.value = true
  testResult.value = null
  try {
    const res = await api.get('/study-plans/test')
    testResult.value = res.data
  } catch (error: any) {
    testResult.value = { error: error.response?.data?.message ?? error.message }
  } finally {
    isTesting.value = false
  }
}
</script>

<template>
  <div class="dashboard-view">
    <header class="view-header">
      <h1 class="text-4xl font-serif font-bold text-on-surface">Bem-vindo, {{ user?.name || 'Estudante' }}</h1>
      <p class="text-secondary mt-2">Aqui está um resumo do seu progresso acadêmico.</p>
    </header>

    <div v-if="isLoading" class="flex justify-center items-center h-64">
      <div class="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
    </div>

    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8 animate-fade-in">
      
      <!-- Profile Card -->
      <VCard class="p-6">
        <h3 class="text-lg font-serif font-bold mb-4">Seu Perfil</h3>
        <div class="space-y-3">
          <div class="flex justify-between">
            <span class="text-secondary text-sm">Email</span>
            <span class="text-on-surface text-sm">{{ user?.email }}</span>
          </div>
          <div class="flex justify-between items-center">
            <span class="text-secondary text-sm">Status</span>
            <VBadge variant="success">Ativo</VBadge>
          </div>
          <div class="mt-4 pt-4 border-t border-outline-variant/10">
            <p class="text-xs font-bold uppercase tracking-widest text-secondary mb-1">Plano Ativo</p>
            <p class="text-sm text-on-surface font-bold">{{ studyPlanStore.activePlanName ?? 'Nenhum' }}</p>
          </div>
          <div class="flex flex-col gap-3 mt-4 border-t border-outline-variant/10 pt-4">
            <VButton @click="testMiddleware" :disabled="isTesting" variant="secondary" class="text-xs">
              {{ isTesting ? 'Testando...' : 'Testar Middleware /test' }}
            </VButton>
            <pre v-if="testResult" class="text-[10px] bg-surface-container p-3 rounded-lg overflow-auto max-h-32">{{ JSON.stringify(testResult, null, 2) }}</pre>
          </div>
        </div>
      </VCard>

      <!-- Next Tasks Card (Placeholder) -->
      <VCard class="p-6">
        <h3 class="text-lg font-serif font-bold mb-4">Próximas Tarefas</h3>
        <div class="flex flex-col items-center justify-center py-8 text-center">
            <span class="material-symbols-outlined text-outline-variant text-4xl mb-2">event_busy</span>
            <p class="text-secondary text-sm italic">Nenhuma tarefa para hoje.</p>
        </div>
      </VCard>

      <!-- Study Plan Quick Select -->
      <VCard class="p-6">
        <div class="flex justify-between items-center mb-4">
            <h3 class="text-lg font-serif font-bold">Plano de Estudo</h3>
            <router-link to="/private/study-plans" class="text-xs text-primary hover:underline">Gerenciar</router-link>
        </div>
        <div class="space-y-4">
          <p class="text-xs text-secondary mb-2">Troque rapidamente entre seus planos:</p>
          <VSelect v-model="currentStudyPlanId" :options="studyPlans" optionLabel="name" optionValue="id" />
          
          <div v-if="studyPlanStore.hasActivePlan" class="p-4 bg-primary/5 rounded-xl border border-primary/10 mt-4">
            <div class="flex items-center gap-3">
                <span class="material-symbols-outlined text-primary text-sm">auto_stories</span>
                <span class="text-xs font-bold text-on-surface">Continuar de onde parou</span>
            </div>
            <VButton class="w-full mt-3 text-xs" variant="primary" @click="$router.push('/private/disciplinas')">Ver Disciplinas</VButton>
          </div>
        </div>
      </VCard>
    </div>
  </div>
</template>

<style scoped>
.dashboard-view {
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
</style>
