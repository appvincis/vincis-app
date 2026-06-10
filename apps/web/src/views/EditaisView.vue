<script setup lang="ts">
import { ref, computed, watch, onUnmounted } from 'vue'
import { VCard, VButton, VSpinner, VModal } from '../components/ui'
import {
    useEditaisQuery,
    useCreateEditalMutation,
    useDeleteEditalMutation,
    useEditalSignedUrlMutation,
    useExtractEditalMutation,
    type Edital
} from '../hooks/useEditais'
import { usePlan } from '../hooks/usePlan'
import { useRouter } from 'vue-router'

const { plan } = usePlan()
const router = useRouter()

const { data: editais, isLoading, isError, refetch } = useEditaisQuery()
const createEdital = useCreateEditalMutation()
const deleteEdital = useDeleteEditalMutation()
const getSignedUrl = useEditalSignedUrlMutation()
const extractEdital = useExtractEditalMutation()

import { api } from '../lib/axios'

const cargos = ref<string[]>([])
const selectedCargo = ref<string | null>(null)
const customCargo = ref('')
const loadingCargos = ref(false)
const cargosError = ref('')
const modalStep = ref(1)

const fetchCargos = async (id: number, currentCargo?: string | null) => {
    loadingCargos.value = true
    cargosError.value = ''
    cargos.value = []
    selectedCargo.value = currentCargo || null
    customCargo.value = ''
    
    try {
        const { data } = await api.get<{ cargos: string[] }>(`/editais/${id}/cargos`)
        cargos.value = data.cargos || []
        
        if (currentCargo) {
            // Se o cargo atual não está na lista retornada pela IA, nós marcamos como customizado e jogamos pro input
            if (cargos.value.length > 0 && !cargos.value.includes(currentCargo)) {
                selectedCargo.value = 'custom'
                customCargo.value = currentCargo
            } else if (cargos.value.length === 0) {
                // Caso não retorne lista de cargos, colocamos no input de fallback
                selectedCargo.value = 'custom'
                customCargo.value = currentCargo
            }
        } else {
            selectedCargo.value = null
        }
    } catch (e: any) {
        console.error('Erro ao buscar cargos:', e)
        cargosError.value = e.response?.data?.error || e.message || 'Erro ao carregar cargos.'
        if (currentCargo) {
            selectedCargo.value = 'custom'
            customCargo.value = currentCargo
        }
    } finally {
        loadingCargos.value = false
    }
}

const extractingId = ref<number | null>(null)

interface ExtractionJob {
    id: number;
    title: string;
    progress: number;
    status: 'idle' | 'running' | 'success' | 'error';
    errorMsg?: string;
    tokensSpent?: number;
    disciplinesCreated?: number;
    topicsCreated?: number;
    intervalId?: any;
}

const activeExtractions = ref<ExtractionJob[]>([])

// Carregar do localStorage ao iniciar
const savedProgresses = ref<Record<number, number>>({});
try {
    const saved = localStorage.getItem('vincis_extractions_progress');
    if (saved) {
        savedProgresses.value = JSON.parse(saved);
    }
} catch (e) {
    console.error('Erro ao ler progressos do localStorage', e);
}

const saveProgressesToLocalStorage = () => {
    const progresses: Record<number, number> = {};
    activeExtractions.value.forEach(job => {
        if (job.status === 'running') {
            progresses[job.id] = job.progress;
        }
    });
    localStorage.setItem('vincis_extractions_progress', JSON.stringify(progresses));
};
const showPremiumModal = ref(false)
const showConfirmModal = ref(false)
const selectedEditalId = ref<number | null>(null)
const selectedEditalTitle = ref('')

const handleExtract = (id: number) => {
    if (!plan.value.isPremium) {
        showPremiumModal.value = true
        return
    }
    const edital = editais.value?.find(e => e.id === id)
    if (!edital) return

    selectedEditalId.value = id
    selectedEditalTitle.value = edital.title
    modalStep.value = 1
    showConfirmModal.value = true
    
    // Iniciar a busca dos cargos disponíveis ao abrir o modal
    fetchCargos(id, edital.cargo)
}

