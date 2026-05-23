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
    <header class="view-header">
      <h1 class="text-4xl font-serif font-bold text-on-surface">Seu Perfil</h1>
      <p class="text-secondary mt-2">Gerencie suas informações pessoais e preferências.</p>
    </header>

    <div class="mt-8 max-w-2xl space-y-4">
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

      <VCard class="p-8">
        <!-- Modo Leitura / Visualização -->
        <div v-if="!isEditing" class="space-y-6">
          <div class="flex items-center gap-6 mb-8">
            <Avatar 
              :image="avatar || 'https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y'" 
              size="xlarge" 
              shape="circle" 
              class="profile-avatar shadow-lg"
            />
            <div>
              <h2 class="text-2xl font-serif font-bold text-on-surface">{{ name || 'Estudante' }}</h2>
              <p class="text-secondary">{{ email }}</p>
            </div>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="profile-field">
              <label class="text-xs font-bold uppercase tracking-wider text-secondary">Nome Completo</label>
              <div class="p-3 bg-surface-container-low rounded-lg mt-1 border border-outline-variant/30 text-on-surface">
                {{ name || 'Não informado' }}
              </div>
            </div>
            <div class="profile-field">
              <label class="text-xs font-bold uppercase tracking-wider text-secondary">E-mail</label>
              <div class="p-3 bg-surface-container-low rounded-lg mt-1 border border-outline-variant/30 text-on-surface">
                {{ email }}
              </div>
            </div>
          </div>
          
          <div class="pt-4 border-t border-outline-variant/20 flex justify-end">
            <VButton variant="primary" @click="startEditing">Editar Perfil</VButton>
          </div>
        </div>

        <!-- Modo Edição -->
        <div v-else class="space-y-6">
          <div class="flex flex-col items-center sm:flex-row gap-6 mb-8">
            <div class="relative group cursor-pointer" @click="triggerFileInput">
              <Avatar 
                :image="avatar || 'https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y'" 
                size="xlarge" 
                shape="circle" 
                class="profile-avatar shadow-lg transition duration-200 group-hover:brightness-50"
              />
              <div class="absolute inset-0 flex flex-col items-center justify-center rounded-full bg-black/40 opacity-0 group-hover:opacity-100 transition duration-200 text-white">
                <span class="material-symbols-outlined text-2xl">photo_camera</span>
                <span class="text-[10px] font-bold mt-1 uppercase tracking-wider">Alterar</span>
              </div>
            </div>
            <div>
              <h2 class="text-xl font-serif font-bold text-on-surface">Foto do Perfil</h2>
              <p class="text-xs text-secondary mt-1">Selecione uma foto. Ela será comprimida e otimizada automaticamente.</p>
              <div class="flex gap-2 mt-3">
                <VButton variant="secondary" size="small" class="text-xs" @click="triggerFileInput">
                  Escolher Imagem
                </VButton>
                <VButton 
                  v-if="avatar" 
                  variant="error" 
                  size="small" 
                  class="text-xs" 
                  @click="avatar = ''"
                >
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

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
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

          <div class="pt-4 border-t border-outline-variant/20 flex justify-end gap-3">
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
.view-header {
  margin-bottom: 2rem;
}

.profile-avatar {
  width: 100px;
  height: 100px;
  border: 4px solid var(--surface-container-lowest);
  object-fit: cover;
}

.relative.group {
  width: 100px;
  height: 100px;
}
</style>
