<!-- apps/web/src/views/ProfileView.vue -->
<script setup lang="ts">
import { ref, watch } from 'vue'
import { useAuthStore } from '../stores/auth'
import { VCard, VButton, VInput, VAlert } from '../components/ui'
import Avatar from 'primevue/avatar'
import { useAuthMeQuery, useUpdateProfileMutation } from '../hooks/useStudyPlans'

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

    <div class="mt-6 max-w-4xl space-y-3">
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

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
            <VButton variant="primary" @click="startEditing">
              <i class="pi pi-pencil mr-2 text-sm" />
              Editar Perfil
            </VButton>
          </div>
        </div>

        <!-- Modo Edição -->
        <div v-else class="space-y-5">
          <div class="flex flex-col sm:flex-row items-start gap-5">
            <div class="relative shrink-0 group cursor-pointer self-center sm:self-auto" @click="triggerFileInput">
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
            <div class="flex-1 min-w-0">
              <div class="flex items-start justify-between gap-4">
                <div>
                  <h3 class="text-base font-serif font-bold text-on-surface">Foto do Perfil</h3>
                  <p class="text-xs text-on-surface-variant font-sans mt-0.5 leading-relaxed">
                    Selecione uma foto. Ela será comprimida e otimizada automaticamente.
                  </p>
                </div>
                <div class="flex gap-2 shrink-0">
                  <VButton variant="secondary" size="small" class="text-xs" @click="triggerFileInput">
                    <i class="pi pi-upload mr-1.5 text-xs" />
                    Escolher
                  </VButton>
                  <VButton 
                    v-if="avatar" 
                    variant="error" 
                    size="small" 
                    class="text-xs" 
                    @click="avatar = ''"
                  >
                    <i class="pi pi-trash mr-1.5 text-xs" />
                    Remover
                  </VButton>
                </div>
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

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
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

          <div class="pt-4 border-t border-outline-variant/15 flex justify-end gap-3">
            <VButton 
              variant="secondary" 
              @click="cancelEditing" 
              :disabled="updateProfileMutation.isPending.value"
            >
              Cancelar
            </VButton>
            <VButton 
              variant="primary" 
              @click="saveProfile" 
              :loading="updateProfileMutation.isPending.value"
            >
              {{ updateProfileMutation.isPending.value ? 'Salvando...' : 'Salvar Alterações' }}
            </VButton>
          </div>
        </div>
      </VCard>
    </div>
  </div>
</template>

<style scoped>
.profile-view {
  position: relative;
  overflow-x: hidden;
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
</style>