const startExtractionProcess = async () => {
    const id = selectedEditalId.value
    if (id === null) return

    showConfirmModal.value = false

    // Check if there is already a running job for this edital
    const existingJob = activeExtractions.value.find(job => job.id === id)
    if (existingJob && existingJob.status === 'running') {
        return
    }

    // Create or update job
    const edital = editais.value?.find(e => e.id === id)
    const title = edital?.title || `Edital #${id}`
    const initialProgress = savedProgresses.value[id] || 15

    const job: ExtractionJob = {
        id,
        title,
        progress: initialProgress,
        status: 'running'
    }

    const index = activeExtractions.value.findIndex(j => j.id === id)
    if (index !== -1) {
        const existing = activeExtractions.value[index]
        if (existing && existing.intervalId) {
            clearInterval(existing.intervalId)
        }
        activeExtractions.value[index] = job
    } else {
        activeExtractions.value.push(job)
    }

    // Start progress simulation
    const intervalId = setInterval(() => {
        const currentJob = activeExtractions.value.find(j => j.id === id)
        if (currentJob && currentJob.status === 'running') {
            if (currentJob.progress < 90) {
                currentJob.progress += Math.random() * 2 + 0.5
                if (currentJob.progress > 90) {
                    currentJob.progress = 90
                }
                saveProgressesToLocalStorage()
            }
        } else {
            clearInterval(intervalId)
        }
    }, 1000)

    job.intervalId = intervalId

    // Definir o cargo que será enviado
    let targetCargoToSend: string | null = null
    if (selectedCargo.value === 'custom') {
        targetCargoToSend = customCargo.value.trim() || null
    } else {
        targetCargoToSend = selectedCargo.value
    }

    try {
        await extractEdital.mutateAsync({ id, cargo: targetCargoToSend })
        // A extração foi iniciada no backend. O status do job será atualizado
        // pelo watcher que escuta as atualizações de editais via polling.
    } catch (e: any) {
        const errorMsg = e.response?.data?.error || e.message || 'Erro ao processar extração com IA.'

        const failedJob = activeExtractions.value.find(j => j.id === id)
        if (failedJob) {
            if (failedJob.intervalId) clearInterval(failedJob.intervalId)
            failedJob.status = 'error'
            failedJob.errorMsg = errorMsg
        }
    }
}

// ─── Polling & Sincronização do Estado com o Banco de Dados ────────────────────
let pollingIntervalId: any = null

const startPollingIfNeeded = () => {
    const hasProcessing = editais.value?.some(e => e.extractionStatus === 'PROCESSING' || e.extractionStatus === 'QUEUED')
    if (hasProcessing) {
        if (!pollingIntervalId) {
            pollingIntervalId = setInterval(() => {
                refetch()
            }, 4000) // Consulta a cada 4 segundos
        }
    } else {
        if (pollingIntervalId) {
            clearInterval(pollingIntervalId)
            pollingIntervalId = null
        }
    }
}

watch(editais, (newEditais) => {
    if (!newEditais) return

    newEditais.forEach(edital => {
        const jobIndex = activeExtractions.value.findIndex(j => j.id === edital.id)

        if (edital.extractionStatus === 'PROCESSING' || edital.extractionStatus === 'QUEUED') {
            if (jobIndex === -1) {
                // Nova extração detectada em progresso (ex: após refresh)
                const initialProgress = savedProgresses.value[edital.id] || 15;
                const job: ExtractionJob = {
                    id: edital.id,
                    title: edital.title,
                    progress: initialProgress,
                    status: 'running',
                    errorMsg: edital.extractionError || undefined
                }

                // Inicia simulação de progresso local
                const intervalId = setInterval(() => {
                    const currentJob = activeExtractions.value.find(j => j.id === edital.id)
                    if (currentJob && currentJob.status === 'running') {
                        if (currentJob.progress < 90) {
                            currentJob.progress += Math.random() * 2 + 0.5
                            if (currentJob.progress > 90) {
                                currentJob.progress = 90
                            }
                            saveProgressesToLocalStorage()
                        }
                    } else {
                        clearInterval(intervalId)
                    }
                }, 1000)

                job.intervalId = intervalId
                activeExtractions.value.push(job)
            } else {
                const job = activeExtractions.value[jobIndex]
                if (job && job.status === 'running') {
                    job.errorMsg = edital.extractionError || undefined
                }
            }
        } else if (edital.extractionStatus === 'SUCCESS') {
            if (jobIndex !== -1) {
                const job = activeExtractions.value[jobIndex]
                if (job && job.status === 'running') {
                    if (job.intervalId) clearInterval(job.intervalId)
                    job.progress = 100
                    job.status = 'success'
                    job.disciplinesCreated = edital.disciplinesCreated
                    job.topicsCreated = edital.topicsCreated
                    
                    // Remover do localStorage ao finalizar com sucesso
                    delete savedProgresses.value[edital.id]
                    localStorage.setItem('vincis_extractions_progress', JSON.stringify(savedProgresses.value))
                }
            }
        } else if (edital.extractionStatus === 'FAILED') {
            if (jobIndex !== -1) {
                const job = activeExtractions.value[jobIndex]
                if (job && job.status === 'running') {
                    if (job.intervalId) clearInterval(job.intervalId)
                    job.status = 'error'
                    job.errorMsg = edital.extractionError || 'Erro ao extrair disciplinas com IA.'
                    
                    // Remover do localStorage ao falhar
                    delete savedProgresses.value[edital.id]
                    localStorage.setItem('vincis_extractions_progress', JSON.stringify(savedProgresses.value))
                }
            }
        }
    })

    startPollingIfNeeded()
}, { deep: true, immediate: true })

onUnmounted(() => {
    if (pollingIntervalId) {
        clearInterval(pollingIntervalId)
    }
    activeExtractions.value.forEach(job => {
        if (job && job.intervalId) {
            clearInterval(job.intervalId)
        }
    })
})

const removeJob = (id: number) => {
    const index = activeExtractions.value.findIndex(j => j.id === id)
    if (index !== -1) {
        const job = activeExtractions.value[index]
        if (job) {
            if (job.intervalId) {
                clearInterval(job.intervalId)
            }
            activeExtractions.value.splice(index, 1)
        }
    }
}

