<script setup>
// Imports usando caminhos relativos para evitar erro de Alias
import DsBadge from '../components/ui/DsBadge.vue';
import DsStat from '../components/ui/DsStat.vue';
import DsCard from '../components/ui/DsCard.vue';
import DsButton from '../components/ui/DsButton.vue';
import DsInput from '../components/ui/DsInput.vue';
</script>

<template>
  <div class="ds-root">
    <header class="ds-header">
      <div class="ds-header__inner">
        <div class="ds-brand">
          <div class="ds-brand__mark">V</div>
          <div>
            <p class="ds-brand__name">Vincis</p>
            <p class="ds-brand__sub">Design System</p>
          </div>
        </div>
      </div>
    </header>

    <div class="ds-hero">
      <DsBadge variant="primary">v1.0.0 — Referência Visual</DsBadge>
      <h1 class="ds-hero__title">
        Vincis<br />
        <em class="ds-hero__italic">Design System</em>
      </h1>
      <p class="ds-hero__sub">
        Todos os componentes, tokens e padrões visuais da plataforma Vincis em um único lugar.
      </p>

      <div class="ds-hero__stats">
        <DsStat icon="pi pi-bolt" label="Streak" value="12 Dias" />
        <DsStat icon="pi pi-check-circle" label="Eficiência" value="94%" />
        <DsStat icon="pi pi-star" label="Nível" value="Acadêmico" />
      </div>
    </div>


    <section class="ds-section">
      <h2 class="ds-section-title">Componentes de UI</h2>
      
      <div class="ds-main-grid">
        <div class="ds-col">
          <h3 class="ds-sub-title">Anatomia dos Containers</h3>
          <div class="ds-stack">
            <DsCard variant="base">
              <p><strong>Card Base:</strong> Usado para conteúdos secundários ou listas simples.</p>
            </DsCard>
            
            <DsCard variant="elevated">
              <p><strong>Card Elevado:</strong> Destaque principal com elevação suave.</p>
              <DsButton variant="primary" style="margin-top: 1rem;">Ação Interna</DsButton>
            </DsCard>
          </div>
        </div>

        <div class="ds-col">
          <h3 class="ds-sub-title">Ações e Entradas</h3>
          <div class="ds-flex-row">
            <DsButton variant="primary">Botão Primário</DsButton>
            <DsButton isFab icon="pi pi-plus" />
          </div>

          <div class="ds-input-demo">
            <DsInput label="Campo de Texto" placeholder="Ex: Nome da trilha..." />
          </div>
        </div>
      </div>
    </section>

    <footer class="ds-footer">
      <div class="ds-footer__inner">
        <span class="ds-footer__copy">© 2026 Vincis Platform</span>
        <DsBadge>Stable Build</DsBadge>
      </div>
    </footer>
  </div>
</template>


<style scoped>
/* Estilos de Layout específicos para a página de showroom */
.ds-root {
  min-height: 100vh;
  padding-bottom: 5rem;
}

.ds-header {
  padding: 1.5rem 2rem;
  border-bottom: 1px solid var(--surface-border);
}

.ds-brand {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.ds-brand__mark {
  background: var(--primary-container);
  color: var(--on-primary-container);
  width: 2rem;
  height: 2rem;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 0.5rem;
  font-weight: bold;
}

.ds-hero {
  text-align: center;
  padding: 5rem 1rem;
}

.ds-hero__title {
  font-size: clamp(2.5rem, 8vw, 4rem);
  line-height: 1.1;
  margin: 1rem 0;
}

.ds-hero__italic {
  font-style: italic;
  font-weight: 400;
  color: var(--primary);
}

.ds-hero__stats {
  display: flex;
  justify-content: center;
  gap: 1rem;
  margin-top: 2rem;
  flex-wrap: wrap;
}

.ds-section {
  max-width: 1100px;
  margin: 4rem auto;
  padding: 0 2rem;
}

.ds-section-title {
  font-size: 0.8rem;
  text-transform: uppercase;
  letter-spacing: 0.15em;
  color: var(--primary);
  margin-bottom: 2rem;
}

.ds-grid-swatches {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 1.5rem;
}

.ds-main-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 3rem;
}

.ds-stack {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.ds-flex-row {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.ds-footer {
  margin-top: 5rem;
  padding: 2rem;
  border-top: 1px solid var(--surface-border);
}

.ds-footer__inner {
  max-width: 1100px;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

@media (max-width: 768px) {
  .ds-main-grid { grid-template-columns: 1fr; }
}
</style>