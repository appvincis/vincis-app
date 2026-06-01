<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { api } from '../lib/axios'
import { VButton, VInput, VAlert } from '../components/ui'

const router = useRouter()
const authStore = useAuthStore()
const isLoginMode = ref(true)
const email = ref('')
const password = ref('')
const message = ref('')
const isError = ref(false)
const isLoading = ref(false)
const isPasswordVisible = ref(false)

const togglePasswordVisibility = () => {
  isPasswordVisible.value = !isPasswordVisible.value
}

const toggleMode = () => {
  isLoginMode.value = !isLoginMode.value
  message.value = ''
  isError.value = false
}

const handleGoogleLogin = () => {
  message.value = 'A autenticação com o Google estará disponível em breve.'
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
  <div class="auth-page">
    
    <!-- Left Side: Editorial Visual Anchor (Visible only on Desktop) -->
    <aside class="auth-aside">
      <!-- Background Image with Editorial Soft Overlay -->
      <div class="aside-bg">
        <img 
          class="aside-image" 
          alt="Brutalist concrete architecture" 
          src="https://lh3.googleusercontent.com/aida-public/AB6AXuB5a9jk6pjNqlh-3ru2IU7VB4IR_7rgxReK_7D5BYoug8oPBW6dpYxvDjkAFkrPYUtlPNeMC_D0fRFJ92nw7O4zXZTdreSDUeWUs58FMnqvgbQsEmJXJjTcgkfnFLukTeCHa_YcA_hpzBCeQfs2-llyuppmC2DFEUx6zyUdaqpRkvzUOww_7p8RqVCi8K53izqM-QejDETvFc94Xav1bvJIa4quFWv1BfXZfG23ud5Enfb6tp1HUxNDSmSPy7wLtw1huml8SflYyzT9"
        />
        <div class="aside-overlay"></div>
      </div>
      
      <!-- Content Overlay -->
      <div class="aside-content animate-fade-in">
        <div class="aside-logo-group">
          <h1 class="serif-headline logo-text italic">
            VINCIS<span style="color: #d4af37">.</span>
          </h1>
        </div>
        
        <div class="aside-middle">
          <h2 class="serif-headline aside-title">
            Redefining the architecture of academic intelligence.
          </h2>
          <div class="aside-divider"></div>
          <p class="aside-description">
            Access your personalized AI-driven study environment. Designed for the modern scholar who values precision and depth.
          </p>
        </div>
        
        <div class="aside-footer">
          <span class="aside-footer-tag">Academic Portal</span>
          <span class="aside-footer-copy">© 2026 Vincis Research Group</span>
        </div>
      </div>
    </aside>

    <!-- Right Side: Login Form Canvas -->
    <main class="auth-main">
      <div class="form-container animate-fade-in-up">
        
        <!-- Mobile Header (Only visible on mobile screens) -->
        <div class="mobile-header">
          <h1 class="serif-headline mobile-logo-text italic">
            VINCIS<span style="color: #d4af37">.</span>
          </h1>
        </div>

        <!-- Login Header -->
        <header class="form-header">
          <h3 class="serif-headline form-title">
            {{ isLoginMode ? 'Entrar' : 'Cadastrar' }}
          </h3>
          <p class="form-subtitle">
            {{ isLoginMode ? 'Bem-vindo de volta ao seu portal acadêmico.' : 'Crie sua conta para começar sua jornada acadêmica.' }}
          </p>
        </header>

        <!-- Social Login -->
        <button 
          @click="handleGoogleLogin"
          type="button" 
          class="google-btn"
        >
          <svg class="google-icon" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"></path>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"></path>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"></path>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"></path>
          </svg>
          <span class="google-btn-text">Entrar com Google</span>
        </button>

        <!-- Divider -->
        <div class="divider">
          <div class="divider-line"></div>
          <span class="divider-text">ou e-mail</span>
          <div class="divider-line"></div>
        </div>

        <!-- Form -->
        <form @submit.prevent="submitForm" class="login-form">
          <div class="input-group">
            <VInput 
              v-model="email" 
              label="E-mail"
              placeholder="nome@exemplo.edu"
              icon="mail"
              required 
            />
          </div>
          
          <div class="input-group password-group">
          <VInput 
            v-model="password" 
            label="Senha"
            :type="isPasswordVisible ? 'text' : 'password'"
            placeholder="••••••••"
            icon="lock"
            required 
          />
          
          <button 
            type="button" 
            class="toggle-password-btn" 
            @click="togglePasswordVisibility"
            :aria-label="isPasswordVisible ? 'Esconder senha' : 'Mostrar senha'"
          >
            <i :class="['pi', isPasswordVisible ? 'pi-eye-slash' : 'pi-eye']"></i>
          </button>

          <a 
            v-if="isLoginMode"
            class="forgot-password-link" 
            href="#"
          >
            Esqueci a senha
          </a>
        </div>

          <!-- Alert/Message Box -->
          <div v-if="message" class="alert-box animate-fade-in">
            <VAlert 
              :variant="isError ? 'error' : 'success'" 
              :title="isError ? 'Ops!' : 'Aviso'" 
              :message="message" 
            />
          </div>

          <div class="submit-container">
            <VButton 
              type="submit" 
              variant="primary" 
              class="btn-submit"
              :loading="isLoading"
              :disabled="isLoading"
            >
              {{ isLoginMode ? 'Entrar' : 'Cadastrar' }}
            </VButton>
          </div>
        </form>
        
        <!-- Footer Link -->
        <p class="form-footer">
          {{ isLoginMode ? "Ainda não possui acesso?" : "Já possui uma conta?" }} 
          <button 
            @click="toggleMode" 
            type="button"
            class="form-toggle-btn"
          >
            {{ isLoginMode ? 'Cadastrar' : 'Fazer login' }}
          </button>
        </p>
      </div>

    </main>
  </div>
</template>

<style scoped>
/* ─────────────────────────────────────────────────────────────────
   LAYOUT E COLUNAS (SPLIT-SCREEN)
   ───────────────────────────────────────────────────────────────── */
.auth-page {
  display: flex !important;
  height: 100vh !important; /* Força a altura a ser exatamente a da tela */
  width: 100vw !important;
  background-color: var(--background) !important;
  overflow: hidden !important; /* Corta qualquer transbordamento na página externa */
  box-sizing: border-box !important;
}

.auth-aside {
  display: flex !important;
  flex-direction: column !important;
  width: 45% !important;
  height: 100% !important; /* Garante que segue os 100vh do pai */
  position: relative !important;
  background-color: #1c1b1a !important; 
  overflow: hidden !important; /* Impede scroll na parte editorial */
  box-sizing: border-box !important;
}

.auth-main {
  flex: 1 !important;
  display: flex !important;
  flex-direction: column !important;
  justify-content: center !important;
  align-items: center !important;
  background-color: var(--background) !important;
  position: relative !important;
  padding: 2rem !important; /* Reduzi levemente de 3rem para evitar empurrar o conteúdo em telas menores */
  height: 100% !important;
  
  /* MUDANÇA CRUCIAL: Se o formulário for maior que a tela (ex: em telas muito pequenas), 
     o scroll acontece APENAS dentro do lado do formulário, sem quebrar a tela inteira. */
  overflow-y: auto !important; 
  box-sizing: border-box !important;
}

/* Botão de Alternar Senha (PrimeIcons) */
.toggle-password-btn {
  position: absolute !important;
  right: 1rem !important;
  bottom: 1rem !important; /* Alinha verticalmente ao centro do input */
  background: none !important;
  border: none !important;
  padding: 0 !important;
  margin: 0 !important;
  cursor: pointer !important;
  z-index: 10 !important;
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
  color: var(--secondary) !important;
  opacity: 0.6 !important;
  transition: opacity 0.2s, color 0.2s !important;
}

.toggle-password-btn:hover {
  opacity: 1 !important;
  color: var(--primary) !important;
}

/* Tamanho do ícone do PrimeIcon */
.toggle-password-btn .pi {
  font-size: 1.15rem !important;
}

/* Ajuste posicional para o link 'Esqueci a senha' não sobrepor o botão */
.forgot-password-link {
  top: -1.5rem !important; 
}
/* ─────────────────────────────────────────────────────────────────
   ELEMENTOS DA LATERAL ESQUERDA (EDITORIAL)
   ───────────────────────────────────────────────────────────────── */
.aside-bg {
  position: absolute !important;
  inset: 0 !important;
  z-index: 0 !important;
}

.aside-image {
  width: 100% !important;
  height: 100% !important;
  object-fit: cover !important;
  mix-blend-mode: multiply !important;
  opacity: 0.60 !important;
}

.aside-overlay {
  position: absolute !important;
  inset: 0 !important;
  background: linear-gradient(to top, #1c1b1a 0%, transparent 60%, #1c1b1a 100%) !important;
  opacity: 0.90 !important;
  z-index: 1 !important;
}

.aside-content {
  position: relative !important;
  z-index: 10 !important;
  display: flex !important;
  flex-direction: column !important;
  height: 100% !important;
  padding: 4rem !important;
  justify-content: space-between !important;
  color: #ffffff !important;
  box-sizing: border-box !important;
}

.aside-logo-group {
  display: flex !important;
  align-items: center !important;
  gap: 1rem !important;
}

.aside-logo-img {
  width: 3rem !important;
  height: 3rem !important;
  border-radius: var(--border-radius-md) !important;
  background-color: #ffffff !important;
  padding: 0.25rem !important;
  object-fit: contain !important;
}

.logo-text {
  font-size: 2.25rem !important;
  font-weight: 700 !important;
  color: #ffffff !important;
  letter-spacing: -0.02em !important;
}

.aside-middle {
  max-width: 440px !important;
  margin-top: auto !important;
  margin-bottom: auto !important;
}

.aside-title {
  font-size: 2.75rem !important;
  font-weight: 500 !important;
  line-height: 1.15 !important;
  margin-bottom: 2rem !important;
  font-style: italic !important;
  color: #ffffff !important;
}

.aside-divider {
  width: 6rem !important;
  height: 4px !important;
  background-color: var(--primary-container) !important;
  margin-bottom: 2rem !important;
}

.aside-description {
  font-family: var(--ds-font-sans) !important;
  font-size: 1.125rem !important;
  color: rgba(229, 226, 223, 0.8) !important;
  line-height: 1.65 !important;
}

.aside-footer {
  display: flex !important;
  flex-direction: column !important;
  gap: 0.5rem !important;
  opacity: 0.6 !important;
}

.aside-footer-tag {
  font-family: var(--ds-font-sans) !important;
  font-size: 0.6875rem !important;
  font-weight: 700 !important;
  text-transform: uppercase !important;
  letter-spacing: 0.22em !important;
  color: #ffffff !important;
}

.aside-footer-copy {
  font-family: var(--ds-font-sans) !important;
  font-size: 0.875rem !important;
  color: #ffffff !important;
}

/* ─────────────────────────────────────────────────────────────────
   ELEMENTOS DA LATERAL DIREITA (FORMULÁRIO E ASSINATURA)
   ───────────────────────────────────────────────────────────────── */
.form-container {
  width: 100% !important;
  max-width: 420px !important;
  display: flex !important;
  flex-direction: column !important;
  gap: 2.5rem !important;
  box-sizing: border-box !important;
}

.form-header {
  display: flex !important;
  flex-direction: column !important;
  gap: 0.5rem !important;
}

.form-title {
  font-size: 2.25rem !important;
  font-weight: 600 !important;
  color: var(--on-surface) !important;
  letter-spacing: -0.01em !important;
}

.form-subtitle {
  font-family: var(--ds-font-sans) !important;
  color: var(--secondary) !important;
  font-size: 0.875rem !important;
  line-height: 1.5 !important;
}

/* Botão do Google */
.google-btn {
  width: 100% !important;
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
  gap: 0.75rem !important;
  padding: 1rem !important;
  background-color: var(--surface-container-low) !important;
  border: 1px solid rgba(208, 197, 175, 0.3) !important;
  border-radius: var(--border-radius-lg) !important;
  cursor: pointer !important;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1) !important;
  box-sizing: border-box !important;
}

.google-btn:hover {
  background-color: var(--surface-container) !important;
}

.google-btn:active {
  transform: scale(0.98) !important;
}

.google-icon {
  width: 1.25rem !important;
  height: 1.25rem !important;
  flex-shrink: 0 !important;
}

.google-btn-text {
  font-family: var(--ds-font-sans) !important;
  font-size: 0.875rem !important;
  font-weight: 600 !important;
  color: var(--on-surface) !important;
}

/* Divisor */
.divider {
  display: flex !important;
  align-items: center !important;
  gap: 1rem !important;
  width: 100% !important;
}

.divider-line {
  flex: 1 !important;
  height: 1px !important;
  background-color: rgba(208, 197, 175, 0.3) !important;
}

.divider-text {
  font-size: 0.625rem !important;
  font-family: var(--ds-font-sans) !important;
  color: var(--secondary) !important;
  letter-spacing: 0.2em !important;
  text-transform: uppercase !important;
}

/* Formulário e Inputs */
.login-form {
  display: flex !important;
  flex-direction: column !important;
  gap: 1.5rem !important;
  width: 100% !important;
}

.input-group {
  display: flex !important;
  flex-direction: column !important;
  width: 100% !important;
}

.password-group {
  position: relative !important;
}

.forgot-password-link {
  position: absolute !important;
  top: 0 !important;
  right: 0 !important;
  font-family: var(--ds-font-sans) !important;
  font-size: 0.625rem !important;
  font-weight: 700 !important;
  color: var(--primary) !important;
  text-transform: uppercase !important;
  letter-spacing: 0.05em !important;
  text-decoration: none !important;
  z-index: 10 !important;
  transition: opacity 0.2s !important;
}

.forgot-password-link:hover {
  text-decoration: underline !important;
  opacity: 0.8 !important;
}

.alert-box {
  width: 100% !important;
}

.submit-container {
  margin-top: 0.5rem !important;
  width: 100% !important;
}

.form-footer {
  font-family: var(--ds-font-sans) !important;
  font-size: 0.875rem !important;
  color: var(--secondary) !important;
  text-align: center !important;
  line-height: 1.5 !important;
}

.form-toggle-btn {
  background: none !important;
  border: none !important;
  padding: 0 !important;
  margin-left: 0.25rem !important;
  color: var(--on-surface) !important;
  font-weight: 700 !important;
  cursor: pointer !important;
  text-decoration: underline !important;
  text-decoration-color: rgba(115, 92, 0, 0.3) !important;
  text-underline-offset: 4px !important;
  transition: color 0.2s !important;
}

.form-toggle-btn:hover {
  color: var(--primary) !important;
}


/* ─────────────────────────────────────────────────────────────────
   RESPONSIVIDADE INDESTRUTÍVEL (SCOPED CSS)
   ───────────────────────────────────────────────────────────────── */
@media (max-width: 1024px) {
  .auth-aside {
    display: none !important;
  }
  
  .auth-main {
    width: 100% !important;
    padding: 1.5rem !important;
  }
  
  .mobile-header {
    display: flex !important;
    flex-direction: column !important;
    align-items: center !important;
    margin-bottom: 2rem !important;
  }
  
  .mobile-logo-img {
    width: 4rem !important;
    height: 4rem !important;
    object-fit: contain !important;
    margin-bottom: 0.75rem !important;
  }
  
  .mobile-logo-text {
    font-size: 2rem !important;
    font-weight: 700 !important;
    color: var(--on-surface) !important;
  }

}

@media (min-width: 1025px) {
  .mobile-header {
    display: none !important;
  }
}

/* ─────────────────────────────────────────────────────────────────
   SOBREPOSIÇÃO CIRÚRGICA DE COMPONENTES PRIME VUE (PRIME VUE)
   ───────────────────────────────────────────────────────────────── */
.serif-headline {
  font-family: var(--ds-font-serif) !important;
}

/* Campos de Input */
:deep(.p-inputtext) {
  width: 100% !important;
  padding-top: 1rem !important;
  padding-bottom: 1rem !important;
  padding-left: 2.75rem !important; /* Espaço para o ícone */
  padding-right: 1rem !important;
  border-radius: var(--border-radius-lg) !important;
  font-size: 0.875rem !important;
  font-family: var(--ds-font-sans) !important;
  color: var(--on-surface) !important;
  background-color: var(--surface-container-lowest) !important;
  border: 1px solid rgba(208, 197, 175, 0.4) !important; /* outline-variant com baixa opacidade */
  transition: all 0.3s ease !important;
  box-sizing: border-box !important;
}

:deep(.p-inputtext:focus) {
  border-color: var(--primary) !important;
  box-shadow: 0 0 0 2px rgba(115, 92, 0, 0.15) !important;
  outline: none !important;
}

:deep(.p-inputtext::placeholder) {
  color: var(--secondary) !important;
  opacity: 0.5 !important;
}

/* Ícone interno do input */
:deep(.ds-input-icon) {
  left: 1rem !important;
  color: var(--outline) !important;
  font-size: 1.25rem !important;
  z-index: 5 !important;
}

/* Botão Submit */
:deep(.p-button) {
  width: 100% !important;
  background-color: var(--on-surface) !important;
  border-color: var(--on-surface) !important;
  font-family: var(--ds-font-serif) !important;
  font-style: italic !important;
  font-weight: 700 !important;
  font-size: 1.125rem !important; /* text-lg */
  border-radius: var(--border-radius-lg) !important;
  padding-top: 1rem !important;
  padding-bottom: 1rem !important;
  color: var(--surface-container-lowest) !important;
  box-shadow: 0 4px 20px rgba(28, 27, 26, 0.15) !important;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
  cursor: pointer !important;
  display: flex !important;
  justify-content: center !important;
  align-items: center !important;
}

:deep(.p-button:hover) {
  background-color: var(--primary) !important;
  border-color: var(--primary) !important;
  transform: translateY(-1px) !important;
  box-shadow: 0 6px 24px rgba(115, 92, 0, 0.25) !important;
}

:deep(.p-button:active) {
  transform: translateY(0) !important;
}

:deep(.p-button-label) {
  font-family: var(--ds-font-serif) !important;
  font-style: italic !important;
  font-weight: 700 !important;
  font-size: 1.125rem !important;
}

/* Animações */
.animate-fade-in-up {
  animation: fadeInUp 0.8s cubic-bezier(0.22, 1, 0.36, 1) both;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
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
</style>