const retryJob = (id: number) => {
    selectedEditalId.value = id
    const edital = editais.value?.find(e => e.id === id)
    selectedEditalTitle.value = edital?.title || ''
    startExtractionProcess()
}

const goToDisciplines = () => {
    router.push('/private/disciplinas')
}

const isJobRunning = (id: number) => {
    const job = activeExtractions.value.find(j => j.id === id)
    if (job) return job.status === 'running'
    const edital = editais.value?.find(e => e.id === id)
    return edital?.extractionStatus === 'PROCESSING' || edital?.extractionStatus === 'QUEUED'
}

// ─── Modal Upload ─────────────────────────────────────────────────────────────
const showUploadModal = ref(false)
const newTitle = ref('')
const newDescription = ref('')
const newPageRange = ref('')
const selectedFile = ref<File | null>(null)
const uploadError = ref('')

const handleFileChange = (e: Event) => {
    const target = e.target as HTMLInputElement
    if (target.files && target.files.length > 0) {
        const file = target.files[0]
        if (!file) return
        if (file.type !== 'application/pdf') {
            uploadError.value = 'Apenas arquivos PDF são permitidos.'
            selectedFile.value = null
            target.value = ''
            return
        }
        if (file.size > 5 * 1024 * 1024) {
            uploadError.value = 'O arquivo excede o limite de 5MB.'
            selectedFile.value = null
            target.value = ''
            return
        }
        uploadError.value = ''
        selectedFile.value = file
    }
}

const submitUpload = async () => {
    if (!newTitle.value || !selectedFile.value) {
        uploadError.value = 'Título e arquivo são obrigatórios.'
        return
    }

    const formData = new FormData()
    formData.append('title', newTitle.value)
    if (newDescription.value) formData.append('description', newDescription.value)
    if (newPageRange.value) formData.append('pageRange', newPageRange.value)
    formData.append('file', selectedFile.value)

    createEdital.mutate(formData, {
        onSuccess: () => {
            showUploadModal.value = false
            newTitle.value = ''
            newDescription.value = ''
            newPageRange.value = ''
            selectedFile.value = null
            uploadError.value = ''
        },
        onError: (err: any) => {
            uploadError.value = err.response?.data?.error || 'Erro ao fazer upload.'
        }
    })
}

// ─── Ações de Edital ──────────────────────────────────────────────────────────
const viewingId = ref<number | null>(null)
const showPreviewModal = ref(false)
const previewUrl = ref<string | null>(null)

const handleView = async (id: number) => {
    try {
        viewingId.value = id
        const url = await getSignedUrl.mutateAsync(id)
        if (url) {
            previewUrl.value = url
            showPreviewModal.value = true
        }
    } catch (e) {
        alert('Erro ao abrir o edital. Ele pode ter sido removido ou não está acessível.')
    } finally {
        viewingId.value = null
    }
}

const closePreview = () => {
    showPreviewModal.value = false
    setTimeout(() => { previewUrl.value = null }, 300)
}

const handleDelete = async (id: number) => {
    if (confirm('Tem certeza que deseja excluir este edital? Esta ação não pode ser desfeita e o arquivo será apagado.')) {
        deleteEdital.mutate(id)
    }
}

// ─── Formatadores ─────────────────────────────────────────────────────────────
const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

const formatDate = (dateString: string) => {
    const d = new Date(dateString)
    return d.toLocaleDateString('pt-BR')
}
</script>

