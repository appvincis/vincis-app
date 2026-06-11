<!-- apps/web/src/views/ProfileView.vue -->
<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import { useAuthStore } from '../stores/auth'
import { VCard, VButton, VInput, VAlert, VModal, VSpinner, VActivityItem } from '../components/ui'
import Avatar from 'primevue/avatar'
import { useAuthMeQuery, useUpdateProfileMutation } from '../hooks/useStudyPlans'

// For stats & trophies
import { useFocusSessionsQuery } from '../hooks/useFocusSessions'
import { useErrorLogsQuery } from '../hooks/useErrorLogs'
import { useDisciplinesQuery } from '../hooks/useDisciplines'
import { usePerformanceStats } from '../hooks/usePerformanceStats'

const authStore = useAuthStore()
const userQuery = useAuthMeQuery()
const updateProfileMutation = useUpdateProfileMutation()

const isEditing = ref(false)
const name = ref(authStore.user?.name || '')
const email = ref(authStore.user?.email || '')
const avatar = ref(authStore.user?.avatar || '')

const fileInput = ref<HTMLInputElement | null>(null)
const errorMsg = ref('')
const successMsg = ref('')

// Sincroniza dados com o resultado da rota /auth/me se mudar no backend
watch(() => userQuery.data.value, (userData) => {
  if (userData) {
    authStore.updateProfile(userData)
    name.value = userData.name || ''
    email.value = userData.email || ''
    avatar.value = userData.avatar || ''
  }
}, { immediate: true })

// Sincroniza se mudar no store
watch(() => authStore.user, (u) => {
  if (u && !isEditing.value) {
    name.value = u.name || ''
    email.value = u.email || ''
    avatar.value = u.avatar || ''
  }
}, { deep: true })

const startEditing = () => {
  name.value = authStore.user?.name || ''
  email.value = authStore.user?.email || ''
  avatar.value = authStore.user?.avatar || ''
  errorMsg.value = ''
  successMsg.value = ''
  isEditing.value = true
}

const cancelEditing = () => {
  isEditing.value = false
  errorMsg.value = ''
}

const triggerFileInput = () => {
  if (isEditing.value) {
    fileInput.value?.click()
  }
}

// Compactador e redimensionador de imagem client-side via HTML Canvas
const compressImage = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (event) => {
      const img = new Image()
      img.onload = () => {
        const canvas = document.createElement('canvas')
        const MAX_WIDTH = 256
        const MAX_HEIGHT = 256
        let width = img.width
        let height = img.height

        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width
            width = MAX_WIDTH
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height
            height = MAX_HEIGHT
          }
        }

        canvas.width = width
        canvas.height = height
        const ctx = canvas.getContext('2d')
        ctx?.drawImage(img, 0, 0, width, height)
        const dataUrl = canvas.toDataURL('image/jpeg', 0.75)
        resolve(dataUrl)
      }
      img.onerror = (err) => reject(err)
      img.src = event.target?.result as string
    }
    reader.onerror = (err) => reject(err)
    reader.readAsDataURL(file)
  })
}

const onFileChange = async (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  if (!file) return

  try {
    const compressed = await compressImage(file)
    avatar.value = compressed
  } catch (err) {
    console.error(err)
    errorMsg.value = 'Falha ao processar a imagem de perfil.'
  }
}

const saveProfile = async () => {
  errorMsg.value = ''
  successMsg.value = ''

  if (!name.value.trim()) {
    errorMsg.value = 'O nome completo é obrigatório.'
    return
  }
  if (!email.value.trim() || !email.value.includes('@')) {
    errorMsg.value = 'Digite um e-mail válido.'
    return
  }

  try {
    const userId = authStore.user?.id
    if (!userId) {
      errorMsg.value = 'Não foi possível encontrar o ID do usuário local.'
      return
    }

    // Chama o backend para atualizar
    await updateProfileMutation.mutateAsync({
      id: Number(userId),
      name: name.value,
      email: email.value,
      avatar: avatar.value
    })

    // Sincroniza na store local
    authStore.updateProfile({
      name: name.value,
      email: email.value,
      avatar: avatar.value
    })

    successMsg.value = 'Perfil atualizado com sucesso!'
    isEditing.value = false
  } catch (err: any) {
    console.error(err)
    errorMsg.value = err.response?.data?.message || 'Falha ao atualizar o perfil. Tente novamente.'
  }
}

