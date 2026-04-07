<script setup lang="ts">
import { ref } from 'vue';
import { VButton, VBadge, VAlert, VCard, VCheckbox, VInput, VSelect, VToggle } from '@/components/ui'


// Form state examples
const inputDefault  = ref('');
const inputFocus    = ref('Fenomenologia');
const inputError    = ref('32/13/2023');
const inputDisabled = ref('Dr. Aris V. — Premium Member');
const textarea      = ref('');
const selectVal     = ref('Filosofia Analítica');
const check1 = ref(true);
const check2 = ref(false);
const check3 = ref(true);
const toggle1 = ref(true);
const toggle2 = ref(false);

const disciplineOptions = [
  { value: 'Filosofia Analítica', label: 'Filosofia Analítica' },
  { value: 'Fenomenologia',       label: 'Fenomenologia' },
  { value: 'Lógica Formal',       label: 'Lógica Formal' },
  { value: 'Ética e Política',    label: 'Ética e Política' },
];
</script>

<template>
  <div class="text-on-surface min-h-screen">

    <!-- ═══════════════════════════════════════
         TOP HEADER
    ═══════════════════════════════════════ -->
    <header class="sticky top-0 z-50 bg-[#fdf9f6] border-b border-outline-variant/20 shadow-[0_4px_24px_rgba(28,27,26,0.05)]">
      <div class="max-w-5xl mx-auto px-8 py-4 flex items-center justify-between">
        <div class="flex items-center gap-3">
          <div class="w-9 h-9 bg-primary-container flex items-center justify-center rounded-lg shadow-sm">
            <span class="text-on-primary-container font-serif font-bold text-lg">V</span>
          </div>
          <div>
            <h1 class="text-lg font-bold font-serif text-on-surface leading-none">Vincis</h1>
            <p class="text-[9px] text-secondary font-label tracking-widest uppercase">Design System</p>
          </div>
        </div>
        <nav class="hidden sm:flex items-center gap-1 text-xs font-label font-semibold text-secondary">
          <a href="#typography" class="px-3 py-1.5 hover:bg-surface-container rounded transition-colors">Tipo</a>
          <a href="#colors"     class="px-3 py-1.5 hover:bg-surface-container rounded transition-colors">Cores</a>
          <a href="#buttons"    class="px-3 py-1.5 hover:bg-surface-container rounded transition-colors">Botões</a>
          <a href="#inputs"     class="px-3 py-1.5 hover:bg-surface-container rounded transition-colors">Inputs</a>
          <a href="#cards"      class="px-3 py-1.5 hover:bg-surface-container rounded transition-colors">Cards</a>
          <a href="#navigation" class="px-3 py-1.5 hover:bg-surface-container rounded transition-colors">Nav</a>
          <a href="#feedback"   class="px-3 py-1.5 hover:bg-surface-container rounded transition-colors">Feedback</a>
        </nav>
      </div>
    </header>

    <!-- ═══════════════════════════════════════
         HERO INTRO
    ═══════════════════════════════════════ -->
    <div class="max-w-5xl mx-auto px-8 pt-16 pb-12">
      <p class="text-xs font-label font-bold text-primary uppercase tracking-widest mb-3">v1.0.0 — Referência Visual</p>
      <h1 class="font-serif font-extrabold text-5xl sm:text-6xl text-on-surface leading-[1.05] mb-5">
        Vincis<br/><em class="font-normal text-primary">Design System</em>
      </h1>
      <p class="text-base text-secondary max-w-xl leading-relaxed">
        Todos os componentes, tokens e padrões visuais da plataforma Vincis em um único lugar.
        Use esta página como contexto para garantir 100% de consistência nas telas geradas.
      </p>
    </div>

    <div class="max-w-5xl mx-auto px-8 pb-24 space-y-24">

      <!-- ═══════════════════════════════════════
           1. TIPOGRAFIA
      ═══════════════════════════════════════ -->
      <section id="typography">
        <div class="vincis-section-label">01 — Tipografia</div>

        <!-- Font families display -->
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-10">
          <div class="p-6 bg-surface-container-lowest rounded-xl border border-outline-variant/20">
            <p class="text-[9px] font-label font-bold text-secondary uppercase tracking-widest mb-3">Headline · Newsreader</p>
            <p class="font-serif text-3xl font-bold text-on-surface leading-tight mb-1">Abc Defg</p>
            <p class="font-serif text-xl italic text-primary">Itálico Elegante</p>
            <p class="font-serif text-sm text-secondary mt-3">Títulos, Display, Números grandes</p>
          </div>
          <div class="p-6 bg-surface-container-lowest rounded-xl border border-outline-variant/20">
            <p class="text-[9px] font-label font-bold text-secondary uppercase tracking-widest mb-3">Body & Label · Manrope</p>
            <p class="font-body text-3xl font-bold text-on-surface leading-tight mb-1">Abc Defg</p>
            <p class="font-body text-xl font-medium text-secondary">400 · 500 · 700</p>
            <p class="font-body text-sm text-secondary mt-3">Parágrafos, Labels, UI text</p>
          </div>
        </div>

        <!-- Type scale -->
        <div class="space-y-6 p-8 bg-surface-container-lowest rounded-xl border border-outline-variant/20">
          <div class="pb-6 border-b border-outline-variant/10">
            <p class="text-[9px] font-bold text-secondary uppercase tracking-widest mb-2">Display · Newsreader 800 · 56px</p>
            <h1 class="font-serif font-extrabold text-5xl text-on-surface leading-none">Planejamento</h1>
          </div>
          <div class="pb-6 border-b border-outline-variant/10">
            <p class="text-[9px] font-bold text-secondary uppercase tracking-widest mb-2">H1 · Newsreader 700 · 40px</p>
            <h1 class="font-serif font-bold text-4xl text-on-surface">Outubro 2023</h1>
          </div>
          <div class="pb-6 border-b border-outline-variant/10">
            <p class="text-[9px] font-bold text-secondary uppercase tracking-widest mb-2">H2 · Newsreader 700 · 30px</p>
            <h2 class="font-serif font-bold text-3xl text-on-surface">Agenda Inteligente</h2>
          </div>
          <div class="pb-6 border-b border-outline-variant/10">
            <p class="text-[9px] font-bold text-secondary uppercase tracking-widest mb-2">H3 · Newsreader 700 · 24px</p>
            <h3 class="font-serif font-bold text-2xl text-on-surface">Linha do Tempo</h3>
          </div>
          <div class="pb-6 border-b border-outline-variant/10">
            <p class="text-[9px] font-bold text-secondary uppercase tracking-widest mb-2">H4 · Newsreader 600 · 18px</p>
            <h4 class="font-serif font-bold text-lg text-on-surface">Estudo Dirigido — Fenomenologia da Percepção</h4>
          </div>
          <div class="pb-6 border-b border-outline-variant/10">
            <p class="text-[9px] font-bold text-secondary uppercase tracking-widest mb-2">Body Large · Manrope 400 · 16px</p>
            <p class="font-body text-base text-on-surface leading-relaxed max-w-xl">
              Otimize suas janelas de estudo baseando-se no seu ritmo circadiano e metas de disciplina. A IA analisa seu histórico de produtividade.
            </p>
          </div>
          <div class="pb-6 border-b border-outline-variant/10">
            <p class="text-[9px] font-bold text-secondary uppercase tracking-widest mb-2">Body Small · Manrope 400 · 14px</p>
            <p class="font-body text-sm text-secondary leading-relaxed max-w-xl">
              Fenomenologia da Percepção — Cap. 3 · Flashcards: Lógica Formal e Simbólica
            </p>
          </div>
          <div class="pb-6 border-b border-outline-variant/10">
            <p class="text-[9px] font-bold text-secondary uppercase tracking-widest mb-2">Label / Caption · Manrope 700 · 10px · UPPERCASE</p>
            <p class="font-label text-[10px] font-bold text-secondary uppercase tracking-widest">08:00 — 10:00 · Premium Member · Foco Semanal</p>
          </div>
          <div>
            <p class="text-[9px] font-bold text-secondary uppercase tracking-widest mb-2">Italic Accent · Newsreader 400 italic</p>
            <p class="font-serif italic text-base text-secondary">Redação da Tese — Introdução</p>
          </div>
        </div>
      </section>

      <!-- ═══════════════════════════════════════
           2. PALETA DE CORES
      ═══════════════════════════════════════ -->
      <section id="colors">
        <div class="vincis-section-label">02 — Paleta de Cores</div>

        <!-- Primary -->
        <p class="text-[9px] font-bold text-secondary uppercase tracking-widest mb-3">Primária — Ouro Acadêmico</p>
        <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
          <div v-for="swatch in [
            { bg: '#735c00', name: 'primary',          hex: '#735c00', cls: 'bg-primary' },
            { bg: '#d4af37', name: 'primary-container', hex: '#d4af37', cls: 'bg-primary-container' },
            { bg: '#e9c349', name: 'primary-fixed-dim', hex: '#e9c349', cls: 'bg-primary-fixed-dim' },
            { bg: '#ffe088', name: 'primary-fixed',     hex: '#ffe088', cls: 'bg-primary-fixed' },
          ]" :key="swatch.name" class="rounded-xl overflow-hidden border border-outline-variant/10">
            <div class="h-20" :style="`background:${swatch.bg}`"></div>
            <div class="p-3 bg-surface-container-lowest">
              <p class="text-[10px] font-bold">{{ swatch.name }}</p>
              <p class="text-[9px] text-secondary font-mono">{{ swatch.hex }}</p>
              <p class="text-[9px] text-secondary mt-0.5">{{ swatch.cls }}</p>
            </div>
          </div>
        </div>

        <!-- Secondary -->
        <p class="text-[9px] font-bold text-secondary uppercase tracking-widest mb-3">Secundária — Cinza Sábio</p>
        <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
          <div v-for="swatch in [
            { bg: '#5f5e5c', name: 'secondary',           hex: '#5f5e5c', cls: 'bg-secondary' },
            { bg: '#e5e2de', name: 'secondary-container',  hex: '#e5e2de', cls: 'bg-secondary-container' },
            { bg: '#595f67', name: 'tertiary',             hex: '#595f67', cls: 'bg-tertiary' },
            { bg: '#aeb3bc', name: 'tertiary-container',   hex: '#aeb3bc', cls: 'bg-tertiary-container' },
          ]" :key="swatch.name" class="rounded-xl overflow-hidden border border-outline-variant/10">
            <div class="h-20" :style="`background:${swatch.bg}`"></div>
            <div class="p-3 bg-surface-container-lowest">
              <p class="text-[10px] font-bold">{{ swatch.name }}</p>
              <p class="text-[9px] text-secondary font-mono">{{ swatch.hex }}</p>
              <p class="text-[9px] text-secondary mt-0.5">{{ swatch.cls }}</p>
            </div>
          </div>
        </div>

        <!-- Surfaces -->
        <p class="text-[9px] font-bold text-secondary uppercase tracking-widest mb-3">Superfícies — Camadas de Profundidade</p>
        <div class="grid grid-cols-3 sm:grid-cols-6 gap-3 mb-8">
          <div v-for="s in [
            { bg: '#ffffff', name: 'lowest', hex: '#ffffff' },
            { bg: '#f7f3f0', name: 'low',    hex: '#f7f3f0' },
            { bg: '#f1edea', name: 'container', hex: '#f1edea' },
            { bg: '#ebe7e4', name: 'high',   hex: '#ebe7e4' },
            { bg: '#e5e2df', name: 'highest', hex: '#e5e2df' },
            { bg: '#31302f', name: 'inverse', hex: '#31302f' },
          ]" :key="s.name" class="rounded-xl overflow-hidden border border-outline-variant/10">
            <div class="h-14" :style="`background:${s.bg}`"></div>
            <div class="p-2 bg-surface-container-lowest">
              <p class="text-[9px] font-bold leading-tight">{{ s.name }}</p>
              <p class="text-[8px] text-secondary font-mono">{{ s.hex }}</p>
            </div>
          </div>
        </div>

        <!-- Semantic -->
        <p class="text-[9px] font-bold text-secondary uppercase tracking-widest mb-3">Semânticas — Estado e Feedback</p>
        <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div v-for="s in [
            { bg: '#2e7d32', name: 'Sucesso', hex: '#2e7d32', cls: 'bg-success' },
            { bg: '#ba1a1a', name: 'Erro',    hex: '#ba1a1a', cls: 'bg-error' },
            { bg: '#e65100', name: 'Alerta',  hex: '#e65100', cls: 'bg-warning' },
            { bg: '#735c00', name: 'Info',    hex: '#735c00 · primary', cls: 'bg-primary' },
          ]" :key="s.name" class="rounded-xl overflow-hidden border border-outline-variant/10">
            <div class="h-14" :style="`background:${s.bg}`"></div>
            <div class="p-3 bg-surface-container-lowest">
              <p class="text-[10px] font-bold">{{ s.name }}</p>
              <p class="text-[9px] text-secondary font-mono">{{ s.hex }}</p>
              <p class="text-[9px] text-secondary">{{ s.cls }}</p>
            </div>
          </div>
        </div>
      </section>

      <!-- ═══════════════════════════════════════
           3. BOTÕES
      ═══════════════════════════════════════ -->
      <section id="buttons">
        <div class="vincis-section-label">03 — Botões</div>

        <div class="p-8 bg-surface-container-lowest rounded-xl border border-outline-variant/20 space-y-8">

          <!-- Primário -->
          <div>
            <p class="text-[9px] font-bold text-secondary uppercase tracking-widest mb-4">Primário — Ação Principal</p>
            <div class="flex flex-wrap gap-4 items-center">
              <VButton variant="primary" icon="auto_awesome">Automatizar Agenda</VButton>
              <VButton variant="primary" icon="add">Novo Evento</VButton>
              <VButton variant="primary" disabled>Desabilitado</VButton>
              <VButton variant="primary" loading>Carregando...</VButton>
            </div>
          </div>

          <!-- Primário Container -->
          <div>
            <p class="text-[9px] font-bold text-secondary uppercase tracking-widest mb-4">Primário Container — Ouro Destaque</p>
            <div class="flex flex-wrap gap-4 items-center">
              <VButton variant="primary-container" icon="bolt">Automatizar Agenda</VButton>
              <VButton variant="primary-container" icon="auto_awesome">Gerar com IA</VButton>
            </div>
          </div>

          <!-- Secundário -->
          <div>
            <p class="text-[9px] font-bold text-secondary uppercase tracking-widest mb-4">Secundário — Ação Auxiliar</p>
            <div class="flex flex-wrap gap-4 items-center">
              <VButton variant="secondary" icon="add">Novo Evento</VButton>
              <VButton variant="secondary" icon="chevron_left">Anterior</VButton>
              <VButton variant="secondary" disabled>Desabilitado</VButton>
            </div>
          </div>

          <!-- Ghost / Text -->
          <div>
            <p class="text-[9px] font-bold text-secondary uppercase tracking-widest mb-4">Ghost / Text — Ação Terciária</p>
            <div class="flex flex-wrap gap-4 items-center">
              <VButton variant="ghost" icon="arrow_forward" icon-position="right">Ver todos</VButton>
              <VButton variant="ghost" icon="notifications" />
              <button class="p-2 text-secondary hover:text-primary transition-colors active:scale-95">
                <span class="material-symbols-outlined">account_circle</span>
              </button>
              <button class="p-2 hover:bg-surface-container-high rounded transition-colors">
                <span class="material-symbols-outlined">chevron_right</span>
              </button>
            </div>
          </div>

          <!-- FAB / Mobile -->
          <div>
            <p class="text-[9px] font-bold text-secondary uppercase tracking-widest mb-4">FAB — Ação Flutuante (Mobile)</p>
            <div class="flex flex-wrap gap-4 items-center">
              <div class="bg-primary p-3 rounded-full shadow-lg border-4 border-background inline-flex">
                <span class="material-symbols-outlined text-white">add</span>
              </div>
              <div class="bg-primary-container p-3 rounded-full shadow-lg inline-flex">
                <span class="material-symbols-outlined text-on-primary-container" style="font-variation-settings: 'FILL' 1;">bolt</span>
              </div>
            </div>
          </div>

          <!-- Danger -->
          <div>
            <p class="text-[9px] font-bold text-secondary uppercase tracking-widest mb-4">Destrutivo — Ação de Risco</p>
            <div class="flex flex-wrap gap-4 items-center">
              <VButton variant="error" icon="delete">Excluir Evento</VButton>
              <VButton variant="error-outline">Cancelar Assinatura</VButton>
            </div>
          </div>
        </div>
      </section>

      <!-- ═══════════════════════════════════════
           4. INPUTS
      ═══════════════════════════════════════ -->
      <section id="inputs">
        <div class="vincis-section-label">04 — Inputs & Formulários</div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-8">

          <!-- Text Inputs -->
          <div class="p-6 bg-surface-container-lowest rounded-xl border border-outline-variant/20 space-y-5">
            <p class="text-[9px] font-bold text-secondary uppercase tracking-widest">Campos de Texto</p>

            <VInput
              v-model="inputDefault"
              label="Título do Evento"
              placeholder="Ex: Estudo Dirigido"
              icon="event_note"
              hint="Estado: Default"
            />

            <!-- Focus state (simulated with raw HTML to match the HTML exactly) -->
            <div>
              <label class="block text-xs font-label font-semibold text-on-surface-variant mb-1.5">Pesquisar notas</label>
              <div class="relative">
                <span class="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-primary text-lg">search</span>
                <input
                  type="text"
                  :value="inputFocus"
                  class="w-full bg-surface-container-low border-2 border-primary rounded-lg py-2.5 pl-10 pr-4 text-sm font-body"
                  style="box-shadow: 0 0 0 3px rgba(115,92,0,0.12);"
                />
              </div>
              <p class="text-[10px] text-primary font-semibold mt-1">Estado: Focus</p>
            </div>

            <VInput
              v-model="inputError"
              label="Data de Entrega"
              icon="calendar_today"
              error="Data inválida. Use o formato DD/MM/AAAA."
            />

            <VInput
              v-model="inputDisabled"
              label="Campo Somente Leitura"
              disabled
              hint="Estado: Desabilitado"
            />

            <VInput
              v-model="textarea"
              label="Descrição / Anotações"
              placeholder="Adicione notas sobre esta sessão de estudo..."
              multiline
              :rows="3"
            />
          </div>

          <!-- Selects & Controls -->
          <div class="p-6 bg-surface-container-lowest rounded-xl border border-outline-variant/20 space-y-5">
            <p class="text-[9px] font-bold text-secondary uppercase tracking-widest">Selects & Controles</p>

            <VSelect
              v-model="selectVal"
              label="Disciplina"
              :options="disciplineOptions"
            />

            <!-- Checkboxes -->
            <div>
              <p class="text-xs font-label font-semibold text-on-surface-variant mb-3">Tipos de Sessão</p>
              <div class="space-y-2.5">
                <VCheckbox v-model="check1" label="Estudo Dirigido" />
                <VCheckbox v-model="check2" label="Revisão Ativa" />
                <VCheckbox v-model="check3" label="Escrita Acadêmica" />
                <VCheckbox :model-value="false" label="Indisponível" disabled />
              </div>
            </div>

            <!-- Toggles -->
            <div>
              <p class="text-xs font-label font-semibold text-on-surface-variant mb-3">Toggles</p>
              <div class="space-y-3">
                <VToggle v-model="toggle1" label="Agenda Inteligente" />
                <VToggle v-model="toggle2" label="Notificações" />
              </div>
            </div>

            <!-- Search bar -->
            <div>
              <p class="text-xs font-label font-semibold text-on-surface-variant mb-2">Search Bar (Header)</p>
              <div class="relative">
                <input type="text" placeholder="Pesquisar notas..." class="bg-surface-container-low border-none rounded-full py-2 pl-10 pr-4 text-sm w-full focus:ring-1 focus:ring-primary" />
                <span class="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-secondary text-lg">search</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- ═══════════════════════════════════════
           5. CARDS & CONTAINERS
      ═══════════════════════════════════════ -->
      <section id="cards">
        <div class="vincis-section-label">05 — Cards & Containers</div>

        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">

          <!-- Timeline Active -->
          <div>
            <p class="text-[9px] font-bold text-secondary uppercase tracking-widest mb-3">Timeline Card — Ativo</p>
            <VCard variant="timeline-active">
              <span class="text-[10px] font-bold text-primary uppercase tracking-widest mb-1 block">08:00 — 10:00</span>
              <h4 class="font-serif font-bold text-on-surface text-lg">Estudo Dirigido</h4>
              <p class="text-xs text-secondary mt-1">Fenomenologia da Percepção — Cap. 3</p>
            </VCard>
          </div>

          <!-- Timeline Pending -->
          <div>
            <p class="text-[9px] font-bold text-secondary uppercase tracking-widest mb-3">Timeline Card — Pendente</p>
            <VCard variant="timeline-pending">
              <span class="text-[10px] font-bold text-secondary uppercase tracking-widest mb-1 block">15:00 — 17:00</span>
              <h4 class="font-serif font-bold text-secondary text-lg">Escrita Acadêmica</h4>
              <p class="text-xs text-secondary/60 mt-1 italic">Redação da Tese — Introdução</p>
            </VCard>
          </div>

          <!-- AI Dark -->
          <div>
  <p class="text-[9px] font-bold text-secondary uppercase tracking-widest mb-3">
    AI Card — Dark Surface
  </p>
  
  <VCard variant="ai-dark" class="bg-ai-card-bg border border-ai-card-border p-5 rounded-2xl shadow-xl">
    <div class="flex flex-col gap-4">
      
      <div class="flex items-center gap-3">
        <div class="w-10 h-10 bg-primary-container flex items-center justify-center rounded-xl shadow-lg shadow-primary/10">
          <span class="material-symbols-outlined text-on-primary-container" style="font-variation-settings: 'FILL' 1">
            bolt
          </span>
        </div>
        <h3 class="text-ai-card-text-primary font-serif text-lg font-bold">
          Agenda Inteligente
        </h3>
      </div>

      <p class="text-ai-card-text-secondary text-xs leading-relaxed opacity-90">
        Otimize suas janelas de estudo baseando-se no seu ritmo circadiano.
      </p>

      <button class="w-full py-3 bg-primary text-on-primary font-bold text-sm rounded-xl active:scale-[0.98] transition-all flex items-center justify-center gap-2 hover:bg-primary-container hover:text-on-primary-container">
        <span>Automatizar</span>
        <span class="material-symbols-outlined text-base">auto_awesome</span>
      </button>

    </div>
  </VCard>
