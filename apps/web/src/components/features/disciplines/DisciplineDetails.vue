<script setup lang="ts">
import { ref } from 'vue'
import DisciplineSettings from './DisciplineSettings.vue'
import DisciplineTopicManager from './DisciplineTopicManager.vue'

const props = defineProps<{
    isOpen: boolean;
    discipline: any | null;
}>();

const emit = defineEmits<{
    (e: 'update:isOpen', value: boolean): void;
    (e: 'update:discipline', discipline: any): void;
}>();

const topicsCount = ref(0)

function closePanel() {
    emit('update:isOpen', false)
}

function handleDisciplineUpdate(updated: any) {
    emit('update:discipline', updated)
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
                        <div class="min-w-0">
                            <h2 class="detail__title">{{ discipline?.name }}</h2>
                            <p class="detail__subtitle">{{ topicsCount }} tópico{{ topicsCount !== 1 ? 's' : '' }}</p>
                        </div>
                    </div>
                    <button class="detail__close" @click="closePanel" title="Fechar">
                        <span class="material-symbols-outlined">close</span>
                    </button>
                </div>

                <template v-if="discipline">
                    <DisciplineTopicManager 
                        :discipline-id="discipline.id" 
                        :panel-color="discipline.color"
                        @update:topicsCount="topicsCount = $event" 
                    />
                    <DisciplineSettings 
                        :discipline="discipline" 
                        @update:discipline="handleDisciplineUpdate" 
                    />
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