// ─── Stats and Trophies (Vault of Wisdom) ───────────────────────────────────
const { data: sessionsData, isLoading: loadingSessions } = useFocusSessionsQuery()
const { data: errorsData,   isLoading: loadingErrors   } = useErrorLogsQuery(ref({}))
const { data: disciplinesData                           } = useDisciplinesQuery()

const isLoadingStats = computed(() => loadingSessions.value || loadingErrors.value)

const {
  selectedPeriod,
  totalStudyHours,
  totalSessions,
  studyStreak,
  totalDoneTasks,
} = usePerformanceStats(sessionsData, errorsData, disciplinesData)

// Force all-time period for profile achievements and indicators
selectedPeriod.value = 'all'

interface Relic {
  id: string
  name: string
  subtitle: string
  description: string
  requirementText: string
  icon: string
  unlocked: boolean
  current: number
  target: number
}

const relics = computed<Relic[]>(() => {
  const sessions = totalSessions.value || 0
  const hours = parseFloat(totalStudyHours.value) || 0
  const streak = studyStreak.value || 0
  const tasks = totalDoneTasks.value || 0

  return [
    {
      id: 'architect',
      name: 'O Arquiteto',
      subtitle: 'Aquele que planeja com rigor.',
      description: 'Dedicado aos estudantes que planejam com rigor e constroem bases sólidas por meio de sessões estruturadas de aprendizado.',
      requirementText: 'Concluir 20 sessões de foco.',
      icon: 'architect',
      unlocked: sessions >= 20,
      current: sessions,
      target: 20
    },
    {
      id: 'philosopher',
      name: 'O Filósofo',
      subtitle: 'Aquele que transmuta esforço em sabedoria.',
      description: 'Dedicado àqueles que transmutam persistência e dedicação bruta em conhecimento e discernimento consolidados.',
      requirementText: 'Acumular 10 horas de estudo ativo.',
      icon: 'philosopher',
      unlocked: hours >= 10,
      current: hours,
      target: 10
    },
    {
      id: 'astra',
      name: 'Astra',
      subtitle: 'Aquele que persevera perante as adversidades.',
      description: 'Dedicado àqueles que mantêm a constância diária, brilhando mesmo em meio à exaustão das rotinas complexas.',
      requirementText: 'Alcançar uma sequência de 5 dias de estudo.',
      icon: 'astra',
      unlocked: streak >= 5,
      current: streak,
      target: 5
    },
    {
      id: 'thesis',
      name: 'O Iniciante',
      subtitle: 'Todo mestre já foi um iniciante.',
      description: 'Dedicado ao primeiro passo na jornada do conhecimento.',
      requirementText: 'Concluir 1 sessão de foco ou 1 tarefa.',
      icon: 'thesis',
      unlocked: sessions >= 1 || tasks >= 1,
      current: sessions >= 1 ? 1 : (tasks >= 1 ? 1 : 0),
      target: 1
    }
  ]
})

const recentSessionsList = computed(() => {
  if (!sessionsData.value) return []
  return [...sessionsData.value]
    .sort((a, b) => new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime())
    .slice(0, 5)
})

// Relic Modal Details
const selectedRelic = ref<Relic | null>(null)
const showRelicModal = ref(false)

const openRelicDetails = (relic: Relic) => {
  selectedRelic.value = relic
  showRelicModal.value = true
}

const showAllRelicsModal = ref(false)

// Formatting helpers
function formatValue(val: number): string {
  if (val % 1 !== 0) {
    return val.toFixed(1)
  }
  return val.toString()
}

function fmtDuration(seconds: number): string {
  if (!seconds) return '0 min'
  const mins = Math.round(seconds / 60)
  if (mins < 60) return `${mins} min`
  const h = Math.floor(mins / 60)
  const m = mins % 60
  return m > 0 ? `${h}h ${m}m` : `${h}h`
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr)
  return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })
}
</script>

