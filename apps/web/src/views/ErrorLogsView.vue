<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { VCard, VButton, VSpinner, VModal } from '../components/ui'
import { useDisciplinesQuery, useTopicsQuery } from '../hooks/useDisciplines'
import {
    useErrorLogsQuery, useCreateErrorLogMutation,
    useUpdateErrorLogMutation, useDeleteErrorLogMutation,
    DIAGNOSTICO_OPTIONS, type ErrorLog, type DiagnosticoType
} from '../hooks/useErrorLogs'

// ─── Filtros ──────────────────────────────────────────────────────────────────
const filterDisciplineId = ref<number | null>(null)
const filterTopicId      = ref<number | null>(null)
const filterStatus       = ref<'all' | 'pending' | 'resolved'>('all')

const filters = computed(() => ({
    disciplineId: filterDisciplineId.value ?? undefined,
    topicId:      filterTopicId.value      ?? undefined,
}))

watch(filterDisciplineId, () => { filterTopicId.value = null })

// ─── Queries ──────────────────────────────────────────────────────────────────
const disciplinesQuery = useDisciplinesQuery()
const disciplines      = computed(() => disciplinesQuery.data.value || [])
const filterTopicsQ    = useTopicsQuery(filterDisciplineId)
const filterTopics     = computed(() => filterTopicsQ.data.value || [])

const logsQuery = useErrorLogsQuery(filters)
const allLogs   = computed(() => logsQuery.data.value || [])
const isLoading = computed(() => logsQuery.isLoading.value)

const visibleLogs = computed(() => {
    if (filterStatus.value === 'pending')  return allLogs.value.filter(l => !l.isResolved)
    if (filterStatus.value === 'resolved') return allLogs.value.filter(l =>  l.isResolved)
    return allLogs.value
})

const totalCount    = computed(() => allLogs.value.length)
const resolvedCount = computed(() => allLogs.value.filter(l => l.isResolved).length)
const pendingCount  = computed(() => totalCount.value - resolvedCount.value)

// ─── Mutations ────────────────────────────────────────────────────────────────
const createMutation = useCreateErrorLogMutation()
const updateMutation = useUpdateErrorLogMutation()
const deleteMutation = useDeleteErrorLogMutation()

// ─── Modal de Criação ─────────────────────────────────────────────────────────
const showModal        = ref(false)
const formDisciplineId = ref<number | null>(null)
const formTopicId      = ref<number | null>(null)
const formTopicText    = ref('')
const formFonte        = ref('')
const formDiagnostico  = ref<DiagnosticoType | null>(null)
const formAnalise      = ref('')
const formCorrecao     = ref('')

watch(formDisciplineId, () => { formTopicId.value = null })

const formTopicsQ   = useTopicsQuery(formDisciplineId)
const formTopics    = computed(() => formTopicsQ.data.value || [])
const isFormValid   = computed(() => formAnalise.value.trim().length > 0)

function openModal() { showModal.value = true }
function resetForm() {
    formDisciplineId.value = null; formTopicId.value = null
    formTopicText.value = ''; formFonte.value = ''
    formDiagnostico.value = null; formAnalise.value = ''; formCorrecao.value = ''
    showModal.value = false
}

async function saveLog() {
    if (!isFormValid.value) return
    await createMutation.mutateAsync({
        analise:     formAnalise.value.trim(),
        correcao:    formCorrecao.value.trim()  || undefined,
        fonte:       formFonte.value.trim()     || undefined,
        diagnostico: formDiagnostico.value      || undefined,
        topicText:   formTopicText.value.trim() || undefined,
        topicId:     formTopicId.value          || undefined,
    })
    resetForm()
}

// ─── Edição inline ────────────────────────────────────────────────────────────
const editingId      = ref<number | null>(null)
const editAnalise    = ref('')
const editCorrecao   = ref('')

