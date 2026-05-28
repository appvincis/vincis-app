<script setup lang="ts">
// Vue component for Tasks view
</script>

<template>
  <div class="p-8 max-w-7xl mx-auto space-y-12 animate-fade-in pb-12">
    <!-- View Header -->
    <header class="view-header flex flex-col md:flex-row md:items-end justify-between gap-6">
      <div class="space-y-2">
        <p class="font-label text-xs uppercase tracking-[0.2em] text-primary font-bold">Organização</p>
        <h2 class="text-4xl md:text-5xl font-headline font-bold text-on-surface tracking-tight text-left">
          Tarefas
        </h2>
        <p class="text-on-surface-muted max-w-xl text-sm leading-relaxed text-left">
          Gerencie suas tarefas diárias de estudo, revisões e metas acadêmicas.
        </p>
      </div>
    </header>

    <!-- Empty State Content -->
    <div class="flex flex-col items-center justify-center py-20 px-4 border border-dashed rounded-3xl bg-surface-container-low/30 backdrop-blur-sm space-y-4 text-center">
      <div class="w-16 h-16 rounded-full bg-primary/5 flex items-center justify-center text-primary">
        <i class="pi pi-check-circle text-3xl"></i>
      </div>
      <div class="space-y-1">
        <h3 class="text-lg font-bold">Nenhuma tarefa criada</h3>
        <p class="text-xs text-on-surface-muted max-w-xs leading-relaxed">
          Você não tem nenhuma tarefa pendente para hoje. Adicione novas tarefas para começar a organizar sua rotina.
        </p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.animate-fade-in {
  animation: fadeIn 0.4s ease-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
