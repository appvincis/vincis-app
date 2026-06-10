<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, nextTick, watch } from 'vue'
import { useRouter } from 'vue-router'
import { usePlan } from '../../hooks/usePlan'
import { useAuthStore } from '../../stores/auth'
import { Chat } from '@ai-sdk/vue'
import { DefaultChatTransport } from 'ai'
import { marked } from 'marked'
import { useQueryClient } from '@tanstack/vue-query'
import { useAiSessionsQuery, useAiSessionQuery, useDeleteAiSessionMutation } from '../../hooks/useAiSession'
import { useEditaisQuery } from '../../hooks/useEditais'

const props = defineProps<{
  isOpen: boolean
}>()

const emit = defineEmits<{
  (e: 'close'): void
}>()

const router = useRouter()
const { plan } = usePlan()
const authStore = useAuthStore()
const queryClient = useQueryClient()

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
const selectedModel = ref('gemini')

const sessionId = ref<string | null>(null)
const showHistory = ref(false)
const isLoadingFromHistory = ref(false)
const attachedEditalId = ref<number | null>(null)
const showAttachmentMenu = ref(false)

const { data: sessions, isLoading: isLoadingSessions } = useAiSessionsQuery()
const { data: currentSession, isFetching: isFetchingSession } = useAiSessionQuery(sessionId)
const deleteSessionMutation = useDeleteAiSessionMutation()
const { data: editais } = useEditaisQuery()

const initialWelcomeMessage = {
  id: 'welcome',
  role: 'assistant' as 'user' | 'assistant' | 'system',
  content: 'Olá! Sou o seu Tutor IA focado em Concursos. Estou aqui para tirar suas dúvidas sobre editais e matérias. Sobre o que vamos falar hoje?',
  parts: [{ type: 'text' as const, text: 'Olá! Sou o seu Tutor IA focado em Concursos. Estou aqui para tirar suas dúvidas sobre editais e matérias. Sobre o que vamos falar hoje?' }]
}

const input = ref('')
const isLoading = computed(() => chat.status === 'streaming' || chat.status === 'submitted')

const chat = new Chat({
  transport: new DefaultChatTransport({
    api: 'http://localhost:4000/ai/chat',
    fetch: async (url, options) => {
      if (options && typeof options.body === 'string') {
        try {
          const bodyObj = JSON.parse(options.body);
          bodyObj.data = {
            provider: selectedModel.value,
            sessionId: sessionId.value || '',
            editalId: attachedEditalId.value?.toString() || ''
          };
          options.body = JSON.stringify(bodyObj);
        } catch (e) {
          console.error('Failed to parse fetch body', e);
        }
      }
      const res = await fetch(url, { ...options, credentials: 'include' })
      const newSessionId = res.headers.get('x-session-id')
      if (newSessionId && !sessionId.value) {
        sessionId.value = newSessionId
        // Invalidate list to show new session
        queryClient.invalidateQueries({ queryKey: ['ai-sessions'] })
      }
      return res
    }
  }),
  messages: [initialWelcomeMessage]
})

// Quando a stream termina ('ready'), invalida a sessão para buscar os tokens gastos salvos no banco
watch(() => chat.status, (newStatus, oldStatus) => {
  if (newStatus === 'ready' && oldStatus === 'streaming' && sessionId.value) {
    queryClient.invalidateQueries({ queryKey: ['ai-sessions', sessionId.value] })
  }
})

const messages = computed(() => chat.messages)

const handleSubmit = (event?: Event) => {
  event?.preventDefault()
  if (!input.value.trim()) return
  
  const text = input.value
  input.value = ''
  
  const attachments = []
  if (attachedEditalId.value) {
    const edital = editais.value?.find((e: any) => e.id === attachedEditalId.value)
    if (edital && edital.parsedContent) {
      attachments.push({
        url: 'db://edital',
        contentType: 'text/plain',
        content: `CONTEÚDO DO EDITAL DE REFERÊNCIA (${edital.title}):\n\n${edital.parsedContent}`
      })
    }
  }

  // Support for attachments using Vercel AI SDK parts format
  const parts: any[] = [{ type: 'text', text }]
  if (attachments.length > 0 && attachments[0]) {
     // Currently we just send the text alongside if there's no native multipart format
     parts[0].text += '\n\n' + attachments[0].content
  }

  chat.sendMessage(
    { text: parts[0].text }
  )
}

const setMessages = (msgs: any[]) => {
  chat.messages = msgs
}

const getMessageText = (msg: any) => {
  if (msg.content) return msg.content
  if (msg.parts && msg.parts.length > 0) {
    return msg.parts.map((p: any) => p.text || '').join('')
  }
  return ''
}