function startEdit(log: ErrorLog) {
    editingId.value  = log.id
    editAnalise.value  = log.analise
    editCorrecao.value = log.correcao || ''
}
function cancelEdit() { editingId.value = null }
async function saveEdit(id: number) {
    await updateMutation.mutateAsync({ id, analise: editAnalise.value.trim(), correcao: editCorrecao.value.trim() || undefined })
    cancelEdit()
}

async function toggleResolved(log: ErrorLog) {
    await updateMutation.mutateAsync({ id: log.id, isResolved: !log.isResolved })
}
async function deleteLog(id: number) { await deleteMutation.mutateAsync(id) }

// ─── Helpers ──────────────────────────────────────────────────────────────────
const DIAGNOSTICO_COLOR: Record<string, { bg: string; text: string }> = {
    'Lacuna Teórica':  { bg: '#3b82f615', text: '#3b82f6' },
    'Falta de Atenção':{ bg: '#f9731615', text: '#f97316' },
    'Interpretação':   { bg: '#a855f715', text: '#a855f7' },
    'Pegadinha':       { bg: '#ec489915', text: '#ec4899' },
    'Falta de Tempo':  { bg: '#eab30815', text: '#eab308' },
}

function diagColor(d: string | null) {
    return d && DIAGNOSTICO_COLOR[d] ? DIAGNOSTICO_COLOR[d] : { bg: 'var(--surface-container-high)', text: 'var(--secondary)' }
}

function formatDate(s: string) {
    return new Date(s).toLocaleDateString('pt-BR', { day:'2-digit', month:'short', year:'numeric' })
}

function topicLabel(log: ErrorLog) {
    return log.topicText || log.topic?.name || null
}
function disciplineOf(log: ErrorLog) {
    return log.topic?.discipline || null
}
</script>

