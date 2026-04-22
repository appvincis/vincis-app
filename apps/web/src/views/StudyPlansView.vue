<script setup lang="ts">
import { VCard } from '../components/ui'
</script>

<template>
  <div class="study-plans-view">
    <header class="view-header">
      <h1 class="text-4xl font-serif font-bold text-on-surface">Planos de Estudo</h1>
      <p class="text-secondary mt-2">Gerencie seus roteiros de aprendizado.</p>
    </header>
    
    <div class="mt-8">
      <VCard class="p-12 text-center border-dashed border-2 border-outline-variant/30">
        <span class="material-symbols-outlined text-6xl text-outline-variant mb-4">auto_stories</span>
        <h3 class="text-xl font-serif font-bold text-on-surface">Nenhum plano ativo</h3>
        <p class="text-secondary mt-2 max-w-md mx-auto">
          Crie seu primeiro plano de estudos para começar a organizar sua jornada acadêmica.
        </p>
      </VCard>
    </div>
  </div>
</template>

<style scoped>
.view-header {
  margin-bottom: 2rem;
}
</style>
