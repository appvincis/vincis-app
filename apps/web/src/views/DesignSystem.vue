<script setup>
import { ref, reactive } from 'vue'
import DsSideBar from '@/components/ui/DsSideBar.vue'
import DsButton from '@/components/ui/DsButton.vue';
import DsBadge from '@/components/ui/DsBadge.vue'
import DsCard from '@/components/ui/DsCard.vue'
import DsInput from '@/components/ui/DsInput.vue'
import DsStat from '@/components/ui/DsStat.vue'
import DsSelect from '@/components/ui/DsSelect.vue'
import DsCheckbox from '@/components/ui/DsCheckbox.vue'
import DsToggle from '@/components/ui/DsToggle.vue'
import DsToast from '@/components/ui/DsToast.vue'
import DsModal from '@/components/ui/DsModal.vue'
import DsTimelineItem from '@/components/ui/DsTimelineItem.vue'
import DsChip from '@/components/ui/DsChip.vue'



// Reactive state
const searchValue = ref('')
const checkbox1 = ref(true)
const checkbox2 = ref(false)
const checkbox3 = ref(true)
const toggle1 = ref(true)
const toggle2 = ref(false)
const activeSidebarItem = ref('plan')
const activeBottomNav = ref('plan')

const disciplines = [
  { label: 'Filosofia Analítica', value: 'analitica' },
  { label: 'Fenomenologia', value: 'fenomenologia' },
  { label: 'Lógica Formal', value: 'logica' },
  { label: 'Ética e Política', value: 'etica' }
]

const sidebarItems = [
  { id: 'dashboard', label: 'Dashboard', icon: 'dashboard' },
  { id: 'disciplines', label: 'Disciplinas', icon: 'menu_book' },
  { id: 'plan', label: 'Planejamento', icon: 'event_note' },
  { id: 'settings', label: 'Configurações', icon: 'settings' }
]
const toastRef = ref(null)
// Funções para mostrar toasts
const showSuccessToast = () => {
  toastRef.value?.success('Evento criado com sucesso!', 'Filosofia Analítica adicionado ao dia 11.')
}

const showErrorToast = () => {
  toastRef.value?.error('Falha ao sincronizar', 'Verifique sua conexão e tente novamente.')
}

const showWarningToast = () => {
  toastRef.value?.warn('Meta semanal em risco', 'Você está 5.5h abaixo da sua meta de 20h.')
}

const showInfoToast = () => {
  toastRef.value?.info('IA analisando seu padrão', 'A agenda inteligente será atualizada em instantes.')
}
</script>