<template>
  <div class="p-8 max-w-7xl mx-auto space-y-8 animate-fade-in pb-12">

    <!-- ─── Header ───────────────────────────────────────────────────── -->
    <header class="view-header flex flex-col md:flex-row md:items-end justify-between gap-6">
      <div class="space-y-2">
        <p class="font-label text-xs uppercase tracking-[0.2em] text-primary font-bold">Mapeamento</p>
        <h2 class="text-4xl md:text-5xl font-headline font-bold text-on-surface tracking-tight text-left">
          Caderno de Erros
        </h2>
        <p class="text-on-surface-muted max-w-xl text-sm leading-relaxed text-left">
          Registre e analise as suas falhas em questões para fixar o aprendizado e evitar reincidências.
        </p>
      </div>
      <div class="flex gap-3">
        <VButton id="btn-novo-erro" @click="openModal" variant="primary">
          <i class="pi pi-plus mr-2 text-xs"></i>
          Registrar Erro
        </VButton>
      </div>
    </header>

    <!-- ─── Stats & Filtros Row ──────────────────────────────────────── -->
    <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-6 border-b border-outline-variant/20 pb-6">
      <!-- Stats -->
      <div class="elv-stats flex flex-wrap gap-2.5">
          <button class="stat-pill" :class="{ active: filterStatus==='all' }"     @click="filterStatus='all'">
              <i class="pi pi-list mr-1.5 text-xs"></i>
              {{ totalCount }} total
          </button>
          <button class="stat-pill stat-pill--pending"  :class="{ active: filterStatus==='pending' }"  @click="filterStatus='pending'">
              <i class="pi pi-clock mr-1.5 text-xs"></i>
              {{ pendingCount }} pendentes
          </button>
          <button class="stat-pill stat-pill--resolved" :class="{ active: filterStatus==='resolved' }" @click="filterStatus='resolved'">
              <i class="pi pi-check-circle mr-1.5 text-xs"></i>
              {{ resolvedCount }} resolvidos
          </button>
      </div>

      <!-- Filtros -->
      <div class="elv-filters flex flex-wrap items-center gap-2.5">
          <select id="filter-disc" v-model="filterDisciplineId" class="ds-native-select">
              <option :value="null">Todas as disciplinas</option>
              <option v-for="d in disciplines" :key="d.id" :value="d.id">{{ d.name }}</option>
          </select>
          <select id="filter-topic" v-model="filterTopicId" class="ds-native-select" :disabled="!filterDisciplineId">
              <option :value="null">Todos os tópicos</option>
              <option v-for="t in filterTopics" :key="t.id" :value="t.id">{{ t.name }}</option>
          </select>
          <button v-if="filterDisciplineId || filterTopicId" id="btn-clear-filters" class="clear-btn"
              @click="filterDisciplineId=null; filterTopicId=null">
              <i class="pi pi-times mr-1 text-[10px]"></i> Limpar
          </button>
      </div>
    </div>

    <!-- ─── Loading ──────────────────────────────────────────────────── -->
    <VSpinner v-if="isLoading" class="h-64" />

    <!-- ─── Empty ────────────────────────────────────────────────────── -->
    <div v-else-if="!visibleLogs.length" class="elv-empty">
        <i class="pi pi-book elv-empty-icon"></i>
        <h3>{{ allLogs.length ? 'Nenhum erro neste filtro' : 'Caderno vazio' }}</h3>
        <p>{{ allLogs.length ? 'Ajuste os filtros ou registre um novo erro.' : 'Registre questões que você errou para revisá-las depois.' }}</p>
        <VButton v-if="!allLogs.length" class="mt-4" @click="openModal">Registrar primeiro erro</VButton>
    </div>

    <!-- ─── Grid de Cards ────────────────────────────────────────────── -->
    <div v-else class="elv-list">
        <div v-for="log in visibleLogs" :key="log.id"
            class="err-card flex flex-col justify-between" :class="{ 'err-card--resolved': log.isResolved }">

            <div class="err-card-body flex-1 flex flex-col">
                <!-- Topo do card: badges + ações -->
                <div class="err-card-top flex justify-between items-start gap-4 mb-3">
                    <div class="err-badges flex flex-wrap gap-1.5 items-center">
                        <!-- Disciplina -->
                        <span v-if="disciplineOf(log)" class="badge-disc"
                            :style="{ background: disciplineOf(log)!.color+'15', color: disciplineOf(log)!.color, borderColor: disciplineOf(log)!.color+'33' }">
                            {{ disciplineOf(log)!.name }}
                        </span>
                        <!-- Diagnóstico -->
                        <span v-if="log.diagnostico" class="badge-diag"
                            :style="{ background: diagColor(log.diagnostico).bg, color: diagColor(log.diagnostico).text }">
                            {{ log.diagnostico }}
                        </span>
                    </div>
                    <div class="err-actions flex gap-1">
                        <button class="icon-btn" :id="`btn-edit-${log.id}`"
                            @click="editingId === log.id ? cancelEdit() : startEdit(log)" title="Editar">
                            <i :class="editingId===log.id ? 'pi pi-times' : 'pi pi-pencil'"></i>
                        </button>
                        <button class="icon-btn icon-btn--del" :id="`btn-del-${log.id}`"
                            @click="deleteLog(log.id)" title="Excluir">
                            <i class="pi pi-trash"></i>
                        </button>
                    </div>
                </div>

                <!-- Tópico e Fonte em linha compacta -->
                <div v-if="topicLabel(log) || (log.fonte && editingId !== log.id)" class="flex flex-wrap gap-2 mb-3">
                    <span v-if="topicLabel(log)" class="badge-topic">
                        <i class="pi pi-tag text-[9px] mr-1"></i>
                        {{ topicLabel(log) }}
                    </span>
                    <span v-if="log.fonte && editingId !== log.id" class="badge-fonte">
                        <i class="pi pi-database text-[9px] mr-1"></i>
                        {{ log.fonte }}
                    </span>
                </div>

                <!-- Modo edição -->
                <div v-if="editingId === log.id" class="err-edit-area flex-1 flex flex-col gap-2.5">
                    <div class="flex-1">
                        <label class="field-label field-label--red">POR QUE EU ERREI? (ANÁLISE)</label>
                        <textarea :id="`edit-analise-${log.id}`" v-model="editAnalise" class="ds-textarea min-h-[60px]" rows="2" />
                    </div>
                    <div>
                        <label class="field-label field-label--green">RESUMO DA CORREÇÃO (PULO DO GATO)</label>
                        <textarea :id="`edit-correcao-${log.id}`" v-model="editCorrecao" class="ds-textarea min-h-[50px]" rows="2" />
                    </div>
                    <div class="err-edit-actions">
                        <VButton variant="ghost" class="btn-sm" @click="cancelEdit">Cancelar</VButton>
                        <VButton :id="`btn-save-${log.id}`" class="btn-sm" @click="saveEdit(log.id)">Salvar</VButton>
                    </div>
                </div>

                <!-- Modo leitura -->
                <template v-else>
                    <div class="err-section flex-1 text-left">
                        <span class="err-section-label err-section-label--red">
                            <i class="pi pi-question-circle mr-1"></i>
                            POR QUE EU ERREI?
                        </span>
                        <p class="err-text" :class="{ 'err-text--resolved': log.isResolved }">{{ log.analise }}</p>
                    </div>
                    <div v-if="log.correcao" class="err-section border-t border-outline-variant/10 pt-3 mt-3 text-left">
                        <span class="err-section-label err-section-label--green">
                            <i class="pi pi-lightbulb mr-1"></i>
                            PULO DO GATO
                        </span>
                        <p class="err-text font-serif italic text-sm">{{ log.correcao }}</p>
                    </div>
                </template>
            </div>

            <!-- Rodapé -->
            <div class="err-footer">
                <span class="err-date">{{ formatDate(log.createdAt) }}</span>
                <button class="resolve-btn" :class="{ 'resolve-btn--on': log.isResolved }"
                    :id="`btn-resolve-${log.id}`" @click="toggleResolved(log)"
                    :disabled="updateMutation.isPending.value">
                    <i :class="log.isResolved ? 'pi pi-check-circle mr-1' : 'pi pi-circle mr-1'"></i>
                    {{ log.isResolved ? 'Resolvido' : 'Resolver' }}
                </button>
            </div>
        </div>
    </div>

    <!-- ─── Modal de Criação ──────────────────────────────────────────── -->
    <VModal v-model:visible="showModal" header="Registrar Novo Erro" :style="{ width: '580px' }" id="modal-novo-erro">
        <div class="modal-body">

            <!-- Linha 1 -->
            <div class="modal-row">
                <div class="modal-field">
                    <label class="field-label">DISCIPLINA</label>
                    <select id="modal-disc" v-model="formDisciplineId" class="ds-native-select w-full">
                        <option :value="null">Selecione...</option>
                        <option v-for="d in disciplines" :key="d.id" :value="d.id">{{ d.name }}</option>
                    </select>
                </div>
                <div class="modal-field">
                    <label class="field-label">TÓPICO / ASSUNTO</label>
                    <input id="modal-topic-text" v-model="formTopicText"
                        class="ds-input" placeholder="Ex: Crase" />
                </div>
            </div>

            <!-- Linha 2 -->
            <div class="modal-row">
                <div class="modal-field">
                    <label class="field-label">FONTE DA QUESTÃO</label>
                    <input id="modal-fonte" v-model="formFonte"
                        class="ds-input" placeholder="Ex: CESPE 2024 - Polícia Federal" />
                </div>
                <div class="modal-field">
                    <label class="field-label">DIAGNÓSTICO DO ERRO</label>
                    <select id="modal-diag" v-model="formDiagnostico" class="ds-native-select w-full">
                        <option :value="null">Selecione...</option>
                        <option v-for="opt in DIAGNOSTICO_OPTIONS" :key="opt" :value="opt">{{ opt }}</option>
                    </select>
                </div>
            </div>

            <!-- Análise -->
            <div class="modal-field" style="margin-top:.25rem">
                <label class="field-label field-label--red">POR QUE EU ERREI? (ANÁLISE) <span style="color:var(--error)">*</span></label>
                <textarea id="modal-analise" v-model="formAnalise" class="ds-textarea"
                    placeholder="Ex: Achei que era caso facultativo, mas era obrigatório..." rows="3" />
            </div>

            <!-- Correção -->
            <div class="modal-field">
                <label class="field-label field-label--green">RESUMO DA CORREÇÃO (PULO DO GATO)</label>
                <textarea id="modal-correcao" v-model="formCorrecao" class="ds-textarea"
                    placeholder="Ex: Diante de pronome possessivo feminino, a crase é facultativa." rows="3" />
            </div>
        </div>

        <template #footer>
            <div class="modal-footer">
                <VButton variant="ghost" @click="resetForm">Cancelar</VButton>
                <VButton id="btn-salvar-caderno"
                    :disabled="!isFormValid || createMutation.isPending.value"
                    @click="saveLog">
                    Salvar no Caderno
                </VButton>
            </div>
        </template>
    </VModal>

  </div>
