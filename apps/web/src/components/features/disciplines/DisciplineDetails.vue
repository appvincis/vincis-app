<script setup lang="ts">
import { ref, computed, watch, nextTick } from 'vue'
import { VButton, VSpinner } from '../../ui'
import DisciplineSettings from './DisciplineSettings.vue'
import DisciplineTopicManager from './DisciplineTopicManager.vue'
import { useGenerateTopicsForDisciplineMutation, useUpdateDisciplineMutation } from '../../../hooks/useDisciplines'
import { useDisciplineFocusSessionsQuery } from '../../../hooks/useFocusSessions'
import { usePlan } from '../../../hooks/usePlan'
import { useRouter } from 'vue-router'

const updateDisciplineMutation = useUpdateDisciplineMutation()
const isEditingName = ref(false)
const editNameValue = ref('')
const nameInputRef = ref<HTMLInputElement | null>(null)

function startEditName() {
    if (!props.discipline) return
    editNameValue.value = props.discipline.name
    isEditingName.value = true
    nextTick(() => {
        nameInputRef.value?.focus()
    })
}

function cancelEditName() {
    isEditingName.value = false
    editNameValue.value = ''
}

async function saveName() {
    if (!props.discipline || !editNameValue.value.trim()) return
    if (editNameValue.value.trim() === props.discipline.name) {
        cancelEditName()
        return
    }
    
    try {
        const updated = await updateDisciplineMutation.mutateAsync({
            id: props.discipline.id,
            name: editNameValue.value.trim()
        })
        emit('update:discipline', updated)
        isEditingName.value = false
    } catch (err) {
        alert('Não foi possível atualizar o nome da disciplina.')
    }
}

const { plan } = usePlan()
const router = useRouter()

const props = defineProps<{
    isOpen: boolean;
    discipline: any | null;
}>();

const emit = defineEmits<{
    (e: 'update:isOpen', value: boolean): void;
    (e: 'update:discipline', discipline: any): void;
}>();

const topicsCount = ref(0)
const activeTab = ref<'topics' | 'history' | 'ai'>('topics')

// Varinha IA state
const syllabusText = ref('')
const generateTopics = useGenerateTopicsForDisciplineMutation()
const isGenerating = ref(false)

// Focus sessions history query
const { data: sessions, isLoading: isLoadingSessions, refetch: refetchSessions } = useDisciplineFocusSessionsQuery(
    computed(() => props.discipline?.id)
)

watch(() => props.isOpen, (open) => {
    if (open) {
        activeTab.value = 'topics'
        syllabusText.value = ''
        refetchSessions()
    }
})

function closePanel() {
    emit('update:isOpen', false)
}

function handleDisciplineUpdate(updated: any) {
    emit('update:discipline', updated)
}

async function handleGenerateTopics() {
    if (!syllabusText.value.trim() || !props.discipline) return
    isGenerating.value = true
    try {
        const res = await generateTopics.mutateAsync({
            id: props.discipline.id,
            syllabusText: syllabusText.value.trim()
        })
        alert(`Sucesso! Foram criados ${res.topicsCreated} tópicos para esta disciplina. (Tokens gastos: ${res.tokensSpent || 0})`);
        syllabusText.value = ''
        activeTab.value = 'topics'
    } catch (e: any) {
        const errorMsg = e.response?.data?.message || e.message || 'Erro ao extrair tópicos.';
        alert(`Erro: ${errorMsg}`);
    } finally {
        isGenerating.value = false
    }
}
</script>