<template>
  <div class="profile-view">
    <!-- Decorative background -->
    <div class="profile-bg-decor" aria-hidden="true"></div>

    <header class="view-header">
      <h1 class="text-3xl lg:text-4xl font-serif font-bold text-on-surface tracking-tight relative inline-block">
        Seu Perfil
        <div class="absolute -bottom-2 left-0 w-20 h-1 bg-primary-container/70 rounded-full"></div>
      </h1>
      <p class="text-secondary mt-2 font-sans text-sm">Gerencie suas informações pessoais e preferências.</p>
    </header>

    <div class="mt-6">
      <VAlert 
        v-if="errorMsg" 
        variant="error" 
        :message="errorMsg" 
        dismissible 
        @close="errorMsg = ''" 
      />
      
      <VAlert 
        v-if="successMsg" 
        variant="success" 
        :message="successMsg" 
        dismissible 
        @close="successMsg = ''" 
      />

      <div class="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        <!-- COLUNA ESQUERDA: Perfil e Edição -->
        <div class="lg:col-span-8 space-y-6">
          <VCard class="p-5 md:p-6">
            <!-- Modo Leitura / Visualização -->
            <div v-if="!isEditing" class="space-y-5">
              <div class="flex items-center gap-5">
                <div class="relative shrink-0">
                  <Avatar 
                    :image="avatar || 'https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y'" 
                    size="xlarge" 
                    shape="circle" 
                    class="profile-avatar shadow-sm"
                  />
                  <div class="absolute -inset-1 rounded-full bg-primary-container/20 -z-10"></div>
                </div>
                <div class="min-w-0">
                  <h2 class="text-xl lg:text-2xl font-serif font-bold text-on-surface truncate">{{ name || 'Estudante' }}</h2>
                  <p class="text-on-surface-variant font-sans text-sm">{{ email || 'Nenhum e-mail cadastrado' }}</p>
                </div>
              </div>

              <div class="grid grid-cols-1 gap-4">
                <div class="profile-field">
                  <label class="text-[10px] font-bold uppercase tracking-widest text-outline font-sans">Nome Completo</label>
                  <div class="mt-1 px-3.5 py-2.5 bg-surface-container-low rounded-lg border border-outline-variant/20 text-on-surface font-sans text-sm">
                    {{ name || 'Não informado' }}
                  </div>
                </div>
                <div class="profile-field">
                  <label class="text-[10px] font-bold uppercase tracking-widest text-outline font-sans">E-mail</label>
                  <div class="mt-1 px-3.5 py-2.5 bg-surface-container-low rounded-lg border border-outline-variant/20 text-on-surface font-sans text-sm">
                    {{ email || 'Não informado' }}
                  </div>
                </div>
              </div>

              <div class="pt-4 border-t border-outline-variant/15 flex justify-end">
                <VButton variant="primary" @click="startEditing" class="w-full justify-center">
                  <i class="pi pi-pencil mr-2 text-sm" />
                  Editar Perfil
                </VButton>
              </div>
            </div>

            <!-- Modo Edição -->
            <div v-else class="space-y-5">
              <div class="flex flex-col sm:flex-row items-center gap-5">
                <div class="relative shrink-0 group cursor-pointer" @click="triggerFileInput">
                  <Avatar 
                    :image="avatar || 'https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y'" 
                    size="xlarge" 
                    shape="circle" 
                    class="profile-avatar shadow-sm transition duration-200 group-hover:brightness-50"
                  />
                  <div class="absolute -inset-1 rounded-full bg-primary-container/20 -z-10"></div>
                  <div class="absolute inset-0 flex flex-col items-center justify-center rounded-full bg-black/40 opacity-0 group-hover:opacity-100 transition duration-200 text-white">
                    <i class="pi pi-camera text-2xl"></i>
                    <span class="text-[10px] font-bold mt-1 uppercase tracking-wider font-sans">Alterar</span>
                  </div>
                </div>
                <div class="flex-1 text-center sm:text-left min-w-0">
                  <div class="flex flex-col gap-2 shrink-0">
                    <VButton variant="secondary" size="small" class="text-xs justify-center" @click="triggerFileInput">
                      <i class="pi pi-upload mr-1.5 text-xs" />
                      Escolher Foto
                    </VButton>
                    <VButton 
                      v-if="avatar" 
                      variant="error" 
                      size="small" 
                      class="text-xs justify-center" 
                      @click="avatar = ''"
                    >
                      <i class="pi pi-trash mr-1.5 text-xs" />
                      Remover Foto
                    </VButton>
                  </div>
                  <input 
                    type="file" 
                    ref="fileInput" 
                    class="hidden" 
                    accept="image/*" 
                    @change="onFileChange" 
                  />
                </div>
              </div>

              <div class="grid grid-cols-1 gap-4">
                <VInput 
                  v-model="name" 
                  label="Nome Completo" 
                  placeholder="Digite seu nome completo" 
                  icon="person" 
                  required
                />
                <VInput 
                  v-model="email" 
                  label="Endereço de E-mail" 
                  placeholder="Digite seu e-mail" 
                  icon="mail" 
                  required
                />
              </div>

              <div class="pt-4 border-t border-outline-variant/15 flex flex-col gap-2">
                <VButton 
                  variant="primary" 
                  @click="saveProfile" 
                  :loading="updateProfileMutation.isPending.value"
                  class="w-full justify-center"
                >
                  {{ updateProfileMutation.isPending.value ? 'Salvando...' : 'Salvar Alterações' }}
                </VButton>
                <VButton 
                  variant="secondary" 
                  @click="cancelEditing" 
                  :disabled="updateProfileMutation.isPending.value"
                  class="w-full justify-center"
                >
                  Cancelar
                </VButton>
              </div>
            </div>
          </VCard>
        </div>
        <div class="lg:col-span-4 space-y-8">
                      <!-- 1. Estatísticas Gerais (Journey Stats) -->
            <div class="grid grid-cols-4 sm:grid-cols-1 gap-2.5">
              <div class="kpi-mini-card">
                <div class="kpi-mini-icon kpi-mini-icon--blue"><i class="pi pi-clock"></i></div>
                <div>
                  <p class="kpi-mini-value">{{ totalStudyHours }}h</p>
                  <p class="kpi-mini-label">Horas Foco</p>
                </div>
              </div>
              <div class="kpi-mini-card">
                <div class="kpi-mini-icon kpi-mini-icon--purple"><i class="pi pi-bolt"></i></div>
                <div>
                  <p class="kpi-mini-value">{{ totalSessions }}</p>
                  <p class="kpi-mini-label">Sessões</p>
                </div>
              </div>
              <div class="kpi-mini-card">
                <div class="kpi-mini-icon kpi-mini-icon--red"><i class="pi pi-calendar-plus"></i></div>
                <div>
                  <p class="kpi-mini-value">{{ studyStreak }}d</p>
                  <p class="kpi-mini-label">Sequência</p>
                </div>
              </div>
              <div class="kpi-mini-card">
                <div class="kpi-mini-icon kpi-mini-icon--green"><i class="pi pi-check-circle"></i></div>
                <div>
                  <p class="kpi-mini-value">{{ totalDoneTasks }}</p>
                  <p class="kpi-mini-label">Tarefas</p>
                </div>
              </div>
            </div>


        </div>
        <!-- COLUNA DIREITA: Estatísticas, Conquistas e Histórico -->
        <div class="lg:col-span-12 space-y-8">
          
          <!-- Loading Stats state -->
          <div v-if="isLoadingStats" class="flex flex-col items-center justify-center py-20 bg-surface-container-lowest border border-outline-variant/15 rounded-2xl">
            <VSpinner />
            <p class="text-xs text-secondary font-sans mt-3">Carregando dados da jornada acadêmica...</p>
          </div>

          <template v-else>
            <!-- 2. Relicário (Vault of Wisdom) -->
            <div class="vault-card p-6 md:p-8">
              <div class="vault-header flex justify-between items-end mb-8">
                <div>
                  <h2 class="text-2xl md:text-3xl font-serif font-bold text-on-surface tracking-tight">Relíquias</h2>
                  <div class="w-16 h-0.5 bg-primary/40 rounded-full mt-1"></div>
                </div>
                <span class="text-[10px] font-bold uppercase tracking-widest text-primary cursor-pointer hover:underline" @click="showAllRelicsModal = true">Ver Todas</span>
              </div>

              <!-- Relic slots row -->
              <div class="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div 
                  v-for="relic in relics" 
                  :key="relic.id" 
                  class="relic-item"
                  @click="openRelicDetails(relic)"
                >
                  <!-- Relic circle outer & inner -->
                  <div 
                    class="relic-circle-outer" 
                    :class="relic.unlocked ? 'unlocked' : 'locked'"
                    :title="relic.unlocked ? 'Desbloqueado!' : `Bloqueado - Requisito: ${relic.requirementText}`"
                  >
                    <div 
                      class="relic-circle-inner"
                      :class="relic.unlocked ? 'unlocked' : 'locked'"
                    >
                      <!-- Minimalist SVG Icons based on ID -->
                      <template v-if="relic.icon === 'architect'">
                        <svg viewBox="0 0 24 24" class="w-10 h-10" :class="relic.unlocked ? 'relic-icon' : 'relic-icon locked'" fill="none" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round">
                          <circle cx="12" cy="5" r="1.5" />
                          <path d="M12 6.5L7.5 19.5M12 6.5l4.5 13M9 15h6M11.5 6.5h1" />
                        </svg>
                      </template>
                      <template v-else-if="relic.icon === 'philosopher'">
                        <svg viewBox="0 0 24 24" class="w-10 h-10" :class="relic.unlocked ? 'relic-icon' : 'relic-icon locked'" fill="none" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round">
                          <path d="M9 3h6M10 3v6.5l-4.5 9.5a1 1 0 001 1.5h11a1 1 0 001-1.5L14 9.5V3" />
                          <path d="M7 16h10" />
                        </svg>
                      </template>
                      <template v-else-if="relic.icon === 'astra'">
                        <svg viewBox="0 0 24 24" class="w-10 h-10" :class="relic.unlocked ? 'relic-icon' : 'relic-icon locked'" fill="none" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round">
                          <path d="M12 4l1 3.5 3.5 1-3.5 1-1 3.5-1-3.5-3.5-1 3.5-1 1-3.5z" />
                          <path d="M18 13l0.7 2.3 2.3 0.7-2.3 0.7-0.7 2.3-0.7-2.3-2.3-0.7 2.3-0.7 0.7-2.3z" />
                          <path d="M6 14l0.5 1.5 1.5 0.5-1.5 0.5-0.5 1.5-0.5-1.5-1.5-0.5 1.5-0.5 0.5-1.5z" />
                        </svg>
                      </template>
                      <template v-else-if="relic.icon === 'thesis'">
                        <svg viewBox="0 0 24 24" class="w-10 h-10" :class="relic.unlocked ? 'relic-icon' : 'relic-icon locked'" fill="none" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round">
                          <path d="M17.5 4.5l2 2L8.5 17.5l-2.5 1 1-2.5L17.5 4.5z" />
                          <path d="M15 7l2 2" />
                          <path d="M12.5 11.5L9 15" />
                          <circle cx="11" cy="11" r="0.5" fill="currentColor" />
                        </svg>
                      </template>
                    </div>
                  </div>

                  <!-- Relic titles below circle -->
                  <h3 class="font-serif font-bold text-on-surface tracking-wide text-sm mt-4 text-center select-none">{{ relic.name }}</h3>
                  <p class="font-sans italic text-secondary text-[11px] mt-1 text-center select-none">{{ relic.subtitle }}</p>
                </div>
              </div>
            </div>

            <!-- 3. Histórico de Atividade Recente (Timeline) -->
            <div class="space-y-4">
              <div class="flex items-center gap-2 mb-2">
                <i class="pi pi-history text-primary"></i>
                <h3 class="text-lg font-serif font-bold text-on-surface">Histórico de Foco Recente</h3>
              </div>
              
              <div v-if="recentSessionsList.length === 0" class="flex flex-col items-center justify-center p-8 bg-surface-container-low/40 border border-dashed border-outline-variant/20 rounded-2xl text-center">
                <i class="pi pi-calendar-times text-2xl text-on-surface-muted/30 mb-2"></i>
                <p class="text-sm font-sans text-on-surface-muted italic">Nenhuma atividade de foco registrada recentemente.</p>
              </div>

              <div v-else class="space-y-3">
                <VActivityItem 
                  v-for="session in recentSessionsList"
                  :key="session.id"
                  :title="session.discipline?.name || 'Sessão de Foco'"
                  :moduleName="formatDate(session.startedAt)"
                  :timeSpent="fmtDuration(session.duration)"
                  :status="session.isCompleted ? 'Completo' : 'Em Andamento'"
                  icon="pi-clock"
                />
              </div>
            </div>
          </template>

        </div>
      </div>
    </div>

    <!-- MODAL 1: Detalhes de uma Relíquia Específica -->
    <VModal :visible="showRelicModal" @update:visible="showRelicModal = false" :header="selectedRelic ? selectedRelic.name : 'Relíquia'">
      <template #default>
        <div v-if="selectedRelic" class="flex flex-col items-center text-center p-4">
          <!-- Outer Relic Circle in Modal -->
          <div 
            class="relic-circle-outer mb-6 scale-110" 
            :class="selectedRelic.unlocked ? 'unlocked' : 'locked'"
          >
            <div 
              class="relic-circle-inner"
              :class="selectedRelic.unlocked ? 'unlocked' : 'locked'"
            >
              <!-- SVG choosing inside modal -->
              <template v-if="selectedRelic.icon === 'architect'">
                <svg viewBox="0 0 24 24" class="w-12 h-12" :class="selectedRelic.unlocked ? 'relic-icon' : 'relic-icon locked'" fill="none" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round">
                  <circle cx="12" cy="5" r="1.5" />
                  <path d="M12 6.5L7.5 19.5M12 6.5l4.5 13M9 15h6M11.5 6.5h1" />
                </svg>
              </template>
              <template v-else-if="selectedRelic.icon === 'philosopher'">
                <svg viewBox="0 0 24 24" class="w-12 h-12" :class="selectedRelic.unlocked ? 'relic-icon' : 'relic-icon locked'" fill="none" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M9 3h6M10 3v6.5l-4.5 9.5a1 1 0 001 1.5h11a1 1 0 001-1.5L14 9.5V3" />
                  <path d="M7 16h10" />
                </svg>
              </template>
              <template v-else-if="selectedRelic.icon === 'astra'">
                <svg viewBox="0 0 24 24" class="w-12 h-12" :class="selectedRelic.unlocked ? 'relic-icon' : 'relic-icon locked'" fill="none" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M12 4l1 3.5 3.5 1-3.5 1-1 3.5-1-3.5-3.5-1 3.5-1 1-3.5z" />
                  <path d="M18 13l0.7 2.3 2.3 0.7-2.3 0.7-0.7 2.3-0.7-2.3-2.3-0.7 2.3-0.7 0.7-2.3z" />
                  <path d="M6 14l0.5 1.5 1.5 0.5-1.5 0.5-0.5 1.5-0.5-1.5-1.5-0.5 1.5-0.5 0.5-1.5z" />
                </svg>
              </template>
              <template v-else-if="selectedRelic.icon === 'thesis'">
                <svg viewBox="0 0 24 24" class="w-12 h-12" :class="selectedRelic.unlocked ? 'relic-icon' : 'relic-icon locked'" fill="none" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M17.5 4.5l2 2L8.5 17.5l-2.5 1 1-2.5L17.5 4.5z" />
                  <path d="M15 7l2 2" />
                  <path d="M12.5 11.5L9 15" />
                  <circle cx="11" cy="11" r="0.5" fill="currentColor" />
                </svg>
              </template>
            </div>
          </div>

          <!-- Titles -->
          <h4 class="text-xl font-serif font-bold text-on-surface">{{ selectedRelic.name }}</h4>
          <p class="text-xs font-sans italic text-secondary mt-1">{{ selectedRelic.subtitle }}</p>
          
          <!-- Detailed Description -->
          <p class="text-sm font-sans text-on-surface-variant mt-4 leading-relaxed max-w-sm">
            {{ selectedRelic.description }}
          </p>

          <!-- Lock status banner -->
          <div v-if="!selectedRelic.unlocked" class="mt-6 px-4 py-2.5 bg-surface-container-high/60 rounded-xl border border-outline-variant/15 flex items-center gap-2 max-w-sm">
            <i class="pi pi-lock text-secondary text-xs shrink-0"></i>
            <span class="text-xs font-sans font-bold text-secondary text-left leading-tight">Requisito: {{ selectedRelic.requirementText }}</span>
          </div>
          <div v-else class="mt-6 px-4 py-2.5 bg-[#735c00]/5 rounded-xl border border-[#735c00]/20 flex items-center gap-2 text-[#735c00] font-bold">
            <i class="pi pi-verified text-xs"></i>
            <span class="text-xs font-sans">Relíquia Ativada no Seu Códice!</span>
          </div>

          <!-- Progress bar -->
          <div class="w-full mt-8 border-t border-outline-variant/10 pt-6">
            <div class="flex justify-between text-xs font-sans font-bold text-secondary mb-2">
              <span>Progresso Realizado</span>
              <span>{{ formatValue(selectedRelic.current) }} / {{ formatValue(selectedRelic.target) }}</span>
            </div>
            <div class="h-2.5 w-full bg-surface-container-high rounded-full overflow-hidden">
              <div 
                class="h-full bg-primary transition-all duration-700 rounded-full" 
                :style="{ width: Math.min(100, (selectedRelic.current / selectedRelic.target) * 100) + '%' }"
              ></div>
            </div>
            <p class="text-[10px] font-sans text-on-surface-muted mt-2 text-left">
              Faltam {{ formatValue(Math.max(0, selectedRelic.target - selectedRelic.current)) }} para atingir a meta total desta relíquia.
            </p>
          </div>
        </div>
      </template>
      <template #footer>
        <div class="flex justify-end">
          <VButton variant="primary" @click="showRelicModal = false">
            Compreendido
          </VButton>
        </div>
      </template>
    </VModal>

    <!-- MODAL 2: View All Relics List -->
    <VModal :visible="showAllRelicsModal" @update:visible="showAllRelicsModal = false" header="Vault of Wisdom — Lista de Relíquias">
      <template #default>
        <div class="space-y-4 max-h-[60vh] overflow-y-auto pr-1">
          <p class="text-xs font-sans text-secondary leading-relaxed mb-4">
            O relicário guarda registros eternos de sua busca pela sabedoria. Conclua seus estudos diários para ativar todas as relíquias de seu códice.
          </p>
          <div 
            v-for="relic in relics" 
            :key="'list-' + relic.id"
            class="flex items-center gap-4 p-4 rounded-xl border transition-colors cursor-pointer"
            :class="relic.unlocked ? 'bg-primary/5 border-primary/20 hover:bg-primary/10' : 'bg-surface-container-low border-outline-variant/20 hover:bg-surface-container-high'"
            @click="showAllRelicsModal = false; openRelicDetails(relic)"
          >
            <div class="w-12 h-12 rounded-full border border-outline-variant/30 flex items-center justify-center bg-surface-container-lowest shrink-0">
              <template v-if="relic.icon === 'architect'">
                <svg viewBox="0 0 24 24" class="w-6 h-6" :class="relic.unlocked ? 'text-[#735c00]' : 'text-outline'" fill="none" stroke="currentColor" stroke-width="1.2">
                  <circle cx="12" cy="5" r="1.5" />
                  <path d="M12 6.5L7.5 19.5M12 6.5l4.5 13M9 15h6" />
                </svg>
              </template>
              <template v-else-if="relic.icon === 'philosopher'">
                <svg viewBox="0 0 24 24" class="w-6 h-6" :class="relic.unlocked ? 'text-[#735c00]' : 'text-outline'" fill="none" stroke="currentColor" stroke-width="1.2">
                  <path d="M9 3h6M10 3v6.5l-4.5 9.5a1 1 0 001 1.5h11a1 1 0 001-1.5L14 9.5" />
                </svg>
              </template>
              <template v-else-if="relic.icon === 'astra'">
                <svg viewBox="0 0 24 24" class="w-6 h-6" :class="relic.unlocked ? 'text-[#735c00]' : 'text-outline'" fill="none" stroke="currentColor" stroke-width="1.2">
                  <path d="M12 4l1 3.5 3.5 1-3.5 1-1 3.5z" />
                </svg>
              </template>
              <template v-else-if="relic.icon === 'thesis'">
                <svg viewBox="0 0 24 24" class="w-6 h-6" :class="relic.unlocked ? 'text-[#735c00]' : 'text-outline'" fill="none" stroke="currentColor" stroke-width="1.2">
                  <path d="M17.5 4.5l2 2L8.5 17.5l-2.5 1" />
                </svg>
              </template>
            </div>
            <div class="flex-1 min-w-0">
              <h5 class="font-serif font-bold text-sm text-on-surface flex items-center gap-1.5">
                {{ relic.name }}
                <i v-if="relic.unlocked" class="pi pi-verified text-primary text-xs"></i>
              </h5>
              <p class="text-xs text-secondary truncate">{{ relic.subtitle }}</p>
            </div>
            <div class="shrink-0 text-right">
              <span class="text-xs font-bold font-sans" :class="relic.unlocked ? 'text-primary' : 'text-secondary'">
                {{ Math.min(100, Math.round((relic.current / relic.target) * 100)) }}%
              </span>
            </div>
          </div>
        </div>
      </template>
      <template #footer>
        <div class="flex justify-end">
          <VButton variant="primary" @click="showAllRelicsModal = false">
            Voltar ao Relicário
          </VButton>
        </div>
      </template>
    </VModal>
  </div>