</div>

          <div>
  <p class="text-[9px] font-bold text-secondary-fixed-dim uppercase tracking-widest mb-3">Stats Card</p>
  
  <VCard variant="section" class="p-6"> <h4 class="text-xs font-bold text-on-surface mb-4 uppercase tracking-wider font-body">Foco Semanal</h4>
    
    <div class="space-y-4">
      <div>
        <div class="flex justify-between text-xs mb-1.5 font-body">
          <span class="text-on-surface-variant opacity-70">Meta: 20h</span>
          <span class="font-bold text-on-surface">14.5h</span>
        </div>
        
        <div class="h-2 w-full bg-surface-variant/30 rounded-full overflow-hidden">
          <div 
            class="h-full bg-primary rounded-full transition-all duration-500 vincis-progress-bar" 
            style="width: 72%;"
          ></div>
        </div>
        <p class="text-[9px] text-on-surface-variant mt-2 font-bold">72% CONCLUÍDO</p>
      </div>

      <div class="grid grid-cols-2 gap-3 pt-1">
        <div class="p-3 bg-surface-container-lowest border border-border-card-base rounded-xl shadow-sm">
          <p class="text-[9px] text-secondary uppercase font-bold tracking-tight">Streak</p>
          <p class="text-xl font-serif font-bold text-primary">12 Dias</p>
        </div>
        
        <div class="p-3 bg-surface-container-lowest border border-border-card-base rounded-xl shadow-sm">
          <p class="text-[9px] text-secondary uppercase font-bold tracking-tight">Eficiência</p>
          <p class="text-xl font-serif font-bold text-primary">94%</p>
        </div>
      </div>
    </div>
  </VCard>
