<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { api } from '../lib/axios'
import { VCard, VButton, VBadge, VInput, VSelect } from '../components/ui'
import { useStudyPlanStore } from '../stores/study-plan'

const router = useRouter()
const studyPlanStore = useStudyPlanStore()
const isLoading = ref(true)
const user = ref<any>(null)
const studyPlans = ref<any>([])
const currentStudyPlan = ref<number>(0)

const studyPlanName = ref("")
const studyPlanDesc = ref("")

const errorMsg = ref('')

onMounted(async () => {
  try {
    const res = await api.get('/auth/me')
    user.value = res.data.user

    const studyPlansRes = await api.get('/study-plans')
    studyPlans.value = studyPlansRes.data

    if (studyPlanStore.activePlanId) {
      // Already selected in this session — just sync the dropdown
      currentStudyPlan.value = studyPlanStore.activePlanId
    } else {
      // Nothing active yet — default to the first plan
      const firstPlan = studyPlans.value[0]
      if (firstPlan) {
        currentStudyPlan.value = firstPlan.id
        await studyPlanStore.selectPlan(firstPlan.id, firstPlan.name)
      }
    }
  } catch (error: any) {
    console.error(error)
    errorMsg.value = 'Erro ao carregar dados do usuário.'
  } finally {
    isLoading.value = false
  }
})

const logout = async () => {
    // Para deslogar completamente seria ideal uma rota de /logout na API pra limpar os cookies
    // Por enquanto redirecionamos. (Simulando)
    document.cookie = "access_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    document.cookie = "refresh_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";

    // Limpa as informações do plano de estudo quando faz logout.
    studyPlanStore.clearPlan()
    router.push('/auth')
}

const createStudyPlan = async () => {
  try {
    const res = await api.post('/study-plans', {
      name: studyPlanName.value,
      description: studyPlanDesc.value,
      is_active: true
    })
    const newPlan = res.data.studyPlan
    studyPlans.value.push(newPlan)
    currentStudyPlan.value = newPlan.id  // triggers watch → selectPlan
    studyPlanName.value = ''
    studyPlanDesc.value = ''
  } catch (error: any) {
    console.error(error)
  }
}

const currentStudyPlanData = computed(() =>
  studyPlans.value.find((p: any) => p.id === currentStudyPlan.value)
)

const selectStudyPlan = async () => {
  const plan = currentStudyPlanData.value
  if (!plan) return
  try {
    await studyPlanStore.selectPlan(plan.id, plan.name)
  } catch (error: any) {
    console.error(error)
  }
}

watch(currentStudyPlan, () => {
  selectStudyPlan()
})

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
            <p class="text-sm text-on-surface">Plano ativo na store: <strong>{{ studyPlanStore.activePlanName ?? 'Nenhum' }}</strong> (ID: {{ studyPlanStore.activePlanId ?? '—' }})</p>
          </div>
          <div class="flex flex-col gap-3 mt-4 border-t border-outline-variant/10 pt-4">
            <VButton @click="testMiddleware" :disabled="isTesting">
              {{ isTesting ? 'Testando...' : 'Testar Middleware /test' }}
            </VButton>
            <pre v-if="testResult" class="text-xs bg-surface-container p-3 rounded-lg overflow-auto">{{ JSON.stringify(testResult, null, 2) }}</pre>
          </div>
        </div>
      </VCard>

      <VCard class="p-6">
        <h3 class="text-lg font-serif font-bold mb-4">Próximas Tarefas</h3>
        <p class="text-secondary text-sm italic">Nenhuma tarefa para hoje.</p>
      </VCard>

      <VCard class="p-6">
        <h3 class="text-lg font-serif font-bold mb-4">Plano de Estudo</h3>
        <p class="text-secondary text-sm">Você ainda não selecionou um plano ativo.</p>
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
