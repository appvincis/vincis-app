<script setup lang="ts">
import { useStudyPlanStore } from '@/stores/study-plan';
import { VButton } from '@/components/ui'
const props = defineProps(['errorMsg'])
const studyPlanStore = useStudyPlanStore()

const emit = defineEmits(['create-discipline'])
</script>

<template>
    <!-- Header -->
    <header class="view-header">
        <div class="flex items-center justify-between">
            <div>
                <h1 class="text-4xl font-serif font-bold text-on-surface">Disciplinas</h1>
                <p class="text-secondary mt-2">Organize suas matérias e adicione tópicos de estudo.</p>
            </div>
            <VButton @click="$emit('create-discipline')" variant="primary" :disabled="!studyPlanStore.hasActivePlan"
                :title="!studyPlanStore.hasActivePlan ? 'Selecione um plano de estudo primeiro' : ''">
                <span class="material-symbols-outlined"
                    style="font-size:1.1rem;vertical-align:-3px;margin-right:6px">add</span>
                Nova Disciplina
            </VButton>
        </div>

        <!-- No active plan warning -->
        <div v-if="!studyPlanStore.activePlanId"
            class="mt-4 p-3 rounded-lg bg-error/10 border border-error/30 text-error text-sm flex items-center gap-2">
            <span class="material-symbols-outlined text-sm">warning</span>
            Nenhum plano de estudo ativo. Selecione um plano no Dashboard.
        </div>

        <!-- Error -->
        <div v-if="errorMsg" class="mt-3 p-3 rounded-lg bg-error/10 border border-error/30 text-error text-sm">
            {{ errorMsg }}
        </div>
    </header>
</template>

<style scoped>
.view-header {
    margin-bottom: 2rem;
}
</style>