<template>
    <Transition name="panel">
        <div v-if="isOpen" class="panel-overlay" @click.self="closePanel">
            <div class="panel">
                <!-- Panel Header -->
                <div class="detail__header" :style="{ borderLeftColor: discipline?.color }">
                    <div class="flex items-center gap-3 flex-1 min-w-0">
                        <span class="detail__dot" :style="{ background: discipline?.color }" />
                        <div class="min-w-0 flex-1">
                            <div v-if="isEditingName" class="flex items-center gap-2">
                                <input 
                                    v-model="editNameValue" 
                                    type="text" 
                                    class="ds-inline-input"
                                    @keyup.enter="saveName"
                                    @keyup.esc="cancelEditName"
                                    ref="nameInputRef"
                                />
                                <button class="p-1 text-success hover:bg-success/10 rounded cursor-pointer border-0 bg-transparent flex items-center justify-center" @click="saveName" title="Salvar">
                                    <i class="pi pi-check text-[10px]"></i>
                                </button>
                                <button class="p-1 text-error hover:bg-error/10 rounded cursor-pointer border-0 bg-transparent flex items-center justify-center" @click="cancelEditName" title="Cancelar">
                                    <i class="pi pi-times text-[10px]"></i>
                                </button>
                            </div>
                            <div v-else class="flex items-center gap-2 group/title">
                                <h2 class="detail__title" @dblclick="startEditName">{{ discipline?.name }}</h2>
                                <button 
                                    class="p-1 text-on-surface-muted hover:text-primary hover:bg-primary/5 rounded cursor-pointer opacity-0 group-hover/title:opacity-100 transition-opacity border-0 bg-transparent flex items-center justify-center" 
                                    @click="startEditName" 
                                    title="Editar Nome"
                                >
                                    <i class="pi pi-pencil text-[9px]"></i>
                                </button>
                            </div>
                            <p class="detail__subtitle">{{ topicsCount }} tópico{{ topicsCount !== 1 ? 's' : '' }}</p>
                        </div>
                    </div>
                    <button class="detail__close" @click="closePanel" title="Fechar">
                        <i class="pi pi-times"></i>
                    </button>
                </div>

                <!-- Tabs Navigation -->
                <div class="flex border-b border-outline-variant/20 px-4 bg-surface-container-lowest flex-shrink-0">
                    <button 
                        @click="activeTab = 'topics'" 
                        class="py-3 px-4 text-xs font-bold border-b-2 transition-colors cursor-pointer"
                        :class="activeTab === 'topics' ? 'border-primary text-primary' : 'border-transparent text-on-surface-muted hover:text-on-surface'"
                    >
                        Tópicos
                    </button>
                    <button 
                        @click="activeTab = 'history'" 
                        class="py-3 px-4 text-xs font-bold border-b-2 transition-colors cursor-pointer"
                        :class="activeTab === 'history' ? 'border-primary text-primary' : 'border-transparent text-on-surface-muted hover:text-on-surface'"
                    >
                        Histórico de Foco
                    </button>
                    <button 
                        @click="activeTab = 'ai'" 
                        class="py-3 px-4 text-xs font-bold border-b-2 transition-colors cursor-pointer flex items-center gap-1.5"
                        :class="activeTab === 'ai' ? 'border-primary text-primary' : 'border-transparent text-on-surface-muted hover:text-on-surface'"
                    >
                        <i class="pi pi-magic text-[10px]"></i>
                        Varinha IA
                    </button>
                </div>

                <template v-if="discipline">
                    <!-- Tab: Topics & Settings -->
                    <div v-show="activeTab === 'topics'" class="flex-1 flex flex-col overflow-hidden">
                        <div class="flex-1 overflow-y-auto flex flex-col">
                            <DisciplineTopicManager 
                                :discipline-id="discipline.id" 
                                :panel-color="discipline.color"
                                @update:topicsCount="topicsCount = $event" 
                            />
                        </div>
                        <DisciplineSettings 
                            :discipline="discipline" 
                            @update:discipline="handleDisciplineUpdate" 
                        />
                    </div>

                    <!-- Tab: Focus Sessions History -->
                    <div v-if="activeTab === 'history'" class="detail__history p-5 overflow-y-auto flex-1">
                        <div v-if="isLoadingSessions" class="flex justify-center py-8">
                            <VSpinner size="sm" />
                        </div>
                        <div v-else-if="!sessions?.length" class="text-center py-12">
                            <i class="pi pi-clock text-4xl text-outline-variant mb-2" style="display:block"></i>
                            <p class="text-secondary text-sm">Nenhum histórico de estudo registrado.</p>
                        </div>
                        <ul v-else class="space-y-3">
                            <li v-for="session in sessions" :key="session.id" class="p-4 bg-surface-container-low border border-outline-variant/30 rounded-xl flex justify-between items-center text-sm animate-fade-in">
                                <div class="flex flex-col text-left">
                                    <span class="font-bold text-on-surface">Sessão de Foco</span>
                                    <span class="text-xs text-on-surface-muted">{{ new Date(session.startedAt).toLocaleDateString('pt-BR') }}</span>
                                </div>
                                <span class="font-mono bg-surface-container-high px-2 py-1 rounded text-xs text-on-surface font-bold">
                                    {{ session.duration }} min
                                </span>
                            </li>
                        </ul>
                    </div>

                    <!-- Tab: AI Varinha Mágica -->
                    <div v-if="activeTab === 'ai'" class="detail__ai p-5 overflow-y-auto flex-1 flex flex-col gap-4 text-left relative">
                        <!-- Premium lock overlay -->
                        <div v-if="!plan.isPremium" class="absolute inset-0 z-10 flex flex-col items-center justify-center p-6 bg-surface-container-lowest/80 backdrop-blur-[2px] text-center space-y-4">
                            <div class="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center">
                                <i class="pi pi-lock text-xl"></i>
                            </div>
                            <div class="space-y-1 max-w-xs">
                                <h4 class="font-bold text-sm text-on-surface">Recurso Premium</h4>
                                <p class="text-xs text-on-surface-muted leading-relaxed">
                                    A <strong>Varinha IA</strong> é exclusiva do plano Premium. Assine para criar tópicos automaticamente.
                                </p>
                            </div>
                            <VButton @click="router.push('/private/plans')" class="bg-primary text-white hover:bg-primary-dark text-xs py-2 px-4">
                                Assinar Plano Premium
                            </VButton>
                        </div>

                        <!-- Content wrapper (with conditional blur if not premium) -->
                        <div class="flex-1 flex flex-col gap-4" :class="{ 'blur-[2px] pointer-events-none select-none opacity-40': !plan.isPremium }">
                            <div>
                                <h3 class="text-base font-bold text-on-surface mb-1 flex items-center gap-2">
                                    <i class="pi pi-bolt text-primary"></i>
                                    Varinha Mágica (IA)
                                </h3>
                                <p class="text-xs text-on-surface-muted leading-relaxed">
                                    Cole o conteúdo programático desta disciplina (extraído do edital) para que a IA crie e organize os tópicos de estudo automaticamente.
                                </p>
                            </div>

                            <textarea 
                                v-model="syllabusText" 
                                rows="8"
                                class="w-full p-3 rounded-xl border border-outline-variant/60 bg-surface-container-low text-on-surface text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                                placeholder="Cole o texto aqui... Ex: 'Ortografia oficial. Acentuação gráfica. Crase.'"
                            ></textarea>

                            <VButton 
                                variant="primary" 
                                class="w-full"
                                :disabled="isGenerating || !syllabusText.trim()"
                                @click="handleGenerateTopics"
                            >
                                <i v-if="isGenerating" class="pi pi-spin pi-spinner mr-2"></i>
                                <i v-else class="pi pi-magic mr-2"></i>
                                {{ isGenerating ? 'Processando...' : 'Gerar Tópicos com IA' }}
                            </VButton>
                        </div>
                    </div>
                </template>
            </div>
        </div>
    </Transition>
