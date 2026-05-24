<script lang="ts" setup>
import { computed } from 'vue'

const props = defineProps<{
    discipline: any;
    isActive?: boolean;
}>()

defineEmits<{
    (e: 'click'): void;
    (e: 'delete'): void;
}>()

const topicsTotal = computed(() => props.discipline.topics?.length ?? 0)
const topicsCompleted = computed(() => props.discipline.topics?.filter((t: any) => t.isCompleted).length ?? 0)
const progress = computed(() =>
    topicsTotal.value ? Math.round((topicsCompleted.value / topicsTotal.value) * 100) : 0
)
</script>

<template>
    <button
        class="group relative bg-surface-container-lowest p-6 rounded-xl border transition-all duration-300 flex flex-col justify-between aspect-square text-left cursor-pointer w-full"
        :class="isActive
            ? 'border-primary-container shadow-md'
            : 'border-on-surface/10 hover:border-primary-container hover:shadow-sm'"
        @click="$emit('click')"
    >
        <!-- Delete button -->
        <button
            class="absolute top-3 right-3 w-7 h-7 rounded-lg flex items-center justify-center text-on-surface-muted opacity-0 group-hover:opacity-100 hover:bg-error/10 hover:text-error transition-all duration-150 cursor-pointer"
            @click.stop="$emit('delete')"
            title="Remover disciplina"
        >
            <i class="pi pi-trash text-[11px]"></i>
        </button>

        <!-- Top section: tag + name + topics count -->
        <div>
            <div class="flex items-center gap-2 mb-3">
                <span class="text-[10px] font-label font-bold tracking-[0.15em] uppercase text-primary">
                    Peso {{ (discipline.weight ?? 1).toFixed(1) }}
                </span>
            </div>
            <h3 class="text-xl font-headline font-bold text-on-surface group-hover:text-primary transition-colors leading-tight pr-8">
                {{ discipline.name }}
            </h3>
            <p class="text-xs text-on-surface-muted font-sans mt-2">
                <span v-if="topicsTotal === 0">Nenhum tópico ainda</span>
                <span v-else>{{ topicsTotal }} tópico{{ topicsTotal !== 1 ? 's' : '' }} · {{ topicsCompleted }} concluído{{ topicsCompleted !== 1 ? 's' : '' }}</span>
            </p>
        </div>

        <!-- Bottom: progress bar -->
        <div class="mt-6">
            <div class="flex justify-between items-end mb-2">
                <span class="text-[10px] font-label font-bold text-on-surface-muted uppercase tracking-wider">Progresso</span>
                <span class="text-sm font-label font-bold text-on-surface">{{ progress }}%</span>
            </div>
            <div class="h-1.5 w-full bg-surface-container rounded-full overflow-hidden">
                <div
                    class="h-full rounded-full transition-all duration-500"
                    :style="{ width: `${progress}%`, background: discipline.color }"
                />
            </div>
        </div>
    </button>
</template>
