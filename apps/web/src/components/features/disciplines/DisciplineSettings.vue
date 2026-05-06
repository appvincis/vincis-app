<script setup lang="ts">
import { ref, watch } from 'vue'
import { api } from '../../../lib/axios'
import { VInput, VButton } from '../../ui'
import { PRESET_COLORS } from '../../../helpers/disciplineColors'

import { useToast } from 'primevue/usetoast'

const toast = useToast()

const props = defineProps<{
    discipline: any;
}>()

const emit = defineEmits<{
    (e: 'update:discipline', discipline: any): void;
}>()

const panelWeight = ref<number>(1.0)
const panelName = ref('')
const panelColor = ref('')
const isSavingInfo = ref(false)
const isEditOpen = ref(false)

// Sync local state when discipline prop changes
watch(() => props.discipline, (newVal) => {
    if (newVal) {
        panelWeight.value = newVal.weight ?? 1.0
        panelName.value = newVal.name
        panelColor.value = newVal.color
        isEditOpen.value = false
    }
}, { immediate: true })

function handleEditToggle(e: Event) {
    isEditOpen.value = (e.target as HTMLDetailsElement).open
}

async function saveDisciplineInfo() {
    if (!props.discipline || !panelName.value.trim()) return
    isSavingInfo.value = true
    try {
        const res = await api.patch(`/disciplines/${props.discipline.id}`, {
            name: panelName.value.trim(),
            color: panelColor.value,
            weight: panelWeight.value,
        })
        emit('update:discipline', res.data.discipline)
        isEditOpen.value = false
    } catch (e: any) {
        toast.add({ severity: 'error', summary: 'Erro', detail: 'Não foi possível salvar as alterações da disciplina.', life: 3000 })
    } finally {
        isSavingInfo.value = false
    }
}
</script>

<template>
    <details class="detail__edit-section" :open="isEditOpen" @toggle="handleEditToggle">
        <summary class="detail__edit-summary">
            <span class="material-symbols-outlined" style="font-size:1rem;vertical-align:-2px">tune</span>
            Editar Disciplina
        </summary>
        <div class="detail__edit-body">
            <VInput v-model="panelName" label="Nome" icon="subject" />
            <div>
                <p class="text-xs text-secondary mb-2">Cor</p>
                <div class="flex gap-2 flex-wrap">
                    <button v-for="color in PRESET_COLORS" :key="color" class="color-swatch"
                        :class="{ 'color-swatch--active': panelColor === color }" :style="{ background: color }"
                        @click="panelColor = color" />
                </div>
            </div>
            <div>
                <div class="flex justify-between items-center mb-1">
                    <p class="text-xs text-secondary">Peso / Importância</p>
                    <span class="weight-badge" :style="{ background: panelColor }">{{
                        panelWeight.toFixed(1) }}</span>
                </div>
                <input type="range" v-model.number="panelWeight" min="0.5" max="5" step="0.5" class="weight-slider" />
                <div class="flex justify-between text-xs text-secondary mt-1">
                    <span>Baixo</span><span>Alto</span>
                </div>
            </div>
            <VButton variant="secondary" :disabled="isSavingInfo" @click="saveDisciplineInfo" style="width:100%">
                {{ isSavingInfo ? 'Salvando...' : 'Salvar Alterações' }}
            </VButton>
        </div>
    </details>
</template>

<style scoped>
/* Edit section (collapsible) */
.detail__edit-section {
    flex-shrink: 0;
    border-top: 1px solid rgba(208, 197, 175, 0.1);
    border-bottom: 1px solid rgba(208, 197, 175, 0.1);
}

.detail__edit-summary {
    display: flex;
    align-items: center;
    gap: 0.4rem;
    padding: 0.75rem 1.25rem;
    font-size: 0.72rem;
    font-weight: 700;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: var(--secondary);
    cursor: pointer;
    user-select: none;
    list-style: none;
    transition: color 0.15s;
    background: var(--surface-container-low);
}

.detail__edit-summary:hover {
    color: var(--on-surface);
}

.detail__edit-summary::-webkit-details-marker {
    display: none;
}

.detail__edit-body {
    padding: 0 1.25rem 1rem;
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    background: var(--surface-container-low);
}

/* Color Swatches */
.color-swatch {
    width: 1.75rem;
    height: 1.75rem;
    border-radius: 50%;
    border: 2px solid transparent;
    cursor: pointer;
    transition: transform 0.15s, border-color 0.15s;
}

.color-swatch:hover {
    transform: scale(1.15);
}

.color-swatch--active {
    border-color: var(--on-surface);
    transform: scale(1.15);
}

/* Weight editor */
.weight-badge {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    font-size: 0.7rem;
    font-weight: 700;
    color: #fff;
    border-radius: 999px;
    padding: 0.1rem 0.5rem;
    min-width: 2rem;
    line-height: 1.4;
}

.weight-slider {
    width: 100%;
    accent-color: var(--primary);
    cursor: pointer;
}
</style>
