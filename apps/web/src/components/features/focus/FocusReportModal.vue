<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { VModal } from '../../ui'
import FocusModalitySelector from './FocusModalitySelector.vue'
import type { Topic } from '../../../hooks/useDisciplines'

const props = defineProps<{
    visible: boolean
    disciplineName: string
    disciplineId: number | null
    topics: Topic[]
    elapsedMinutes: number
}>()

const emit = defineEmits<{
    (e: 'update:visible', val: boolean): void
    (e: 'submit', data: {
        modalities: string[]
        topicId: number | null
        questionsDone: number
        questionsCorrect: number
        duration: number
        isTopicFinished: boolean
    }): void
}>()

// ─── Local State ──────────────────────────────────────────────────────────────
const selectedModalities = ref<string[]>(['PDF'])
const selectedTopicId = ref<number | null>(null)
const duration = ref(0)
const questionsDone = ref(0)
const questionsCorrect = ref(0)
const isTopicFinished = ref(false)

// Reset state when modal opens
watch(() => props.visible, (isVisible) => {
    if (isVisible) {
        duration.value = props.elapsedMinutes
        selectedModalities.value = ['PDF']
        selectedTopicId.value = null
        questionsDone.value = 0
        questionsCorrect.value = 0
        isTopicFinished.value = false
    }
})

const hitRate = computed(() => {
    if (questionsDone.value === 0) return null
    return Math.round((questionsCorrect.value / questionsDone.value) * 100)
})

const hitRateColor = computed(() => {
    if (hitRate.value === null) return ''
    if (hitRate.value >= 80) return 'var(--color-success, #22c55e)'
    if (hitRate.value >= 60) return '#eab308'
    return 'var(--color-error, #ef4444)'
})

function handleSubmit() {
    emit('submit', {
        modalities: selectedModalities.value,
        topicId: selectedTopicId.value,
        questionsDone: questionsDone.value,
        questionsCorrect: questionsCorrect.value,
        duration: duration.value,
        isTopicFinished: isTopicFinished.value,
    })
}

function handleClose() {
    emit('update:visible', false)
}
</script>

<template>
    <VModal :visible="visible" @update:visible="handleClose" header="Registro da Sessão">
        <template #default>
            <div class="report-body">
                <!-- Disciplina Badge -->
                <div class="report-discipline-badge">
                    <i class="pi pi-check-circle"></i>
                    <span>{{ disciplineName }}</span>
                </div>

                <!-- Modalidades -->
                <div class="report-section">
                    <label class="report-label">
                        <i class="pi pi-tags"></i>
                        Como você estudou?
                    </label>
                    <FocusModalitySelector v-model="selectedModalities" />
                </div>

                <!-- Tópico Estudado -->
                <div class="report-section" v-if="topics.length > 0">
                    <label class="report-label">
                        <i class="pi pi-list"></i>
                        Tópico Estudado
                    </label>
                    <div class="report-select-wrap">
                        <select v-model="selectedTopicId" class="report-select">
                            <option :value="null">Geral / Revisão (Sem Tópico)</option>
                            <option v-for="topic in topics" :key="topic.id" :value="topic.id">
                                {{ topic.name }} {{ topic.isCompleted ? '(Concluído)' : '' }}
                            </option>
                        </select>
                        <i class="pi pi-chevron-down report-select-icon"></i>
                    </div>
                </div>

                <!-- Duração -->
                <div class="report-section">
                    <label class="report-label">
                        <i class="pi pi-stopwatch"></i>
                        Duração (minutos)
                    </label>
                    <input type="number" v-model.number="duration" min="1" class="report-input" />
                </div>

                <!-- Marcar tópico como concluído -->
                <div v-if="selectedTopicId" class="report-topic-complete">
                    <label class="report-checkbox-wrap">
                        <input type="checkbox" v-model="isTopicFinished" class="report-checkbox" />
                        <div>
                            <span class="report-checkbox-label">Marcar tópico como concluído?</span>
                            <span class="report-checkbox-sub">
                                {{ topics.find(t => t.id === selectedTopicId)?.name || '' }}
                            </span>
                        </div>
                    </label>
                </div>

                <!-- Questões -->
                <div class="report-questions-grid">
                    <div class="report-section">
                        <label class="report-label">Questões Feitas</label>
                        <input type="number" v-model.number="questionsDone" min="0" class="report-input" />
                    </div>
                    <div class="report-section">
                        <label class="report-label">Acertos</label>
                        <input type="number" v-model.number="questionsCorrect" min="0" :max="questionsDone"
                            class="report-input report-input--success" />
                    </div>
                </div>

                <!-- Taxa de Acerto -->
                <div v-if="hitRate !== null" class="report-hit-rate" :style="{ '--rate-color': hitRateColor }">
                    <span class="report-hit-label">Taxa de Acerto</span>
                    <span class="report-hit-value">{{ hitRate }}%</span>
                </div>
            </div>
        </template>

        <template #footer>
            <div class="report-footer">
                <button @click="handleClose" class="report-btn-cancel">Cancelar</button>
                <button @click="handleSubmit" class="report-btn-submit">
                    <i class="pi pi-save"></i>
                    Registrar Sessão
                </button>
            </div>
        </template>
    </VModal>
