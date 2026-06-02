<script setup lang="ts">
// Empty state para quando não há plano de estudo selecionado
</script>

<template>
    <div
        class="flex flex-col items-center justify-center py-20 px-4 border border-dashed rounded-3xl bg-surface-container-low/30 backdrop-blur-sm space-y-4 text-center">
        <div class="w-16 h-16 rounded-full bg-primary/5 flex items-center justify-center text-primary">
            <i class="pi pi-book text-3xl"></i>
        </div>
        <div class="space-y-1">
            <h3 class="text-lg font-bold">Nenhum plano ativo</h3>
            <p class="text-xs text-on-surface-muted max-w-xs leading-relaxed">
                Selecione um plano de estudo para iniciar suas sessões de foco.
            </p>
        </div>
    </div>
</template>