<template>
  <div class="p-8 max-w-7xl mx-auto space-y-8 animate-fade-in pb-12">
    <!-- ─── Header ───────────────────────────────────────────────────── -->
    <header class="view-header flex flex-col md:flex-row md:items-end justify-between gap-6">
      <div class="space-y-2">
        <p class="font-label text-xs uppercase tracking-[0.2em] text-primary font-bold">Documentos</p>
        <h2 class="text-4xl md:text-5xl font-headline font-bold text-on-surface tracking-tight text-left">
          Editais
        </h2>
        <p class="text-on-surface-muted max-w-xl text-sm leading-relaxed text-left">
          Gerencie seus editais e cadernos de provas em PDF de forma centralizada e segura.
        </p>
      </div>
      <div class="flex gap-3">
        <VButton id="btn-import-edital" @click="showUploadModal = true" variant="primary">
          <i class="pi pi-upload mr-2 text-xs"></i>
          Importar Edital
        </VButton>
      </div>
    </header>

    <!-- Estado de Carregamento / Erro -->
    <VSpinner v-if="isLoading" class="h-64" />
    <div v-else-if="isError" class="flex-1 flex justify-center items-center text-error h-64">
      <p>Erro ao carregar editais. Tente novamente mais tarde.</p>
    </div>

    <!-- Empty State Content -->
    <div v-else-if="editais?.length === 0" class="flex flex-col items-center justify-center py-20 px-4 border border-dashed rounded-3xl bg-surface-container-low/30 backdrop-blur-sm space-y-4 text-center border-outline-variant/30">
      <div class="w-16 h-16 rounded-full bg-primary/5 flex items-center justify-center text-primary">
        <i class="pi pi-file-pdf text-3xl"></i>
      </div>
      <div class="space-y-1">
        <h3 class="text-lg font-bold">Nenhum edital importado</h3>
        <p class="text-xs text-on-surface-muted max-w-xs leading-relaxed">
          Você não possui nenhum edital importado. Adicione arquivos PDF (até 5MB) para iniciar seus estudos.
        </p>
      </div>
      <VButton variant="secondary" @click="showUploadModal = true" class="mt-2">
        Importar primeiro arquivo
      </VButton>
    </div>

    <!-- Lista de Editais -->
    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
      <VCard v-for="edital in editais" :key="edital.id"
        class="edital-card flex flex-col justify-between p-5 border border-outline-variant/20 rounded-2xl transition-all h-full bg-surface-container-lowest hover:border-primary/30">
        
        <div class="flex items-start justify-between gap-4 mb-4">
            <div class="flex-1 min-w-0 text-left">
                <h3 class="font-bold text-lg text-on-surface truncate font-headline" :title="edital.title">
                    {{ edital.title }}
                </h3>
                <p v-if="edital.description" class="text-sm text-on-surface-muted mt-1 line-clamp-2">
                    {{ edital.description }}
                </p>
            </div>
            <div class="w-10 h-10 rounded-xl bg-error/10 text-error flex items-center justify-center flex-shrink-0">
                <i class="pi pi-file-pdf text-xl"></i>
            </div>
        </div>

        <!-- Status Badge -->
        <div class="mb-4 flex flex-wrap gap-2 text-left">
            <span v-if="edital.extractionStatus === 'SUCCESS'" class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-success/10 text-success border border-success/20">
                <i class="pi pi-check text-[8px]"></i> Grade Extraída ({{ edital.disciplinesCreated }} disc. / {{ edital.topicsCreated }} tóp.)
            </span>
            <span v-else-if="edital.extractionStatus === 'QUEUED'" class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-warning/10 text-warning border border-warning/20" :title="edital.extractionError || ''">
                <i class="pi pi-hourglass text-[8px] animate-pulse"></i> {{ edital.extractionError || 'Aguardando na fila...' }}
            </span>
            <span v-else-if="edital.extractionStatus === 'PROCESSING' || isJobRunning(edital.id)" class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-primary/10 text-primary border border-primary/20 animate-pulse" :title="edital.extractionError || ''">
                <i class="pi pi-spin pi-spinner text-[8px]"></i> {{ edital.extractionError || 'Processando IA...' }}
            </span>
            <span v-else-if="edital.extractionStatus === 'FAILED'" class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-error/10 text-error border border-error/20" :title="edital.extractionError || ''">
                <i class="pi pi-exclamation-triangle text-[8px]"></i> Falha na Extração
            </span>
            <span v-if="edital.cargo" class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-purple-500/10 text-purple-400 border border-purple-500/20" :title="edital.cargo">
                <i class="pi pi-briefcase text-[8px]"></i> Cargo: {{ edital.cargo }}
            </span>
        </div>

        <div class="mt-auto pt-4 flex flex-col gap-3 border-t border-outline-variant/10">
            <div class="flex justify-between items-center text-xs font-medium text-on-surface-muted">
                <span class="flex items-center gap-1.5"><i class="pi pi-calendar text-[10px]"></i> {{ formatDate(edital.createdAt) }}</span>
                <span class="flex items-center gap-1.5"><i class="pi pi-database text-[10px]"></i> {{ formatBytes(edital.fileSize) }}</span>
            </div>

            <div class="flex flex-col gap-2 w-full mt-2">
                <div class="flex gap-2 w-full">
                    <VButton class="flex-1 text-on-surface border border-outline-variant/30 bg-surface-container-low hover:bg-surface-container-high py-2"
                        :disabled="viewingId === edital.id || isJobRunning(edital.id)"
                        @click="handleView(edital.id)">
                        <i v-if="viewingId === edital.id" class="pi pi-spin pi-spinner mr-2 text-xs"></i>
                        <i v-else class="pi pi-external-link mr-2 text-xs"></i>
                        Visualizar
                    </VButton>
                    
                    <button class="w-10 flex-shrink-0 rounded-xl flex items-center justify-center transition-colors text-on-surface-muted hover:bg-error/10 hover:text-error"
                        :disabled="deleteEdital.isPending.value || isJobRunning(edital.id)"
                        @click="handleDelete(edital.id)"
                        title="Excluir Edital">
                        <i class="pi pi-trash"></i>
                    </button>
                </div>
                
                <div v-if="edital.extractionStatus === 'SUCCESS'" class="flex gap-2 w-full">
                    <VButton class="flex-1 text-white bg-success hover:bg-success-dark py-2 flex items-center justify-center"
                        @click="goToDisciplines">
                        <i class="pi pi-arrow-right mr-2 text-xs"></i>
                        Ver Disciplinas
                    </VButton>
                    <VButton class="flex-1 text-on-surface border border-outline-variant/30 bg-surface-container-low hover:bg-surface-container-high py-2 flex items-center justify-center"
                        :disabled="isJobRunning(edital.id)"
                        @click="handleExtract(edital.id)">
                        <i v-if="isJobRunning(edital.id)" class="pi pi-spin pi-spinner mr-1 text-xs"></i>
                        <i v-else class="pi pi-refresh mr-1 text-xs"></i>
                        Reextrair
                    </VButton>
                </div>
                <VButton v-else class="w-full text-white bg-primary hover:bg-primary-dark py-2 flex items-center justify-center"
                    :disabled="isJobRunning(edital.id)"
                    @click="handleExtract(edital.id)">
                    <i v-if="isJobRunning(edital.id)" class="pi pi-spin pi-spinner mr-2 text-xs"></i>
                    <i v-else-if="!plan.isPremium" class="pi pi-lock mr-2 text-xs"></i>
                    <i v-else class="pi pi-bolt mr-2 text-xs"></i>
                    Extrair Grade (IA)
                    <span v-if="!plan.isPremium" class="ml-1.5 text-[9px] bg-white/20 px-1.5 py-0.5 rounded uppercase font-bold tracking-wider">Premium</span>
                </VButton>
            </div>
        </div>
      </VCard>
    </div>

    <!-- Upload Modal -->
    <VModal v-model:visible="showUploadModal" header="Importar Edital" :style="{ width: '500px' }" id="modal-import-edital" @close="showUploadModal = false">
      <div class="modal-body">
        <div v-if="uploadError" class="p-3 mb-2 bg-error/10 text-error rounded-lg text-sm flex items-start gap-2 font-medium">
            <i class="pi pi-exclamation-triangle mt-0.5"></i>
            <span>{{ uploadError }}</span>
        </div>

        <div class="modal-field">
            <label class="field-label">TÍTULO DO EDITAL <span style="color:var(--color-error)">*</span></label>
            <input v-model="newTitle" type="text"
                class="ds-input"
                placeholder="Ex: Polícia Federal 2024" required />
        </div>

        <div class="modal-field">
            <label class="field-label">DESCRIÇÃO (OPCIONAL)</label>
            <textarea v-model="newDescription" rows="2"
                class="ds-textarea"
                placeholder="Informações adicionais..."></textarea>
        </div>

        <div class="modal-field">
            <label class="field-label">FAIXA DE PÁGINAS DO CONTEÚDO (OPCIONAL)</label>
            <input v-model="newPageRange" type="text"
                class="ds-input"
                placeholder="Ex: 25-35 (Vazio = Edital Completo)" />
        </div>

        <div class="modal-field mt-2">
            <label class="field-label">ARQUIVO PDF <span style="color:var(--color-error)">*</span></label>
            <div class="file-input-wrapper">
                <input type="file" accept="application/pdf" @change="handleFileChange" class="hidden-file-input" id="pdf-upload" />
                <label for="pdf-upload" class="file-label" :class="{'has-file': selectedFile}">
                    <i class="pi" :class="selectedFile ? 'pi-file-pdf text-error' : 'pi-upload'"></i>
                    <div class="file-text">
                        <span class="file-name">{{ selectedFile ? selectedFile.name : 'Clique para selecionar o PDF' }}</span>
                        <span class="file-size" v-if="selectedFile">{{ formatBytes(selectedFile.size) }}</span>
                    </div>
                </label>
            </div>
            <p class="text-[10px] text-on-surface-muted mt-1.5 font-medium uppercase tracking-wider">
                Tamanho máximo: 5MB
            </p>
        </div>
      </div>

      <template #footer>
          <div class="modal-footer">
              <VButton variant="ghost" @click="showUploadModal = false" :disabled="createEdital.isPending.value">
                  Cancelar
              </VButton>
              <VButton @click="submitUpload" :disabled="createEdital.isPending.value || !selectedFile || !newTitle">
                  <i v-if="createEdital.isPending.value" class="pi pi-spin pi-spinner mr-2"></i>
                  Importar
              </VButton>
          </div>
      </template>
    </VModal>

    <!-- Modal de Visualização do PDF -->
    <VModal v-model:visible="showPreviewModal" header="Visualização de Edital" :style="{ width: '90vw', maxWidth: '1200px' }" id="modal-preview-edital" @close="closePreview">
        <div class="w-full overflow-hidden" style="height: calc(85vh - 160px);">
            <iframe v-if="previewUrl" :src="previewUrl" class="w-full h-full border-0 rounded-lg shadow-inner bg-surface-container-lowest" title="Visualizador de PDF"></iframe>
            <div v-else class="w-full h-full flex items-center justify-center">
                <VSpinner class="w-8 h-8 text-primary" />
            </div>
        </div>
        <template #footer>
            <div class="modal-footer">
                <VButton @click="closePreview" variant="ghost">Fechar</VButton>
                <a v-if="previewUrl" :href="previewUrl" target="_blank" class="inline-flex">
                    <VButton variant="secondary">
                        <i class="pi pi-external-link mr-2"></i>
                        Abrir em nova aba
                    </VButton>
                </a>
            </div>
        </template>
    </VModal>

    <!-- Modal de Confirmação e Aviso da Extração IA -->
    <VModal v-model:visible="showConfirmModal" header="Extração de Disciplinas com IA" :style="{ width: '450px' }" id="modal-confirm-extract" @close="showConfirmModal = false">
        <div class="modal-body text-left space-y-4">
            <!-- Passo 1: Aviso Importante -->
            <div v-if="modalStep === 1" class="space-y-4">
                <div class="flex items-center gap-3 text-primary mb-2">
                    <i class="pi pi-bolt text-2xl"></i>
                    <h3 class="font-bold text-lg text-on-surface">Iniciar Processamento?</h3>
                </div>
                
                <p class="text-sm text-on-surface leading-relaxed">
                    Você está prestes a iniciar a extração automática das disciplinas e assuntos contidos no edital <strong>{{ selectedEditalTitle }}</strong>.
                </p>

                <div class="p-4 rounded-2xl bg-warning/10 border border-warning/30 text-xs text-warning space-y-2 leading-relaxed">
                    <div class="flex gap-2 font-bold text-sm">
                        <i class="pi pi-exclamation-triangle mt-0.5 text-warning"></i>
                        <span>AVISO IMPORTANTE</span>
                    </div>
                    <p>
                        Dependendo do tamanho e formatação do edital, esse processo é pesado e <strong>pode demorar de 30 segundos a alguns minutos</strong>.
                    </p>
                    <p class="font-semibold text-on-surface">
                        A extração é baseada em inteligência artificial. Após a conclusão, o próprio usuário deve revisar o plano de estudos gerado, pois podem ocorrer falhas de mapeamento ou tópicos duplicados/omitidos.
                    </p>
                </div>
            </div>

            <!-- Passo 2: Seleção de Cargo -->
            <div v-if="modalStep === 2" class="space-y-4">
                <div class="flex items-center gap-3 text-primary mb-2">
                    <i class="pi pi-filter text-2xl"></i>
                    <h3 class="font-bold text-lg text-on-surface">Filtrar por Cargo</h3>
                </div>
                
                <p class="text-sm text-on-surface leading-relaxed">
                    Selecione o cargo pretendido para que a IA extraia apenas as matérias comuns e específicas deste cargo.
                </p>

                <div class="space-y-2 mt-4 text-left border-t border-outline-variant/15 pt-4">
                    <label class="field-label">Cargo Pretendido (Filtro IA)</label>
                    
                    <div v-if="loadingCargos" class="flex items-center gap-2 py-2 text-xs text-on-surface-muted font-medium">
                        <i class="pi pi-spin pi-spinner text-primary"></i>
                        <span>Analisando edital para listar cargos...</span>
                    </div>
                    <div v-else-if="cargosError" class="text-xs text-error font-medium py-1">
                        Não foi possível identificar a lista de cargos automaticamente. Você pode digitar abaixo ou extrair completo.
                    </div>
                    
                    <div v-if="!loadingCargos">
                        <!-- Dropdown de cargos extraídos se houver cargos -->
                        <select v-if="cargos.length > 0" v-model="selectedCargo" class="ds-input mb-3">
                            <option :value="null">-- Extrair tudo (sem filtrar por cargo) --</option>
                            <option v-for="cargo in cargos" :key="cargo" :value="cargo">{{ cargo }}</option>
                            <option value="custom">-- Outro cargo (digitar...) --</option>
                        </select>
                        
                        <!-- Fallback input text para cargo manual -->
                        <div v-if="cargos.length === 0 || selectedCargo === 'custom'" class="space-y-1">
                            <input v-model="customCargo" 
                                   type="text" 
                                   class="ds-input" 
                                   placeholder="Ex: Analista de TI, Soldado..." />
                            <p class="text-[10px] text-on-surface-muted">
                                Digite o cargo exatamente como consta no edital.
                            </p>
                        </div>
                    </div>
                </div>

                <p class="text-xs text-on-surface-muted mt-2">
                    A extração será executada em segundo plano. Você poderá continuar usando a plataforma normalmente.
                </p>
            </div>
        </div>

        <template #footer>
            <div class="modal-footer mt-4">
                <!-- Footer Passo 1 -->
                <template v-if="modalStep === 1">
                    <VButton variant="ghost" @click="showConfirmModal = false">
                        Cancelar
                    </VButton>
                    <VButton @click="modalStep = 2" class="bg-primary text-white hover:bg-primary-dark">
                        Continuar
                    </VButton>
                </template>
                
                <!-- Footer Passo 2 -->
                <template v-else-if="modalStep === 2">
                    <VButton variant="ghost" @click="modalStep = 1">
                        Voltar
                    </VButton>
                    <VButton @click="startExtractionProcess" class="bg-primary text-white hover:bg-primary-dark" :disabled="loadingCargos">
                        Iniciar Extração
                    </VButton>
                </template>
            </div>
        </template>
    </VModal>

    <!-- Modal do Upgrade Premium -->
    <VModal v-model:visible="showPremiumModal" header="Recurso Premium" :style="{ width: '420px' }" id="modal-premium-upgrade" @close="showPremiumModal = false">
        <div class="modal-body text-center py-4 space-y-4">
            <div class="w-16 h-16 rounded-full bg-primary/10 text-primary flex items-center justify-center mx-auto">
                <i class="pi pi-lock text-3xl"></i>
            </div>
            <div class="space-y-1">
                <h3 class="font-bold text-lg text-on-surface">Recurso Exclusivo do Plano Premium</h3>
                <p class="text-sm text-on-surface-muted leading-relaxed px-2">
                    A extração automática de disciplinas e assuntos a partir de editais em PDF está disponível apenas para usuários do plano Premium.
                </p>
            </div>
            
            <div class="p-3.5 rounded-2xl bg-surface-container-low border border-outline-variant/30 text-xs text-on-surface-muted leading-relaxed text-left space-y-1.5">
                <p class="font-bold text-on-surface flex items-center gap-1.5"><i class="pi pi-bolt text-primary"></i> Benefícios da Conta Premium:</p>
                <ul class="list-disc pl-4 space-y-1">
                    <li>Extração completa de Editais complexos</li>
                    <li>Sessão de Insights IA e Tutor de IA completo</li>
                    <li>Geração de tópicos inteligente no painel de disciplinas</li>
                </ul>
            </div>
        </div>

        <template #footer>
            <div class="modal-footer justify-center w-full mt-2">
                <VButton variant="ghost" @click="showPremiumModal = false" class="flex-1">
                    Voltar
                </VButton>
                <VButton @click="router.push('/private/plans')" class="bg-primary text-white hover:bg-primary-dark flex-1">
                    Assinar Premium
                </VButton>
            </div>
        </template>
    </VModal>

    <!-- Container de extrações em segundo plano (Floating bottom-right) -->
    <div v-if="activeExtractions.length > 0" class="fixed bottom-6 right-6 z-50 flex flex-col gap-4 max-w-sm w-full px-4 sm:px-0 animate-fade-in">
        <div v-for="job in activeExtractions" :key="job.id"
            class="bg-surface-container-high/95 backdrop-blur-md border border-outline-variant/30 rounded-2xl p-5 shadow-2xl transition-all duration-300 relative overflow-hidden"
            :style="{
                borderColor: job.status === 'running' ? 'var(--color-primary)' : (job.status === 'success' ? 'var(--color-success)' : 'var(--color-error)')
            }">
            
            <!-- Close Button (only shown when not running) -->
            <button v-if="job.status !== 'running'" @click="removeJob(job.id)"
                class="absolute top-4 right-4 text-on-surface-muted hover:text-on-surface transition-colors cursor-pointer border-0 bg-transparent p-0">
                <i class="pi pi-times"></i>
            </button>

            <!-- Card Header -->
            <div class="flex items-start gap-3 pr-6">
                <div class="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
                    :class="{
                        'bg-primary/10 text-primary': job.status === 'running',
                        'bg-success/10 text-success': job.status === 'success',
                        'bg-error/10 text-error': job.status === 'error'
                    }">
                    <i v-if="job.status === 'running'" class="pi pi-spin pi-spinner text-sm"></i>
                    <i v-else-if="job.status === 'success'" class="pi pi-check-circle text-sm"></i>
                    <i v-else-if="job.status === 'error'" class="pi pi-exclamation-triangle text-sm"></i>
                </div>
                <div class="flex-1 min-w-0 text-left">
                    <h4 class="font-bold text-xs text-on-surface truncate">{{ job.title }}</h4>
                    <p class="text-[10px] text-on-surface-muted mt-0.5">
                        <span v-if="job.status === 'running'">{{ job.errorMsg || 'Extraindo disciplinas com IA...' }}</span>
                        <span v-else-if="job.status === 'success'">Processo concluído com sucesso!</span>
                        <span v-else-if="job.status === 'error'">Falha no processamento.</span>
                    </p>
                </div>
            </div>

            <!-- Progress Bar & Stats -->
            <div class="mt-3.5 space-y-1.5">
                <div class="w-full h-1.5 bg-surface-container-low rounded-full overflow-hidden">
                    <div class="h-full transition-all duration-300 rounded-full"
                        :class="{
                            'bg-primary': job.status === 'running',
                            'bg-success': job.status === 'success',
                            'bg-error': job.status === 'error'
                        }"
                        :style="{ width: `${job.progress}%` }">
                    </div>
                </div>
                
                <div class="flex justify-between items-center text-[9px] font-medium text-on-surface-muted">
                    <span>{{ Math.round(job.progress) }}% completo</span>
                    <span v-if="job.status === 'success' && job.tokensSpent" class="bg-primary/5 text-primary px-1.5 py-0.5 rounded font-mono">
                        {{ job.tokensSpent }} tokens
                    </span>
                </div>
            </div>

            <!-- Warnings / Feedback -->
            <div v-if="job.status === 'running'" class="mt-3 p-2.5 rounded-xl bg-primary/5 border border-primary/10 text-[10px] text-primary/95 leading-relaxed text-left flex gap-2">
                <i class="pi pi-info-circle mt-0.5 flex-shrink-0"></i>
                <span>A extração está rodando em segundo plano. Você pode continuar navegando pela plataforma.</span>
            </div>

            <div v-if="job.status === 'success'" class="mt-3 space-y-2.5">
                <div class="p-2.5 rounded-xl bg-success/5 border border-success/10 text-[10px] text-success leading-relaxed text-left flex gap-1.5">
                    <i class="pi pi-check mt-0.5 flex-shrink-0"></i>
                    <div>
                        Foram criadas <strong>{{ job.disciplinesCreated }} disciplinas</strong> e <strong>{{ job.topicsCreated }} tópicos</strong>.
                    </div>
                </div>
                
                <!-- REQUIRED: Warning about manual check and potential failure -->
                <div class="p-2.5 rounded-xl bg-warning/10 border border-warning/20 text-[10px] text-warning leading-relaxed text-left flex gap-1.5">
                    <i class="pi pi-exclamation-triangle mt-0.5 flex-shrink-0 text-warning"></i>
                    <span>
                        <strong>Atenção:</strong> Como a extração foi feita por IA, revise atentamente a grade gerada no seu plano de estudo, pois podem ter ocorrido falhas ou omissões.
                    </span>
                </div>
                
                <div class="flex gap-2">
                    <VButton @click="goToDisciplines" class="w-full text-[10px] py-1.5 bg-success text-white hover:bg-success-dark">
                        <i class="pi pi-arrow-right mr-1 text-[9px]"></i>
                        Ver Disciplinas
                    </VButton>
                    <VButton @click="removeJob(job.id)" variant="ghost" class="text-[10px] py-1.5">
                        Fechar
                    </VButton>
                </div>
            </div>

            <div v-if="job.status === 'error'" class="mt-3 space-y-2.5">
                <div class="p-2.5 rounded-xl bg-error/5 border border-error/10 text-[10px] text-error leading-relaxed text-left flex gap-1.5">
                    <i class="pi pi-times-circle mt-0.5 flex-shrink-0"></i>
                    <span>{{ job.errorMsg || 'Ocorreu um erro inesperado durante a análise do edital.' }}</span>
                </div>
                <div class="flex gap-2">
                    <VButton @click="retryJob(job.id)" class="w-full text-[10px] py-1.5 bg-error text-white hover:bg-error-dark">
                        <i class="pi pi-refresh mr-1 text-[9px]"></i>
                        Tentar Novamente
                    </VButton>
                    <VButton @click="removeJob(job.id)" variant="ghost" class="text-[10px] py-1.5">
                        Fechar
                    </VButton>
                </div>
            </div>
        </div>
    </div>
  </div>