</template>

<style scoped>
/* ── Page Layout ──────────────────────────────────────────────── */
.view-header {
    margin-bottom: 2rem;
}

/* Stats & Filtros row */
.elv-stats, .elv-filters {
    margin-bottom: 0;
}

.stat-pill {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.45rem 1rem;
    border-radius: 999px;
    font-size: 0.78rem;
    font-weight: 700;
    cursor: pointer;
    background: var(--color-surface-container-low);
    color: var(--color-on-surface-muted);
    border: 1px solid color-mix(in srgb, var(--color-on-surface) 8%, transparent);
    transition: all 0.2s ease;
}

.stat-pill:hover {
    background: var(--color-surface-container-high);
    color: var(--color-on-surface);
}

.stat-pill.active {
    background: var(--color-primary-container);
    color: var(--color-on-primary-container);
    border-color: color-mix(in srgb, var(--color-primary) 30%, transparent);
}

.stat-pill--pending.active {
    background: color-mix(in srgb, var(--color-warning) 12%, transparent);
    color: var(--color-warning);
    border-color: color-mix(in srgb, var(--color-warning) 30%, transparent);
}

.stat-pill--resolved.active {
    background: color-mix(in srgb, var(--color-success) 12%, transparent);
    color: var(--color-success);
    border-color: color-mix(in srgb, var(--color-success) 30%, transparent);
}

