<script setup lang="ts">
defineProps<{
  isEmpty?: boolean
  highlightDiscipline?: string
  retentionRate?: string
  fatigueDiscipline?: string
  recommendationText?: string
  actionLink?: string
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
      
      <!-- Estado Vazio (Sem disciplinas/tarefas) -->
      <div v-if="isEmpty" class="space-y-4 max-w-2xl text-left">
        <p class="text-lg font-headline text-on-surface-variant leading-relaxed">
          Parece que você ainda não começou a cadastrar sua rotina de estudos.
        </p>
        <p class="text-sm font-body text-secondary leading-relaxed">
          Para que a inteligência artificial possa gerar insights e analisar o seu desempenho acadêmico, recomendamos cadastrar suas disciplinas e tarefas do dia. Dê o primeiro passo agora mesmo!
        </p>
        <div class="mt-6 flex flex-wrap gap-3">
          <router-link to="/private/disciplinas" class="px-4 py-2.5 bg-primary text-on-primary rounded-lg text-xs font-bold hover:bg-primary/90 transition-all flex items-center gap-1.5 active:scale-95 shadow-sm">
            <i class="pi pi-book"></i>
            Cadastrar Disciplinas
          </router-link>
          <router-link to="/private/tasks" class="px-4 py-2.5 bg-surface-container-high border border-outline-variant/30 text-on-surface rounded-lg text-xs font-bold hover:bg-surface-container-highest transition-all flex items-center gap-1.5 active:scale-95">
            <i class="pi pi-check-circle"></i>
            Criar Tarefas
          </router-link>
        </div>
      </div>
      
      <div v-else class="space-y-4 max-w-2xl text-left">
        <!-- Estado Ativo (Com dados) -->
        <p class="text-lg font-headline italic text-on-surface-variant leading-relaxed">
          "Seu desempenho em <span class="text-on-surface font-bold">{{ highlightDiscipline }}</span> mostra uma curva de retenção excepcional de {{ retentionRate }}. No entanto, observamos uma fadiga cognitiva após 45 minutos de estudo em <span class="text-on-surface font-bold">{{ fatigueDiscipline }}</span>."
        </p>
        <p class="text-sm font-body text-secondary leading-relaxed">
          {{ recommendationText }}
        </p>
        <div class="mt-8 flex items-center gap-4">
          <router-link :to="actionLink || '/private/disciplinas'" class="flex items-center gap-2 text-primary font-bold font-label text-sm group-hover:underline">
            Ver plano de ação completo
            <i class="pi pi-arrow-right text-sm"></i>
          </router-link>
        </div>
      </div>
      
    </div>
  </div>
</template>
