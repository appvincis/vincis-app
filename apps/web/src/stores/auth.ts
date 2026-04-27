import { defineStore } from 'pinia'
import { ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { api } from '../lib/axios'
import { useStudyPlanStore } from './study-plan'

const DEFAULT_USER = {
  name: 'Usuário Vincis',
  email: 'usuario@vincis.com',
  avatar: 'https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y'
}

const STORAGE_KEY = 'vincis_auth_state'

export const useAuthStore = defineStore('auth', () => {
  const router = useRouter()
  
  // Load initial state from localStorage
  const savedState = JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null')
  
  const user = ref<any>(savedState?.user || { ...DEFAULT_USER })
  const isAuthenticated = ref(savedState?.isAuthenticated || false)

  // Watch for changes and save to localStorage
  watch([user, isAuthenticated], () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      user: user.value,
      isAuthenticated: isAuthenticated.value
    }))
  }, { deep: true })

  function login(userData: any) {
    isAuthenticated.value = true
    user.value = {
      ...DEFAULT_USER,
      ...(userData || {})
    }
  }

  async function logout() {
    try {
      // Chama a API para limpar os cookies HttpOnly no servidor
      await api.post('/auth/logout')
    } catch (err) {
      // Mesmo se a chamada falhar (ex: token já expirado), continua limpando o estado local
      console.warn('Falha ao chamar /auth/logout na API:', err)
    }

    // Limpa o estado local
    isAuthenticated.value = false
    user.value = { ...DEFAULT_USER }
    localStorage.removeItem(STORAGE_KEY)

    // Limpa dados do plano de estudo
    const studyPlanStore = useStudyPlanStore()
    studyPlanStore.clearPlan()

    router.push('/auth')
  }

  return {
    user,
    isAuthenticated,
    login,
    logout
  }
})