<template>
  <div class="ds-root">
    <!-- Header -->
    <header class="ds-header">
      <div class="ds-header__inner">
        <div class="ds-brand">
          <div class="ds-brand__mark">V</div>
          <div>
            <p class="ds-brand__name">Vincis</p>
            <p class="ds-brand__sub">Design System</p>
          </div>
        </div>
        <nav class="ds-nav">
          <a href="#typography">Tipo</a>
          <a href="#colors">Cores</a>
          <a href="#buttons">Botões</a>
          <a href="#inputs">Inputs</a>
          <a href="#cards">Cards</a>
          <a href="#navigation">Nav</a>
          <a href="#feedback">Feedback</a>
        </nav>
      </div>
    </header>

    <!-- Hero Section -->
    <div class="ds-hero">
      <DsBadge severity="primary" value="v1.0.0 — Referência Visual" />
      <h1 class="ds-hero__title">
        Vincis<br />
        <em class="ds-hero__italic">Design System</em>
      </h1>
      <p class="ds-hero__sub">
        Todos os componentes, tokens e padrões visuais da plataforma Vincis em um único lugar.
      </p>
    </div>

    <div class="ds-content">
      <!-- TIPOGRAFIA -->
      <section id="typography" class="ds-section">
        <div class="ds-section-label">01 — Tipografia</div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-10">
          <DsCard>
            <p class="ds-meta-label">Headline · Newsreader</p>
            <p class="font-serif text-3xl font-bold leading-tight mb-1">Abc Defg</p>
            <p class="font-serif text-xl italic text-primary">Itálico Elegante</p>
            <p class="text-secondary text-sm mt-3">Títulos, Display, Números grandes</p>
          </DsCard>
          
          <DsCard>
            <p class="ds-meta-label">Body & Label · Manrope</p>
            <p class="font-body text-3xl font-bold leading-tight mb-1">Abc Defg</p>
            <p class="font-body text-xl font-medium text-secondary">400 · 500 · 700</p>
            <p class="text-secondary text-sm mt-3">Parágrafos, Labels, UI text</p>
          </DsCard>
        </div>

        <DsCard>
          <div class="type-scale-item">
            <p class="ds-meta-label">Display · Newsreader 800 · 56px</p>
            <h1 class="font-serif font-extrabold text-5xl">Planejamento</h1>
          </div>
          <div class="type-scale-item">
            <p class="ds-meta-label">H1 · Newsreader 700 · 40px</p>
            <h1 class="font-serif font-bold text-4xl">Outubro 2023</h1>
          </div>
          <div class="type-scale-item">
            <p class="ds-meta-label">H2 · Newsreader 700 · 30px</p>
            <h2 class="font-serif font-bold text-3xl">Agenda Inteligente</h2>
          </div>
          <div class="type-scale-item">
            <p class="ds-meta-label">Body Large · Manrope 400 · 16px</p>
            <p class="font-body text-base leading-relaxed max-w-xl">
              Otimize suas janelas de estudo baseando-se no seu ritmo circadiano.
            </p>
          </div>
          <div class="type-scale-item">
            <p class="ds-meta-label">Label / Caption · Manrope 700 · 10px · UPPERCASE</p>
            <p class="font-label text-[10px] font-bold text-secondary uppercase tracking-widest">
              08:00 — 10:00 · Premium Member · Foco Semanal
            </p>
          </div>
        </DsCard>
      </section>

      <!-- PALETA DE CORES -->
      <section id="colors" class="ds-section">
        <div class="ds-section-label">02 — Paleta de Cores</div>

        <p class="ds-meta-label mb-3">Primária — Ouro Acadêmico</p>
        <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
          <div class="color-swatch"><div class="color-swatch__box bg-primary"></div><div class="color-swatch__info"><p class="font-bold text-[10px]">primary</p><p class="text-[9px] text-secondary font-mono">#735c00</p></div></div>
          <div class="color-swatch"><div class="color-swatch__box bg-primary-container"></div><div class="color-swatch__info"><p class="font-bold text-[10px]">primary-container</p><p class="text-[9px] text-secondary font-mono">#d4af37</p></div></div>
          <div class="color-swatch"><div class="color-swatch__box" style="background: #e9c349;"></div><div class="color-swatch__info"><p class="font-bold text-[10px]">primary-fixed-dim</p><p class="text-[9px] text-secondary font-mono">#e9c349</p></div></div>
          <div class="color-swatch"><div class="color-swatch__box" style="background: #ffe088;"></div><div class="color-swatch__info"><p class="font-bold text-[10px]">primary-fixed</p><p class="text-[9px] text-secondary font-mono">#ffe088</p></div></div>
        </div>

        <p class="ds-meta-label mb-3">Superfícies — Camadas de Profundidade</p>
        <div class="grid grid-cols-3 sm:grid-cols-6 gap-3 mb-8">
          <div class="surface-swatch"><div class="surface-swatch__box bg-surface-container-lowest"></div><div class="surface-swatch__info"><p class="text-[9px] font-bold">lowest</p></div></div>
          <div class="surface-swatch"><div class="surface-swatch__box bg-surface-container-low"></div><div class="surface-swatch__info"><p class="text-[9px] font-bold">low</p></div></div>
          <div class="surface-swatch"><div class="surface-swatch__box bg-surface-container"></div><div class="surface-swatch__info"><p class="text-[9px] font-bold">container</p></div></div>
          <div class="surface-swatch"><div class="surface-swatch__box bg-surface-container-high"></div><div class="surface-swatch__info"><p class="text-[9px] font-bold">high</p></div></div>
          <div class="surface-swatch"><div class="surface-swatch__box bg-surface-container-highest"></div><div class="surface-swatch__info"><p class="text-[9px] font-bold">highest</p></div></div>
          <div class="surface-swatch"><div class="surface-swatch__box" style="background: #31302f;"></div><div class="surface-swatch__info"><p class="text-[9px] font-bold">inverse</p></div></div>
        </div>
      </section>

      <!-- BOTÕES -->
      <section id="buttons" class="ds-section">
        <div class="ds-section-label">03 — Botões</div>

        <DsCard>
          <div>
            <p class="ds-meta-label mb-4">Primário — Ação Principal</p>
            <div class="flex flex-wrap gap-4 items-center">
              <DsButton label="Automatizar Agenda" severity="primary" icon="pi pi-bolt" />
              <DsButton label="Novo Evento" severity="primary" icon="pi pi-plus" />
              <DsButton label="Desabilitado" severity="primary" disabled />
            </div>
          </div>

          <div class="mt-6">
            <p class="ds-meta-label mb-4">Secundário — Ação Auxiliar</p>
            <div class="flex flex-wrap gap-4 items-center">
              <DsButton label="Novo Evento" severity="secondary" icon="pi pi-plus" />
              <DsButton label="Desabilitado" severity="secondary" disabled />
            </div>
          </div>

          <div class="mt-6">
            <p class="ds-meta-label mb-4">Sucesso — Ação Positiva</p>
            <div class="flex flex-wrap gap-4 items-center">
              <DsButton label="Clique aqui" severity="success" />
            </div>
          </div>

          <div class="mt-6">
            <p class="ds-meta-label mb-4">Destrutivo — Ação de Risco</p>
            <div class="flex flex-wrap gap-4 items-center">
              <DsButton label="Excluir Evento" severity="danger" icon="pi pi-trash" />
            </div>
          </div>
        </DsCard>
      </section>

      <!-- INPUTS -->
      <section id="inputs" class="ds-section">
        <div class="ds-section-label">04 — Inputs & Formulários</div>

        <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <DsCard>
            <p class="ds-meta-label mb-4">Campos de Texto</p>
            <DsInput label="Título do Evento" placeholder="Ex: Estudo Dirigido" />
            <div class="mt-4">
              <DsInput label="Pesquisar notas" placeholder="Fenomenologia" />
            </div>
            <div class="mt-4">
              <DsInput label="Campo Desabilitado" modelValue="Dr. Aris V. — Premium Member" disabled />
            </div>
          </DsCard>

          <DsCard>
            <p class="ds-meta-label mb-4">Selects & Controles</p>
            <DsSelect
              label="Disciplina"
              :options="disciplines"
              optionLabel="label"
              optionValue="value"
              placeholder="Selecione..."
            />

            <div class="mt-4">
              <p class="text-xs font-label font-semibold text-on-surface-variant mb-3">Checkboxes</p>
              <div class="space-y-2">
                <label class="flex items-center gap-3 cursor-pointer">
                  <DsCheckbox v-model="checkbox1" :binary="true" />
                  <span class="text-sm font-body">Estudo Dirigido</span>
                </label>
                <label class="flex items-center gap-3 cursor-pointer">
                  <DsCheckbox v-model="checkbox2" :binary="true" />
                  <span class="text-sm font-body">Revisão Ativa</span>
                </label>
              </div>
            </div>

            <div class="mt-4">
              <p class="text-xs font-label font-semibold text-on-surface-variant mb-3">Toggles</p>
              <div class="space-y-3">
                <label class="flex items-center justify-between cursor-pointer">
                  <span class="text-sm font-body">Agenda Inteligente</span>
                  <DsToggle v-model="toggle1" />
                </label>
                <label class="flex items-center justify-between cursor-pointer">
                  <span class="text-sm font-body">Notificações</span>
                  <DsToggle v-model="toggle2" />
                </label>
              </div>
            </div>
          </DsCard>
        </div>
      </section>

      <!-- CARDS -->
      <section id="cards" class="ds-section">
        <div class="ds-section-label">05 — Cards & Containers</div>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div>
            <p class="ds-meta-label mb-3">Stats Card</p>
            <DsStat title="Foco Semanal" value="14.5h" icon="pi pi-chart-line" severity="primary">
              <template #footer>
                <div class="stat-footer">
                  <div class="progress-label"><span>Meta: 20h</span><span>72%</span></div>
                  <div class="progress-bar"><div class="progress-fill" style="width: 72%"></div></div>
                </div>
              </template>
            </DsStat>
          </div>

          <div>
            <p class="ds-meta-label mb-3">User Profile & Tags</p>
            <div class="flex items-center gap-3 p-3 bg-surface-container-lowest rounded-xl border border-outline-variant/10 shadow-sm w-fit mb-4">
              <div class="w-10 h-10 rounded-full bg-primary-container flex items-center justify-center font-serif font-bold text-on-primary-container">A</div>
              <div><p class="text-sm font-bold">Dr. Aris V.</p><p class="text-[9px] text-secondary uppercase tracking-widest font-bold">Premium Member</p></div>
            </div>
            <div class="flex flex-wrap gap-2">
              <DsChip label="Filosofia" />
              <DsChip label="Seminário" />
              <DsChip label="Concluído" />
            </div>
          </div>
        </div>
      </section>