</template>

<style scoped>
.animate-fade-in {
  animation: fadeIn 0.4s ease-out;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(8px); }
  to { opacity: 1; transform: translateY(0); }
}

.view-header {
    margin-bottom: 2rem;
}

/* Card */
.edital-card {
    min-height: 200px;
    box-sizing: border-box;
}

.edital-card:hover {
    box-shadow: 0 8px 24px color-mix(in srgb, var(--color-primary) 4%, transparent);
    transform: translateY(-2px);
}

/* Modal form elements */
.modal-body {
    display: flex;
    flex-direction: column;
    gap: 1.25rem;
    padding: 0.5rem 0;
    text-align: left;
}

.modal-field {
    display: flex;
    flex-direction: column;
}

.field-label {
    display: block;
    font-size: 0.625rem;
    font-weight: 800;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    color: var(--color-outline);
    margin-bottom: 0.35rem;
}

.ds-input, .ds-textarea {
    width: 100%;
    padding: 0.55rem 0.85rem;
    border-radius: 0.75rem;
    border: 1px solid color-mix(in srgb, var(--color-on-surface) 12%, transparent);
    background: var(--color-surface-container-low);
    color: var(--color-on-surface);
    font-family: inherit;
    font-size: 0.85rem;
    outline: none;
    transition: all 0.2s ease;
    box-sizing: border-box;
}

