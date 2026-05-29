<script setup lang="ts">
import { ref, computed, onMounted, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { usePlan } from '../hooks/usePlan'
import { useAuthStore } from '../stores/auth'

const router = useRouter()
const { plan } = usePlan()
const authStore = useAuthStore()

interface Message {
  id: string
  role: 'user' | 'assistant' | 'system'
  text: string
}

const input = ref('')
const isLoading = ref(false)
const scrollContainerRef = ref<HTMLDivElement | null>(null)

const subject = ref('Geral')
const topic = ref('Estratégia de Estudos')

const messages = ref<Message[]>([
  {
    id: 'welcome',
    role: 'assistant',
    text: `Olá! Sou o seu Tutor IA focado em Concursos. Estou aqui para tirar suas dúvidas sobre editais e matérias. Sobre o que vamos falar hoje?`
  }
])

const apiKey = import.meta.env.VITE_OPENAI_API_KEY || ''
const model = 'gpt-4o-mini'

const scrollToBottom = async () => {
  await nextTick()
  if (scrollContainerRef.value) {
    scrollContainerRef.value.scrollTo({
      top: scrollContainerRef.value.scrollHeight,
      behavior: 'smooth'
    })
  }
}

const handleSend = async () => {
  if (!input.value.trim() || isLoading.value) return

  const userText = input.value
  const userMsg: Message = { id: Date.now().toString(), role: 'user', text: userText }
  
  messages.value.push(userMsg)
  input.value = ''
  isLoading.value = true
  await scrollToBottom()

  try {
    if (!apiKey) {
      // Fallback simulado caso não haja chave de API real configurada
      setTimeout(() => {
        messages.value.push({
          id: Date.now().toString(),
          role: 'assistant',
          text: `(Modo de Simulação) Aqui está uma resposta simulada para a sua dúvida sobre "${userText}".\nPara usar o modelo real da OpenAI, adicione a variável VITE_OPENAI_API_KEY no seu ambiente.`
        })
        isLoading.value = false
        scrollToBottom()
      }, 1500)
      return
    }

    const systemInstruction = `
        ATUAÇÃO: Você é um Mentor de Elite para Concursos Públicos.
        CONTEXTO: O aluno está em uma sessão de estudo focado (tempo cronometrado) e lendo editais. Ele precisa de respostas precisas e rápidas.
        
        REGRAS RÍGIDAS DE RESPOSTA:
        1. SEJA CIRÚRGICO: Vá direto à resposta.
        2. FOCO NA PROVA: Explique o conceito focando em como as bancas cobram.
        3. PEGADINHAS: Se houver uma "pegadinha" clássica, alerte com ⚠️.
        4. LEI SECA: Se for jurídico, cite o Artigo/Lei.
        5. FORMATAÇÃO: Use Bullet Points e NEGRITO nas palavras-chave.
    `

    const apiMessages = [
      { role: 'system', content: systemInstruction },
      ...messages.value.map((m) => ({
        role: m.role === 'assistant' || m.role === 'user' ? m.role : 'system',
        content: m.text
      })),
      { role: 'user', content: userText }
    ]

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey.trim()}`
      },
      body: JSON.stringify({
        model: model,
        messages: apiMessages,
        temperature: 0.5,
        max_tokens: 300
      })
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error?.message || 'Erro na API da OpenAI')
    }

    const data = await response.json()
    const text = data.choices[0].message.content || 'Não consegui formular uma resposta.'

    messages.value.push({ id: (Date.now() + 1).toString(), role: 'assistant', text })
  } catch (error: any) {
    console.error('Erro no Tutor IA:', error)
    messages.value.push({
      id: Date.now().toString(),
      role: 'assistant',
      text: `Erro: ${error.message}.`
    })
  } finally {
    isLoading.value = false
    await scrollToBottom()
  }
}

const handleKeyDown = (e: KeyboardEvent) => {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault()
    handleSend()
  }
}

onMounted(() => {
  scrollToBottom()
})
</script>

<template>
  <div class="h-full flex flex-col relative w-full overflow-hidden">
    <!-- Header -->
    <header class="view-header flex-shrink-0 flex flex-col gap-2 p-6 md:px-8 md:py-6 border-b border-outline-variant/30 bg-surface-container-low dark:bg-surface-dark-elevated">
      <div class="space-y-1 text-left">
        <p class="font-label text-xs uppercase tracking-[0.2em] text-primary font-bold">Inteligência Artificial</p>
        <h2 class="text-4xl md:text-5xl font-headline font-bold text-on-surface tracking-tight">
          Insights de IA
        </h2>
        <p class="text-on-surface-muted max-w-xl text-sm leading-relaxed mt-1">
          Tire dúvidas rápidas sobre editais, bancas e matérias com o Tutor IA (Modo Flash).
        </p>
      </div>
    </header>

    <!-- Main Content Area with Paywall Blur & Shift -->
    <div class="flex-1 relative overflow-hidden bg-background dark:bg-surface-dark">
      
      <!-- Se não for premium, aplica blur, deslocamento (shift) e impede eventos de mouse -->
      <div 
        class="h-full flex flex-col transition-all duration-500 ease-out"
        :class="{ 'blur-md translate-y-4 scale-[0.98] pointer-events-none select-none opacity-40 origin-bottom': !plan.isPremium }"
      >
        <!-- Área de Mensagens -->
        <div ref="scrollContainerRef" class="flex-1 overflow-y-auto p-4 md:p-8 flex flex-col gap-6 custom-scrollbar">
          <div 
            v-for="msg in messages" 
            :key="msg.id" 
            class="flex"
            :class="msg.role === 'user' ? 'justify-end' : 'justify-start'"
          >
            <div 
              class="max-w-[85%] md:max-w-[70%] rounded-2xl p-4 text-[15px] font-sans shadow-sm"
              :class="
                msg.role === 'user' 
                  ? 'bg-primary text-on-primary rounded-br-none' 
                  : 'bg-surface-container-lowest dark:bg-[#1e1e2d] text-on-surface border border-outline-variant/30 rounded-bl-none'
              "
            >
              <div v-html="msg.text.replace(/\n/g, '<br/>')"></div>
            </div>
          </div>
          
          <!-- Loading Indicator -->
          <div v-if="isLoading" class="flex justify-start">
            <div class="bg-surface-container-lowest dark:bg-[#1e1e2d] border border-outline-variant/30 rounded-2xl rounded-bl-none p-4 flex items-center gap-2">
              <span class="w-2 h-2 bg-primary/50 rounded-full animate-bounce"></span>
              <span class="w-2 h-2 bg-primary/50 rounded-full animate-bounce" style="animation-delay: 0.2s"></span>
              <span class="w-2 h-2 bg-primary/50 rounded-full animate-bounce" style="animation-delay: 0.4s"></span>
            </div>
          </div>
        </div>

        <!-- Input Area -->
        <div class="p-4 md:p-6 bg-surface-container-low dark:bg-[#15152a] border-t border-outline-variant/30">
          <div class="max-w-4xl mx-auto flex gap-3 items-end bg-background dark:bg-surface-dark-elevated p-2 rounded-2xl border border-outline-variant/50 focus-within:ring-2 focus-within:ring-primary/30 transition-all shadow-inner">
            <textarea 
              v-model="input"
              @keydown="handleKeyDown"
              placeholder="Digite sua dúvida sobre o edital ou matéria (Ex: 'Como a FGV cobra crase?')"
              class="flex-1 bg-transparent border-none focus:ring-0 text-[15px] text-on-surface resize-none max-h-32 min-h-[44px] py-3 px-4 font-sans outline-none"
              rows="1"
            ></textarea>
            <button 
              @click="handleSend"
              :disabled="isLoading || !input.trim()"
              class="p-3 rounded-xl transition-all flex items-center justify-center shrink-0 mb-1 mr-1"
              :class="
                input.trim() && !isLoading
                  ? 'bg-primary text-on-primary shadow-md hover:bg-primary/90 hover:scale-[1.02] active:scale-95 cursor-pointer' 
                  : 'bg-surface-container-high text-on-surface-muted cursor-not-allowed opacity-70'
              "
            >
              <i class="pi pi-send text-[18px]"></i>
            </button>
          </div>
          <p class="text-[11px] text-center text-on-surface-muted mt-3 font-sans ">
            A IA pode cometer erros. Sempre verifique as informações nos PDFs e Editais oficiais.
          </p>
        </div>
      </div>

    </div>

    <!-- Overlay CTA para usuários Free (agora no root para cobertura total e evitar corte) -->
    <div v-if="!plan.isPremium" class="absolute inset-0 z-10 flex items-center justify-center p-4 bg-background/40 dark:bg-[#15152a]/60 backdrop-blur-[1px]">
      <div class="bg-surface-container-lowest dark:bg-surface-dark p-8 md:p-10 rounded-3xl border border-outline-variant/50 shadow-2xl max-w-lg text-center flex flex-col items-center">
        
        <div class="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mb-6 ring-4 ring-primary/5">
          <i class="pi pi-verified text-primary text-3xl"></i>
        </div>
        
        <h3 class="text-2xl font-bold font-headline text-on-surface mb-3">
          Desbloqueie o Tutor de IA
        </h3>
        <p class="text-[15px] font-sans text-on-surface-muted mb-8 leading-relaxed">
          A <strong>Sessão de Insights IA</strong> é uma ferramenta exclusiva do plano Premium. 
          Tenha um mentor à disposição 24/7 para tirar dúvidas de matérias, analisar editais e 
          mostrar as pegadinhas das bancas organizadoras.
        </p>
        
        <button 
          @click="router.push('/private/plans')" 
          class="w-full md:w-auto px-8 py-5 bg-primary text-on-primary rounded-xl font-bold font-sans text-[15px] hover:bg-primary/90 hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 transition-all flex items-center justify-center gap-2"
        >
          <i class="pi pi-star-fill text-sm"></i>
          Assinar Plano Premium
        </button>
        
        <button 
          @click="router.push('/private')" 
          class="mt-4 px-4 py-2 text-sm font-bold font-sans text-on-surface-muted hover:text-on-surface transition-colors"
        >
          Voltar ao Dashboard
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
  width: 6px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: color-mix(in srgb, var(--color-on-surface) 15%, transparent);
  border-radius: 10px;
}
.custom-scrollbar:hover::-webkit-scrollbar-thumb {
  background: color-mix(in srgb, var(--color-on-surface) 25%, transparent);
}
</style>
