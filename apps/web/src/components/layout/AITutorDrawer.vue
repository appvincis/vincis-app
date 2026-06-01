<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, nextTick, watch } from 'vue'
import { useRouter } from 'vue-router'
import { usePlan } from '../../hooks/usePlan'
import { useAuthStore } from '../../stores/auth'
import { useChat } from '@ai-sdk/vue'
import { marked } from 'marked'

const props = defineProps<{
  isOpen: boolean
}>()

const emit = defineEmits<{
  (e: 'close'): void
}>()

const router = useRouter()
const { plan } = usePlan()
const authStore = useAuthStore()

const scrollContainerRef = ref<HTMLDivElement | null>(null)

// Resize logic
const drawerWidth = ref(450)
const isDragging = ref(false)

const startDrag = (e: MouseEvent) => {
  isDragging.value = true
  document.addEventListener('mousemove', onDrag)
  document.addEventListener('mouseup', stopDrag)
  document.body.style.userSelect = 'none'
}

const onDrag = (e: MouseEvent) => {
  if (!isDragging.value) return
  // Drawer is anchored to the right, so width is (window.innerWidth - cursorX)
  const newWidth = window.innerWidth - e.clientX
  if (newWidth > 320 && newWidth < window.innerWidth - 100) {
    drawerWidth.value = newWidth
  }
}

const stopDrag = () => {
  isDragging.value = false
  document.removeEventListener('mousemove', onDrag)
  document.removeEventListener('mouseup', stopDrag)
  document.body.style.userSelect = ''
}

const subject = ref('Geral')
const topic = ref('Estratégia de Estudos')
const selectedModel = ref('openai')

const { messages, input, handleSubmit, isLoading } = useChat({
  api: 'http://localhost:4000/ai/chat',
  streamProtocol: 'text',
  initialMessages: [
    {
      id: 'welcome',
      role: 'assistant',
      content: 'Olá! Sou o seu Tutor IA focado em Concursos. Estou aqui para tirar suas dúvidas sobre editais e matérias. Sobre o que vamos falar hoje?'
    }
  ]
})

const renderMarkdown = (text: string) => {
  if (!text) return ''
  return marked.parse(text, { breaks: true, gfm: true })
}

const scrollToBottom = async () => {
  await nextTick()
  if (scrollContainerRef.value) {
    scrollContainerRef.value.scrollTo({
      top: scrollContainerRef.value.scrollHeight,
      behavior: 'smooth'
    })
  }
}

watch(messages, () => {
  scrollToBottom()
}, { deep: true })

const handleKeyDown = (e: KeyboardEvent) => {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault()
    if (input.value.trim() && !isLoading.value) {
      handleSubmit(e as unknown as Event, { data: { provider: selectedModel.value } })
    }
  }
}

const sendClick = (e: Event) => {
  if (input.value.trim() && !isLoading.value) {
    handleSubmit(e, { data: { provider: selectedModel.value } })
  }
}

watch(() => props.isOpen, (newVal) => {
  if (newVal) {
    scrollToBottom()
  }
})
</script>

