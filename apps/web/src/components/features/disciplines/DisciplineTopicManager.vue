<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import { api } from '../../../lib/axios'
import { VInput, VButton, VSpinner } from '../../ui'
import { useToast } from 'primevue/usetoast'

const toast = useToast()

const props = defineProps<{
    disciplineId: number;
    panelColor: string;
}>()

const emit = defineEmits<{
    (e: 'update:topicsCount', count: number): void;
}>()

// Topics
const topics = ref<any[]>([])
const isLoadingTopics = ref(false)
const newTopicName = ref('')
const newTopicDesc = ref('')
const isAddingTopic = ref(false)

// Topic inline edit
const editingTopicId = ref<number | null>(null)
const editTopicName = ref('')
const editTopicDesc = ref('')
const isSavingTopic = ref(false)

watch(() => props.disciplineId, async (newId) => {
    if (newId) {
        topics.value = []
        newTopicName.value = ''
        newTopicDesc.value = ''
        editingTopicId.value = null
        await fetchTopics(newId)
    }
}, { immediate: true })

// Notify parent of total count changes (for the subtitle)
watch(() => topics.value.length, (newCount) => {
    emit('update:topicsCount', newCount)
})

async function fetchTopics(disciplineId: number) {
    isLoadingTopics.value = true
    try {
        const res = await api.get(`/topics/discipline/${disciplineId}`)
        topics.value = res.data
    } catch (e: any) {
        topics.value = []
    } finally {
        isLoadingTopics.value = false
    }
}

async function addTopic() {
    if (!newTopicName.value.trim() || !props.disciplineId) return
    isAddingTopic.value = true
    try {
        const res = await api.post('/topics', {
            name: newTopicName.value.trim(),
            description: newTopicDesc.value.trim() || undefined,
            disciplineId: props.disciplineId
        })
        topics.value.push(res.data.topic)
        newTopicName.value = ''
        newTopicDesc.value = ''
    } catch (e: any) {
        toast.add({ severity: 'error', summary: 'Erro', detail: 'Não foi possível adicionar o tópico.', life: 3000 })
    } finally {
        isAddingTopic.value = false
    }
}

async function toggleTopic(topic: any) {
    try {
        const res = await api.patch(`/topics/${topic.id}`, { isCompleted: !topic.isCompleted })
        const idx = topics.value.findIndex((t) => t.id === topic.id)
        if (idx !== -1) topics.value[idx] = res.data.topic
    } catch (e: any) {
        toast.add({ severity: 'error', summary: 'Erro', detail: 'Não foi possível atualizar o tópico.', life: 3000 })
    }
}

async function deleteTopic(id: number) {
    try {
        await api.delete(`/topics/${id}`)
        topics.value = topics.value.filter((t) => t.id !== id)
    } catch (e: any) {
        toast.add({ severity: 'error', summary: 'Erro', detail: 'Não foi possível deletar o tópico.', life: 3000 })
    }
}

function startEditTopic(topic: any) {
    editingTopicId.value = topic.id
    editTopicName.value = topic.name
    editTopicDesc.value = topic.description ?? ''
}

function cancelTopicEdit() {
    editingTopicId.value = null
    editTopicName.value = ''
    editTopicDesc.value = ''
}

async function saveTopicEdit(topicId: number) {
    if (!editTopicName.value.trim()) return
    isSavingTopic.value = true
    try {
        const res = await api.patch(`/topics/${topicId}`, {
            name: editTopicName.value.trim(),
            description: editTopicDesc.value.trim() || undefined,
        })
        const idx = topics.value.findIndex((t) => t.id === topicId)
        if (idx !== -1) topics.value[idx] = res.data.topic
        cancelTopicEdit()
    } catch (e: any) {
        toast.add({ severity: 'error', summary: 'Erro', detail: 'Não foi possível salvar as alterações.', life: 3000 })
    } finally {
        isSavingTopic.value = false
    }
}

const completedCount = computed(() => topics.value.filter((t) => t.isCompleted).length)
const progress = computed(() =>
    topics.value.length ? Math.round((completedCount.value / topics.value.length) * 100) : 0
)
</script>

