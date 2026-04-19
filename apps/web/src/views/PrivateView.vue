<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { api } from '../lib/axios'
import { VCard, VButton, VBadge, VInput, VSelect } from '../components/ui'

const router = useRouter()
const isLoading = ref(true)
const user = ref<any>(null)
const studyPlans = ref<any>([])
const currentStudyPlan = ref(0)

const studyPlanName = ref("")
const studyPlanDesc = ref("")

const errorMsg = ref('')

onMounted(async () => {
  try {
    const res = await api.get('/auth/me')
    user.value = res.data.user

    const studyPlansRes = await api.get('/study-plans')
    studyPlans.value = studyPlansRes.data

    currentStudyPlan.value = studyPlans.value[0]?.id ?? 0
  } catch (error: any) {
    console.error(error)
    errorMsg.value = 'Acesso não autorizado. Redirecionando para login...'
    setTimeout(() => {
      router.push('/auth')
    }, 2000)
  } finally {
    isLoading.value = false
  }
})

const logout = async () => {
    // Para deslogar completamente seria ideal uma rota de /logout na API pra limpar os cookies
    // Por enquanto redirecionamos. (Simulando)
    document.cookie = "access_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    document.cookie = "refresh_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    router.push('/auth')
}

const createStudyPlan = async () => {
  try {
    const res = await api.post('/study-plans', {
      name: studyPlanName.value,
      description: studyPlanDesc.value,
      is_active: true
    })
    studyPlans.value.push(res.data.studyPlan)
  } catch (error: any) {
    console.error(error)
  }
}

const currentStudyPlanData = computed(() =>
  studyPlans.value.find((p: any) => p.id === currentStudyPlan.value)
)
</script>

<template>
  <div class="min-h-screen bg-background text-on-surface p-8">
    <div class="max-w-3xl mx-auto">
      
      <div v-if="isLoading" class="flex justify-center items-center h-64">
        <div class="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>

      <div v-else-if="errorMsg" class="animate-fade-in text-center mt-12">
        <div class="bg-error/10 border border-error/50 text-error p-6 rounded-xl inline-block">
          <h2 class="text-xl font-serif font-bold mb-2">Erro de Autenticação</h2>
          <p class="font-body">{{ errorMsg }}</p>
        </div>
      </div>

      <div v-else class="animate-fade-in">
        <VCard class="p-8 shadow-xl bg-surface-container-lowest border-outline-variant/20">
          <div class="flex items-center justify-between mb-8 pb-6 border-b border-outline-variant/15">
            <div>
              <h1 class="text-3xl font-serif font-bold text-on-surface mb-2">Área Privada</h1>
              <p class="text-secondary font-body">Você só está vendo isso porque seu cookie é válido.</p>
            </div>
            <VButton @click="logout" variant="error" icon="logout" class="shadow-sm">
              Sair
            </VButton>
          </div>

          <div class="space-y-4">
            <div class="grid grid-cols-3 gap-4 border-b border-outline-variant/10 pb-4 items-center">
              <div class="text-secondary text-sm font-label font-bold uppercase tracking-widest">Sua ID</div>
              <div class="col-span-2 text-primary font-mono text-sm">{{ user?.id }}</div>
            </div>
            <div class="grid grid-cols-3 gap-4 border-b border-outline-variant/10 pb-4 items-center">
              <div class="text-secondary text-sm font-label font-bold uppercase tracking-widest">E-mail</div>
              <div class="col-span-2 text-on-surface font-body">{{ user?.email }}</div>
            </div>
            <div class="grid grid-cols-3 gap-4 border-b border-outline-variant/10 pb-4 items-center">
              <div class="text-secondary text-sm font-label font-bold uppercase tracking-widest">Status Auth</div>
              <div class="col-span-2 flex items-center gap-2">
                <VBadge variant="success" shape="rounded">Logado</VBadge>
                <div class="text-sm text-secondary font-body">
                  Último Login: {{ new Date(user?.last_sign_in_at).toLocaleString() }}
                </div>
              </div>
            </div>
          </div>
        </VCard>
        <VCard>
          <div class="flex items-center justify-between">
            <h2>Planos de Estudo</h2>
            <VInput v-model="studyPlanName" placeholder="Nome do plano de estudo..."/>
            <VInput v-model="studyPlanDesc" placeholder="Descrição do plano de estudo..."/>
            <VButton @click="createStudyPlan">Criar Plano de Estudo</VButton>
          </div>
          <div>
            <VSelect v-model="currentStudyPlan" :options="studyPlans" optionLabel="name" optionValue="id" />
          </div>
          <div>
            <p>Seu plano de estudo atual: {{ currentStudyPlanData?.name }}</p>
          </div>
        </VCard>
      </div>
    </div>
  </div>
</template>