<!-- 06. TOASTS / NOTIFICAÇÕES -->
      <section id="toasts" class="ds-section">
        <div class="ds-section-label">06 — Toasts & Notificações</div>
        
        <!-- Demonstração visual dos toasts -->
        <p class="ds-meta-label mb-4">Exemplos Visuais</p>
        <div class="toasts-demo mb-8">
          <div class="toast success"><div class="toast__icon"><span class="material-symbols-outlined" style="font-variation-settings: 'FILL' 1;">check_circle</span></div><div class="toast__content"><p class="toast__title">Evento criado com sucesso!</p><p class="toast__message">Filosofia Analítica adicionado ao dia 11.</p></div><button class="toast__close"><span class="material-symbols-outlined">close</span></button></div>
          <div class="toast error"><div class="toast__icon"><span class="material-symbols-outlined" style="font-variation-settings: 'FILL' 1;">error</span></div><div class="toast__content"><p class="toast__title">Falha ao sincronizar</p><p class="toast__message">Verifique sua conexão e tente novamente.</p></div><button class="toast__close"><span class="material-symbols-outlined">close</span></button></div>
          <div class="toast warning"><div class="toast__icon"><span class="material-symbols-outlined" style="font-variation-settings: 'FILL' 1;">warning</span></div><div class="toast__content"><p class="toast__title">Meta semanal em risco</p><p class="toast__message">Você está 5.5h abaixo da sua meta de 20h.</p></div><button class="toast__close"><span class="material-symbols-outlined">close</span></button></div>
          <div class="toast info"><div class="toast__icon"><span class="material-symbols-outlined" style="font-variation-settings: 'FILL' 1;">info</span></div><div class="toast__content"><p class="toast__title">IA analisando seu padrão</p><p class="toast__message">A agenda inteligente será atualizada em instantes.</p></div><button class="toast__close"><span class="material-symbols-outlined">close</span></button></div>
        </div>

        <!-- Botões para disparar toasts -->
        <p class="ds-meta-label mb-4">Disparar Notificações</p>
        <div class="flex-wrap">
          <DsButton label="Toast de Sucesso" severity="success" icon="pi pi-check-circle" @click="showSuccessToast" />
          <DsButton label="Toast de Erro" severity="danger" icon="pi pi-exclamation-circle" @click="showErrorToast" />
          <DsButton label="Toast de Alerta" severity="warning" icon="pi pi-exclamation-triangle" @click="showWarningToast" />
          <DsButton label="Toast de Informação" severity="primary" icon="pi pi-info-circle" @click="showInfoToast" />
        </div>

        <!-- Anotações sobre uso -->
        <DsCard class="mt-6">
          <p class="ds-meta-label mb-3">Como usar</p>
          <pre class="code-block"><code>// No componente