<template>
    <!-- Progress Bar -->
    <div v-if="topics.length" class="detail__progress-wrap">
        <div class="flex justify-between text-xs text-secondary mb-1">
            <span>Progresso</span>
            <span>{{ completedCount }}/{{ topics.length }} ({{ progress }}%)</span>
        </div>
        <div class="detail__progress-track">
            <div class="detail__progress-fill" :style="{ width: progress + '%', background: panelColor }" />
        </div>
    </div>

    <!-- Topics List -->
    <div class="detail__topics">
        <div v-if="isLoadingTopics" class="flex justify-center py-8">
            <VSpinner size="sm" />
        </div>
        <div v-else-if="!topics.length" class="detail__empty">
            <span class="material-symbols-outlined text-4xl text-outline-variant mb-2"
                style="display:block">article</span>
            <p class="text-secondary text-sm">Nenhum tópico ainda. Adicione abaixo.</p>
        </div>
        <ul v-else class="topic-list">
            <li v-for="topic in topics" :key="topic.id" class="topic-item"
                :class="{ 'topic-item--done': topic.isCompleted && editingTopicId !== topic.id }">
                <template v-if="editingTopicId !== topic.id">
                    <button class="topic-item__check" @click="toggleTopic(topic)">
                        <span class="material-symbols-outlined" :style="{ color: topic.isCompleted ? panelColor : '' }">
                            {{ topic.isCompleted ? 'check_circle' : 'radio_button_unchecked' }}
                        </span>
                    </button>
                    <div class="topic-item__text">
                        <span class="topic-item__name">{{ topic.name }}</span>
                        <span v-if="topic.description" class="topic-item__desc">{{ topic.description
                        }}</span>
                    </div>
                    <button class="topic-item__action" @click="startEditTopic(topic)" title="Editar">
                        <span class="material-symbols-outlined">edit</span>
                    </button>
                    <button class="topic-item__delete" @click="deleteTopic(topic.id)" title="Deletar">
                        <span class="material-symbols-outlined">delete</span>
                    </button>
                </template>
                <template v-else>
                    <div class="topic-edit-form">
                        <VInput v-model="editTopicName" placeholder="Nome do tópico..." icon="edit_note" />
                        <VInput v-model="editTopicDesc" placeholder="Descrição (opcional)..."
                            icon="notes" />
                        <div class="flex gap-2">
                            <VButton variant="primary" :disabled="isSavingTopic || !editTopicName.trim()"
                                @click="saveTopicEdit(topic.id)" style="flex:1">
                                {{ isSavingTopic ? 'Salvando...' : 'Salvar' }}
                            </VButton>
                            <VButton variant="secondary" @click="cancelTopicEdit" style="flex:1">
                                Cancelar</VButton>
                        </div>
                    </div>
                </template>
            </li>
        </ul>
    </div>

    <!-- Add Topic -->
    <div class="detail__add-topic">
        <h4 class="text-xs font-bold uppercase tracking-widest text-secondary mb-3">Adicionar
            Tópico</h4>
        <div class="flex flex-col gap-3">
            <VInput v-model="newTopicName" placeholder="Nome do tópico..." icon="edit_note" @keydown.enter="addTopic" />
            <VInput v-model="newTopicDesc" placeholder="Descrição (opcional)..." icon="notes" @keydown.enter="addTopic" />
            <VButton variant="primary" :disabled="isAddingTopic || !newTopicName.trim()" @click="addTopic">
                {{ isAddingTopic ? 'Adicionando...' : 'Adicionar Tópico' }}
            </VButton>
        </div>
    </div>
</template>

<style scoped>
/* Progress */
.detail__progress-wrap {
    padding: 0.75rem 1.25rem 0;
    flex-shrink: 0;
}

.detail__progress-track {
    height: 5px;
    border-radius: 999px;
    background: rgba(208, 197, 175, 0.15);
    overflow: hidden;
    margin-top: 0.375rem;
}

.detail__progress-fill {
    height: 100%;
    border-radius: 999px;
    transition: width 0.4s ease;
}

/* Topics */
.detail__topics {
    flex: 1;
    overflow-y: auto;
    padding: 1rem 1.25rem;
}

.detail__empty {
    text-align: center;
    padding: 2.5rem 0;
}

.topic-list {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    list-style: none;
    margin: 0;
    padding: 0;
}

.topic-item {
    display: flex;
    align-items: flex-start;
    gap: 0.75rem;
    padding: 0.75rem;
    border-radius: 0.5rem;
    background: rgba(208, 197, 175, 0.05);
    border: 1px solid rgba(208, 197, 175, 0.08);
    transition: background 0.15s;
}

.topic-item:hover {
    background: rgba(208, 197, 175, 0.1);
}

.topic-item--done .topic-item__name {
    text-decoration: line-through;
    opacity: 0.5;
}

.topic-item__check {
    background: none;
    border: none;
    cursor: pointer;
    padding: 0;
    color: var(--primary);
    flex-shrink: 0;
    line-height: 1;
    transition: color 0.15s;
}

.topic-item__text {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 0.2rem;
}

.topic-item__name {
    font-size: 0.875rem;
    color: var(--on-surface);
    font-weight: 500;
    transition: opacity 0.2s;
}

.topic-item__desc {
    font-size: 0.72rem;
    color: var(--secondary);
}

.topic-item__delete,
.topic-item__action {
    background: none;
    border: none;
    cursor: pointer;
    color: var(--secondary);
    padding: 0;
    opacity: 0;
    transition: opacity 0.15s;
    line-height: 1;
    font-size: 1rem;
    flex-shrink: 0;
}

.topic-item:hover .topic-item__delete,
.topic-item:hover .topic-item__action {
    opacity: 1;
}

.topic-item__delete:hover {
    color: var(--error, #ef4444);
}

.topic-item__action:hover {
    color: var(--primary);
}

.topic-edit-form {
    width: 100%;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
}

/* Add topic */
.detail__add-topic {
    padding: 1rem 1.25rem;
    border-top: 1px solid rgba(208, 197, 175, 0.1);
    flex-shrink: 0;
}
</style>
