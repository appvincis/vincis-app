<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { VCard, VButton, VBadge, VSelect, VCardStat, VDiagnosticCard, VActivityItem, VSpinner } from '../components/ui'
import { useStudyPlanStore } from '../stores/study-plan'
import { useAuthMeQuery, useStudyPlansQuery, useSelectStudyPlanMutation } from '../hooks/useStudyPlans'
import { useDisciplinesQuery } from '../hooks/useDisciplines'
import { useFocusSessionsQuery, type FocusSession } from '../hooks/useFocusSessions'
import { api } from '../lib/axios'

const studyPlanStore = useStudyPlanStore()

const { data: userData, isLoading: isLoadingUser } = useAuthMeQuery()
const user = computed(() => userData.value)

const { data: studyPlansData, isLoading: isLoadingPlans } = useStudyPlansQuery()
const studyPlans = computed(() => studyPlansData.value || [])

const { data: disciplinesData, isLoading: isLoadingDisciplines } = useDisciplinesQuery()
const disciplines = computed(() => disciplinesData.value || [])
const isAiInsightsEmpty = computed(() => disciplines.value.length === 0)

const highlightDiscipline = computed(() => disciplines.value[0]?.name || 'Sistemas Operacionais')
const fatigueDiscipline = computed(() => disciplines.value[1]?.name || disciplines.value[0]?.name || 'Cálculo Diferencial')
const recommendationText = computed(() => {
  const firstDisc = disciplines.value[0]?.name
  if (firstDisc) {
    return `Recomendamos priorizar a revisão de tópicos de '${firstDisc}' hoje às 15:00 para consolidar a memória de longo prazo antes das provas.`
  }
  return "Recomendamos priorizar a revisão de 'Gerenciamento de Memória' hoje às 15:00 para consolidar a memória de longo prazo antes da prova de amanhã."
})

const selectStudyPlanMutation = useSelectStudyPlanMutation()

const isLoading = computed(() => isLoadingUser.value || isLoadingPlans.value || isLoadingDisciplines.value)

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

// ─── Atividade Recente (Foco) ─────────────────────────────────────────────────
const { data: focusSessions, isLoading: isLoadingSessions } = useFocusSessionsQuery()

const recentSessions = computed(() => {
  if (!focusSessions.value) return []
  return [...focusSessions.value]
    .sort((a, b) => new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime())
    .slice(0, 5)
})

function formatDuration(seconds: number): string {
  if (!seconds) return '0 min'
  const mins = Math.round(seconds / 60)
  if (mins < 60) return `${mins} min`
  const h = Math.floor(mins / 60)
  const m = mins % 60
  return m > 0 ? `${h}h ${m}m` : `${h}h`
}

function sessionStatus(session: FocusSession): 'Completo' | 'Em Andamento' | 'Pausado' {
  if (session.isCompleted) return 'Completo'
  return 'Em Andamento'
}

const disciplineIcons: Record<string, string> = {
  'matemática': 'pi-calculator',
  'português': 'pi-book',
  'redação': 'pi-pencil',
  'história': 'pi-globe',
  'geografia': 'pi-map',
  'física': 'pi-atom',
  'química': 'pi-flask',
  'biologia': 'pi-dna',
  'inglês': 'pi-language',
  'informática': 'pi-desktop',
  'direito': 'pi-scale',
  'administração': 'pi-chart-bar',
  'contabilidade': 'pi-calculator',
}

function getIconForDiscipline(name?: string): string {
  if (!name) return 'pi-clock'
  const lower = name.toLowerCase()
  for (const [key, icon] of Object.entries(disciplineIcons)) {
    if (lower.includes(key)) return icon
  }
  return 'pi-clock'
}
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
          class="md:col-span-8 h-fit"
          :isEmpty="isAiInsightsEmpty"
          :highlightDiscipline="highlightDiscipline"
          retentionRate="92%"
          :fatigueDiscipline="fatigueDiscipline"
          :recommendationText="recommendationText"
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
          <router-link to="/private/focus" class="text-sm font-label font-bold text-secondary hover:text-primary transition-colors">
            Ir para o Foco
          </router-link>
        </div>

        <div v-if="isLoadingSessions" class="flex justify-center py-12">
          <VSpinner />
        </div>

        <div v-else-if="recentSessions.length === 0" class="flex flex-col items-center justify-center py-16 gap-6">
          <div class="w-24 h-24 rounded-full bg-primary-container/20 flex items-center justify-center">
            <i class="pi pi-hourglass text-5xl text-primary/60"></i>
          </div>
          <div class="text-center max-w-sm">
            <h4 class="text-lg font-headline font-bold text-on-surface">Nenhuma sessão ainda</h4>
            <p class="text-sm text-on-surface-variant font-sans mt-2 leading-relaxed">
              Seu histórico de sessões de foco aparecerá aqui. 
              Inicie uma sessão para acompanhar seu progresso e manter a consistência nos estudos.
            </p>
          </div>
          <router-link to="/private/focus">
            <VButton variant="primary">
              <i class="pi pi-play mr-2 text-sm" />
              Iniciar Sessão de Foco
            </VButton>
          </router-link>
        </div>

        <div v-else class="grid grid-cols-1 gap-4">
          <VActivityItem
            v-for="session in recentSessions"
            :key="session.id"
            :title="session.discipline?.name || 'Disciplina Deletada'"
            :moduleName="session.cyclesCompleted + ' de ' + session.cyclesTarget + ' ciclos'"
            :timeSpent="formatDuration(session.duration)"
            :status="sessionStatus(session)"
            :icon="getIconForDiscipline(session.discipline?.name)"
          />
        </div>
      </section>
    </div>
  </div>
</template>