import { useToast } from 'primevue/usetoast'
const toast = useToast()

// Success
toast.add({ severity: 'success', summary: 'Título', detail: 'Mensagem', life: 3000 })

// Error
toast.add({ severity: 'error', summary: 'Título', detail: 'Mensagem', life: 5000 })

// Warn
toast.add({ severity: 'warn', summary: 'Título', detail: 'Mensagem', life: 4000 })

// Info
toast.add({ severity: 'info', summary: 'Título', detail: 'Mensagem', life: 3000 })</code></pre>
        </DsCard>
      </section>


      <!-- NAVEGAÇÃO -->
      <section id="navigation" class="ds-section">
        <div class="ds-section-label">06 — Navegação</div>

        <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div>
            <p class="ds-meta-label mb-3">Sidebar Nav (Desktop)</p>
            <DsSideBar
              :items="sidebarItems"
              :active-item="activeSidebarItem"
              @update:active-item="activeSidebarItem = $event"
            />
          </div>
        </div>
      </section>

      <!-- FEEDBACK -->
      <section id="feedback" class="ds-section">
        <div class="ds-section-label">07 — Feedback Visual</div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <DsCard>
            <div class="empty-state">
              <i class="pi pi-calendar empty-state__icon"></i>
              <p class="empty-state__title">Nenhum evento hoje</p>
              <p class="empty-state__message">Adicione um evento de estudo para começar seu dia.</p>
              <DsButton label="Criar Evento" severity="primary" icon="pi pi-plus" />
            </div>
          </DsCard>
        </div>
      </section>
    </div>

    <footer class="ds-footer">
      <div class="ds-footer__inner">
        <div class="ds-footer__brand">
          <div class="ds-footer__mark">V</div>
          <span class="ds-footer__name">Vincis Design System</span>
          <span class="ds-footer__version">v1.0.0</span>
        </div>
      </div>
    </footer>

    <DsToast />
  </div>