/* Filtros */
.ds-native-select, .ds-input {
    padding: 0.45rem 0.85rem;
    border-radius: 0.75rem;
    border: 1px solid color-mix(in srgb, var(--color-on-surface) 8%, transparent);
    background: var(--color-surface-container-low);
    color: var(--color-on-surface);
    font-family: inherit;
    font-size: 0.8rem;
    font-weight: 600;
    outline: none;
    transition: all 0.2s ease;
    min-width: 170px;
}

.ds-native-select:focus, .ds-input:focus {
    border-color: var(--color-primary);
    background: var(--color-surface-container-lowest);
    box-shadow: 0 0 0 3px color-mix(in srgb, var(--color-primary) 15%, transparent);
}

.ds-native-select:disabled {
    opacity: 0.5;
    cursor: not-allowed;
}

.w-full {
    width: 100%;
    min-width: unset;
}

.clear-btn {
    display: flex;
    align-items: center;
    gap: 0.25rem;
    font-size: 0.78rem;
    font-weight: 700;
    color: var(--color-outline);
    background: none;
    border: none;
    cursor: pointer;
    padding: 0.35rem 0.65rem;
    border-radius: 0.5rem;
    transition: background 0.15s;
}

.clear-btn:hover {
    background: var(--color-surface-container-high);
    color: var(--color-on-surface);
}