</div>

          <!-- Calendar Event Chip -->
          <div>
            <p class="text-[9px] font-bold text-secondary uppercase tracking-widest mb-3">Calendar Event Chip</p>
            <div class="bg-surface-container-lowest rounded-xl border border-outline-variant/15 overflow-hidden">
              <div class="p-3 border-b border-outline-variant/10">
                <p class="text-[10px] font-bold text-secondary uppercase tracking-widest mb-2">Semana atual</p>
                <div class="grid grid-cols-4 gap-1.5">
                  <div class="p-2 bg-primary/5 rounded-lg">
                    <p class="text-[10px] font-bold text-primary underline decoration-2">11</p>
                    <div class="mt-1 p-1 bg-primary-container text-on-primary-container text-[9px] rounded font-bold text-center">Revisão</div>
                  </div>
                  <div class="p-2 rounded-lg">
                    <p class="text-[10px] font-bold text-on-surface">12</p>
                  </div>
                  <div class="p-2 rounded-lg">
                    <p class="text-[10px] font-bold text-on-surface">13</p>
                    <div class="mt-1 p-1 bg-secondary-container text-on-secondary-container text-[9px] rounded border border-outline-variant/20 text-center">Seminário</div>
                  </div>
                  <div class="p-2 rounded-lg">
                    <p class="text-[10px] font-bold text-on-surface">14</p>
                  </div>
                </div>
              </div>
              <div class="p-2 text-center">
                <p class="text-[9px] text-secondary font-label">Calendar Grid — border-outline-variant/5</p>
              </div>
            </div>
          </div>

          <!-- User Profile Chip & Tags (VBadge) -->
          <div>
            <p class="text-[9px] font-bold text-secondary uppercase tracking-widest mb-3">User Profile Chip & Tags</p>
            <div class="space-y-4">
              <div class="flex items-center gap-3 p-3 bg-surface-container-lowest rounded-xl border border-outline-variant/10 shadow-sm w-fit">
                <div class="w-10 h-10 rounded-full bg-primary-container flex items-center justify-center font-serif font-bold text-on-primary-container">A</div>
                <div>
                  <p class="text-sm font-bold">Dr. Aris V.</p>
                  <p class="text-[9px] text-secondary uppercase tracking-widest font-bold">Premium Member</p>
                </div>
              </div>
              <div class="flex flex-wrap gap-2">
                <VBadge variant="primary"   shape="rounded">Filosofia</VBadge>
                <VBadge variant="secondary" shape="rounded">Seminário</VBadge>
                <VBadge variant="plain"     shape="square">Importante</VBadge>
                <VBadge variant="success"   shape="pill">Concluído</VBadge>
                <VBadge variant="error"     shape="pill">Atrasado</VBadge>
              </div>
            </div>
          </div>
        </div>

       <div class="p-6 bg-surface-container-lowest rounded-xl border border-border-card-base">
  <p class="text-[9px] font-bold text-secondary uppercase tracking-widest mb-5">
    Anatomia dos Containers — Bordas, Shadow e Padding
  </p>
  
  <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center text-xs">
    <div class="flex flex-col">
      <VCard class="p-4 rounded-lg border border-border-card-base shadow-sm h-full">
        <p class="font-serif text-sm font-bold">Card Base</p>
        <p class="text-secondary text-[10px] mt-1 italic">rounded-lg · border · shadow-sm · p-4</p>
      </VCard>
    </div>

    <div class="flex flex-col">
      <VCard variant="elevated" class="p-6 rounded-xl border border-border-card-elevated shadow-md h-full">
        <p class="font-serif text-sm font-bold">Card Elevado</p>
        <p class="text-secondary text-[10px] mt-1 italic">rounded-xl · border-soft · shadow-md · p-6</p>
      </VCard>
    </div>

    <div class="flex flex-col">
      <VCard variant="section" class="p-6 rounded-2xl bg-surface-container-low h-full border-none shadow-none">
        <p class="font-serif text-sm font-bold">Card Section</p>
        <p class="text-secondary text-[10px] mt-1 italic">rounded-2xl · bg-low · p-6</p>
      </VCard>
    </div>
  </div>