</template>

<style scoped>
/* Remove a scrollbar do body/html globalmente nesta tela */
:global(html), :global(body) {
  scrollbar-width: none !important;
  -ms-overflow-style: none !important;
  overflow-x: hidden !important;
}

:global(html::-webkit-scrollbar), :global(body::-webkit-scrollbar) {
  display: none !important;
}

/* Remove o padding-right de compensação do PrimeVue para impedir pulos de layout e flickering */
:global(body.p-overflow-hidden) {
  padding-right: 0 !important;
}

/* Remove as scrollbars de diálogos e modais do PrimeVue */
:global(.p-dialog-mask), :global(.p-dialog), :global(.p-dialog-content) {
  scrollbar-width: none !important;
  -ms-overflow-style: none !important;
}

:global(.p-dialog-content::-webkit-scrollbar) {
  display: none !important;
}

.profile-view {
  position: relative;
  overflow: hidden;
}

.profile-bg-decor {
  position: absolute;
  top: -6rem;
  right: -6rem;
  width: 20rem;
  height: 20rem;
  background: radial-gradient(circle at center, rgba(212, 175, 55, 0.07) 0%, transparent 70%);
  border-radius: 50%;
  pointer-events: none;
  z-index: 0;
}

.view-header {
  position: relative;
  z-index: 1;
}