</template>

<style scoped>
.panel-overlay {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.45);
    backdrop-filter: blur(2px);
    z-index: 100;
    display: flex;
    justify-content: flex-end;
}

.panel {
    width: min(480px, 95vw);
    height: 100%;
    background: var(--surface-container-lowest);
    display: flex;
    flex-direction: column;
    overflow: hidden;
}

.detail__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 1.25rem 1.25rem 1rem;
    border-left: 4px solid transparent;
    flex-shrink: 0;
    background: rgba(208, 197, 175, 0.04);
}

.detail__dot {
    width: 12px;
    height: 12px;
    border-radius: 50%;
    flex-shrink: 0;
}

.detail__title {
    font-family: var(--ds-font-serif);
    font-size: 1.1rem;
    font-weight: 700;
    color: var(--on-surface);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.ds-inline-input {
    background: var(--surface-container-low);
    border: 1px solid var(--outline-variant);
    border-radius: 0.375rem;
    padding: 0.15rem 0.4rem;
    font-size: 1rem;
    font-weight: 700;
    color: var(--on-surface);
    outline: none;
    width: 100%;
    max-width: 220px;
    box-sizing: border-box;
}

.ds-inline-input:focus {
    border-color: var(--primary);
    box-shadow: 0 0 0 2px color-mix(in srgb, var(--primary) 15%, transparent);
}

.detail__subtitle {
    font-size: 0.72rem;
    color: var(--secondary);
    margin-top: 0.1rem;
}

.detail__close {
    background: none;
    border: none;
    cursor: pointer;
    color: var(--secondary);
    padding: 0.2rem;
    border-radius: 0.375rem;
    transition: background 0.15s, color 0.15s;
    flex-shrink: 0;
}

.detail__close:hover {
    background: rgba(208, 197, 175, 0.12);
    color: var(--on-surface);
}

.animate-fade-in {
    animation: fadeIn 0.4s ease-out;
}

@keyframes fadeIn {
    from { opacity: 0; transform: translateY(8px); }
    to { opacity: 1; transform: translateY(0); }
}

/* Panel slide transition */
.panel-enter-active,
.panel-leave-active {
    transition: opacity 0.25s ease;
}

.panel-enter-active .panel,
.panel-leave-active .panel {
    transition: transform 0.3s cubic-bezier(0.32, 0, 0.15, 1);
}

.panel-enter-from {
    opacity: 0;
}

.panel-enter-from .panel {
    transform: translateX(100%);
}

.panel-leave-to {
    opacity: 0;
}

.panel-leave-to .panel {
    transform: translateX(100%);
}
</style>