</template>

<style scoped>
/* Globals injected by VincisTheme (see vincis-primevue-theme.js) */

.ds-root {
  min-height: 100vh;
  background: var(--background);
}

.ds-header {
  position: sticky;
  top: 0;
  z-index: 50;
  background: rgba(253, 249, 246, 0.95);
  backdrop-filter: blur(8px);
  border-bottom: 1px solid var(--surface-border);
}

.ds-header__inner {
  max-width: 1100px;
  margin: 0 auto;
  padding: 1rem 2rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 1rem;
}

.ds-brand {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.ds-brand__mark {
  width: 2.25rem;
  height: 2.25rem;
  background: var(--primary-container);
  color: #554300;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 0.5rem;
  font-family: 'Newsreader', serif;
  font-weight: bold;
  font-size: 1.25rem;
}

.ds-brand__name {
  font-family: 'Newsreader', serif;
  font-weight: bold;
  font-size: 1.125rem;
  line-height: 1.2;
}

.ds-brand__sub {
  font-size: 0.5625rem;
  font-weight: 700;
  letter-spacing: 0.22em;
  text-transform: uppercase;
  color: var(--secondary);
}

.ds-nav {
  display: flex;
  gap: 0.25rem;
  flex-wrap: wrap;
}

.ds-nav a {
  padding: 0.5rem 0.75rem;
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--secondary);
  text-decoration: none;
  border-radius: 0.375rem;
  transition: all 0.15s;
}

.ds-nav a:hover {
  background: var(--surface-container);
  color: var(--on-surface);
}

.ds-hero {
  text-align: center;
  padding: 4rem 1rem;
  max-width: 1100px;
  margin: 0 auto;
}

.ds-hero__title {
  font-family: 'Newsreader', serif;
  font-size: clamp(2.5rem, 8vw, 4rem);
  font-weight: 800;
  line-height: 1.05;
  margin: 1rem 0;
  color: var(--on-surface);
}

.ds-hero__italic {
  font-style: italic;
  font-weight: 400;
  color: var(--primary);
}

.ds-hero__sub {
  color: var(--secondary);
  max-width: 500px;
  margin: 0 auto;
  line-height: 1.5;
}

.ds-content {
  max-width: 1100px;
  margin: 0 auto;
  padding: 0 2rem 4rem;
}

.ds-section {
  margin-bottom: 4rem;
}

.ds-section-label {
  font-family: 'Manrope', sans-serif;
  font-size: 0.625rem;
  font-weight: 700;
  letter-spacing: 0.22em;
  text-transform: uppercase;
  color: var(--outline);
  margin-bottom: 1.5rem;
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.ds-section-label::after {
  content: '';
  flex: 1;
  height: 1px;
  background: var(--outline-variant);
  opacity: 0.5;
}

.ds-meta-label {
  font-size: 0.5625rem;
  font-weight: 700;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--secondary);
}



.color-swatch {
  border-radius: 0.75rem;
  overflow: hidden;
  border: 1px solid rgba(208, 197, 175, 0.15);
}

.color-swatch__box {
  height: 5rem;
}

.color-swatch__info {
  padding: 0.5rem 0.75rem;
  background: var(--surface-container-lowest);
}

.surface-swatch {
  border-radius: 0.75rem;
  overflow: hidden;
  border: 1px solid rgba(208, 197, 175, 0.1);
}

.surface-swatch__box {
  height: 3.5rem;
}