/* Empty State */
.elv-empty {
    text-align: center;
    padding: 5rem 2rem;
    border: 1px dashed color-mix(in srgb, var(--color-on-surface) 12%, transparent);
    border-radius: 1.5rem;
    background: color-mix(in srgb, var(--color-surface-container-low) 30%, transparent);
    backdrop-filter: blur(4px);
}

.elv-empty-icon {
    font-size: 3rem;
    color: var(--color-outline-variant);
    display: block;
    margin-bottom: 1.25rem;
}

.elv-empty h3 {
    font-family: var(--font-family-serif);
    font-size: 1.35rem;
    font-weight: 700;
    color: var(--color-on-surface);
    margin: 0 0 0.5rem;
}

.elv-empty p {
    color: var(--color-on-surface-muted);
    font-size: 0.875rem;
    max-width: 380px;
    margin-inline: auto;
    line-height: 1.6;
}

.mt-4 {
    margin-top: 1rem;
}

/* Lista Grid */
.elv-list {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(330px, 1fr));
    gap: 1.25rem;
}

@media (max-width: 640px) {
    .elv-list {
        grid-template-columns: 1fr;
    }
}

/* Card */
.err-card {
    padding: 1.15rem;
    border: 1px solid color-mix(in srgb, var(--color-on-surface) 8%, transparent);
    background: var(--color-surface-container-lowest);
    border-radius: 1rem;
    min-height: 240px; /* Garante altura harmoniosa e alinhada */
    box-sizing: border-box;
    transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
}

.err-card:hover {
    border-color: color-mix(in srgb, var(--color-primary) 30%, transparent);
    box-shadow: 0 8px 24px color-mix(in srgb, var(--color-primary) 6%, transparent);
    transform: translateY(-2px);
}

.err-card--resolved {
    opacity: 0.75;
    background: color-mix(in srgb, var(--color-success) 0.5%, var(--color-surface-container-lowest));
    border-color: color-mix(in srgb, var(--color-success) 15%, transparent);
}

.err-card-top {
    margin-bottom: 0.75rem;
}

.badge-disc {
    font-size: 0.625rem;
    font-weight: 800;
    padding: 0.2rem 0.65rem;
    border-radius: 999px;
    border: 1px solid;
    letter-spacing: 0.05em;
    text-transform: uppercase;
}

.badge-topic {
    display: inline-flex;
    align-items: center;
    font-size: 0.7rem;
    font-weight: 700;
    color: var(--color-outline);
    background: var(--color-surface-container-low);
    border: 1px solid color-mix(in srgb, var(--color-on-surface) 5%, transparent);
    padding: 0.15rem 0.55rem;
    border-radius: 6px;
}

.badge-fonte {
    display: inline-flex;
    align-items: center;
    font-size: 0.7rem;
    font-weight: 600;
    color: var(--color-outline);
    background: var(--color-surface-container-low);
    border: 1px solid color-mix(in srgb, var(--color-on-surface) 5%, transparent);
    padding: 0.15rem 0.55rem;
    border-radius: 6px;
}

.badge-diag {
    font-size: 0.625rem;
    font-weight: 800;
    padding: 0.2rem 0.65rem;
    border-radius: 999px;
    letter-spacing: 0.04em;
    text-transform: uppercase;
}

.icon-btn {
    width: 28px;
    height: 28px;
    display: flex;
    align-items: center;
    justify-content: center;
    border: none;
    border-radius: 6px;
    background: none;
    cursor: pointer;
    color: var(--color-on-surface-muted);
    transition: all 0.15s ease;
}

.icon-btn:hover {
    background: var(--color-surface-container-high);
    color: var(--color-on-surface);
}

.icon-btn--del:hover {
    background: color-mix(in srgb, var(--color-error) 15%, transparent);
    color: var(--color-error);
}

.icon-btn .pi {
    font-size: 0.75rem;
}

