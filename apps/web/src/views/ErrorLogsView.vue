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
    'Lacuna Teórica':  { bg: '#3b82f620', text: '#60a5fa' },
    'Falta de Atenção':{ bg: '#f9731620', text: '#fb923c' },
    'Interpretação':   { bg: '#a855f720', text: '#c084fc' },
    'Pegadinha':       { bg: '#ec489920', text: '#f472b6' },
    'Falta de Tempo':  { bg: '#eab30820', text: '#fbbf24' },
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
    <div class="elv">

        <!-- ─── Header ───────────────────────────────────────────────────── -->
        <div class="elv-header">
            <div class="elv-title-group">
                <span class="material-symbols-outlined elv-header-icon">edit_note</span>
                <div>
                    <h1 class="elv-title">Caderno de Erros</h1>
                    <p class="elv-subtitle">Registre e revise questões que você errou</p>
                </div>
            </div>
            <VButton id="btn-novo-erro" @click="openModal">
                <span class="material-symbols-outlined" style="font-size:1.1rem;vertical-align:middle;margin-right:4px">add</span>
                Registrar Erro
            </VButton>
        </div>

        <!-- ─── Stats ────────────────────────────────────────────────────── -->
        <div class="elv-stats" v-if="totalCount > 0 || !isLoading">
            <button class="stat-pill" :class="{ active: filterStatus==='all' }"     @click="filterStatus='all'">
                <span class="material-symbols-outlined">format_list_bulleted</span>
                {{ totalCount }} total
            </button>
            <button class="stat-pill stat-pill--pending"  :class="{ active: filterStatus==='pending' }"  @click="filterStatus='pending'">
                <span class="material-symbols-outlined">pending</span>
                {{ pendingCount }} pendente{{ pendingCount !== 1 ? 's' : '' }}
            </button>
            <button class="stat-pill stat-pill--resolved" :class="{ active: filterStatus==='resolved' }" @click="filterStatus='resolved'">
                <span class="material-symbols-outlined">check_circle</span>
                {{ resolvedCount }} resolvido{{ resolvedCount !== 1 ? 's' : '' }}
            </button>
        </div>

        <!-- ─── Filtros ──────────────────────────────────────────────────── -->
        <div class="elv-filters">
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
                <span class="material-symbols-outlined">close</span> Limpar
            </button>
        </div>

        <!-- ─── Loading ──────────────────────────────────────────────────── -->
        <VSpinner v-if="isLoading" class="h-64" />

        <!-- ─── Empty ────────────────────────────────────────────────────── -->
        <div v-else-if="!visibleLogs.length" class="elv-empty">
            <span class="material-symbols-outlined elv-empty-icon">menu_book</span>
            <h3>{{ allLogs.length ? 'Nenhum erro neste filtro' : 'Caderno vazio' }}</h3>
            <p>{{ allLogs.length ? 'Ajuste os filtros ou registre um novo erro.' : 'Registre questões que você errou para revisá-las depois.' }}</p>
            <VButton v-if="!allLogs.length" class="mt-4" @click="openModal">Registrar primeiro erro</VButton>
        </div>

        <!-- ─── Lista ────────────────────────────────────────────────────── -->
        <div v-else class="elv-list">
            <VCard v-for="log in visibleLogs" :key="log.id"
                class="err-card" :class="{ 'err-card--resolved': log.isResolved }">

                <!-- Topo do card: badges + ações -->
                <div class="err-card-top">
                    <div class="err-badges">
                        <!-- Disciplina -->
                        <span v-if="disciplineOf(log)" class="badge-disc"
                            :style="{ background: disciplineOf(log)!.color+'22', color: disciplineOf(log)!.color, borderColor: disciplineOf(log)!.color+'55' }">
                            {{ disciplineOf(log)!.name }}
                        </span>
                        <!-- Tópico -->
                        <span v-if="topicLabel(log)" class="badge-topic">
                            <span class="material-symbols-outlined" style="font-size:.85rem">label</span>
                            {{ topicLabel(log) }}
                        </span>
                        <!-- Diagnóstico -->
                        <span v-if="log.diagnostico" class="badge-diag"
                            :style="{ background: diagColor(log.diagnostico).bg, color: diagColor(log.diagnostico).text }">
                            {{ log.diagnostico }}
                        </span>
                    </div>
                    <div class="err-actions">
                        <button class="icon-btn" :id="`btn-edit-${log.id}`"
                            @click="editingId === log.id ? cancelEdit() : startEdit(log)" title="Editar">
                            <span class="material-symbols-outlined">{{ editingId===log.id ? 'close' : 'edit' }}</span>
                        </button>
                        <button class="icon-btn icon-btn--del" :id="`btn-del-${log.id}`"
                            @click="deleteLog(log.id)" title="Excluir">
                            <span class="material-symbols-outlined">delete</span>
                        </button>
                    </div>
                </div>

                <!-- Fonte -->
                <div v-if="log.fonte && editingId !== log.id" class="err-fonte">
                    <span class="material-symbols-outlined">source</span>{{ log.fonte }}
                </div>

                <!-- Modo edição -->
                <div v-if="editingId === log.id" class="err-edit-area">
                    <label class="field-label field-label--red">POR QUE EU ERREI? (ANÁLISE)</label>
                    <textarea :id="`edit-analise-${log.id}`" v-model="editAnalise" class="ds-textarea" rows="3" />
                    <label class="field-label field-label--green" style="margin-top:.75rem">RESUMO DA CORREÇÃO (PULO DO GATO)</label>
                    <textarea :id="`edit-correcao-${log.id}`" v-model="editCorrecao" class="ds-textarea" rows="2" />
                    <div class="err-edit-actions">
                        <VButton variant="ghost" @click="cancelEdit">Cancelar</VButton>
                        <VButton :id="`btn-save-${log.id}`" @click="saveEdit(log.id)">Salvar</VButton>
                    </div>
                </div>

                <!-- Modo leitura -->
                <template v-else>
                    <div class="err-section">
                        <span class="err-section-label err-section-label--red">
                            <span class="material-symbols-outlined">psychology</span>
                            POR QUE EU ERREI?
                        </span>
                        <p class="err-text" :class="{ 'err-text--resolved': log.isResolved }">{{ log.analise }}</p>
                    </div>
                    <div v-if="log.correcao" class="err-section">
                        <span class="err-section-label err-section-label--green">
                            <span class="material-symbols-outlined">lightbulb</span>
                            PULO DO GATO
                        </span>
                        <p class="err-text">{{ log.correcao }}</p>
                    </div>
                </template>

                <!-- Rodapé -->
                <div class="err-footer">
                    <span class="err-date">{{ formatDate(log.createdAt) }}</span>
                    <button class="resolve-btn" :class="{ 'resolve-btn--on': log.isResolved }"
                        :id="`btn-resolve-${log.id}`" @click="toggleResolved(log)"
                        :disabled="updateMutation.isPending.value">
                        <span class="material-symbols-outlined">
                            {{ log.isResolved ? 'check_circle' : 'radio_button_unchecked' }}
                        </span>
                        {{ log.isResolved ? 'Resolvido' : 'Marcar como resolvido' }}
                    </button>
                </div>
            </VCard>
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
.elv { width: 100%; max-width: 860px; }

