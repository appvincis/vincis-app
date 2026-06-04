<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { api } from '../lib/axios'
import { supabase } from '../lib/supabase'

const router = useRouter()
const authStore = useAuthStore()
const message = ref('Autenticando com o Google...')
const isError = ref(false)

onMounted(async () => {
  try {
    // O Supabase JS client detecta automaticamente o ?code= na URL e faz a troca PKCE
    const { data, error } = await supabase.auth.getSession()

    if (error || !data.session) {
      throw new Error(error?.message || 'Sessão não encontrada.')
    }

    const { access_token, refresh_token, expires_in } = data.session

    // Envia os tokens ao backend para que ele defina os cookies HttpOnly seguros
    const res = await api.post('/auth/google/callback', {
      access_token,
      refresh_token,
      expires_in,
    })

    if (res.data?.user) {
      authStore.login(res.data.user)
      message.value = 'Autenticado com sucesso! Redirecionando...'
      setTimeout(() => {
        router.push('/private')
      }, 800)
    } else {
      throw new Error('Usuário não retornado pela API.')
    }
  } catch (err: any) {
    console.error('Erro ao processar callback de login:', err)
    isError.value = true
    message.value = err.response?.data?.message || err.message || 'Falha na autenticação com o Google. Redirecionando...'
    setTimeout(() => {
      router.push('/auth?error=google_auth_failed')
    }, 2500)
  }
})
</script>

<template>
  <div class="callback-container">
    <div class="card shadow-lg">
      <div v-if="!isError" class="spinner-container">
        <div class="spinner"></div>
      </div>
      <div v-else class="error-icon">
        <i class="pi pi-exclamation-circle"></i>
      </div>
      <p class="message" :class="{ 'error-text': isError }">{{ message }}</p>
    </div>
  </div>
</template>

<style scoped>
.callback-container {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  background: var(--color-surface-container-lowest, #0e1118);
  font-family: var(--font-sans, sans-serif);
  padding: 1.5rem;
}

.card {
  background: var(--color-surface-container-low, #151a24);
  border: 1px solid var(--color-outline-variant, rgba(255, 255, 255, 0.1));
  border-radius: 1.5rem;
  padding: 3rem;
  text-align: center;
  max-width: 420px;
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.5rem;
}

.spinner-container {
  position: relative;
  width: 50px;
  height: 50px;
}

.spinner {
  width: 50px;
  height: 50px;
  border: 4px solid var(--color-primary-container, rgba(99, 102, 241, 0.2));
  border-top: 4px solid var(--color-primary, #6366f1);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

.error-icon {
  font-size: 3rem;
  color: var(--color-error, #f87171);
}

.message {
  color: var(--color-on-surface, #e2e8f0);
  font-size: 1rem;
  font-weight: 500;
  line-height: 1.5;
}

.error-text {
  color: var(--color-error, #f87171);
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
</style>