</template>

<style scoped>
.report-body {
    display: flex;
    flex-direction: column;
    gap: 1.25rem;
}

.report-discipline-badge {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    background: color-mix(in srgb, var(--color-primary) 8%, transparent);
    color: var(--color-primary);
    padding: 0.5rem 1rem;
    border-radius: 2rem;
    font-size: 0.875rem;
    font-weight: 700;
    font-family: var(--font-family-sans);
    width: fit-content;
}

.report-section {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
}

.report-label {
    font-size: 0.7rem;
    font-weight: 800;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    color: var(--color-on-surface-muted);
    display: flex;
    align-items: center;
    gap: 0.375rem;
    font-family: var(--font-family-sans);
}

.report-label i {
    font-size: 0.75rem;
}

.report-select-wrap {
    position: relative;
}

.report-select {
    width: 100%;
    appearance: none;
    padding: 0.75rem 2.5rem 0.75rem 0.875rem;
    border-radius: 0.75rem;
    border: 1.5px solid var(--color-outline-variant);
    background: var(--color-surface-container-low);
    color: var(--color-on-surface);
    font-size: 0.875rem;
    font-weight: 600;
    font-family: var(--font-family-sans);
    cursor: pointer;
    transition: border-color 0.2s;
}

.report-select:focus {
    outline: none;
    border-color: var(--color-primary);
    box-shadow: 0 0 0 3px color-mix(in srgb, var(--color-primary) 15%, transparent);
}

.report-select-icon {
    position: absolute;
    right: 0.875rem;
    top: 50%;
    transform: translateY(-50%);
    font-size: 0.75rem;
    color: var(--color-on-surface-muted);
    pointer-events: none;
}

.report-input {
    width: 100%;
    padding: 0.75rem 0.875rem;
    border-radius: 0.75rem;
    border: 1.5px solid var(--color-outline-variant);
    background: var(--color-surface-container-low);
    color: var(--color-on-surface);
    font-size: 0.875rem;
    font-weight: 700;
    font-family: var(--font-family-sans);
    font-variant-numeric: tabular-nums;
    transition: border-color 0.2s;
}

.report-input:focus {
    outline: none;
    border-color: var(--color-primary);
    box-shadow: 0 0 0 3px color-mix(in srgb, var(--color-primary) 15%, transparent);
}

.report-input--success:focus {
    border-color: #22c55e;
    box-shadow: 0 0 0 3px rgba(34, 197, 94, 0.15);
}

.report-topic-complete {
    background: color-mix(in srgb, var(--color-primary) 5%, transparent);
    border: 1px solid color-mix(in srgb, var(--color-primary) 15%, transparent);
    border-radius: 0.875rem;
    padding: 0.875rem 1rem;
}

.report-checkbox-wrap {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    cursor: pointer;
}

.report-checkbox {
    width: 1.25rem;
    height: 1.25rem;
    border-radius: 0.375rem;
    accent-color: var(--color-primary);
    cursor: pointer;
}

.report-checkbox-label {
    display: block;
    font-size: 0.875rem;
    font-weight: 700;
    color: var(--color-on-surface);
    font-family: var(--font-family-sans);
}

.report-checkbox-sub {
    display: block;
    font-size: 0.75rem;
    color: var(--color-on-surface-muted);
    font-family: var(--font-family-sans);
}

.report-questions-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1rem;
}

.report-hit-rate {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0.75rem 1rem;
    border-radius: 0.75rem;
    background: var(--color-surface-container);
}

.report-hit-label {
    font-size: 0.875rem;
    font-weight: 600;
    color: var(--color-on-surface-muted);
    font-family: var(--font-family-sans);
}

.report-hit-value {
    font-size: 1.25rem;
    font-weight: 900;
    color: var(--rate-color);
    font-variant-numeric: tabular-nums;
    font-family: var(--font-family-sans);
}

.report-footer {
    display: flex;
    gap: 0.75rem;
    justify-content: flex-end;
}

.report-btn-cancel {
    padding: 0.625rem 1rem;
    border-radius: 0.75rem;
    font-size: 0.875rem;
    font-weight: 700;
    color: var(--color-on-surface-muted);
    background: transparent;
    cursor: pointer;
    transition: background 0.2s;
    font-family: var(--font-family-sans);
}

.report-btn-cancel:hover {
    background: var(--color-surface-container-highest);
}

.report-btn-submit {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.625rem 1.25rem;
    border-radius: 0.75rem;
    font-size: 0.875rem;
    font-weight: 700;
    color: white;
    background: var(--color-primary);
    cursor: pointer;
    transition: all 0.2s;
    box-shadow: 0 4px 12px color-mix(in srgb, var(--color-primary) 25%, transparent);
    font-family: var(--font-family-sans);
}

.report-btn-submit:hover {
    filter: brightness(1.1);
    box-shadow: 0 6px 20px color-mix(in srgb, var(--color-primary) 35%, transparent);
}

.report-btn-submit:active {
    transform: scale(0.97);
}
</style>
