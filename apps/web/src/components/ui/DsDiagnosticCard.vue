<script setup lang="ts">
import { VSpinner } from '.'

defineProps<{
  isEmpty?: boolean
  isPremium?: boolean
  isLoading?: boolean
  hasData?: boolean
  highlightDiscipline?: string
  retentionRate?: string
  fatigueDiscipline?: string
  recommendationText?: string
}>()

defineEmits(['generate'])
</script>

<template>
  <div class="bg-surface-container-low rounded-xl p-8 relative overflow-hidden soft-brutalist-border group">
    <!-- Glow effect -->
    <div
      class="absolute -right-12 -top-12 w-64 h-64 bg-primary/5 rounded-full blur-3xl group-hover:bg-primary/10 transition-colors">
    </div>

    <div class="relative z-10 flex flex-col h-full">
      <div class="flex items-center gap-2 mb-6">
        <span
          class="bg-primary-container text-on-primary-container text-[10px] font-bold font-label p-1.5 rounded uppercase tracking-wider">IA
          Insights</span>
        <span class="text-secondary text-xs font-label">Atualizado há pouco</span>
      </div>

      <h3 class="text-3xl font-headline font-bold mb-4 leading-tight">Diagnóstico Vincis</h3>

      <!-- Estado de Loading -->
      <div v-if="isLoading" class="flex flex-col items-center justify-center py-8 space-y-4">
        <VSpinner />
        <p class="text-sm font-label text-on-surface-muted animate-pulse">A Inteligência Artificial está analisando seu
          desempenho...</p>
      </div>

      <!-- Estado Upsell (Basic Plan) -->
      <div v-else-if="!isPremium" class="space-y-4 max-w-2xl text-left">
        <div
          class="p-4 bg-surface-container-highest border border-outline-variant/30 rounded-xl relative overflow-hidden">
          <div class="absolute -right-4 -top-4 w-24 h-24 bg-primary/10 rounded-full blur-2xl"></div>
          <div class="relative z-10 flex flex-col gap-3">
            <div class="flex items-center gap-2 text-primary">
              <i class="pi pi-lock text-xl"></i>
              <span class="font-bold font-headline">Recurso Exclusivo Premium</span>
            </div>
            <p class="text-sm font-body text-on-surface-variant leading-relaxed">
              Desbloqueie o Diagnóstico IA para receber análises profundas sobre sua curva de retenção, pontos de fadiga
              cognitiva e dicas personalizadas para o seu estudo.
            </p>
            <div class="mt-2">
              <router-link to="/private/premium"
                class="inline-flex items-center gap-2 px-4 py-2 bg-primary text-on-primary rounded-lg text-xs font-bold hover:bg-primary/90 transition-all active:scale-95 shadow-sm">
                <i class="pi pi-star-fill text-[10px]"></i>
                Fazer Upgrade
              </router-link>
            </div>
          </div>
        </div>
      </div>

      <!-- Estado Vazio (Sem disciplinas/tarefas para IA ler) -->
      <div v-else-if="isEmpty" class="space-y-4 max-w-2xl text-left">
        <p class="text-lg font-headline text-on-surface-variant leading-relaxed">
          Parece que você ainda não começou a cadastrar sua rotina de estudos.
        </p>
        <p class="text-sm font-body text-secondary leading-relaxed">
          Para que a inteligência artificial possa gerar insights e analisar o seu desempenho acadêmico, recomendamos
          cadastrar suas disciplinas e tarefas do dia. Dê o primeiro passo agora mesmo!
        </p>
        <div class="mt-6 flex flex-wrap gap-3">
          <router-link to="/private/disciplinas"
            class="px-4 py-2.5 bg-primary text-on-primary rounded-lg text-xs font-bold hover:bg-primary/90 transition-all flex items-center gap-1.5 active:scale-95 shadow-sm">
            <i class="pi pi-book"></i>
            Cadastrar Disciplinas
          </router-link>
          <router-link to="/private/tasks"
            class="px-4 py-2.5 bg-surface-container-high border border-outline-variant/30 text-on-surface rounded-lg text-xs font-bold hover:bg-surface-container-highest transition-all flex items-center gap-1.5 active:scale-95">
            <i class="pi pi-check-circle"></i>
            Criar Tarefas
          </router-link>
        </div>
      </div>

      <!-- Estado Premium: Botão para Gerar (Ainda não gerado) -->
      <div v-else-if="!hasData" class="space-y-4 max-w-2xl text-left">
        <p class="text-lg font-headline text-on-surface-variant leading-relaxed">
          Sua inteligência artificial está pronta para analisar seu desempenho recente.
        </p>
        <p class="text-sm font-body text-secondary leading-relaxed">
          Nós utilizamos seus últimos 30 dias de sessões de estudo e registros de erro para montar um relatório
          detalhado e identificar onde você pode focar sua revisão.
        </p>
        <div class="mt-4">
          <button @click="$emit('generate')"
            class="cursor-pointer px-4 py-2.5 bg-primary text-on-primary rounded-lg text-xs font-bold hover:bg-primary/90 transition-all flex items-center gap-2 active:scale-95 shadow-sm">
            <i class="pi pi-sparkles"></i>
            Gerar Diagnóstico IA
          </button>
        </div>
      </div>

      <!-- Estado Ativo (Com dados) -->
      <div v-else class="space-y-4 max-w-2xl text-left animate-fade-in">
        <p class="text-lg font-headline italic text-on-surface-variant leading-relaxed">
          "Seu desempenho em <span class="text-on-surface font-bold">{{ highlightDiscipline }}</span> mostra uma
          retenção <span class="text-on-surface font-bold">{{ retentionRate }}</span>. No entanto, observamos uma fadiga
          cognitiva ou repetição de erros em <span class="text-on-surface font-bold">{{ fatigueDiscipline }}</span>."
        </p>
        <p class="text-sm font-body text-secondary leading-relaxed break-words whitespace-pre-wrap">
          <i class="pi pi-lightbulb text-primary mr-1 text-xs"></i>
          {{ recommendationText }}
        </p>
        <div class="mt-8 flex items-center gap-4">
          <button @click="$emit('generate')"
            class="cursor-pointer flex items-center gap-2 text-primary font-bold font-label text-sm hover:underline active:scale-95 transition-all">
            <i class="pi pi-refresh text-sm"></i>
            Gerar novo relatório
          </button>
        </div>
      </div>

    </div>
  </div>
</template>

<style scoped>
.animate-fade-in {
  animation: fadeIn 0.5s ease-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(5px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