</div>
      </section>

      <!-- ═══════════════════════════════════════
           6. NAVEGAÇÃO
      ═══════════════════════════════════════ -->
      <section id="navigation">
        <div class="vincis-section-label">06 — Navegação</div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-8">

          <!-- Sidebar -->
          <div>
            <p class="text-[9px] font-bold text-secondary uppercase tracking-widest mb-3">Sidebar Nav (Desktop)</p>
            <div class="w-full bg-surface-container-low rounded-xl p-5 space-y-1 border border-outline-variant/15">
              <div class="flex items-center gap-3 mb-6">
                <div class="w-9 h-9 bg-primary-container flex items-center justify-center rounded-lg shadow-sm">
                  <span class="text-on-primary-container font-serif font-bold text-lg">V</span>
                </div>
                <div>
                  <p class="text-base font-bold text-on-surface font-serif">Vincis</p>
                  <p class="text-[9px] text-secondary font-label tracking-wide uppercase">Academic Portal</p>
                </div>
              </div>
              <a class="flex items-center gap-3 px-4 py-2.5 text-secondary font-serif hover:bg-surface-bright transition-all rounded-lg cursor-pointer">
                <span class="material-symbols-outlined">dashboard</span>
                <span class="text-sm">Dashboard</span>
              </a>
              <a class="flex items-center gap-3 px-4 py-2.5 text-secondary font-serif hover:bg-surface-bright transition-all rounded-lg cursor-pointer">
                <span class="material-symbols-outlined">menu_book</span>
                <span class="text-sm">Disciplinas</span>
              </a>
              <a class="flex items-center gap-3 px-4 py-2.5 bg-primary-container text-on-surface font-serif italic rounded-lg cursor-pointer vincis-nav-active">
                <span class="material-symbols-outlined" style="font-variation-settings: 'FILL' 1;">event_note</span>
                <span class="text-sm">Planejamento</span>
              </a>
              <a class="flex items-center gap-3 px-4 py-2.5 text-secondary font-serif hover:bg-surface-bright transition-all rounded-lg cursor-pointer">
                <span class="material-symbols-outlined">settings</span>
                <span class="text-sm">Configurações</span>
              </a>
              <div class="pt-4 mt-2 border-t border-outline-variant/15">
                <p class="text-[9px] text-secondary font-bold uppercase tracking-widest mb-1 px-1">Regras do Nav:</p>
                <p class="text-[9px] text-secondary px-1">Ativo: bg-primary-container · italic · icon FILL=1</p>
                <p class="text-[9px] text-secondary px-1">Inativo: text-secondary · hover:bg-surface-bright</p>
              </div>
            </div>
          </div>

          <!-- Mobile Bottom Nav -->
          <div>
            <p class="text-[9px] font-bold text-secondary uppercase tracking-widest mb-3">Bottom Nav (Mobile)</p>
            <div class="bg-surface-bright rounded-xl border border-outline-variant/15 overflow-hidden">
              <div class="flex justify-around items-center p-4 border-b border-outline-variant/10">
                <button class="flex flex-col items-center gap-1 text-secondary hover:text-primary transition-colors">
                  <span class="material-symbols-outlined">dashboard</span>
                  <span class="text-[10px] font-bold uppercase tracking-tighter">Dash</span>
                </button>
                <button class="flex flex-col items-center gap-1 text-primary">
                  <span class="material-symbols-outlined" style="font-variation-settings: 'FILL' 1;">event_note</span>
                  <span class="text-[10px] font-bold uppercase tracking-tighter">Plan</span>
                </button>
                <div class="bg-primary p-3 rounded-full mt-4 shadow-lg border-4 border-background">
                  <span class="material-symbols-outlined text-white">add</span>
                </div>
                <button class="flex flex-col items-center gap-1 text-secondary hover:text-primary transition-colors">
                  <span class="material-symbols-outlined">menu_book</span>
                  <span class="text-[10px] font-bold uppercase tracking-tighter">Livros</span>
                </button>
                <button class="flex flex-col items-center gap-1 text-secondary hover:text-primary transition-colors">
                  <span class="material-symbols-outlined">settings</span>
                  <span class="text-[10px] font-bold uppercase tracking-tighter">Ajuste</span>
                </button>
              </div>
              <div class="p-3">
                <p class="text-[9px] text-secondary">FAB central: bg-primary · rounded-full · border-4 border-background · -mt-10</p>
                <p class="text-[9px] text-secondary mt-0.5">Ativo: text-primary · icon FILL=1 · Inativo: text-secondary</p>
              </div>
            </div>

            <!-- Top Header Sample -->
            <p class="text-[9px] font-bold text-secondary uppercase tracking-widest mb-3 mt-6">Top Header</p>
            <div class="bg-[#fdf9f6] rounded-xl border border-outline-variant/15 overflow-hidden shadow-[0_4px_20px_rgba(28,27,26,0.05)]">
              <div class="flex justify-between items-center px-5 py-3">
                <h1 class="font-serif font-bold text-lg tracking-tight text-on-surface">PLANEJAMENTO</h1>
                <div class="flex items-center gap-3">
                  <div class="relative">
                    <input class="bg-surface-container-low border-none rounded-full py-1.5 pl-8 pr-3 text-xs focus:ring-1 focus:ring-primary w-36 transition-all" placeholder="Pesquisar..."/>
                    <span class="material-symbols-outlined absolute left-2.5 top-1/2 -translate-y-1/2 text-secondary" style="font-size:16px;">search</span>
                  </div>
                  <button class="p-1.5 text-secondary hover:text-primary transition-colors">
                    <span class="material-symbols-outlined">notifications</span>
                  </button>
                </div>
              </div>
              <div class="px-5 pb-2">
                <p class="text-[9px] text-secondary">sticky top-0 · z-50 · shadow-[0_10px_40px_rgba(28,27,26,0.05)] · bg-[#fdf9f6]</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- ═══════════════════════════════════════
           7. FEEDBACK — TOASTS & MODAIS
      ═══════════════════════════════════════ -->
      <section id="feedback">
        <div class="vincis-section-label">07 — Feedback Visual</div>

        <!-- Toasts -->
        <p class="text-[9px] font-bold text-secondary uppercase tracking-widest mb-4">Toasts / Notificações</p>
        <div class="space-y-3 mb-10">
          <VAlert variant="success" title="Evento criado com sucesso!" message="Filosofia Analítica adicionado ao dia 11." dismissible />
          <VAlert variant="error"   title="Falha ao sincronizar"        message="Verifique sua conexão e tente novamente." dismissible />
          <VAlert variant="warning" title="Meta semanal em risco"       message="Você está 5.5h abaixo da sua meta de 20h." dismissible />
          <VAlert variant="info"    title="IA analisando seu padrão"    message="A agenda inteligente será atualizada em instantes." dismissible />
        </div>

        <!-- Modal -->
        <p class="text-[9px] font-bold text-secondary uppercase tracking-widest mb-4">Modal</p>
        <div class="relative rounded-2xl overflow-hidden border border-outline-variant/20">
          <div class="absolute inset-0 vincis-modal-overlay rounded-2xl"></div>
          <div class="relative z-10 m-6 sm:m-10 bg-surface-container-lowest rounded-2xl shadow-2xl p-6 max-w-sm mx-auto">
            <div class="flex items-center justify-between mb-4">
              <h3 class="font-serif font-bold text-xl text-on-surface">Novo Evento</h3>
              <button class="p-1.5 text-secondary hover:text-on-surface hover:bg-surface-container rounded-lg transition-colors">
                <span class="material-symbols-outlined">close</span>
              </button>
            </div>
            <div class="space-y-4">
              <VInput label="Título" placeholder="Ex: Revisão Ativa" />
              <div class="grid grid-cols-2 gap-3">
                <VInput label="Data"    placeholder="DD/MM/AAAA" />
                <VInput label="Horário" placeholder="08:00" />
              </div>
              <VSelect
                label="Disciplina"
                :options="disciplineOptions"
                :model-value="disciplineOptions[0].value"
              />
            </div>
            <div class="flex gap-3 mt-6">
              <VButton variant="secondary" class="flex-1">Cancelar</VButton>
              <VButton variant="primary"   class="flex-1">Criar Evento</VButton>
            </div>
          </div>
          <div class="h-8"></div>
        </div>

        <!-- Empty / Loading States -->
        <p class="text-[9px] font-bold text-secondary uppercase tracking-widest mb-4 mt-10">Estados Vazios & Loading</p>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <!-- Empty state -->
          <div class="p-8 bg-surface-container-lowest rounded-xl border border-outline-variant/15 border-dashed flex flex-col items-center justify-center gap-3 text-center">
            <span class="material-symbols-outlined text-4xl text-outline-variant" style="font-variation-settings: 'FILL' 0;">event_note</span>
            <p class="font-serif font-bold text-on-surface">Nenhum evento hoje</p>
            <p class="text-xs text-secondary max-w-200px">Adicione um evento de estudo para começar seu dia.</p>
            <button class="flex items-center gap-2 px-4 py-2 bg-primary-container text-on-primary-container font-label font-bold text-sm rounded-lg mt-1">
              <span class="material-symbols-outlined text-base">add</span>
              Criar Evento
            </button>
          </div>
          <!-- Loading skeleton -->
          <div class="p-8 bg-surface-container-lowest rounded-xl border border-outline-variant/15 flex flex-col items-center justify-center gap-4">
            <div class="flex gap-1.5">
              <div class="w-2 h-2 bg-primary rounded-full animate-bounce" style="animation-delay:0s"></div>
              <div class="w-2 h-2 bg-primary-container rounded-full animate-bounce" style="animation-delay:0.15s"></div>
              <div class="w-2 h-2 bg-primary-fixed-dim rounded-full animate-bounce" style="animation-delay:0.3s"></div>
            </div>
            <div class="space-y-2 w-full px-4">
              <div class="h-3 bg-surface-container-high rounded animate-pulse"></div>
              <div class="h-3 bg-surface-container-high rounded animate-pulse w-4/5"></div>
              <div class="h-3 bg-surface-container-high rounded animate-pulse w-3/5"></div>
            </div>
            <p class="text-xs text-secondary font-label">Loading skeleton state</p>
          </div>
        </div>
      </section>

      <!-- ═══════════════════════════════════════
           8. TOKENS DE DESIGN — REFERÊNCIA RÁPIDA
      ═══════════════════════════════════════ -->
      <section id="tokens">
        <div class="vincis-section-label">08 — Tokens & Referência Rápida para IA</div>

        <div class="p-6 bg-on-surface rounded-2xl border border-outline-variant/10 text-surface-bright">
          <div class="flex items-center gap-3 mb-6">
            <div class="w-8 h-8 bg-primary-container rounded-lg flex items-center justify-center">
              <span class="material-symbols-outlined text-on-primary-container" style="font-size:18px; font-variation-settings: 'FILL' 1;">bolt</span>
            </div>
            <h3 class="font-serif font-bold text-xl">Guia rápido para IA gerar telas</h3>
          </div>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs font-mono">
            <div class="space-y-2">
              <p class="font-label font-bold text-primary-container uppercase tracking-widest text-[9px] mb-3">Fontes</p>
              <p class="text-surface-variant">Títulos/Display → <span class="text-primary-fixed">font-serif (Newsreader)</span></p>
              <p class="text-surface-variant">UI / Corpo → <span class="text-primary-fixed">font-body / font-label (Manrope)</span></p>
              <p class="text-surface-variant">Labels caps → <span class="text-primary-fixed">text-[10px] font-bold uppercase tracking-widest</span></p>
              <p class="text-surface-variant">Ativo em nav → <span class="text-primary-fixed">font-serif italic</span></p>
            </div>
            <div class="space-y-2">
              <p class="font-label font-bold text-primary-container uppercase tracking-widest text-[9px] mb-3">Superfícies (mais escuro = mais elevado)</p>
              <p class="text-surface-variant">Fundo global → <span class="text-primary-fixed">bg-background (#fdf9f6)</span></p>
              <p class="text-surface-variant">Cards base → <span class="text-primary-fixed">bg-surface-container-lowest</span></p>
              <p class="text-surface-variant">Sidebar → <span class="text-primary-fixed">bg-surface-container-low</span></p>
              <p class="text-surface-variant">Hover/pressed → <span class="text-primary-fixed">bg-surface-container-high</span></p>
            </div>
            <div class="space-y-2">
              <p class="font-label font-bold text-primary-container uppercase tracking-widest text-[9px] mb-3">Bordas & Radius</p>
              <p class="text-surface-variant">Divisores sutis → <span class="text-primary-fixed">border-outline-variant/10 ou /15</span></p>
              <p class="text-surface-variant">Cards → <span class="text-primary-fixed">rounded-xl (0.75rem)</span></p>
              <p class="text-surface-variant">Seções → <span class="text-primary-fixed">rounded-2xl (1rem)</span></p>
              <p class="text-surface-variant">Pills/tags → <span class="text-primary-fixed">rounded-full</span></p>
              <p class="text-surface-variant">Timeline items → <span class="text-primary-fixed">rounded-[10px]</span></p>
            </div>
            <div class="space-y-2">
              <p class="font-label font-bold text-primary-container uppercase tracking-widest text-[9px] mb-3">Interação</p>
              <p class="text-surface-variant">Press → <span class="text-primary-fixed">active:scale-95 transition-all</span></p>
              <p class="text-surface-variant">Focus ring → <span class="text-primary-fixed">focus:ring-2 focus:ring-primary/50</span></p>
              <p class="text-surface-variant">Hover texto → <span class="text-primary-fixed">hover:text-primary transition-colors</span></p>
              <p class="text-surface-variant">Hover bg → <span class="text-primary-fixed">hover:bg-surface-bright transition-all</span></p>
              <p class="text-surface-variant">Icons → <span class="text-primary-fixed">Material Symbols Outlined</span></p>
              <p class="text-surface-variant">Icon ativo → <span class="text-primary-fixed">FILL=1</span></p>
            </div>
          </div>
        </div>
      </section>

    </div>

    <!-- Footer -->
    <footer class="border-t border-outline-variant/20 mt-4">
      <div class="max-w-5xl mx-auto px-8 py-8 flex items-center justify-between">
        <div class="flex items-center gap-2">
          <div class="w-7 h-7 bg-primary-container flex items-center justify-center rounded-lg">
            <span class="text-on-primary-container font-serif font-bold text-sm">V</span>
          </div>
          <span class="font-serif font-bold text-on-surface">Vincis Design System</span>
          <span class="text-secondary text-sm">v1.0.0</span>
        </div>
        <p class="text-xs text-secondary font-label">Rota: <span class="font-mono bg-surface-container px-2 py-0.5 rounded">/design-system</span></p>
      </div>
    </footer>

  </div>
</template>