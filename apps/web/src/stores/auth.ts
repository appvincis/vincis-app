import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'

export const useAuthStore = defineStore('auth', () => {
  const router = useRouter()
  const user = ref({
    name: 'Usuário Vincis',
    email: 'usuario@vincis.com',
    avatar: 'https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y'
  })
  
  const isAuthenticated = ref(true) // Simulating auth for now

  function logout() {
    isAuthenticated.value = false
    user.value = null
    // Here we would also clear tokens etc.
    router.push('/auth')
  }

  return {
    user,
    isAuthenticated,
    logout
  }
})
