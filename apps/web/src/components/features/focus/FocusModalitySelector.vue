<script setup lang="ts">
const props = defineProps<{
    modelValue: string[]
}>()

const emit = defineEmits<{
    (e: 'update:modelValue', val: string[]): void
}>()

const modalities = [
    { id: 'PDF', label: 'PDF / Leitura', icon: 'pi-file-pdf' },
    { id: 'VIDEO', label: 'Videoaula', icon: 'pi-video' },
    { id: 'QUESTIONS', label: 'Questões', icon: 'pi-question-circle' },
    { id: 'LEGISLATION', label: 'Lei Seca', icon: 'pi-building-columns' },
    { id: 'REVIEW', label: 'Revisão', icon: 'pi-replay' },
]

function toggle(id: string) {
    const current = props.modelValue
    if (current.includes(id)) {
        // Não permite desmarcar se é o último
        if (current.length === 1) return
        emit('update:modelValue', current.filter(m => m !== id))
    } else {
        emit('update:modelValue', [...current, id])
    }
}
</script>

<template>
    <div class="modality-grid">
        <button v-for="mod in modalities" :key="mod.id" @click="toggle(mod.id)" class="modality-chip"
            :class="{ 'modality-chip--active': modelValue.includes(mod.id) }" type="button">
            <i class="pi" :class="mod.icon"></i>
            <span class="modality-label">{{ mod.label }}</span>
            <i v-if="modelValue.includes(mod.id)" class="pi pi-check modality-check"></i>
        </button>
    </div>
</template>

<style scoped>
.modality-grid {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
}

.modality-chip {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.5rem 0.875rem;
    border-radius: 0.75rem;
    font-size: 0.75rem;
    font-weight: 700;
    font-family: var(--font-family-sans);
    border: 1.5px solid var(--color-outline-variant);
    background: var(--color-surface-container-low);
    color: var(--color-on-surface-muted);
    cursor: pointer;
    transition: all 0.2s cubic-bezier(0.25, 1, 0.5, 1);
}

.modality-chip:hover {
    border-color: var(--color-outline);
    background: var(--color-surface-container);
    transform: translateY(-1px);
}

.modality-chip:active {
    transform: scale(0.97);
}

.modality-chip--active {
    background: color-mix(in srgb, var(--color-primary) 10%, transparent);
    border-color: var(--color-primary);
    color: var(--color-primary);
    box-shadow: 0 2px 8px color-mix(in srgb, var(--color-primary) 12%, transparent);
}

.modality-chip--active:hover {
    background: color-mix(in srgb, var(--color-primary) 15%, transparent);
}

.modality-chip i:first-child {
    font-size: 0.875rem;
}

.modality-label {
    white-space: nowrap;
}

.modality-check {
    font-size: 0.625rem;
    margin-left: 0.125rem;
}
</style>