watch(currentSession, (session) => {
  if (session) {
    if (session.editalId) {
      attachedEditalId.value = session.editalId
    }
    // Sincroniza se clicou no histórico OU se a IA terminou de responder (para pegar os tokens salvos no banco)
    if (session.messages?.length && (isLoadingFromHistory.value || chat.status === 'ready')) {
      const mapped = session.messages.map((m: any) => ({
        id: m.id,
        role: m.role as 'user' | 'assistant',
        content: m.content,
        parts: [{ type: 'text', text: m.content }],
        metadata: { tokens: m.tokens } // Passa o token do db na propriedade metadata
      }))
      setMessages(mapped)
      isLoadingFromHistory.value = false // reset flag after loading
    }
  }
}, { immediate: true, deep: true })

const startNewChat = () => {
  sessionId.value = null
  showHistory.value = false
  isLoadingFromHistory.value = false
  attachedEditalId.value = null
  setMessages([initialWelcomeMessage])
}

const selectSession = (id: string) => {
  sessionId.value = id
  showHistory.value = false
  isLoadingFromHistory.value = true
}

const deleteSession = (id: string, event: Event) => {
  event.stopPropagation()
  deleteSessionMutation.mutate(id)
  if (sessionId.value === id) {
    startNewChat()
    showHistory.value = true // keep history open
  }
}

const toggleAttachmentMenu = () => {
  showAttachmentMenu.value = !showAttachmentMenu.value
}

const selectEdital = (editalId: number) => {
  attachedEditalId.value = editalId
  showAttachmentMenu.value = false
}

const attachedEditalName = computed(() => {
  if (!attachedEditalId.value || !editais.value) return null
  return editais.value.find((e: any) => e.id === attachedEditalId.value)?.title
})

const firstUserMessage = computed(() => {
  return messages.value.find(m => m.role === 'user')
})

const tokenMap = computed(() => {
  const map: Record<string, number> = {}
  if (currentSession.value?.messages) {
    currentSession.value.messages.forEach((m: any) => {
      if (m.tokens) {
        map[m.id] = m.tokens
        // Fallback: mapeia pelo conteúdo exato da mensagem,
        // já que o Vercel AI SDK usa IDs locais (v-xxx) diferentes dos UUIDs do banco.
        if (m.content) {
          map[m.content] = m.tokens
        }
      }
    })
  }
  return map
})

const getTokenUsage = (msg: any) => {
  if (!msg) return null;
  // Busca direto do mapa reativo do DB (A prova de falhas)
  if (tokenMap.value[msg.id]) return tokenMap.value[msg.id];
  if (tokenMap.value[msg.content]) return tokenMap.value[msg.content];
  
  // If loaded from DB history (new format)
  if (msg.metadata && msg.metadata.tokens) return msg.metadata.tokens;
  // Fallback para o formato antigo
  if (msg.tokens) return msg.tokens;
  
  // If streaming from Vercel AI SDK
  if (msg.annotations && Array.isArray(msg.annotations)) {
    const usageObj = msg.annotations.find((a: any) => a?.type === 'usage' || a?.promptTokens !== undefined);
    if (usageObj) {
       const vals = usageObj.value || usageObj;
       return vals.totalTokens || (vals.promptTokens + vals.completionTokens) || null;
    }
  }
  return null;
}

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
      handleSubmit(e as unknown as Event)
    }
  }
}

