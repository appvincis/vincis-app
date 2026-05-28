<script setup lang="ts">
import { ref, computed } from 'vue'
import { VCard, VButton, VSpinner, VModal } from '../components/ui'
import {
    useEditaisQuery,
    useCreateEditalMutation,
    useDeleteEditalMutation,
    useEditalSignedUrlMutation,
    type Edital
} from '../hooks/useEditais'

const { data: editais, isLoading, isError, refetch } = useEditaisQuery()
const createEdital = useCreateEditalMutation()
const deleteEdital = useDeleteEditalMutation()
const getSignedUrl = useEditalSignedUrlMutation()

// ─── Modal Upload ─────────────────────────────────────────────────────────────
const showUploadModal = ref(false)
const newTitle = ref('')
const newDescription = ref('')
const selectedFile = ref<File | null>(null)
const uploadError = ref('')

const handleFileChange = (e: Event) => {
    const target = e.target as HTMLInputElement
    if (target.files && target.files.length > 0) {
        const file = target.files[0]
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
    formData.append('file', selectedFile.value)

    createEdital.mutate(formData, {
        onSuccess: () => {
            showUploadModal.value = false
            newTitle.value = ''
            newDescription.value = ''
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

const handleView = async (id: number) => {
    try {
        viewingId.value = id
        const url = await getSignedUrl.mutateAsync(id)
        if (url) {
            window.open(url, '_blank')
        }
    } catch (e) {
        alert('Erro ao abrir o edital. Ele pode ter sido removido ou não está acessível.')
    } finally {
        viewingId.value = null
    }
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

        <div class="mt-auto pt-4 flex flex-col gap-3 border-t border-outline-variant/10">
            <div class="flex justify-between items-center text-xs font-medium text-on-surface-muted">
                <span class="flex items-center gap-1.5"><i class="pi pi-calendar text-[10px]"></i> {{ formatDate(edital.createdAt) }}</span>
                <span class="flex items-center gap-1.5"><i class="pi pi-database text-[10px]"></i> {{ formatBytes(edital.fileSize) }}</span>
            </div>

            <div class="flex gap-2 w-full mt-2">
                <VButton class="flex-1 text-on-surface border border-outline-variant/30 bg-surface-container-low hover:bg-surface-container-high py-2"
                    :disabled="viewingId === edital.id"
                    @click="handleView(edital.id)">
                    <i v-if="viewingId === edital.id" class="pi pi-spin pi-spinner mr-2 text-xs"></i>
                    <i v-else class="pi pi-external-link mr-2 text-xs"></i>
                    Visualizar
                </VButton>
                
                <button class="w-10 flex-shrink-0 rounded-xl flex items-center justify-center transition-colors text-on-surface-muted hover:bg-error/10 hover:text-error"
                    :disabled="deleteEdital.isPending.value"
                    @click="handleDelete(edital.id)"
                    title="Excluir Edital">
                    <i class="pi pi-trash"></i>
                </button>
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
