<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { VCard, VButton, VBadge, VSelect, VCardStat, VDiagnosticCard, VActivityItem, VSpinner } from '../components/ui'
import { useStudyPlanStore } from '../stores/study-plan'
import { useAuthMeQuery, useStudyPlansQuery, useSelectStudyPlanMutation } from '../hooks/useStudyPlans'
import { api } from '../lib/axios'

const studyPlanStore = useStudyPlanStore()

const { data: userData, isLoading: isLoadingUser } = useAuthMeQuery()
const user = computed(() => userData.value)

const { data: studyPlansData, isLoading: isLoadingPlans } = useStudyPlansQuery()
const studyPlans = computed(() => studyPlansData.value || [])

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

// ─── Computed ──────────────────────────────────────────────────────────────────
const firstName = computed(() => {
  const name = user.value?.name || 'Estudante'
  return name.split(' ')[0]
})
</script>

<template>
  <div class="p-8 max-w-7xl mx-auto space-y-12 animate-fade-in pb-12">
    <!-- Welcome Section -->
    <section class="flex flex-col md:flex-row md:items-end justify-between gap-6">
      <div class="space-y-1">
        <p class="font-label text-xs uppercase tracking-[0.2em] text-primary font-bold">Resumo Acadêmico</p>
        <h2 class="text-4xl md:text-5xl font-headline font-bold text-on-surface tracking-tight">Bom dia, {{ firstName }}.</h2>
      </div>
      <div class="flex gap-3">
        <button class="bg-surface-container-low rounded-lg text-sm font-label font-bold soft-brutalist-border hover:bg-surface-container-highest transition-colors active:scale-95" style="padding: 10px 24px; min-height: 44px; display: flex; align-items: center; justify-content: center;">
          Exportar Relatório
        </button>
        <router-link to="/private/focus" class="bg-on-surface text-surface rounded-lg text-sm font-label font-bold active:scale-95 transition-all shadow-sm" style="padding: 10px 24px; min-height: 44px; display: flex; align-items: center; justify-content: center;">
          Nova Sessão
        </router-link>
      </div>
    </section>

    <!-- Loading Spinner -->
    <div v-if="isLoading" class="flex justify-center items-center h-64">
      <VSpinner />
    </div>

    <!-- Dashboard Content (Loaded State) -->
    <div v-else class="space-y-12">
      <!-- Bento Grid Layout -->
      <div class="grid grid-cols-1 md:grid-cols-12 gap-6">
        <!-- IA Diagnostic Card (Main) -->
        <VDiagnosticCard 
          class="md:col-span-8"
          highlightDiscipline="Sistemas Operacionais"
          retentionRate="92%"
          fatigueDiscipline="Cálculo Diferencial"
          recommendationText="Recomendamos priorizar a revisão de 'Gerenciamento de Memória' hoje às 15:00 para consolidar a memória de longo prazo antes da prova de amanhã."
          actionLink="/private/disciplinas"
        />

        <!-- Quick Stats -->
        <div class="md:col-span-4 space-y-6">
          <VCardStat 
            title="Taxa de Sucesso" 
            value="88%" 
            icon="pi-bolt"
            iconBgClass="bg-primary/10"
            iconColorClass="text-primary"
            badgeText="+4%"
            badgeColorClass="text-green-600"
            badgeBgClass="bg-green-50"
          />
          <VCardStat 
            title="Foco Médio" 
            value="72" 
            suffix="pts"
            icon="pi-bullseye"
            iconBgClass="bg-secondary/10"
            iconColorClass="text-secondary"
          />
          <VCardStat 
            title="Meta Semanal" 
            value="18" 
            suffix="/ 24h"
            icon="pi-clock"
            iconBgClass="bg-primary/10"
            iconColorClass="text-primary"
            showProgress
            :progressPercent="75"
          />
        </div>
      </div>

      <!-- Recent Activity List Section -->
      <section class="space-y-6">
        <div class="flex items-center justify-between border-b border-outline-variant/10 pb-4">
          <h3 class="text-2xl font-headline font-bold">Atividade Recente</h3>
          <router-link to="/private/disciplinas" class="text-sm font-label font-bold text-secondary hover:text-primary transition-colors">
            Ver disciplinas
          </router-link>
        </div>
        <div class="grid grid-cols-1 gap-4">
          <VActivityItem 
            title="Sistemas Operacionais"
            moduleName="Gerenciamento de Memória"
            timeSpent="45 min"
            status="Completo"
            icon="pi-code"
          />
          <VActivityItem 
            title="Matemática Discreta"
            moduleName="Teoria dos Grafos"
            timeSpent="2h 10min"
            status="Em Andamento"
            icon="pi-share-alt"
          />
        </div>
      </section>
    </div>
  </div>
</template>