const sendClick = (e: Event) => {
  if (input.value.trim() && !isLoading.value) {
    handleSubmit(e)
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

      <!-- Right Actions -->
      <div class="flex items-center gap-3">
        <button 
          v-if="!showHistory"
          @click="showHistory = true" 
          class="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold font-sans transition-colors bg-surface-container-highest hover:bg-surface-container-high text-on-surface-muted hover:text-on-surface cursor-pointer border border-outline-variant/30"
        >
          <i class="pi pi-history text-xs"></i>
          <span class="hidden md:inline">Histórico</span>
        </button>
        <button 
          v-else
          @click="showHistory = false" 
          class="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold font-sans transition-colors bg-primary text-on-primary cursor-pointer shadow-sm"
        >
          <i class="pi pi-comments text-xs"></i>
          <span class="hidden md:inline">Voltar ao Chat</span>
        </button>

        <button @click="emit('close')" class="w-8 h-8 rounded-full flex items-center justify-center bg-surface-container hover:bg-surface-container-high text-on-surface-muted hover:text-on-surface transition-colors cursor-pointer border border-outline-variant/30">
          <i class="pi pi-times text-sm"></i>
        </button>
      </div>
    </header>

    <!-- Main Content Area with Paywall Blur & Shift -->
    <div class="flex-1 flex flex-col relative overflow-hidden bg-background dark:bg-surface-dark">
      
      <!-- Se não for premium, aplica blur -->
      <div 
        class="flex-1 flex flex-col transition-all duration-500 ease-out min-h-0 relative"
        :class="{ 'blur-md translate-y-4 scale-[0.98] pointer-events-none select-none opacity-40 origin-bottom': !plan.isPremium }"
      >
        <!-- TELA DE HISTÓRICO -->
        <div 
          v-if="showHistory" 
          class="absolute inset-0 bg-background dark:bg-surface-dark z-20 flex flex-col overflow-hidden"
        >
          <div class="p-6 border-b border-outline-variant/20 flex justify-between items-center bg-surface-container-lowest">
            <h3 class="font-headline font-bold text-lg">Suas Conversas</h3>
            <button @click="startNewChat" class="px-4 py-2 bg-primary/10 text-primary hover:bg-primary/20 rounded-xl text-sm font-bold transition-colors flex items-center gap-2">
              <i class="pi pi-plus"></i> Nova Conversa
            </button>
          </div>
          
          <div class="flex-1 overflow-y-auto px-4 py-4 custom-scrollbar">
            <div v-if="isLoadingSessions" class="flex justify-center p-8">
              <i class="pi pi-spinner animate-spin text-primary text-2xl"></i>
            </div>
            <div v-else-if="!sessions?.length" class="text-center p-8 text-on-surface-muted">
              Nenhuma conversa encontrada.
            </div>
            <div v-else class="flex flex-col gap-2">
              <div 
                v-for="session in sessions" 
                :key="session.id"
                class="flex items-center text-left p-4 rounded-xl transition-all border hover:shadow-sm group relative"
                :class="session.id === sessionId ? 'bg-primary/5 border-primary/30' : 'bg-surface-container-lowest border-outline-variant/30 hover:bg-surface-container-highest'"
              >
                <button @click="selectSession(session.id)" class="flex-1 flex flex-col items-start cursor-pointer text-left w-full pr-10">
                  <span class="font-sans font-bold text-on-surface truncate w-full text-[15px] mb-1">
                    {{ session.title }}
                  </span>
                  <span class="text-xs text-on-surface-muted font-sans flex items-center gap-1.5">
                    <i class="pi pi-clock text-[10px]"></i>
                    {{ new Date(session.updatedAt).toLocaleDateString('pt-BR') }} às {{ new Date(session.updatedAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) }}
                  </span>
                </button>
                <button 
                  @click="deleteSession(session.id, $event)" 
                  class="absolute right-4 w-8 h-8 flex items-center justify-center rounded-lg hover:bg-error/10 hover:text-error text-on-surface-muted opacity-0 group-hover:opacity-100 transition-all cursor-pointer"
                  title="Excluir conversa"
                  :disabled="deleteSessionMutation.isPending.value"
                >
                  <i class="pi pi-trash text-sm" :class="{'pi-spinner animate-spin': deleteSessionMutation.isPending.value && deleteSessionMutation.variables.value === session.id}"></i>
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Área de Mensagens (Oculta se Histórico aberto) -->
        <div v-show="!showHistory" ref="scrollContainerRef" class="flex-1 overflow-y-auto px-4 md:px-6 custom-scrollbar scroll-auto min-h-0 relative">
          
          <!-- Loading overlay quando estiver trocando de sessão -->
          <div v-if="isFetchingSession" class="absolute inset-0 z-10 bg-background/50 backdrop-blur-sm flex items-center justify-center">
            <i class="pi pi-spinner animate-spin text-primary text-3xl"></i>
          </div>

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
                    v-html="renderMarkdown(getMessageText(msg))"
                  ></div>
                  <!-- Tokens Counter (Claude Style) -->
                  <div v-if="getTokenUsage(msg)" class="mt-3 flex items-center gap-1.5 text-[11px] text-on-surface-muted font-mono bg-surface-container w-fit px-2 py-0.5 rounded-md border border-outline-variant/30">
                    <i class="pi pi-sparkles text-[9px] text-primary"></i>
                    <span>{{ getTokenUsage(msg).toLocaleString('pt-BR') }} tokens</span>
                  </div>
                </div>
              </div>

              <!-- User Layout (Bubble on the right) -->
              <div 
                v-else
                class="max-w-[85%] flex flex-col items-end gap-2"
              >
                <!-- Attachment Card -->
                <div v-if="msg.id === firstUserMessage?.id && attachedEditalName" class="bg-surface-container dark:bg-surface-dark-elevated text-on-surface p-3 rounded-2xl flex flex-col items-center justify-center gap-2 border border-outline-variant/20 shadow-sm w-28 h-28 shrink-0">
                  <div class="bg-error text-white w-10 h-10 rounded-lg flex items-center justify-center shadow-sm">
                    <i class="pi pi-file-pdf text-xl"></i>
                  </div>
                  <span class="text-xs font-bold text-center w-full truncate px-1 mt-1" :title="attachedEditalName">{{ attachedEditalName }}</span>
                </div>

                <div class="bg-surface-container-high dark:bg-surface-dark-elevated text-on-surface px-5 py-3.5 rounded-[24px] rounded-br-sm shadow-sm border border-outline-variant/10">
                  <div class="text-[15px] leading-relaxed whitespace-pre-wrap" v-html="getMessageText(msg).replace(/\n/g, '<br/>')"></div>
                </div>
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
        <div v-show="!showHistory" class="absolute bottom-0 left-0 w-full bg-gradient-to-t from-background via-background to-transparent dark:from-surface-dark dark:via-surface-dark pt-12 pb-6 md:pb-8 px-4 md:px-6 pointer-events-none z-10">
          <div class="max-w-3xl mx-auto w-full pointer-events-auto relative">
            <div class="bg-surface-container-lowest dark:bg-[#1a1a24] rounded-3xl border border-outline-variant/40 shadow-sm focus-within:shadow-md focus-within:border-primary/40 transition-all flex flex-col p-2">
              <!-- Attachment Badge (Only for new session) -->
              <div v-if="attachedEditalName && !sessionId" class="px-3 pt-2 flex items-center justify-between">
                <div class="flex items-center gap-1.5 bg-primary/10 text-primary px-2 py-1 rounded-md text-xs font-bold font-sans">
                  <i class="pi pi-file-pdf"></i>
                  <span class="truncate max-w-[200px]">Edital: {{ attachedEditalName }}</span>
                  <button @click="attachedEditalId = null" class="ml-1 hover:text-error cursor-pointer">
                    <i class="pi pi-times text-[10px]"></i>
                  </button>
                </div>
              </div>

              <textarea 
                v-model="input"
                @keydown="handleKeyDown"
                placeholder="Pergunte algo ao Tutor IA..."
                class="w-full bg-transparent border-none focus:ring-0 text-[15px] text-on-surface resize-none max-h-32 min-h-[44px] pt-3 pb-2 px-4 font-sans outline-none custom-scrollbar"
                rows="1"
              ></textarea>
              
              <div class="flex items-center justify-between mt-1 pl-2 pr-1 relative">
                <!-- Left Toolbar: Attach + Model Selector -->
                <div class="flex items-center gap-2">
                  <div class="relative" v-if="!sessionId">
                    <button @click="toggleAttachmentMenu" class="w-8 h-8 rounded-full flex items-center justify-center text-on-surface-muted hover:bg-surface-container hover:text-on-surface transition-colors cursor-pointer" title="Anexar edital" :class="{'bg-surface-container text-on-surface': showAttachmentMenu}">
                      <i class="pi pi-paperclip text-[15px]"></i>
                    </button>

                    <!-- Attachment Popover -->
                    <div v-if="showAttachmentMenu" class="absolute bottom-10 left-0 w-64 bg-surface-container-highest border border-outline-variant/30 rounded-xl shadow-lg z-50 overflow-hidden flex flex-col">
                      <div class="px-3 py-2 border-b border-outline-variant/20 bg-surface-container-lowest">
                        <span class="text-xs font-bold text-on-surface-muted uppercase tracking-wider">Anexar Edital</span>
                      </div>
                      <div class="max-h-48 overflow-y-auto custom-scrollbar flex flex-col p-1">
                        <div v-if="!editais?.length" class="p-3 text-center text-xs text-on-surface-muted">
                          Nenhum edital cadastrado.
                        </div>
                        <button 
                          v-else
                          v-for="edital in editais" 
                          :key="edital.id"
                          @click="selectEdital(edital.id)"
                          class="flex items-center gap-2 px-3 py-2 hover:bg-surface-container rounded-lg text-left text-sm text-on-surface transition-colors"
                        >
                          <i class="pi pi-file-pdf text-primary opacity-70"></i>
                          <span class="truncate flex-1">{{ edital.title }}</span>
                        </button>
                      </div>
                    </div>
                  </div>
                  
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