/* Seções Internas do Card */
.err-section {
    margin-bottom: 0;
}

.err-section-label {
    display: flex;
    align-items: center;
    gap: 0.25rem;
    font-size: 0.625rem;
    font-weight: 850;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    margin-bottom: 0.25rem;
}

.err-section-label .pi {
    font-size: 0.7rem;
}

.err-section-label--red {
    color: color-mix(in srgb, var(--color-error) 75%, white);
}

.err-section-label--green {
    color: var(--color-success);
}

.err-text {
    font-size: 0.85rem;
    color: var(--color-on-surface);
    line-height: 1.6;
    margin: 0;
    word-break: break-word;
}

.err-text--resolved {
    text-decoration: line-through;
    color: var(--color-on-surface-muted);
    opacity: 0.75;
}

/* Edit area */
.err-edit-area {
    margin-bottom: 0.5rem;
}

.btn-sm {
    padding: 0.35rem 0.75rem !important;
    font-size: 0.75rem !important;
    min-height: 32px !important;
}

.err-edit-actions {
    display: flex;
    justify-content: flex-end;
    gap: 0.4rem;
    margin-top: 0.5rem;
}

/* Footer */
.err-footer {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding-top: 0.75rem;
    border-top: 1px solid color-mix(in srgb, var(--color-on-surface) 6%, transparent);
    flex-wrap: wrap;
    gap: 0.5rem;
    margin-top: 0.875rem;
}

.err-date {
    font-size: 0.72rem;
    font-weight: 500;
    color: var(--color-outline);
}

.resolve-btn {
    display: flex;
    align-items: center;
    gap: 0.3rem;
    padding: 0.3rem 0.75rem;
    border-radius: 6px;
    border: 1px solid color-mix(in srgb, var(--color-on-surface) 8%, transparent);
    background: none;
    cursor: pointer;
    font-size: 0.75rem;
    font-weight: 700;
    color: var(--color-on-surface-muted);
    transition: all 0.2s ease;
}

.resolve-btn:hover:not(:disabled) {
    background: color-mix(in srgb, var(--color-success) 10%, transparent);
    border-color: var(--color-success);
    color: var(--color-success);
}

.resolve-btn--on {
    background: color-mix(in srgb, var(--color-success) 10%, transparent) !important;
    border-color: var(--color-success) !important;
    color: var(--color-success) !important;
}

.resolve-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
}

.resolve-btn .pi {
    font-size: 0.75rem;
}

/* Textarea */
.ds-textarea {
    width: 100%;
    padding: 0.5rem 0.75rem;
    border-radius: 0.5rem;
    border: 1px solid color-mix(in srgb, var(--color-on-surface) 8%, transparent);
    background: var(--color-surface-container-low);
    color: var(--color-on-surface);
    font-family: inherit;
    font-size: 0.85rem;
    line-height: 1.5;
    resize: vertical;
    outline: none;
    transition: all 0.2s ease;
    box-sizing: border-box;
}

.ds-textarea:focus {
    border-color: var(--color-primary);
    background: var(--color-surface-container-lowest);
    box-shadow: 0 0 0 2px color-mix(in srgb, var(--color-primary) 15%, transparent);
}

/* Labels */
.field-label {
    display: block;
    font-size: 0.625rem;
    font-weight: 800;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    color: var(--color-outline);
    margin-bottom: 0.25rem;
}

.field-label--red {
    color: color-mix(in srgb, var(--color-error) 75%, white);
}

.field-label--green {
    color: var(--color-success);
}

/* Modal body */
.modal-body {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    padding: 0.25rem 0;
    text-align: left;
}

.modal-row {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1rem;
}

@media (max-width: 560px) {
    .modal-row {
        grid-template-columns: 1fr;
    }
}

.modal-field {
    display: flex;
    flex-direction: column;
}

.modal-footer {
    display: flex;
    justify-content: flex-end;
    gap: 0.75rem;
    padding-top: 0.5rem;
}
</style>