.surface-swatch__info {
  padding: 0.5rem;
  background: var(--surface-container-lowest);
  text-align: center;
}

.type-scale-card {
  padding: 2rem;
}

.type-scale-item {
  padding-bottom: 1.5rem;
  margin-bottom: 1.5rem;
  border-bottom: 1px solid rgba(208, 197, 175, 0.1);
}

.type-scale-item:last-child {
  border-bottom: none;
  padding-bottom: 0;
  margin-bottom: 0;
}

.stat-footer {
  margin-top: 1rem;
  padding-top: 0.75rem;
  border-top: 1px solid rgba(208, 197, 175, 0.2);
}

.progress-label {
  display: flex;
  justify-content: space-between;
  font-size: 0.625rem;
  margin-bottom: 0.375rem;
  color: var(--secondary);
}

.progress-bar {
  height: 0.25rem;
  background: #e5e2df;
  border-radius: 9999px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: var(--primary);
  border-radius: 9999px;
  transition: width 0.6s ease;
}

.empty-state {
  text-align: center;
  padding: 2rem;
  border: 1px dashed rgba(208, 197, 175, 0.15);
}

.empty-state__icon {
  font-size: 2.5rem;
  color: var(--outline-variant);
  margin-bottom: 1rem;
}

.empty-state__title {
  font-family: 'Newsreader', serif;
  font-weight: 700;
  margin-bottom: 0.25rem;
}

.empty-state__message {
  font-size: 0.75rem;
  color: var(--secondary);
  max-width: 12rem;
  margin: 0 auto 1rem;
}

.ds-footer {
  margin-top: 4rem;
  padding: 1.5rem 2rem;
  border-top: 1px solid var(--surface-border);
  background: var(--background);
}

.ds-footer__inner {
  max-width: 1100px;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 1rem;
}

.ds-footer__brand {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.ds-footer__mark {
  width: 1.75rem;
  height: 1.75rem;
  background: var(--primary-container);
  border-radius: 0.375rem;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: 'Newsreader', serif;
  font-weight: bold;
  font-size: 0.875rem;
  color: #554300;
}

.ds-footer__name {
  font-family: 'Newsreader', serif;
  font-weight: bold;
  font-size: 0.875rem;
}

.ds-footer__version {
  font-size: 0.75rem;
  color: var(--secondary);
}



.toasts-demo { display: flex; flex-direction: column; gap: 0.75rem; }
.toast { display: flex; align-items: flex-start; gap: 0.75rem; padding: 0.75rem 1rem; background: var(--surface-container-lowest); border-radius: 0.75rem; box-shadow: 0 4px 20px rgba(28, 27, 26, 0.12); max-width: 22rem; animation: slideIn 0.35s cubic-bezier(0.22, 1, 0.36, 1) both; }
.toast.success { border: 1px solid rgba(46, 125, 50, 0.2); }
.toast.error { border: 1px solid rgba(186, 26, 26, 0.2); }
.toast.warning { border: 1px solid rgba(230, 81, 0, 0.2); }
.toast.info { border: 1px solid rgba(115, 92, 0, 0.2); }
.toast__icon { width: 2rem; height: 2rem; border-radius: 0.5rem; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.toast.success .toast__icon { background: var(--success-container); color: var(--success); }
.toast.error .toast__icon { background: var(--error-container); color: var(--error); }
.toast.warning .toast__icon { background: var(--warning-container); color: var(--warning); }
.toast.info .toast__icon { background: var(--primary-fixed); color: var(--primary); }
.toast__title { font-weight: 700; font-size: 0.875rem; }
.toast__message { font-size: 0.75rem; color: var(--secondary); margin-top: 0.125rem; }
.toast__close { background: none; border: none; color: var(--secondary); cursor: pointer; padding: 0.25rem; margin-left: auto; }
@keyframes slideIn { from { transform: translateX(110%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }

/* Code Block */
.code-block { background: var(--surface-container-low); padding: 1rem; border-radius: 0.5rem; overflow-x: auto; font-family: monospace; font-size: 0.75rem; color: var(--on-surface); }
code { font-family: monospace; }



@media (max-width: 768px) {
  .ds-content { padding: 0 1rem 2rem; }
  .ds-header__inner { padding: 0.75rem 1rem; }
  .ds-nav { display: none; }
  .ds-hero { padding: 2rem 1rem; }
}
</style>