/* Header */
.elv-header { display:flex; align-items:center; justify-content:space-between; margin-bottom:1.5rem; flex-wrap:wrap; gap:1rem; }
.elv-title-group { display:flex; align-items:center; gap:.875rem; }
.elv-header-icon { font-size:2rem; color:var(--primary); font-variation-settings:'FILL' 1; }
.elv-title { font-family:var(--ds-font-serif); font-size:1.75rem; font-weight:700; color:var(--on-surface); margin:0; line-height:1.2; }
.elv-subtitle { font-size:.875rem; color:var(--secondary); margin:0; }

/* Stats */
.elv-stats { display:flex; gap:.625rem; margin-bottom:1.25rem; flex-wrap:wrap; }
.stat-pill {
    display:flex; align-items:center; gap:.375rem;
    padding:.375rem 1rem; border-radius:999px;
    font-size:.8125rem; font-weight:600; cursor:pointer;
    background:var(--surface-container); color:var(--secondary);
    border:1.5px solid var(--outline-variant);
    transition: all .2s;
}
.stat-pill .material-symbols-outlined { font-size:1rem; }
.stat-pill:hover, .stat-pill.active { background:var(--surface-container-high); color:var(--on-surface); border-color:var(--outline); }
.stat-pill--pending.active  { background:color-mix(in srgb,var(--primary) 15%,transparent); color:var(--primary); border-color:var(--primary); }
.stat-pill--resolved.active { background:color-mix(in srgb,#22c55e 15%,transparent); color:#16a34a; border-color:#22c55e; }

/* Filtros */
.elv-filters { display:flex; align-items:center; gap:.75rem; margin-bottom:1.5rem; flex-wrap:wrap; }
.ds-native-select, .ds-input {
    padding:.5rem .875rem; border-radius:10px;
    border:1.5px solid var(--outline-variant);
    background:var(--surface-container-low);
    color:var(--on-surface); font-family:inherit; font-size:.9rem;
    outline:none; transition:border-color .2s;
    min-width:175px;
}
.ds-native-select:focus, .ds-input:focus { border-color:var(--primary); }
.ds-native-select:disabled { opacity:.5; cursor:not-allowed; }
.w-full { width:100%; min-width:unset; }
.clear-btn {
    display:flex; align-items:center; gap:.25rem;
    font-size:.8125rem; color:var(--secondary);
    background:none; border:none; cursor:pointer;
    padding:.375rem .625rem; border-radius:8px;
    transition:background .15s;
}
.clear-btn:hover { background:var(--surface-container-high); color:var(--on-surface); }
.clear-btn .material-symbols-outlined { font-size:1rem; }

/* Empty */
.elv-empty { text-align:center; padding:4rem 2rem; }
.elv-empty-icon { font-size:3.5rem; color:var(--outline-variant); display:block; margin-bottom:1rem; }
.elv-empty h3 { font-family:var(--ds-font-serif); font-size:1.25rem; color:var(--on-surface); margin:0 0 .5rem; }
.elv-empty p  { color:var(--secondary); font-size:.9375rem; max-width:360px; margin-inline:auto; }
.mt-4 { margin-top:1rem; }

/* Lista */
.elv-list { display:flex; flex-direction:column; gap:1rem; }

/* Card */
.err-card { padding:1.25rem; border:1px solid var(--outline-variant); transition:box-shadow .2s, opacity .3s; }
.err-card:hover { box-shadow:0 4px 20px rgba(0,0,0,.1); }
.err-card--resolved { opacity:.6; }

.err-card-top { display:flex; justify-content:space-between; align-items:flex-start; gap:.5rem; margin-bottom:.875rem; flex-wrap:wrap; }
.err-badges { display:flex; flex-wrap:wrap; gap:.4rem; align-items:center; }

.badge-disc {
    font-size:.7rem; font-weight:700; padding:.25rem .625rem;
    border-radius:999px; border:1.5px solid; letter-spacing:.02em;
}
.badge-topic {
    display:flex; align-items:center; gap:.2rem;
    font-size:.75rem; font-weight:600; color:var(--secondary);
    background:var(--surface-container-high);
    padding:.25rem .625rem; border-radius:999px;
}
.badge-diag {
    font-size:.72rem; font-weight:700; padding:.25rem .625rem;
    border-radius:999px; letter-spacing:.02em;
}

.err-actions { display:flex; gap:.25rem; flex-shrink:0; }
.icon-btn {
    width:32px; height:32px; display:flex; align-items:center; justify-content:center;
    border:none; border-radius:8px; background:none; cursor:pointer;
    color:var(--secondary); transition:background .15s, color .15s;
}
.icon-btn:hover { background:var(--surface-container-high); color:var(--on-surface); }
.icon-btn--del:hover { background:color-mix(in srgb,#ef4444 15%,transparent); color:#ef4444; }
.icon-btn .material-symbols-outlined { font-size:1.1rem; }

.err-fonte {
    display:flex; align-items:center; gap:.3rem;
    font-size:.78rem; color:var(--outline); margin-bottom:.75rem;
}
.err-fonte .material-symbols-outlined { font-size:.9rem; }

/* Seções */
.err-section { margin-bottom:.75rem; }
.err-section-label {
    display:flex; align-items:center; gap:.25rem;
    font-size:.7rem; font-weight:800; letter-spacing:.08em;
    text-transform:uppercase; margin-bottom:.35rem;
}
.err-section-label .material-symbols-outlined { font-size:.9rem; }
.err-section-label--red   { color:#f87171; }
.err-section-label--green { color:#4ade80; }

.err-text { font-size:.9375rem; color:var(--on-surface); line-height:1.65; margin:0; }
.err-text--resolved { text-decoration:line-through; color:var(--secondary); }

/* Edit area */
.err-edit-area { margin-bottom:.875rem; }
.err-edit-actions { display:flex; justify-content:flex-end; gap:.5rem; margin-top:.75rem; }

/* Footer */
.err-footer {
    display:flex; align-items:center; justify-content:space-between;
    padding-top:.75rem; border-top:1px solid var(--outline-variant);
    flex-wrap:wrap; gap:.5rem;
}
.err-date { font-size:.8rem; color:var(--outline); }
.resolve-btn {
    display:flex; align-items:center; gap:.375rem;
    padding:.375rem .875rem; border-radius:8px;
    border:1.5px solid var(--outline-variant);
    background:none; cursor:pointer;
    font-size:.8125rem; font-weight:600; color:var(--secondary);
    transition:all .2s;
}
.resolve-btn:hover:not(:disabled) { background:color-mix(in srgb,#22c55e 12%,transparent); border-color:#22c55e; color:#16a34a; }
.resolve-btn--on { background:color-mix(in srgb,#22c55e 12%,transparent) !important; border-color:#22c55e !important; color:#16a34a !important; }
.resolve-btn:disabled { opacity:.5; cursor:not-allowed; }
.resolve-btn .material-symbols-outlined { font-size:1rem; font-variation-settings:'FILL' 1; }

/* Textarea */
.ds-textarea {
    width:100%; padding:.7rem .875rem; border-radius:10px;
    border:1.5px solid var(--outline-variant);
    background:var(--surface-container-low);
    color:var(--on-surface); font-family:inherit; font-size:.9375rem;
    resize:vertical; outline:none; transition:border-color .2s;
    box-sizing:border-box;
}
.ds-textarea:focus { border-color:var(--primary); }

/* Labels */
.field-label {
    display:block; font-size:.7rem; font-weight:800;
    letter-spacing:.08em; text-transform:uppercase;
    color:var(--secondary); margin-bottom:.375rem;
}
.field-label--red   { color:#f87171; }
.field-label--green { color:#4ade80; }

/* Modal body */
.modal-body { display:flex; flex-direction:column; gap:.875rem; padding:.25rem 0; }
.modal-row  { display:grid; grid-template-columns:1fr 1fr; gap:.875rem; }
@media (max-width:560px) { .modal-row { grid-template-columns:1fr; } }
.modal-field { display:flex; flex-direction:column; }
.modal-footer { display:flex; justify-content:flex-end; gap:.75rem; padding-top:.5rem; }
</style>
