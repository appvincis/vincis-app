<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { api } from '../lib/axios'
import { VButton, VInput, VAlert, VCard } from '../components/ui'

const router = useRouter()
const authStore = useAuthStore()
const isLoginMode = ref(true)
const email = ref('')
const password = ref('')
const message = ref('')
const isError = ref(false)
const isLoading = ref(false)

const toggleMode = () => {
  isLoginMode.value = !isLoginMode.value
  message.value = ''
  isError.value = false
}

const submitForm = async () => {
  isLoading.value = true
  message.value = ''
  isError.value = false

  const endpoint = isLoginMode.value ? '/auth/login' : '/auth/register'

  try {
    const res = await api.post(endpoint, {
      email: email.value,
      password: password.value
    })
    
    isError.value = false
    message.value = res.data.message || 'Sucesso!'

    if (isLoginMode.value) {
      authStore.login(res.data.user)
      setTimeout(() => router.push('/private'), 500)
    }
  } catch (error: any) {
    isError.value = true
    if (error.response?.data?.errors) {
      message.value = error.response.data.errors[0].message
    } else {
      message.value = error.response?.data?.message || 'Erro inesperado. Tente novamente.'
    }
  } finally {
    isLoading.value = false
  }
}
</script>

<template>
  <div class="ds-auth-page min-h-screen flex items-center justify-center p-6">
    <div class="ds-auth-container animate-fade-in-up">
      <VCard class="p-10 shadow-2xl bg-surface-container-lowest border-outline-variant/15 ds-auth-card">
        <div class="text-center mb-10">
          <div class="ds-auth-logo mb-6">V</div>
          <h2 class="text-3xl font-serif font-bold text-on-surface leading-tight">
            {{ isLoginMode ? 'Bem-vindo de volta!' : 'Crie sua conta' }}
          </h2>
          <p class="text-secondary text-sm mt-3 font-body">
            {{ isLoginMode ? 'Acesse sua área exclusiva Vincis.' : 'Comece sua jornada acadêmica hoje.' }}
          </p>
        </div>
        
        <form @submit.prevent="submitForm" class="flex flex-col gap-6">
          <VInput 
            v-model="email" 
            label="E-mail"
            placeholder="seu@email.com"
            icon="mail"
            required 
          />
          
          <VInput 
            v-model="password" 
            label="Senha"
            type="password"
            placeholder="••••••••"
            icon="lock"
            required 
          />

          <!-- Alert/Message Box -->
          <div v-if="message" class="animate-fade-in">
            <VAlert 
              :variant="isError ? 'error' : 'success'" 
              :title="isError ? 'Ops!' : 'Tudo certo'" 
              :message="message" 
            />
          </div>

          <VButton 
            type="submit" 
            variant="primary" 
            class="w-full justify-center py-3.5 mt-2 shadow-lg"
            :loading="isLoading"
            :disabled="isLoading"
          >
            {{ isLoginMode ? 'Entrar' : 'Cadastrar' }}
          </VButton>
        </form>
        
        <div class="mt-8 text-center text-sm font-body text-secondary">
          {{ isLoginMode ? "Ainda não tem conta?" : "Já possui conta?" }}
          <button 
            @click="toggleMode" 
            type="button" 
            class="ds-auth-toggle-btn"
          >
            {{ isLoginMode ? 'Cadastre-se' : 'Fazer Login' }}
          </button>
        </div>
      </VCard>
    </div>
  </div>
</template>

<style scoped>
.ds-auth-page {
  background: radial-gradient(circle at top left, var(--surface-container-low), var(--background));
  width: 100vw;
  overflow-x: hidden;
}

.ds-auth-container {
  width: 100%;
  max-width: 420px;
  margin: 0 auto;
}

.ds-auth-card {
  border-radius: 1.5rem !important;
}

.ds-auth-logo {
  width: 4rem;
  height: 4rem;
  background: var(--primary-container);
  color: var(--on-primary-container);
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 1.25rem;
  font-family: var(--ds-font-serif);
  font-weight: 800;
  font-size: 2rem;
  margin: 0 auto;
  box-shadow: 0 4px 16px rgba(115, 92, 0, 0.18);
}

.ds-auth-toggle-btn {
  background: none;
  border: none;
  padding: 0;
  margin-left: 0.25rem;
  color: var(--primary);
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s ease;
  text-decoration: none;
}

.ds-auth-toggle-btn:hover {
  opacity: 0.7;
  text-decoration: underline;
}

.animate-fade-in-up {
  animation: fadeInUp 0.8s cubic-bezier(0.22, 1, 0.36, 1) both;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-fade-in {
  animation: fadeIn 0.4s ease both;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

/* Fix PrimeVue internal styles */
:deep(.p-button) {
  width: 100%;
  border-radius: 0.75rem;
  font-weight: 700;
  letter-spacing: 0.02em;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 4px 6px -1px rgba(115, 92, 0, 0.1), 0 2px 4px -1px rgba(115, 92, 0, 0.06);
}

:deep(.p-button:hover) {
  transform: translateY(-2px);
  box-shadow: 0 10px 15px -3px rgba(115, 92, 0, 0.2), 0 4px 6px -2px rgba(115, 92, 0, 0.05);
}

:deep(.p-button:active) {
  transform: translateY(0);
}
</style>

