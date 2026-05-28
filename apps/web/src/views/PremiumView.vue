<script setup lang="ts">
import { api } from '@/lib/axios';
import { ref, onMounted } from 'vue';
import { VCard, VButton, VSpinner } from '@/components/ui';

const mytext = ref("")
const isLoading = ref(true)
const isError = ref(false)

async function init() {
    isLoading.value = true
    isError.value = false
    try {
        const res = await api.get("/users/plan/premium")
        mytext.value = res.data
    } catch (error) {
        console.error("Erro ao carregar dados do plano premium:", error)
        isError.value = true
    } finally {
        isLoading.value = false
    }
}

onMounted(() => {
    init()
})
</script>

<template>
  <div class="premium-dashboard p-8 max-w-7xl mx-auto space-y-12 animate-fade-in pb-12">
    <!-- View Header -->
    <header class="view-header flex flex-col md:flex-row md:items-end justify-between gap-6">
      <div class="space-y-2">
        <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-600 dark:text-amber-400 text-xs font-bold uppercase tracking-widest animate-pulse">
          <i class="pi pi-star-fill text-[10px]"></i>
          Área Exclusiva Premium
        </div>
        <h2 class="text-4xl md:text-5xl font-headline font-bold text-on-surface tracking-tight text-left">
          Vincis <span class="bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-600 bg-clip-text text-transparent">Scholar Elite</span>
        </h2>
        <p class="text-on-surface-muted max-w-xl text-sm leading-relaxed text-left">
          Bem-vindo ao topo do seu desempenho acadêmico. Aqui estão as ferramentas de inteligência artificial de última geração preparadas exclusivamente para você.
        </p>
      </div>
      <div class="flex items-center gap-2 text-xs font-semibold text-on-surface-muted bg-surface-container-low px-4 py-2.5 rounded-xl border soft-brutalist-border">
        <span class="w-2.5 h-2.5 rounded-full bg-green-500 animate-ping"></span>
        Status: {{ mytext || 'Verificando assinatura...' }}
      </div>
    </header>

    <!-- Content Area -->
    <div v-if="isLoading" class="flex justify-center items-center h-64">
      <VSpinner />
    </div>

    <div v-else-if="isError" class="bg-red-500/5 border border-red-500/20 rounded-2xl p-8 text-center space-y-4">
      <i class="pi pi-exclamation-triangle text-4xl text-red-500"></i>
      <h3 class="text-xl font-bold">Erro ao verificar assinatura Premium</h3>
      <p class="text-on-surface-muted text-sm max-w-md mx-auto">
        Não conseguimos carregar suas credenciais premium. Por favor, tente novamente ou verifique se o seu plano atual é de fato Premium.
      </p>
      <VButton @click="init" variant="secondary">Tentar Novamente</VButton>
    </div>

    <div v-else class="space-y-12">
      <!-- Bento Grid Exclusivo Premium -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        <!-- IA Simulados Card -->
        <div class="premium-card relative overflow-hidden group border text-left">
          <div class="absolute inset-0 bg-gradient-to-br from-amber-500/10 via-transparent to-transparent group-hover:opacity-100 transition-opacity opacity-50 duration-500"></div>
          <div class="card-content p-6 space-y-4 flex flex-col h-full relative z-10">
            <div class="w-12 h-12 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-500 group-hover:scale-110 transition-transform duration-300">
              <i class="pi pi-bolt text-2xl"></i>
            </div>
            <h3 class="text-xl font-bold font-headline">Simulados Adaptativos com IA</h3>
            <p class="text-xs text-on-surface-muted leading-relaxed flex-1">
              Questões geradas dinamicamente com base nas suas fraquezas de estudo. A IA analisa seus logs de erro e constrói o simulado perfeito para você evoluir.
            </p>
            <VButton variant="primary" class="w-full mt-4 group-hover:translate-y-[-2px] transition-transform duration-300">
              Gerar Simulado IA
            </VButton>
          </div>
        </div>

        <!-- Questões Comentadas Card -->
        <div class="premium-card relative overflow-hidden group border text-left">
          <div class="absolute inset-0 bg-gradient-to-br from-amber-500/10 via-transparent to-transparent group-hover:opacity-100 transition-opacity opacity-50 duration-500"></div>
          <div class="card-content p-6 space-y-4 flex flex-col h-full relative z-10">
            <div class="w-12 h-12 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-500 group-hover:scale-110 transition-transform duration-300">
              <i class="pi pi-comments text-2xl"></i>
            </div>
            <h3 class="text-xl font-bold font-headline">Gabaritos Comentados por IA</h3>
            <p class="text-xs text-on-surface-muted leading-relaxed flex-1">
              Esqueça gabaritos secos. Para qualquer questão errada, a IA do Vincis gera uma explicação pedagógica personalizada no formato "Pulo do Gato".
            </p>
            <VButton variant="secondary" class="w-full mt-4 group-hover:translate-y-[-2px] transition-transform duration-300">
              Explorar Questões
            </VButton>
          </div>
        </div>

        <!-- Revisão Espaçada IA Card -->
        <div class="premium-card relative overflow-hidden group border text-left">
          <div class="absolute inset-0 bg-gradient-to-br from-amber-500/10 via-transparent to-transparent group-hover:opacity-100 transition-opacity opacity-50 duration-500"></div>
          <div class="card-content p-6 space-y-4 flex flex-col h-full relative z-10">
            <div class="w-12 h-12 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-500 group-hover:scale-110 transition-transform duration-300">
              <i class="pi pi-calendar text-2xl"></i>
            </div>
            <h3 class="text-xl font-bold font-headline">Revisão Espaçada Avançada</h3>
            <p class="text-xs text-on-surface-muted leading-relaxed flex-1">
              Cronograma preditivo baseado na curva de esquecimento de Ebbinghaus calibrada pela sua taxa de retenção real. A IA avisa o dia exato de revisar.
            </p>
            <VButton variant="secondary" class="w-full mt-4 group-hover:translate-y-[-2px] transition-transform duration-300">
              Ver Agenda IA
            </VButton>
          </div>
        </div>

      </div>

      <!-- Feature Highlight section -->
      <section class="premium-banner rounded-3xl p-8 relative overflow-hidden flex flex-col md:flex-row items-center gap-8 border">
        <!-- Glow accents -->
        <div class="absolute -right-24 -bottom-24 w-96 h-96 rounded-full bg-gradient-to-br from-amber-500/20 to-transparent blur-3xl" aria-hidden="true"></div>
        <div class="absolute -left-24 -top-24 w-96 h-96 rounded-full bg-gradient-to-br from-yellow-400/10 to-transparent blur-3xl" aria-hidden="true"></div>

        <div class="space-y-4 flex-1 relative z-10 text-left">
          <span class="text-[10px] font-bold text-amber-500 uppercase tracking-widest">
            Fator de Desempenho
          </span>
          <h3 class="text-2xl md:text-3xl font-headline font-bold">Diagnóstico Cognitivo Geral</h3>
          <p class="text-xs text-on-surface-muted leading-relaxed max-w-xl">
            Sua taxa média de retenção está em <strong class="text-amber-500">92%</strong> com as revisões ativas. Seus pontos de atenção continuam sendo disciplinas de alta carga matemática, mas a IA já está adaptando os próximos cronogramas.
          </p>
        </div>
        <div class="flex-shrink-0 flex gap-6 items-center relative z-10">
          <div class="text-center bg-surface-container-high/40 backdrop-blur-md px-6 py-4 rounded-2xl border soft-brutalist-border">
            <p class="text-3xl font-serif font-bold text-amber-500">92%</p>
            <p class="text-[10px] font-bold uppercase text-on-surface-muted mt-1">Retenção</p>
          </div>
          <div class="text-center bg-surface-container-high/40 backdrop-blur-md px-6 py-4 rounded-2xl border soft-brutalist-border">
            <p class="text-3xl font-serif font-bold text-amber-500">2.4x</p>
            <p class="text-[10px] font-bold uppercase text-on-surface-muted mt-1">Mais Rápido</p>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>

<style scoped>
.premium-card {
  background: var(--color-surface-container-lowest);
  border: 1px solid color-mix(in srgb, var(--color-on-surface) 8%, transparent);
  border-radius: 1.5rem;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.premium-card:hover {
  border-color: color-mix(in srgb, var(--color-primary) 30%, transparent);
  box-shadow: 0 12px 40px color-mix(in srgb, var(--color-primary) 8%, transparent);
  transform: translateY(-4px);
}

.premium-banner {
  background: linear-gradient(to right, var(--color-surface-container-low), var(--color-surface-container-lowest));
  border-color: color-mix(in srgb, var(--color-on-surface) 8%, transparent);
}
</style>