.profile-avatar {
  width: 80px;
  height: 80px;
  border: 3px solid var(--color-surface-container-lowest);
  object-fit: cover;
}

.relative.shrink-0.group {
  width: 80px;
  height: 80px;
}

.relative.shrink-0 {
  width: 80px;
  height: 80px;
}

/* ─── KPI Cards ───────────────────────────────────────────────────────────── */
.kpi-mini-card {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1.5rem;
  background: var(--color-surface-container-lowest);
  border: 1px solid var(--color-outline-variant);
  border-radius: 1rem;
  transition: all 0.2s cubic-bezier(0.22, 1, 0.36, 1);
}
.kpi-mini-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0,0,0,0.04);
}
.kpi-mini-icon {
  width: 36px;
  height: 36px;
  border-radius: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1rem;
  flex-shrink: 0;
}
.kpi-mini-icon--blue { background: rgba(59, 130, 246, 0.08); color: #3b82f6; }
.kpi-mini-icon--purple { background: rgba(168, 85, 247, 0.08); color: #a855f7; }
.kpi-mini-icon--red { background: rgba(239, 68, 68, 0.08); color: #ef4444; }
.kpi-mini-icon--green { background: rgba(34, 197, 94, 0.08); color: #22c55e; }
.kpi-mini-value {
  font-size: 1.25rem;
  font-weight: 800;
  color: var(--color-on-surface);
  line-height: 1.1;
  font-family: var(--font-headline, inherit);
}
.kpi-mini-label {
  font-size: 0.65rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--color-on-surface-muted);
  margin-top: 0.1rem;
}

/* ─── Vault of Wisdom Card ────────────────────────────────────────────────── */
.vault-card {
  background: color-mix(in srgb, var(--color-primary) 3%, var(--color-surface-container-lowest));
  border: 1px solid rgba(212, 175, 55, 0.15);
  border-radius: 1.25rem;
  box-shadow: 0 10px 30px -10px rgba(115, 92, 0, 0.04);
}

.relic-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  cursor: pointer;
  transition: transform 0.3s cubic-bezier(0.22, 1, 0.36, 1);
}

.relic-item:hover {
  transform: translateY(-4px);
}

.relic-circle-outer {
  position: relative;
  width: 110px;
  height: 110px;
  border-radius: 50%;
  border: 1px solid rgba(212, 175, 55, 0.15);
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  transition: all 0.4s cubic-bezier(0.22, 1, 0.36, 1);
}

@media (min-width: 768px) {
  .relic-circle-outer {
    width: 128px;
    height: 128px;
  }
}

.relic-circle-inner {
  width: 98px;
  height: 98px;
  border-radius: 50%;
  border: 1.5px solid rgba(212, 175, 55, 0.25);
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--color-surface-container-lowest);
  box-shadow: inset 0 2px 8px rgba(212, 175, 55, 0.02);
  transition: all 0.4s cubic-bezier(0.22, 1, 0.36, 1);
}

@media (min-width: 768px) {
  .relic-circle-inner {
    width: 114px;
    height: 114px;
  }
}

/* Unlocked states styling */
.relic-circle-outer.unlocked {
  border-color: rgba(212, 175, 55, 0.32);
  box-shadow: 0 0 15px rgba(212, 175, 55, 0.06);
}

.relic-circle-outer.unlocked:hover {
  border-color: rgba(212, 175, 55, 0.55);
  box-shadow: 0 0 25px rgba(212, 175, 55, 0.16);
}

.relic-circle-inner.unlocked {
  border-color: rgba(212, 175, 55, 0.45);
  background: radial-gradient(circle, rgba(253, 249, 246, 1) 0%, rgba(212, 175, 55, 0.05) 100%);
}

.relic-circle-inner.unlocked:hover {
  border-color: rgba(212, 175, 55, 0.65);
}

/* Locked states styling */
.relic-circle-outer.locked {
  filter: grayscale(100%);
  opacity: 0.45;
  border-color: var(--color-outline-variant);
}

.relic-circle-inner.locked {
  border-color: var(--color-outline-variant);
  background: var(--color-surface-container-low);
}

/* Icon colors */
.relic-icon {
  color: #735c00;
  transition: transform 0.3s cubic-bezier(0.22, 1, 0.36, 1);
}

.relic-item:hover .relic-icon {
  transform: scale(1.08);
}

.relic-icon.locked {
  color: var(--color-outline);
}
</style>

