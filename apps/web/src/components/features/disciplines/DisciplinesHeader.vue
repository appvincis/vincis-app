<script setup lang="ts">
import { useStudyPlanStore } from '@/stores/study-plan';
import { VButton } from '@/components/ui'

const props = defineProps<{
    errorMsg?: string;
    viewMode: 'ACTIVE' | 'ARCHIVED';
    displayFormat: 'GRID' | 'LIST';
    hasOtherPlans: boolean;
    selectedCount: number;
}>()

const studyPlanStore = useStudyPlanStore()

defineEmits<{
    (e: 'create-discipline'): void;
    (e: 'export-disciplines'): void;
    (e: 'import-disciplines'): void;
    (e: 'clone-disciplines'): void;
    (e: 'update:viewMode', value: 'ACTIVE' | 'ARCHIVED'): void;
    (e: 'update:displayFormat', value: 'GRID' | 'LIST'): void;
}>()
</script>

<template>
    <header class="mb-8">
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
            <div class="flex flex-wrap gap-1.5">
                <VButton
                    v-if="hasOtherPlans"
                    @click="$emit('clone-disciplines')"
                    variant="secondary"
                    size="small"
                    :disabled="!studyPlanStore.hasActivePlan"
                >
                    <i class="pi pi-clone text-xs mr-1.5"></i>
                    {{ selectedCount > 0 ? 'Clonar Selecionadas' : 'Clonar de outro plano' }}
                </VButton>
                <VButton
                    @click="$emit('export-disciplines')"
                    variant="secondary"
                    size="small"
                    :disabled="!studyPlanStore.hasActivePlan"
                >
                    <i class="pi pi-download text-xs mr-1.5"></i>
                    Exportar
                </VButton>
                <VButton
                    @click="$emit('import-disciplines')"
                    variant="secondary"
                    size="small"
                    :disabled="!studyPlanStore.hasActivePlan"
                >
                    <i class="pi pi-upload text-xs mr-1.5"></i>
                    Importar
                </VButton>
                <VButton
                    @click="$emit('create-discipline')"
                    variant="primary"
                    size="small"
                    :disabled="!studyPlanStore.hasActivePlan"
                    :title="!studyPlanStore.hasActivePlan ? 'Selecione um plano de estudo primeiro' : ''"
                >
                    <i class="pi pi-plus text-xs mr-1.5"></i>
                    Nova Disciplina
                </VButton>
            </div>
        </div>

        <!-- Secondary Navigation and Layout Toggles Bar -->
        <div v-if="studyPlanStore.hasActivePlan" class="mt-8 flex flex-wrap items-center justify-between gap-4 border-b border-outline-variant/20 pb-4">
            <!-- Active/Archived Tabs -->
            <div class="flex bg-surface-container-low p-1 rounded-xl border border-outline-variant/30">
                <button
                    @click="$emit('update:viewMode', 'ACTIVE')"
                    class="px-4 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer"
                    :class="viewMode === 'ACTIVE' ? 'bg-primary text-white shadow-md' : 'text-on-surface-muted hover:text-on-surface'"
                >
                    Ativas
                </button>
                <button
                    @click="$emit('update:viewMode', 'ARCHIVED')"
                    class="px-4 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer"
                    :class="viewMode === 'ARCHIVED' ? 'bg-primary text-white shadow-md' : 'text-on-surface-muted hover:text-on-surface'"
                >
                    Arquivadas
                </button>
            </div>

            <!-- Grid/List View Toggles -->
            <div class="flex bg-surface-container-low p-1 rounded-xl border border-outline-variant/30">
                <button
                    @click="$emit('update:displayFormat', 'GRID')"
                    class="p-2 rounded-lg transition-all cursor-pointer flex items-center justify-center"
                    :class="displayFormat === 'GRID' ? 'bg-surface-container text-primary shadow-sm' : 'text-on-surface-muted hover:text-on-surface'"
                    title="Visualizar em Grade"
                >
                    <i class="pi pi-th-large text-sm"></i>
                </button>
                <button
                    @click="$emit('update:displayFormat', 'LIST')"
                    class="p-2 rounded-lg transition-all cursor-pointer flex items-center justify-center"
                    :class="displayFormat === 'LIST' ? 'bg-surface-container text-primary shadow-sm' : 'text-on-surface-muted hover:text-on-surface'"
                    title="Visualizar em Lista"
                >
                    <i class="pi pi-list text-sm"></i>
                </button>
            </div>
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