.ds-textarea {
    resize: vertical;
}

.ds-input:focus, .ds-textarea:focus {
    border-color: var(--color-primary);
    background: var(--color-surface-container-lowest);
    box-shadow: 0 0 0 3px color-mix(in srgb, var(--color-primary) 15%, transparent);
}

.modal-footer {
    display: flex;
    justify-content: flex-end;
    gap: 0.75rem;
    padding-top: 0.5rem;
}

/* Custom File Input */
.file-input-wrapper {
    position: relative;
    width: 100%;
}

.hidden-file-input {
    width: 0.1px;
    height: 0.1px;
    opacity: 0;
    overflow: hidden;
    position: absolute;
    z-index: -1;
}

.file-label {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 0.75rem 1rem;
    background: var(--color-surface-container-low);
    border: 1px dashed color-mix(in srgb, var(--color-on-surface) 20%, transparent);
    border-radius: 0.75rem;
    cursor: pointer;
    transition: all 0.2s ease;
}

.file-label:hover {
    background: color-mix(in srgb, var(--color-primary) 5%, var(--color-surface-container-low));
    border-color: color-mix(in srgb, var(--color-primary) 40%, transparent);
}

.file-label.has-file {
    border-style: solid;
    border-color: color-mix(in srgb, var(--color-primary) 30%, transparent);
    background: color-mix(in srgb, var(--color-primary) 2%, var(--color-surface-container-lowest));
}

.file-label .pi {
    font-size: 1.25rem;
    color: var(--color-on-surface-muted);
}

.file-text {
    display: flex;
    flex-direction: column;
    flex: 1;
    min-width: 0;
}

.file-name {
    font-size: 0.85rem;
    font-weight: 600;
    color: var(--color-on-surface);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.file-size {
    font-size: 0.7rem;
    font-weight: 500;
    color: var(--color-on-surface-muted);
}
</style>