<template>
  <!-- Backdrop (Mobile only) -->
  <div 
    v-if="isOpen" 
    @click="emit('close')"
    class="fixed inset-0 bg-black/20 dark:bg-black/40 backdrop-blur-sm z-40 md:hidden transition-opacity"
  ></div>

  <!-- Drawer -->
  <div 
    class="drawer-container fixed top-0 right-0 h-screen w-full bg-background dark:bg-surface-dark shadow-[0_0_40px_rgba(0,0,0,0.1)] dark:shadow-[0_0_40px_rgba(0,0,0,0.5)] z-50 flex flex-col border-l border-outline-variant/30"
    :class="[isOpen ? 'translate-x-0' : 'translate-x-full', isDragging ? 'transition-none' : 'transition-transform duration-300 ease-in-out']"
  >
    <!-- Resize Handle (desktop only) -->
    <div 
      class="absolute top-0 left-0 w-2 h-full cursor-col-resize hover:bg-primary/10 transition-colors z-[60] hidden md:flex items-center justify-center group -ml-1"
      @mousedown.stop.prevent="startDrag"
    >
      <div class="w-1 h-12 rounded-full bg-outline-variant/40 group-hover:bg-primary/60 transition-colors"></div>
    </div>
    <!-- Minimal Chat Header -->
    <header class="flex-shrink-0 flex items-center justify-between px-4 md:px-6 py-3 border-b border-outline-variant/20 bg-background/80 dark:bg-surface-dark/80 backdrop-blur-md z-10">
      <div class="flex items-center gap-3">
        <div class="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20 shadow-sm">
          <i class="pi pi-sparkles"></i>
        </div>
        <div class="flex flex-col">
          <span class="font-headline font-bold text-on-surface text-base md:text-lg tracking-tight leading-none">Tutor IA</span>
          <span class="text-[11px] text-on-surface-muted font-label uppercase tracking-wider mt-1 hidden md:block">Assistente de Concursos</span>
        </div>
      </div>

      <!-- Close Button -->
      <div class="flex items-center gap-3">
        <button @click="emit('close')" class="w-8 h-8 rounded-full flex items-center justify-center bg-surface-container hover:bg-surface-container-high text-on-surface-muted hover:text-on-surface transition-colors cursor-pointer border border-outline-variant/30">
          <i class="pi pi-times text-sm"></i>
        </button>
      </div>
    </header>

    <!-- Main Content Area with Paywall Blur & Shift -->
    <div class="flex-1 flex flex-col relative overflow-hidden bg-background dark:bg-surface-dark">
      
      <!-- Se não for premium, aplica blur, deslocamento (shift) e impede eventos de mouse -->
      <div 
        class="flex-1 flex flex-col transition-all duration-500 ease-out min-h-0"
        :class="{ 'blur-md translate-y-4 scale-[0.98] pointer-events-none select-none opacity-40 origin-bottom': !plan.isPremium }"
      >
        <!-- Área de Mensagens -->
        <div ref="scrollContainerRef" class="flex-1 overflow-y-auto px-4 md:px-6 custom-scrollbar scroll-auto min-h-0">
          <div class="max-w-3xl mx-auto w-full py-8 md:py-12 flex flex-col gap-10">
            
            <div 
              v-for="msg in messages" 
              :key="msg.id" 
              class="flex w-full"
              :class="msg.role === 'user' ? 'justify-end' : 'justify-start'"
            >
              <!-- Assistant Layout (Avatar + Text) -->
              <div v-if="msg.role !== 'user'" class="flex gap-4 w-full">
                <!-- Avatar -->
                <div class="shrink-0 mt-1">
                  <div class="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary border border-primary/20 shadow-sm">
                    <i class="pi pi-sparkles text-sm"></i>
                  </div>
                </div>
                
                <!-- Content sem Bubble -->
                <div class="flex-1 min-w-0">
                  <div 
                    class="prose prose-sm md:prose-base prose-neutral dark:prose-invert max-w-none prose-p:leading-relaxed prose-headings:font-headline prose-a:text-primary prose-strong:text-on-surface dark:prose-strong:text-white"
                    v-html="renderMarkdown(msg.content)"
                  ></div>
                </div>
              </div>

              <!-- User Layout (Bubble on the right) -->
              <div 
                v-else
                class="max-w-[85%] bg-surface-container-high dark:bg-surface-dark-elevated text-on-surface px-5 py-3.5 rounded-[24px] rounded-br-sm shadow-sm border border-outline-variant/10"
              >
                <div class="text-[15px] leading-relaxed whitespace-pre-wrap" v-html="msg.content.replace(/\n/g, '<br/>')"></div>
              </div>
            </div>
            
            <!-- Loading Indicator -->
            <div v-if="isLoading" class="flex gap-4 w-full">
              <div class="shrink-0 mt-1">
                <div class="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary animate-pulse">
                  <i class="pi pi-sparkles text-sm"></i>
                </div>
              </div>
              <div class="flex items-center gap-1.5 h-8">
                <span class="w-2 h-2 bg-on-surface-muted/40 rounded-full animate-bounce"></span>
                <span class="w-2 h-2 bg-on-surface-muted/40 rounded-full animate-bounce" style="animation-delay: 0.2s"></span>
                <span class="w-2 h-2 bg-on-surface-muted/40 rounded-full animate-bounce" style="animation-delay: 0.4s"></span>
              </div>
            </div>

            <!-- Spacer to ensure content isn't hidden behind the fixed input area -->
            <div class="h-32 md:h-40 shrink-0 w-full"></div>

          </div>
        </div>

        <!-- Input Area (Fixed at bottom) -->
        <div class="absolute bottom-0 left-0 w-full bg-gradient-to-t from-background via-background to-transparent dark:from-surface-dark dark:via-surface-dark pt-12 pb-6 md:pb-8 px-4 md:px-6 pointer-events-none">
          <div class="max-w-3xl mx-auto w-full pointer-events-auto relative">
            <div class="bg-surface-container-lowest dark:bg-[#1a1a24] rounded-3xl border border-outline-variant/40 shadow-sm focus-within:shadow-md focus-within:border-primary/40 transition-all flex flex-col p-2">
              <textarea 
                v-model="input"
                @keydown="handleKeyDown"
                placeholder="Pergunte algo ao Tutor IA..."
                class="w-full bg-transparent border-none focus:ring-0 text-[15px] text-on-surface resize-none max-h-32 min-h-[44px] pt-3 pb-2 px-4 font-sans outline-none custom-scrollbar"
                rows="1"
              ></textarea>
              
              <div class="flex items-center justify-between mt-1 pl-2 pr-1">
                <!-- Left Toolbar: Attach + Model Selector -->
                <div class="flex items-center gap-2">
                  <button class="w-8 h-8 rounded-full flex items-center justify-center text-on-surface-muted hover:bg-surface-container hover:text-on-surface transition-colors cursor-pointer" title="Anexar arquivo ou imagem">
                    <i class="pi pi-paperclip text-[15px]"></i>
                  </button>
                  
                  <div class="flex items-center bg-surface-container-highest dark:bg-[#1e1e2d] p-0.5 rounded-lg shadow-inner border border-outline-variant/30">
                    <button 
                      @click="selectedModel = 'openai'" 
                      :class="selectedModel === 'openai' ? 'bg-primary text-on-primary shadow-sm' : 'text-on-surface-muted hover:text-on-surface'" 
                      class="px-2.5 py-1 rounded-md text-[11px] font-bold font-sans transition-all cursor-pointer flex items-center"
                    >
                      <i class="pi pi-bolt mr-1 text-[9px]"></i> GPT-4o
                    </button>
                    <button 
                      @click="selectedModel = 'gemini'" 
                      :class="selectedModel === 'gemini' ? 'bg-primary text-on-primary shadow-sm' : 'text-on-surface-muted hover:text-on-surface'" 
                      class="px-2.5 py-1 rounded-md text-[11px] font-bold font-sans transition-all cursor-pointer flex items-center"
                    >
                      <i class="pi pi-star mr-1 text-[9px]"></i> Gemini 1.5
                    </button>
                  </div>
                </div>

                <!-- Right Toolbar: Send -->
                <button 
                  @click="sendClick"
                  :disabled="isLoading || !input.trim()"
                  class="w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-all duration-200"
                  :class="
                    input.trim() && !isLoading
                      ? 'bg-primary text-on-primary hover:scale-105 active:scale-95 cursor-pointer shadow-sm' 
                      : 'bg-surface-container-high text-on-surface-muted cursor-not-allowed opacity-60'
                  "
                >
                  <i class="pi pi-arrow-up text-[13px] font-bold"></i>
                </button>
              </div>
            </div>
            <p class="text-[11px] text-center text-on-surface-muted mt-3 font-sans">
              O Tutor IA pode cometer erros. Sempre verifique as informações oficiais.
            </p>
          </div>
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
          @click="emit('close')" 
          class="mt-4 px-4 py-2 text-sm font-bold font-sans text-on-surface-muted hover:text-on-surface transition-colors"
        >
          Fechar Tutor
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
@media (min-width: 768px) {
  .drawer-container {
    width: v-bind('drawerWidth + "px"');
  }
}

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
