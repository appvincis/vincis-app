<script lang="ts" setup>
defineProps<{
    discipline: any;
    isActive?: boolean;
}>();

defineEmits<{
    (e: 'click'): void;
    (e: 'delete'): void;
}>();
</script>

<template>
    <button class="discipline-card" @click="$emit('click')" :class="{ 'discipline-card--active': isActive }">
        <div class="discipline-card__color-bar" :style="{ background: discipline.color }" />
        <div class="discipline-card__body">
            <div class="flex items-start justify-between gap-2">
                <h3 class="discipline-card__name">{{ discipline.name }}</h3>
                <button class="discipline-card__delete" @click.stop="$emit('delete')" title="Remover disciplina">
                    <span class="material-symbols-outlined">delete</span>
                </button>
            </div>
            <div class="flex items-center justify-between mt-2">
                <p class="discipline-card__hint">Clique para ver os tópicos</p>
                <span class="weight-badge" :style="{ background: discipline.color }">
                    {{ (discipline.weight ?? 1).toFixed(1) }}
                </span>
            </div>
        </div>
    </button>
</template>

<style scoped>
.discipline-card {
    display: flex;
    flex-direction: column;
    background: var(--surface-container-lowest);
    border: 1px solid rgba(208, 197, 175, 0.1);
    border-radius: 0.75rem;
    overflow: hidden;
    cursor: pointer;
    text-align: left;
    transition: transform 0.18s ease, box-shadow 0.18s ease, border-color 0.2s;
}

.discipline-card:hover {
    transform: translateY(-3px);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
}

.discipline-card--active {
    box-shadow: 0 8px 28px rgba(0, 0, 0, 0.18);
    transform: translateY(-2px);
}

.discipline-card__color-bar {
    height: 5px;
    width: 100%;
    flex-shrink: 0;
}

.discipline-card__body {
    padding: 1.25rem;
    flex: 1;
}

.discipline-card__name {
    font-family: var(--ds-font-serif);
    font-size: 1rem;
    font-weight: 700;
    color: var(--on-surface);
    line-height: 1.3;
    flex: 1;
}

.discipline-card__hint {
    font-size: 0.75rem;
    color: var(--secondary);
    margin-top: 0.5rem;
}

.discipline-card__delete {
    color: var(--secondary);
    opacity: 0;
    transition: opacity 0.15s;
    background: none;
    border: none;
    cursor: pointer;
    padding: 0;
    line-height: 1;
}

.discipline-card:hover .discipline-card__delete {
    opacity: 1;
}

.discipline-card__delete:hover {
    color: var(--error, #ef4444);
}

.weight-badge {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    font-size: 0.68rem;
    font-weight: 700;
    color: #fff;
    border-radius: 999px;
    padding: 0.1rem 0.45rem;
    min-width: 1.8rem;
    line-height: 1.4;
    flex-shrink: 0;
}
</style>