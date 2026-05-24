<script setup lang="ts">
import { useStudyPlanStore } from '@/stores/study-plan';
import { VButton } from '@/components/ui'
const props = defineProps(['errorMsg'])
const studyPlanStore = useStudyPlanStore()
defineEmits(['create-discipline'])
</script>

<template>
    <header class="mb-12">
        <div class="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
                <p class="text-xs font-label font-bold uppercase tracking-[0.2em] text-primary mb-2">Módulo Acadêmico</p>
                <h1 class="text-4xl md:text-5xl font-headline font-bold text-on-surface tracking-tight relative inline-block">
                    Suas Disciplinas
                    <div class="absolute -bottom-2 left-0 w-24 h-1 bg-primary-container/70 rounded-full"></div>
                </h1>
                <p class="mt-6 text-on-surface-muted font-sans max-w-2xl leading-relaxed text-sm">
                    Gerencie seu percurso acadêmico. Acompanhe o progresso das matérias e organize seus tópicos de estudo.
                </p>
            </div>
            <VButton
                @click="$emit('create-discipline')"
                variant="primary"
                :disabled="!studyPlanStore.hasActivePlan"
                :title="!studyPlanStore.hasActivePlan ? 'Selecione um plano de estudo primeiro' : ''"
            >
                <i class="pi pi-plus" style="font-size:1rem;vertical-align:-2px;margin-right:6px"></i>
                Nova Disciplina
            </VButton>
        </div>

        <div
            v-if="!studyPlanStore.activePlanId"
            class="mt-6 p-3 rounded-lg bg-error/10 border border-error/30 text-error text-sm flex items-center gap-2"
        >
            <i class="pi pi-exclamation-triangle text-sm"></i>
            Nenhum plano de estudo ativo. Selecione um plano no seletor da barra lateral.
        </div>

        <div v-if="errorMsg" class="mt-3 p-3 rounded-lg bg-error/10 border border-error/30 text-error text-sm">
            {{ errorMsg }}
        </div>
    </header>
</template>
