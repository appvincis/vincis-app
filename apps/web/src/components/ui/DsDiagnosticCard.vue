<script setup lang="ts">
defineProps<{
  highlightDiscipline: string
  retentionRate: string
  fatigueDiscipline: string
  recommendationText: string
  actionLink: string
}>()
</script>

<template>
  <div class="bg-surface-container-low rounded-xl p-8 relative overflow-hidden soft-brutalist-border group">
    <!-- Glow effect -->
    <div class="absolute -right-12 -top-12 w-64 h-64 bg-primary/5 rounded-full blur-3xl group-hover:bg-primary/10 transition-colors"></div>
    
    <div class="relative z-10 flex flex-col h-full">
      <div class="flex items-center gap-2 mb-6">
        <span class="bg-primary-container text-on-primary-container text-[10px] font-bold font-label px-2 py-0.5 rounded uppercase tracking-wider">IA Insights</span>
        <span class="text-secondary text-xs font-label">Atualizado há pouco</span>
      </div>
      
      <h3 class="text-3xl font-headline font-bold mb-4 leading-tight">Diagnóstico Vincis</h3>
      
      <div class="space-y-4 max-w-2xl">
        <p class="text-lg font-headline italic text-on-surface-variant leading-relaxed">
          "Seu desempenho em <span class="text-on-surface font-bold">{{ highlightDiscipline }}</span> mostra uma curva de retenção excepcional de {{ retentionRate }}. No entanto, observamos uma fadiga cognitiva após 45 minutos de estudo em <span class="text-on-surface font-bold">{{ fatigueDiscipline }}</span>."
        </p>
        <p class="text-sm font-body text-secondary leading-relaxed">
          {{ recommendationText }}
        </p>
      </div>
      
      <div class="mt-8 flex items-center gap-4">
        <router-link :to="actionLink" class="flex items-center gap-2 text-primary font-bold font-label text-sm group-hover:underline">
          Ver plano de ação completo
          <i class="pi pi-arrow-right text-sm"></i>
        </router-link>
      </div>
    </div>
  </div>
</template>
