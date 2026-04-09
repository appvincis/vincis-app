<template>
  <div class="ds-root">

    <!-- ══════════════════════════════════════
         HEADER
    ══════════════════════════════════════ -->
    <header class="ds-header">
      <div class="ds-header__inner">
        <div class="ds-brand">
          <div class="ds-brand__mark">V</div>
          <div>
            <p class="ds-brand__name">Vincis</p>
            <p class="ds-brand__sub">Design System</p>
          </div>
        </div>

        <nav class="ds-header__nav">
          <a v-for="item in navItems" :key="item.href" :href="item.href" class="ds-header__link">
            {{ item.label }}
          </a>
        </nav>
      </div>
    </header>

    <!-- ══════════════════════════════════════
         HERO
    ══════════════════════════════════════ -->
    <div class="ds-hero">
      <p class="ds-label ds-label--primary">v1.0.0 — Referência Visual</p>
      <h1 class="ds-hero__title">
        Vincis<br />
        <em class="ds-hero__italic">Design System</em>
      </h1>
      <p class="ds-hero__sub">
        Todos os componentes, tokens e padrões visuais da plataforma Vincis em um único lugar.
        Use esta página como contexto para garantir 100% de consistência nas telas geradas.
      </p>
    </div>

    <!-- ══════════════════════════════════════
         CONTEÚDO
    ══════════════════════════════════════ -->
    <div class="ds-content">

      <!-- ──────────────────────────────────
           01 TIPOGRAFIA
      ────────────────────────────────── -->
      <section id="typography">
        <div class="ds-section-label">01 — Tipografia</div>

        <div class="ds-grid-2 mb-10">
          <div class="ds-card">
            <p class="ds-label ds-label--muted mb-3">Headline · Newsreader</p>
            <p class="ds-headline ds-text-3xl ds-font-bold mb-1">Abc Defg</p>
            <p class="ds-headline ds-text-xl ds-italic ds-text-primary">Itálico Elegante</p>
            <p class="ds-text-sm ds-text-muted mt-3">Títulos, Display, Números grandes</p>
          </div>
          <div class="ds-card">
            <p class="ds-label ds-label--muted mb-3">Body & Label · Manrope</p>
            <p class="ds-text-3xl ds-font-bold mb-1">Abc Defg</p>
            <p class="ds-text-xl ds-text-muted">400 · 500 · 700</p>
            <p class="ds-text-sm ds-text-muted mt-3">Parágrafos, Labels, UI text</p>
          </div>
        </div>

        <div class="ds-card ds-type-scale">
          <div class="ds-type-row">
            <p class="ds-label ds-label--muted">Display · Newsreader 800 · 56px</p>
            <h1 class="ds-headline" style="font-size:3.5rem; font-weight:800; line-height:1;">Planejamento</h1>
          </div>
          <div class="ds-type-row">
            <p class="ds-label ds-label--muted">H1 · Newsreader 700 · 40px</p>
            <h1 class="ds-headline" style="font-size:2.5rem; font-weight:700;">Outubro 2023</h1>
          </div>
          <div class="ds-type-row">
            <p class="ds-label ds-label--muted">H2 · Newsreader 700 · 30px</p>
            <h2 class="ds-headline" style="font-size:1.875rem; font-weight:700;">Agenda Inteligente</h2>
          </div>
          <div class="ds-type-row">
            <p class="ds-label ds-label--muted">H3 · Newsreader 700 · 24px</p>
            <h3 class="ds-headline" style="font-size:1.5rem; font-weight:700;">Linha do Tempo</h3>
          </div>
          <div class="ds-type-row">
            <p class="ds-label ds-label--muted">H4 · Newsreader 600 · 18px</p>
            <h4 class="ds-headline" style="font-size:1.125rem; font-weight:600;">Estudo Dirigido — Fenomenologia da Percepção</h4>
          </div>
          <div class="ds-type-row">
            <p class="ds-label ds-label--muted">Body Large · Manrope 400 · 16px</p>
            <p style="font-size:1rem; line-height:1.6; max-width:560px;">
              Otimize suas janelas de estudo baseando-se no seu ritmo circadiano e metas de disciplina.
              A IA analisa seu histórico de produtividade.
            </p>
          </div>
          <div class="ds-type-row">
            <p class="ds-label ds-label--muted">Body Small · Manrope 400 · 14px</p>
            <p class="ds-text-muted" style="font-size:0.875rem; line-height:1.6; max-width:560px;">
              Fenomenologia da Percepção — Cap. 3 · Flashcards: Lógica Formal e Simbólica
            </p>
          </div>
          <div class="ds-type-row">
            <p class="ds-label ds-label--muted">Label / Caption · Manrope 700 · 10px · UPPERCASE</p>
            <p class="ds-label">08:00 — 10:00 · Premium Member · Foco Semanal</p>
          </div>
          <div class="ds-type-row" style="border-bottom:none; padding-bottom:0;">
            <p class="ds-label ds-label--muted">Italic Accent · Newsreader 400 italic</p>
            <p class="ds-headline ds-italic ds-text-muted" style="font-size:1rem;">Redação da Tese — Introdução</p>
          </div>
        </div>
      </section>

      <!-- ──────────────────────────────────
           02 CORES
      ────────────────────────────────── -->
      <section id="colors">
        <div class="ds-section-label">02 — Paleta de Cores</div>

        <p class="ds-label ds-label--muted mb-3">Primária — Ouro Acadêmico</p>
        <div class="ds-color-grid mb-8">
          <ColorSwatch color="#735c00" name="primary" hex="#735c00" token="bg-primary" />
          <ColorSwatch color="#d4af37" name="primary-container" hex="#d4af37" token="bg-primary-container" />
          <ColorSwatch color="#e9c349" name="primary-fixed-dim" hex="#e9c349" token="bg-primary-fixed-dim" />
          <ColorSwatch color="#ffe088" name="primary-fixed" hex="#ffe088" token="bg-primary-fixed" />
        </div>

        <p class="ds-label ds-label--muted mb-3">Secundária — Cinza Sábio</p>
        <div class="ds-color-grid mb-8">
          <ColorSwatch color="#5f5e5c" name="secondary" hex="#5f5e5c" token="bg-secondary" />
          <ColorSwatch color="#e5e2de" name="secondary-container" hex="#e5e2de" token="bg-secondary-container" />
          <ColorSwatch color="#595f67" name="tertiary" hex="#595f67" token="bg-tertiary" />
          <ColorSwatch color="#aeb3bc" name="tertiary-container" hex="#aeb3bc" token="bg-tertiary-container" />
        </div>

        <p class="ds-label ds-label--muted mb-3">Superfícies — Camadas de Profundidade</p>
        <div class="ds-color-grid ds-color-grid--6 mb-8">
          <ColorSwatch color="#ffffff" name="lowest" hex="#ffffff" small />
          <ColorSwatch color="#f7f3f0" name="low" hex="#f7f3f0" small />
          <ColorSwatch color="#f1edea" name="container" hex="#f1edea" small />
          <ColorSwatch color="#ebe7e4" name="high" hex="#ebe7e4" small />
          <ColorSwatch color="#e5e2df" name="highest" hex="#e5e2df" small />
          <ColorSwatch color="#31302f" name="inverse" hex="#31302f" small />
        </div>

        <p class="ds-label ds-label--muted mb-3">Semânticas — Estado e Feedback</p>
        <div class="ds-color-grid">
          <ColorSwatch color="#2e7d32" name="Sucesso" hex="#2e7d32" token="bg-success" small />
          <ColorSwatch color="#ba1a1a" name="Erro" hex="#ba1a1a" token="bg-error" small />
          <ColorSwatch color="#e65100" name="Alerta" hex="#e65100" token="bg-warning" small />
          <ColorSwatch color="#735c00" name="Info" hex="#735c00 · primary" token="bg-primary" small />
        </div>
      </section>

      <!-- ──────────────────────────────────
           03 BOTÕES
      ────────────────────────────────── -->
      <section id="buttons">
        <div class="ds-section-label">03 — Botões</div>

        <div class="ds-card" style="display:flex; flex-direction:column; gap:2rem;">

          <!-- Primário -->
          <div>
            <p class="ds-label ds-label--muted mb-4">Primário — Ação Principal</p>
            <div class="ds-row">
              <Button label="Automatizar Agenda" icon="pi pi-bolt" />
              <Button label="Novo Evento" icon="pi pi-plus" />
              <Button label="Desabilitado" :disabled="true" />
              <Button label="Carregando..." :loading="true" />
            </div>
          </div>

          <!-- Primário Container (Golden) -->
          <div>
            <p class="ds-label ds-label--muted mb-4">Primário Container — Ouro Destaque</p>
            <div class="ds-row">
              <Button label="Automatizar Agenda" icon="pi pi-bolt" class="p-button-golden" />
              <Button label="Gerar com IA" icon="pi pi-sparkles" class="p-button-golden" />
            </div>
          </div>

          <!-- Secundário -->
          <div>
            <p class="ds-label ds-label--muted mb-4">Secundário — Ação Auxiliar</p>
            <div class="ds-row">
              <Button label="Novo Evento" icon="pi pi-plus" severity="secondary" />
              <Button label="Anterior" icon="pi pi-chevron-left" severity="secondary" />
              <Button label="Desabilitado" severity="secondary" :disabled="true" />
            </div>
          </div>

          <!-- Ghost / Text -->
          <div>
            <p class="ds-label ds-label--muted mb-4">Ghost / Text — Ação Terciária</p>
            <div class="ds-row">
              <Button label="Ver todos" icon="pi pi-arrow-right" iconPos="right" text />
              <Button icon="pi pi-bell" text severity="secondary" />
              <Button icon="pi pi-user" text severity="secondary" rounded />
              <Button icon="pi pi-chevron-right" text severity="secondary" />
            </div>
          </div>

          <!-- FAB -->
          <div>
            <p class="ds-label ds-label--muted mb-4">FAB — Ação Flutuante (Mobile)</p>
            <div class="ds-row">
              <Button icon="pi pi-plus" class="p-button-fab" rounded />
              <Button icon="pi pi-bolt" class="p-button-fab-golden" rounded />
            </div>
          </div>

          <!-- Destrutivo -->
          <div>
            <p class="ds-label ds-label--muted mb-4">Destrutivo — Ação de Risco</p>
            <div class="ds-row">
              <Button label="Excluir Evento" icon="pi pi-trash" severity="danger" />
              <Button label="Cancelar Assinatura" severity="danger" outlined />
            </div>
          </div>

        </div>
      </section>

      <!-- ──────────────────────────────────
           04 INPUTS
      ────────────────────────────────── -->
      <section id="inputs">
        <div class="ds-section-label">04 — Inputs & Formulários</div>

        <div class="ds-grid-2">

          <!-- Campos de texto -->
          <div class="ds-card" style="display:flex; flex-direction:column; gap:1.25rem;">
            <p class="ds-label ds-label--muted">Campos de Texto</p>

            <!-- Default -->
            <div class="ds-field">
              <label class="ds-field__label">Título do Evento</label>
              <IconField>
                <InputIcon class="pi pi-calendar-alt" />
                <InputText placeholder="Ex: Estudo Dirigido" class="w-full" />
              </IconField>
              <p class="ds-field__hint">Estado: Default</p>
            </div>

            <!-- Focus simulado -->
            <div class="ds-field">
              <label class="ds-field__label">Pesquisar notas</label>
              <IconField>
                <InputIcon class="pi pi-search" />
                <InputText v-model="searchValue" class="w-full" />
              </IconField>
              <p class="ds-field__hint ds-field__hint--primary">Estado: Focus</p>
            </div>

            <!-- Error -->
            <div class="ds-field">
              <label class="ds-field__label ds-field__label--error">Data de Entrega</label>
              <IconField>
                <InputIcon class="pi pi-calendar" />
                <InputText value="32/13/2023" invalid class="w-full" />
              </IconField>
              <p class="ds-field__hint ds-field__hint--error">
                <i class="pi pi-exclamation-circle" style="font-size:0.7rem;" />
                Data inválida. Use o formato DD/MM/AAAA.
              </p>
            </div>

            <!-- Disabled -->
            <div class="ds-field">
              <label class="ds-field__label ds-field__label--disabled">Campo Somente Leitura</label>
              <InputText value="Dr. Aris V. — Premium Member" disabled class="w-full" />
              <p class="ds-field__hint ds-field__hint--disabled">Estado: Desabilitado</p>
            </div>

            <!-- Textarea -->
            <div class="ds-field">
              <label class="ds-field__label">Descrição / Anotações</label>
              <Textarea placeholder="Adicione notas sobre esta sessão de estudo..." :rows="3" class="w-full" autoResize />
            </div>
          </div>

          <!-- Selects & Controles -->
          <div class="ds-card" style="display:flex; flex-direction:column; gap:1.25rem;">
            <p class="ds-label ds-label--muted">Selects & Controles</p>

            <!-- Select -->
            <div class="ds-field">
              <label class="ds-field__label">Disciplina</label>
              <Select
                v-model="selectedDiscipline"
                :options="disciplines"
                optionLabel="name"
                placeholder="Selecione"
                class="w-full"
              />
            </div>

            <!-- Checkboxes -->
            <div class="ds-field">
              <p class="ds-field__label">Tipos de Sessão</p>
              <div style="display:flex; flex-direction:column; gap:0.625rem; margin-top:0.25rem;">
                <div v-for="item in sessionTypes" :key="item.id" class="ds-check-row">
                  <Checkbox v-model="item.checked" :inputId="item.id" :binary="true" />
                  <label :for="item.id" :class="['ds-check-label', !item.checked && 'ds-check-label--off', item.disabled && 'ds-check-label--disabled']">
                    {{ item.label }}
                  </label>
                </div>
              </div>
            </div>

            <!-- Toggles -->
            <div class="ds-field">
              <p class="ds-field__label">Toggles</p>
              <div style="display:flex; flex-direction:column; gap:0.75rem; margin-top:0.25rem;">
                <div v-for="tog in toggles" :key="tog.id" class="ds-toggle-row">
                  <label :for="tog.id" :class="['ds-toggle-label', !tog.checked && 'ds-toggle-label--off']">{{ tog.label }}</label>
                  <ToggleSwitch v-model="tog.checked" :inputId="tog.id" />
                </div>
              </div>
            </div>

            <!-- Search bar -->
            <div class="ds-field">
              <p class="ds-field__label">Search Bar (Header)</p>
              <IconField>
                <InputIcon class="pi pi-search" />
                <InputText placeholder="Pesquisar notas..." class="w-full ds-search-pill" />
              </IconField>
            </div>

            <!-- InputNumber -->
            <div class="ds-field">
              <label class="ds-field__label">Horas de Estudo</label>
              <InputNumber v-model="studyHours" suffix="h" :min="0" :max="24" showButtons class="w-full" />
            </div>

            <!-- MultiSelect -->
            <div class="ds-field">
              <label class="ds-field__label">Disciplinas (multi)</label>
              <MultiSelect
                v-model="selectedMulti"
                :options="disciplines"
                optionLabel="name"
                placeholder="Selecione disciplinas"
                display="chip"
                class="w-full"
              />
            </div>
          </div>
        </div>
      </section>

      <!-- ──────────────────────────────────
           05 CARDS & CONTAINERS
      ────────────────────────────────── -->
      <section id="cards">
        <div class="ds-section-label">05 — Cards & Containers</div>

        <div class="ds-grid-3 mb-8">

          <!-- Timeline ativo -->
          <div>
            <p class="ds-label ds-label--muted mb-3">Timeline Card — Ativo</p>
            <div class="ds-timeline-item">
              <div class="ds-timeline-dot ds-timeline-dot--active"></div>
              <div class="ds-timeline-line"></div>
              <div class="ds-card ds-card--timeline-active">
                <span class="ds-label ds-label--primary ds-label--block mb-1">08:00 — 10:00</span>
                <h4 class="ds-headline" style="font-size:1.125rem; font-weight:700;">Estudo Dirigido</h4>
                <p class="ds-text-sm ds-text-muted mt-1">Fenomenologia da Percepção — Cap. 3</p>
              </div>
            </div>
          </div>

          <!-- Timeline pendente -->
          <div>
            <p class="ds-label ds-label--muted mb-3">Timeline Card — Pendente</p>
            <div class="ds-timeline-item">
              <div class="ds-timeline-dot"></div>
              <div class="ds-timeline-line"></div>
              <div class="ds-card ds-card--timeline-pending">
                <span class="ds-label ds-label--muted ds-label--block mb-1">15:00 — 17:00</span>
                <h4 class="ds-headline ds-text-muted" style="font-size:1.125rem; font-weight:700;">Escrita Acadêmica</h4>
                <p class="ds-text-sm ds-italic" style="color:#7f7663; margin-top:0.25rem; opacity:.6;">Redação da Tese — Introdução</p>
              </div>
            </div>
          </div>

          <!-- AI Dark Card -->
          <div>
            <p class="ds-label ds-label--muted mb-3">AI Card — Dark Surface</p>
            <div class="ds-card ds-card--dark">
              <div class="ds-card-dark__glow"></div>
              <div style="position:relative; z-index:1; display:flex; flex-direction:column; gap:0.75rem;">
                <div style="display:flex; align-items:center; gap:0.75rem;">
                  <div class="ds-icon-box">
                    <i class="pi pi-bolt" style="color:#554300; font-size:1.125rem;" />
                  </div>
                  <h3 class="ds-headline" style="color:#fdf9f6; font-size:1.125rem; font-weight:700;">Agenda Inteligente</h3>
                </div>
                <p style="color:#e5e2df; font-size:0.75rem; line-height:1.6;">
                  Otimize suas janelas de estudo baseando-se no seu ritmo circadiano.
                </p>
                <Button label="Automatizar" icon="pi pi-sparkles" class="p-button-golden" style="width:100%;" />
              </div>
            </div>
          </div>

          <!-- Stats Card -->
          <div>
            <p class="ds-label ds-label--muted mb-3">Stats Card</p>
            <div class="ds-card" style="background:#f7f3f0;">
              <h4 class="ds-label mb-4">Foco Semanal</h4>
              <div style="display:flex; flex-direction:column; gap:1rem;">
                <div>
                  <div style="display:flex; justify-content:space-between; font-size:0.75rem; margin-bottom:0.375rem;">
                    <span class="ds-text-muted">Meta: 20h</span>
                    <span style="font-weight:700;">14.5h</span>
                  </div>
                  <ProgressBar :value="72" :showValue="false" style="height:6px;" />
                  <p class="ds-text-sm ds-text-muted mt-1">72% concluído</p>
                </div>
                <div style="display:grid; grid-template-columns:1fr 1fr; gap:0.75rem;">
                  <div class="ds-stat-mini">
                    <p class="ds-label ds-label--muted">Streak</p>
                    <p class="ds-headline" style="font-size:1.25rem; font-weight:700;">12 Dias</p>
                  </div>
                  <div class="ds-stat-mini">
                    <p class="ds-label ds-label--muted">Eficiência</p>
                    <p class="ds-headline" style="font-size:1.25rem; font-weight:700;">94%</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Calendar chip -->
          <div>
            <p class="ds-label ds-label--muted mb-3">Calendar Event Chip</p>
            <div class="ds-card" style="padding:0; overflow:hidden;">
              <div style="padding:0.75rem; border-bottom:1px solid rgba(208,197,175,0.15);">
                <p class="ds-label ds-label--muted mb-2">Semana atual</p>
                <div style="display:grid; grid-template-columns:repeat(4,1fr); gap:0.375rem;">
                  <div class="ds-cal-day ds-cal-day--today">
                    <p class="ds-cal-day__num ds-text-primary" style="text-decoration:underline; text-decoration-thickness:2px;">11</p>
                    <div class="ds-cal-event ds-cal-event--primary">Revisão</div>
                  </div>
                  <div class="ds-cal-day">
                    <p class="ds-cal-day__num">12</p>
                  </div>
                  <div class="ds-cal-day">
                    <p class="ds-cal-day__num">13</p>
                    <div class="ds-cal-event ds-cal-event--secondary">Seminário</div>
                  </div>
                  <div class="ds-cal-day">
                    <p class="ds-cal-day__num">14</p>
                  </div>
                </div>
              </div>
              <div style="padding:0.5rem; text-align:center;">
                <p class="ds-label ds-label--muted">Calendar Grid — border-outline-variant/5</p>
              </div>
            </div>
          </div>

          <!-- Profile chip & Tags -->
          <div>
            <p class="ds-label ds-label--muted mb-3">User Profile Chip & Tags</p>
            <div style="display:flex; flex-direction:column; gap:1rem;">
              <div class="ds-profile-chip">
                <Avatar label="A" shape="circle" />
                <div>
                  <p style="font-size:0.875rem; font-weight:700;">Dr. Aris V.</p>
                  <p class="ds-label ds-label--muted">Premium Member</p>
                </div>
              </div>
              <div style="display:flex; flex-wrap:wrap; gap:0.5rem;">
                <Tag value="Filosofia" severity="primary" />
                <Tag value="Seminário" severity="secondary" />
                <Tag value="Importante" severity="contrast" />
                <Tag value="Concluído" severity="success" />
                <Tag value="Atrasado" severity="danger" />
              </div>
              <!-- Badges -->
              <div style="display:flex; align-items:center; gap:1rem;">
                <div class="ds-badge-demo">
                  <i class="pi pi-bell" style="font-size:1.25rem; color:#5f5e5c;" />
                  <Badge value="3" />
                </div>
                <div class="ds-badge-demo">
                  <i class="pi pi-envelope" style="font-size:1.25rem; color:#5f5e5c;" />
                  <Badge value="12" severity="danger" />
                </div>
                <div class="ds-badge-demo">
                  <i class="pi pi-calendar" style="font-size:1.25rem; color:#5f5e5c;" />
                  <Badge value="2" severity="success" />
                </div>
              </div>
            </div>
          </div>

        </div>

        <!-- Anatomia dos containers -->
        <div class="ds-card">
          <p class="ds-label ds-label--muted mb-5">Anatomia dos Containers — Bordas, Shadow e Padding</p>
          <div style="display:grid; grid-template-columns:repeat(3,1fr); gap:1rem; text-align:center;">
            <div>
              <div class="ds-anatomy-card ds-anatomy-card--base">
                <p class="ds-headline" style="font-size:0.875rem; font-weight:700;">Card Base</p>
                <p class="ds-text-sm ds-text-muted mt-1">rounded-[10px] · border/10 · shadow-sm · p-4</p>
              </div>
            </div>
            <div>
              <div class="ds-anatomy-card ds-anatomy-card--elevated">
                <p class="ds-headline" style="font-size:0.875rem; font-weight:700;">Card Elevado</p>
                <p class="ds-text-sm ds-text-muted mt-1">rounded-xl · border/20 · shadow-md · p-6</p>
              </div>
            </div>
            <div>
              <div class="ds-anatomy-card ds-anatomy-card--section">
                <p class="ds-headline" style="font-size:0.875rem; font-weight:700;">Card Section</p>
                <p class="ds-text-sm ds-text-muted mt-1">rounded-2xl · bg-surface-low · p-6</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- ──────────────────────────────────
           06 NAVEGAÇÃO
      ────────────────────────────────── -->
      <section id="navigation">
        <div class="ds-section-label">06 — Navegação</div>

        <div class="ds-grid-2">

          <!-- Sidebar -->
          <div>
            <p class="ds-label ds-label--muted mb-3">Sidebar Nav (Desktop)</p>
            <PanelMenu :model="sidebarItems" class="ds-sidebar-menu" />
          </div>

          <!-- Bottom nav + header -->
          <div style="display:flex; flex-direction:column; gap:1.5rem;">

            <!-- Bottom Nav -->
            <div>
              <p class="ds-label ds-label--muted mb-3">Bottom Nav (Mobile)</p>
              <div class="ds-bottom-nav">
                <div class="ds-bottom-nav__inner">
                  <button
                    v-for="item in bottomNavItems"
                    :key="item.id"
                    :class="['ds-bottom-nav__item', item.active && 'ds-bottom-nav__item--active']"
                    @click="setBottomNav(item.id)"
                  >
                    <i :class="['pi', item.icon]" style="font-size:1.25rem;" />
                    <span>{{ item.label }}</span>
                  </button>
                  <div class="ds-bottom-nav__fab">
                    <Button icon="pi pi-plus" class="p-button-fab" rounded style="width:3rem; height:3rem;" />
                  </div>
                </div>
                <div class="ds-bottom-nav__hint">
                  <p class="ds-label ds-label--muted">FAB central: bg-primary · rounded-full · border-4 border-background</p>
                  <p class="ds-label ds-label--muted">Ativo: text-primary · icon FILL=1 · Inativo: text-secondary</p>
                </div>
              </div>
            </div>

            <!-- Top Header Sample -->
            <div>
              <p class="ds-label ds-label--muted mb-3">Top Header</p>
              <div class="ds-header-sample">
                <h1 class="ds-headline" style="font-size:1.125rem; font-weight:700; letter-spacing:-0.01em;">PLANEJAMENTO</h1>
                <div style="display:flex; align-items:center; gap:0.75rem;">
                  <IconField>
                    <InputIcon class="pi pi-search" />
                    <InputText placeholder="Pesquisar..." class="ds-search-pill" style="width:9rem;" />
                  </IconField>
                  <Button icon="pi pi-bell" text severity="secondary" />
                </div>
              </div>
              <p class="ds-label ds-label--muted mt-2">sticky top-0 · z-50 · shadow · bg-background</p>
            </div>

            <!-- Breadcrumb -->
            <div>
              <p class="ds-label ds-label--muted mb-3">Breadcrumb</p>
              <Breadcrumb :home="breadcrumbHome" :model="breadcrumbItems" />
            </div>

            <!-- Steps -->
            <div>
              <p class="ds-label ds-label--muted mb-3">Steps</p>
              <Steps :model="stepsItems" :readonly="false" v-model:activeStep="activeStep" />
            </div>
          </div>

        </div>
      </section>

      <!-- ──────────────────────────────────
           07 FEEDBACK
      ────────────────────────────────── -->
      <section id="feedback">
        <div class="ds-section-label">07 — Feedback Visual</div>

        <!-- Toasts demo -->
        <p class="ds-label ds-label--muted mb-4">Toasts / Notificações</p>
        <div style="display:flex; flex-wrap:wrap; gap:0.75rem; margin-bottom:1.5rem;">
          <Button label="Toast Sucesso" icon="pi pi-check-circle" severity="success" outlined @click="showToast('success')" />
          <Button label="Toast Erro" icon="pi pi-times-circle" severity="danger" outlined @click="showToast('error')" />
          <Button label="Toast Aviso" icon="pi pi-exclamation-triangle" severity="warn" outlined @click="showToast('warn')" />
          <Button label="Toast Info" icon="pi pi-info-circle" outlined @click="showToast('info')" />
        </div>
        <Toast position="top-right" />

        <!-- Toasts estáticos (preview) -->
        <div style="display:flex; flex-direction:column; gap:0.75rem; max-width:24rem; margin-bottom:2.5rem;">
          <div class="ds-toast-preview ds-toast-preview--success">
            <div class="ds-toast-preview__icon" style="background:#c8e6c9;">
              <i class="pi pi-check-circle" style="color:#2e7d32; font-size:1.125rem;" />
            </div>
            <div class="ds-toast-preview__body">
              <p class="ds-toast-preview__title">Evento criado com sucesso!</p>
              <p class="ds-toast-preview__sub">Filosofia Analítica adicionado ao dia 11.</p>
            </div>
            <button class="ds-toast-preview__close"><i class="pi pi-times" style="font-size:0.875rem;" /></button>
          </div>
          <div class="ds-toast-preview ds-toast-preview--error">
            <div class="ds-toast-preview__icon" style="background:#ffdad6;">
              <i class="pi pi-times-circle" style="color:#ba1a1a; font-size:1.125rem;" />
            </div>
            <div class="ds-toast-preview__body">
              <p class="ds-toast-preview__title">Falha ao sincronizar</p>
              <p class="ds-toast-preview__sub">Verifique sua conexão e tente novamente.</p>
            </div>
            <button class="ds-toast-preview__close"><i class="pi pi-times" style="font-size:0.875rem;" /></button>
          </div>
          <div class="ds-toast-preview ds-toast-preview--warn">
            <div class="ds-toast-preview__icon" style="background:#ffe0b2;">
              <i class="pi pi-exclamation-triangle" style="color:#e65100; font-size:1.125rem;" />
            </div>
            <div class="ds-toast-preview__body">
              <p class="ds-toast-preview__title">Meta semanal em risco</p>
              <p class="ds-toast-preview__sub">Você está 5.5h abaixo da sua meta de 20h.</p>
            </div>
            <button class="ds-toast-preview__close"><i class="pi pi-times" style="font-size:0.875rem;" /></button>
          </div>
          <div class="ds-toast-preview ds-toast-preview--info">
            <div class="ds-toast-preview__icon" style="background:#ffe088;">
              <i class="pi pi-info-circle" style="color:#735c00; font-size:1.125rem;" />
            </div>
            <div class="ds-toast-preview__body">
              <p class="ds-toast-preview__title">IA analisando seu padrão</p>
              <p class="ds-toast-preview__sub">A agenda inteligente será atualizada em instantes.</p>
            </div>
            <button class="ds-toast-preview__close"><i class="pi pi-times" style="font-size:0.875rem;" /></button>
          </div>
        </div>

        <!-- Modal -->
        <p class="ds-label ds-label--muted mb-4">Modal</p>
        <div style="margin-bottom:1rem;">
          <Button label="Abrir Modal — Novo Evento" icon="pi pi-calendar-plus" @click="dialogOpen = true" />
        </div>

        <Dialog v-model:visible="dialogOpen" header="Novo Evento" modal :style="{ width: '26rem' }">
          <div style="display:flex; flex-direction:column; gap:1rem; padding-top:0.25rem;">
            <div class="ds-field">
              <label class="ds-field__label">Título</label>
              <InputText placeholder="Ex: Revisão Ativa" class="w-full" />
            </div>
            <div style="display:grid; grid-template-columns:1fr 1fr; gap:0.75rem;">
              <div class="ds-field">
                <label class="ds-field__label">Data</label>
                <InputText placeholder="DD/MM/AAAA" class="w-full" />
              </div>
              <div class="ds-field">
                <label class="ds-field__label">Horário</label>
                <InputText placeholder="08:00" class="w-full" />
              </div>
            </div>
            <div class="ds-field">
              <label class="ds-field__label">Disciplina</label>
              <Select v-model="selectedDiscipline" :options="disciplines" optionLabel="name" placeholder="Selecione" class="w-full" />
            </div>
          </div>
          <template #footer>
            <Button label="Cancelar" severity="secondary" @click="dialogOpen = false" />
            <Button label="Criar Evento" @click="dialogOpen = false" />
          </template>
        </Dialog>

        <!-- Inline messages -->
        <p class="ds-label ds-label--muted mb-3 mt-8">Messages Inline</p>
        <div style="display:flex; flex-direction:column; gap:0.75rem; max-width:30rem; margin-bottom:2.5rem;">
          <Message severity="success">Evento criado com sucesso! Adicionado ao dia 11.</Message>
          <Message severity="error">Falha ao sincronizar. Verifique sua conexão.</Message>
          <Message severity="warn">Meta semanal em risco — 5.5h abaixo da meta de 20h.</Message>
          <Message severity="info">IA analisando seu padrão de estudos.</Message>
        </div>

        <!-- Estados Vazios & Loading -->
        <p class="ds-label ds-label--muted mb-4 mt-2">Estados Vazios & Loading</p>
        <div class="ds-grid-2">
          <div class="ds-empty-state">
            <i class="pi pi-calendar" style="font-size:2.5rem; color:#d0c5af;" />
            <p class="ds-headline" style="font-size:1rem; font-weight:700;">Nenhum evento hoje</p>
            <p class="ds-text-sm ds-text-muted" style="max-width:200px; text-align:center;">
              Adicione um evento de estudo para começar seu dia.
            </p>
            <Button label="Criar Evento" icon="pi pi-plus" class="p-button-golden" size="small" style="margin-top:0.25rem;" />
          </div>
          <div class="ds-loading-state">
            <div style="display:flex; gap:0.375rem;">
              <div class="ds-bounce-dot" style="animation-delay:0s;"></div>
              <div class="ds-bounce-dot" style="animation-delay:0.15s; background:#d4af37;"></div>
              <div class="ds-bounce-dot" style="animation-delay:0.3s; background:#e9c349;"></div>
            </div>
            <div style="display:flex; flex-direction:column; gap:0.5rem; width:100%; padding:0 1rem;">
              <Skeleton height="12px" borderRadius="6px" />
              <Skeleton height="12px" width="80%" borderRadius="6px" />
              <Skeleton height="12px" width="60%" borderRadius="6px" />
            </div>
            <p class="ds-label ds-label--muted">Loading skeleton state</p>
          </div>
        </div>

        <!-- Accordion / Collapse -->
        <p class="ds-label ds-label--muted mb-3 mt-8">Accordion</p>
        <Accordion :value="['0']" multiple style="max-width:36rem;">
          <AccordionPanel value="0">
            <AccordionHeader>Fenomenologia da Percepção</AccordionHeader>
            <AccordionContent>
              <p class="ds-text-sm ds-text-muted" style="line-height:1.6;">
                Cap. 3 — A estrutura da experiência perceptiva segundo Merleau-Ponty,
                abordando a intencionalidade corporal e o campo perceptivo.
              </p>
            </AccordionContent>
          </AccordionPanel>
          <AccordionPanel value="1">
            <AccordionHeader>Lógica Formal e Simbólica</AccordionHeader>
            <AccordionContent>
              <p class="ds-text-sm ds-text-muted" style="line-height:1.6;">
                Cálculo proposicional, tabelas-verdade, dedução natural e sistemas axiomáticos.
              </p>
            </AccordionContent>
          </AccordionPanel>
          <AccordionPanel value="2">
            <AccordionHeader>Ética e Política</AccordionHeader>
            <AccordionContent>
              <p class="ds-text-sm ds-text-muted" style="line-height:1.6;">
                Teorias normativas, contratualismo e deontologia kantiana.
              </p>
            </AccordionContent>
          </AccordionPanel>
        </Accordion>

        <!-- DataTable -->
        <p class="ds-label ds-label--muted mb-3 mt-8">Data Table</p>
        <DataTable :value="tableData" stripedRows class="ds-table">
          <Column field="time" header="Horário" style="width:7rem;" />
          <Column field="title" header="Evento" />
          <Column field="discipline" header="Disciplina" />
          <Column field="status" header="Status">
            <template #body="{ data }">
              <Tag :value="data.status" :severity="data.statusSeverity" />
            </template>
          </Column>
          <Column header="Ações" style="width:6rem;">
            <template #body>
              <div style="display:flex; gap:0.25rem;">
                <Button icon="pi pi-pencil" text size="small" />
                <Button icon="pi pi-trash" text severity="danger" size="small" />
              </div>
            </template>
          </Column>
        </DataTable>

      </section>

      <!-- ──────────────────────────────────
           08 TOKENS
      ────────────────────────────────── -->
      <section id="tokens">
        <div class="ds-section-label">08 — Tokens & Referência Rápida para IA</div>

        <div class="ds-tokens-card">
          <div style="display:flex; align-items:center; gap:0.75rem; margin-bottom:1.5rem;">
            <div class="ds-icon-box">
              <i class="pi pi-bolt" style="color:#554300; font-size:1.125rem;" />
            </div>
            <h3 class="ds-headline" style="color:#fdf9f6; font-size:1.25rem; font-weight:700;">Guia rápido para IA gerar telas</h3>
          </div>
          <div style="display:grid; grid-template-columns:1fr 1fr; gap:1.5rem; font-size:0.75rem; font-family:monospace;">
            <div style="display:flex; flex-direction:column; gap:0.5rem;">
              <p class="ds-tokens-section-title">Fontes</p>
              <p class="ds-tokens-row"><span>Títulos/Display →</span><span class="ds-tokens-val">font-serif (Newsreader)</span></p>
              <p class="ds-tokens-row"><span>UI / Corpo →</span><span class="ds-tokens-val">font-body / font-label (Manrope)</span></p>
              <p class="ds-tokens-row"><span>Labels caps →</span><span class="ds-tokens-val">text-[10px] font-bold uppercase tracking-widest</span></p>
              <p class="ds-tokens-row"><span>Ativo em nav →</span><span class="ds-tokens-val">font-serif italic</span></p>
            </div>
            <div style="display:flex; flex-direction:column; gap:0.5rem;">
              <p class="ds-tokens-section-title">Superfícies (mais escuro = mais elevado)</p>
              <p class="ds-tokens-row"><span>Fundo global →</span><span class="ds-tokens-val">bg-background (#fdf9f6)</span></p>
              <p class="ds-tokens-row"><span>Cards base →</span><span class="ds-tokens-val">bg-surface-container-lowest</span></p>
              <p class="ds-tokens-row"><span>Sidebar →</span><span class="ds-tokens-val">bg-surface-container-low</span></p>
              <p class="ds-tokens-row"><span>Hover/pressed →</span><span class="ds-tokens-val">bg-surface-container-high</span></p>
            </div>
            <div style="display:flex; flex-direction:column; gap:0.5rem;">
              <p class="ds-tokens-section-title">Bordas & Radius</p>
              <p class="ds-tokens-row"><span>Divisores sutis →</span><span class="ds-tokens-val">border-outline-variant/10 ou /15</span></p>
              <p class="ds-tokens-row"><span>Cards →</span><span class="ds-tokens-val">rounded-xl (0.75rem)</span></p>
              <p class="ds-tokens-row"><span>Seções →</span><span class="ds-tokens-val">rounded-2xl (1rem)</span></p>
              <p class="ds-tokens-row"><span>Pills/tags →</span><span class="ds-tokens-val">rounded-full</span></p>
              <p class="ds-tokens-row"><span>Timeline items →</span><span class="ds-tokens-val">rounded-[10px]</span></p>
            </div>
            <div style="display:flex; flex-direction:column; gap:0.5rem;">
              <p class="ds-tokens-section-title">Interação</p>
              <p class="ds-tokens-row"><span>Press →</span><span class="ds-tokens-val">active:scale-95 transition-all</span></p>
              <p class="ds-tokens-row"><span>Focus ring →</span><span class="ds-tokens-val">focus:ring-2 focus:ring-primary/50</span></p>
              <p class="ds-tokens-row"><span>Hover texto →</span><span class="ds-tokens-val">hover:text-primary transition-colors</span></p>
              <p class="ds-tokens-row"><span>Hover bg →</span><span class="ds-tokens-val">hover:bg-surface-bright transition-all</span></p>
              <p class="ds-tokens-row"><span>Icons →</span><span class="ds-tokens-val">PrimeIcons (pi pi-*)</span></p>
            </div>
          </div>
        </div>
      </section>

    </div><!-- /ds-content -->

    <!-- ══════════════════════════════════════
         FOOTER
    ══════════════════════════════════════ -->
    <footer class="ds-footer">
      <div class="ds-footer__inner">
        <div style="display:flex; align-items:center; gap:0.5rem;">
          <div class="ds-brand__mark" style="width:1.75rem; height:1.75rem; font-size:0.875rem;">V</div>
          <span class="ds-headline" style="font-weight:700;">Vincis Design System</span>
          <span class="ds-text-muted" style="font-size:0.875rem;">v1.0.0</span>
        </div>
        <p class="ds-label ds-label--muted">
          Rota: <code class="ds-code">/design-system</code>
        </p>
      </div>
    </footer>

  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useToast } from 'primevue/usetoast'

// PrimeVue components
import Button from 'primevue/button'
import InputText from 'primevue/inputtext'
import Textarea from 'primevue/textarea'
import Select from 'primevue/select'
import Checkbox from 'primevue/checkbox'
import ToggleSwitch from 'primevue/toggleswitch'
import InputNumber from 'primevue/inputnumber'
import MultiSelect from 'primevue/multiselect'
import IconField from 'primevue/iconfield'
import InputIcon from 'primevue/inputicon'
import ProgressBar from 'primevue/progressbar'
import Tag from 'primevue/tag'
import Badge from 'primevue/badge'
import Avatar from 'primevue/avatar'
import Skeleton from 'primevue/skeleton'
import Toast from 'primevue/toast'
import Dialog from 'primevue/dialog'
import Message from 'primevue/message'
import Accordion from 'primevue/accordion'
import AccordionPanel from 'primevue/accordionpanel'
import AccordionHeader from 'primevue/accordionheader'
import AccordionContent from 'primevue/accordioncontent'
import PanelMenu from 'primevue/panelmenu'
import Breadcrumb from 'primevue/breadcrumb'
import Steps from 'primevue/steps'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'

// Sub-componente local para swatches de cor
const ColorSwatch = {
  props: ['color', 'name', 'hex', 'token', 'small'],
  template: `
    <div class="ds-swatch">
      <div class="ds-swatch__color" :style="{ background: color, height: small ? '3.5rem' : '5rem' }"></div>
      <div class="ds-swatch__info">
        <p class="ds-swatch__name">{{ name }}</p>
        <p class="ds-swatch__hex">{{ hex }}</p>
        <p v-if="token" class="ds-swatch__token">{{ token }}</p>
      </div>
    </div>
  `
}

const toast = useToast()

// ── State ───────────────────────────────────────
const searchValue = ref('Fenomenologia')
const studyHours  = ref(8)
const selectedDiscipline = ref(null)
const selectedMulti = ref([])
const dialogOpen = ref(false)
const activeStep = ref(1)

const disciplines = ref([
  { name: 'Filosofia Analítica' },
  { name: 'Fenomenologia' },
  { name: 'Lógica Formal' },
  { name: 'Ética e Política' },
])

const sessionTypes = ref([
  { id: 'sess1', label: 'Estudo Dirigido',   checked: true,  disabled: false },
  { id: 'sess2', label: 'Revisão Ativa',     checked: false, disabled: false },
  { id: 'sess3', label: 'Escrita Acadêmica', checked: true,  disabled: false },
  { id: 'sess4', label: 'Indisponível',      checked: false, disabled: true  },
])

const toggles = ref([
  { id: 'tog1', label: 'Agenda Inteligente', checked: true  },
  { id: 'tog2', label: 'Notificações',       checked: false },
])

// ── Navegação ───────────────────────────────────
const navItems = [
  { href: '#typography', label: 'Tipo'    },
  { href: '#colors',     label: 'Cores'   },
  { href: '#buttons',    label: 'Botões'  },
  { href: '#inputs',     label: 'Inputs'  },
  { href: '#cards',      label: 'Cards'   },
  { href: '#navigation', label: 'Nav'     },
  { href: '#feedback',   label: 'Feedback'},
]

const sidebarItems = ref([
  {
    label: 'Vincis',
    items: [
      { label: 'Dashboard',   icon: 'pi pi-chart-bar' },
      { label: 'Disciplinas', icon: 'pi pi-book' },
      {
        label: 'Planejamento',
        icon: 'pi pi-calendar',
        class: 'ds-nav-active',
      },
      { label: 'Configurações', icon: 'pi pi-cog' },
    ],
  },
])

const bottomNavItems = ref([
  { id: 'dash',  icon: 'pi-chart-bar',   label: 'Dash',   active: false },
  { id: 'plan',  icon: 'pi-calendar',    label: 'Plan',   active: true  },
  { id: 'books', icon: 'pi-book',        label: 'Livros', active: false },
  { id: 'cfg',   icon: 'pi-cog',         label: 'Ajuste', active: false },
])

const setBottomNav = (id) => {
  bottomNavItems.value.forEach(i => i.active = i.id === id)
}

const breadcrumbHome  = ref({ icon: 'pi pi-home', route: '/' })
const breadcrumbItems = ref([
  { label: 'Disciplinas' },
  { label: 'Fenomenologia' },
  { label: 'Cap. 3' },
])

const stepsItems = ref([
  { label: 'Disciplina' },
  { label: 'Horário'    },
  { label: 'Confirmar'  },
])

// ── DataTable ───────────────────────────────────
const tableData = ref([
  { time: '08:00–10:00', title: 'Estudo Dirigido',   discipline: 'Fenomenologia',       status: 'Concluído',  statusSeverity: 'success'   },
  { time: '10:30–12:00', title: 'Revisão Ativa',     discipline: 'Lógica Formal',       status: 'Em curso',   statusSeverity: 'warn'       },
  { time: '14:00–16:00', title: 'Escrita Acadêmica', discipline: 'Filosofia Analítica', status: 'Pendente',   statusSeverity: 'secondary'  },
  { time: '16:30–18:00', title: 'Seminário',          discipline: 'Ética e Política',    status: 'Atrasado',   statusSeverity: 'danger'     },
])

// ── Toasts ──────────────────────────────────────
const showToast = (severity) => {
  const map = {
    success: { summary: 'Evento criado!',       detail: 'Filosofia Analítica adicionado ao dia 11.' },
    error:   { summary: 'Falha ao sincronizar', detail: 'Verifique sua conexão e tente novamente.'   },
    warn:    { summary: 'Meta em risco',         detail: 'Você está 5.5h abaixo da meta de 20h.'      },
    info:    { summary: 'IA analisando',         detail: 'A agenda inteligente será atualizada.'       },
  }
  toast.add({ severity, ...map[severity], life: 4000 })
}
</script>

<style scoped>
/* ══════════════════════════════════════════════════
   TOKENS LOCAIS
══════════════════════════════════════════════════ */
:root,
.ds-root {
  --c-primary:           #735c00;
  --c-primary-container: #d4af37;
  --c-primary-fixed:     #ffe088;
  --c-on-primary:        #ffffff;
  --c-on-primary-cnt:    #554300;
  --c-secondary:         #5f5e5c;
  --c-on-surface:        #1c1b1a;
  --c-on-surface-var:    #4d4635;
  --c-bg:                #fdf9f6;
  --c-surface-low:       #f7f3f0;
  --c-surface:           #f1edea;
  --c-surface-high:      #ebe7e4;
  --c-surface-highest:   #e5e2df;
  --c-surface-lowest:    #ffffff;
  --c-outline:           #7f7663;
  --c-outline-var:       #d0c5af;
  --c-error:             #ba1a1a;
  --c-error-cnt:         #ffdad6;
  --c-success:           #2e7d32;
  --c-success-cnt:       #c8e6c9;
  --c-warning:           #e65100;
  --c-warning-cnt:       #ffe0b2;
  --c-inverse:           #31302f;
  --c-inverse-on:        #f4f0ed;
}

/* ══════════════════════════════════════════════════
   LAYOUT
══════════════════════════════════════════════════ */
.ds-root {
  font-family: 'Manrope', sans-serif;
  background: var(--c-bg);
  color: var(--c-on-surface);
  min-height: 100vh;
}

.ds-content {
  max-width: 64rem;
  margin: 0 auto;
  padding: 0 2rem 6rem;
  display: flex;
  flex-direction: column;
  gap: 6rem;
}

/* ══════════════════════════════════════════════════
   HEADER
══════════════════════════════════════════════════ */
.ds-header {
  position: sticky;
  top: 0;
  z-index: 50;
  background: var(--c-bg);
  border-bottom: 1px solid rgba(208, 197, 175, 0.20);
  box-shadow: 0 4px 24px rgba(28, 27, 26, 0.05);
}
.ds-header__inner {
  max-width: 64rem;
  margin: 0 auto;
  padding: 1rem 2rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.ds-header__nav {
  display: flex;
  align-items: center;
  gap: 0.25rem;
}
.ds-header__link {
  padding: 0.375rem 0.75rem;
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--c-secondary);
  text-decoration: none;
  border-radius: 0.25rem;
  transition: background 0.15s, color 0.15s;
}
.ds-header__link:hover {
  background: var(--c-surface);
  color: var(--c-on-surface);
}

/* ══════════════════════════════════════════════════
   BRAND
══════════════════════════════════════════════════ */
.ds-brand {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}
.ds-brand__mark {
  width: 2.25rem;
  height: 2.25rem;
  background: var(--c-primary-container);
  color: var(--c-on-primary-cnt);
  font-family: 'Newsreader', serif;
  font-weight: 700;
  font-size: 1.125rem;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 0.5rem;
  box-shadow: 0 1px 3px rgba(0,0,0,0.08);
}
.ds-brand__name {
  font-family: 'Newsreader', serif;
  font-weight: 700;
  font-size: 1.125rem;
  line-height: 1;
  color: var(--c-on-surface);
}
.ds-brand__sub {
  font-size: 0.5625rem;
  color: var(--c-secondary);
  text-transform: uppercase;
  letter-spacing: 0.18em;
  font-weight: 700;
  margin-top: 0.1rem;
}

/* ══════════════════════════════════════════════════
   HERO
══════════════════════════════════════════════════ */
.ds-hero {
  max-width: 64rem;
  margin: 0 auto;
  padding: 4rem 2rem 3rem;
}
.ds-hero__title {
  font-family: 'Newsreader', serif;
  font-size: clamp(2.5rem, 6vw, 3.75rem);
  font-weight: 800;
  line-height: 1.05;
  margin-bottom: 1.25rem;
}
.ds-hero__italic {
  font-style: italic;
  font-weight: 400;
  color: var(--c-primary);
}
.ds-hero__sub {
  font-size: 1rem;
  color: var(--c-secondary);
  max-width: 36rem;
  line-height: 1.65;
}

/* ══════════════════════════════════════════════════
   SECTION LABEL
══════════════════════════════════════════════════ */
.ds-section-label {
  font-family: 'Manrope', sans-serif;
  font-size: 0.625rem;
  font-weight: 700;
  letter-spacing: 0.22em;
  text-transform: uppercase;
  color: var(--c-outline);
  margin-bottom: 1.5rem;
  display: flex;
  align-items: center;
  gap: 0.75rem;
}
.ds-section-label::after {
  content: '';
  flex: 1;
  height: 1px;
  background: var(--c-outline-var);
  opacity: 0.5;
}

/* ══════════════════════════════════════════════════
   TYPOGRAPHY HELPERS
══════════════════════════════════════════════════ */
.ds-headline { font-family: 'Newsreader', serif; }
.ds-italic   { font-style: italic; }
.ds-font-bold { font-weight: 700; }
.ds-text-3xl  { font-size: 1.875rem; }
.ds-text-xl   { font-size: 1.25rem; }
.ds-text-sm   { font-size: 0.875rem; }
.ds-text-primary { color: var(--c-primary); }
.ds-text-muted   { color: var(--c-secondary); }

.ds-label {
  font-size: 0.625rem;
  font-weight: 700;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: var(--c-outline);
}
.ds-label--primary { color: var(--c-primary); }
.ds-label--muted   { color: var(--c-secondary); }
.ds-label--block   { display: block; }

/* ══════════════════════════════════════════════════
   CARDS
══════════════════════════════════════════════════ */
.ds-card {
  background: var(--c-surface-lowest);
  border-radius: 0.75rem;
  border: 1px solid rgba(208, 197, 175, 0.20);
  padding: 1.5rem;
  box-shadow: 0 1px 4px rgba(28, 27, 26, 0.05);
}

.ds-card--timeline-active {
  padding: 1rem;
  border-radius: 0.625rem;
  background: var(--c-surface-lowest);
  border: 1px solid rgba(115, 92, 0, 0.40);
  box-shadow: 0 1px 3px rgba(28, 27, 26, 0.06);
}

.ds-card--timeline-pending {
  padding: 1rem;
  border-radius: 0.625rem;
  background: rgba(247, 243, 240, 0.5);
  border: 1px dashed rgba(208, 197, 175, 0.5);
}

.ds-card--dark {
  position: relative;
  overflow: hidden;
  background: var(--c-inverse);
  border-radius: 1rem;
  padding: 1.5rem;
  box-shadow: 0 8px 32px rgba(28, 27, 26, 0.24);
}

.ds-card-dark__glow {
  position: absolute;
  right: -3rem;
  top: -3rem;
  width: 12rem;
  height: 12rem;
  background: var(--c-primary);
  opacity: 0.10;
  border-radius: 50%;
  filter: blur(40px);
}

/* ══════════════════════════════════════════════════
   GRIDS
══════════════════════════════════════════════════ */
.ds-grid-2 { display: grid; grid-template-columns: repeat(2, 1fr); gap: 1.5rem; }
.ds-grid-3 { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1.5rem; }

@media (max-width: 700px) {
  .ds-grid-2, .ds-grid-3 { grid-template-columns: 1fr; }
}

/* ══════════════════════════════════════════════════
   COLORS
══════════════════════════════════════════════════ */
.ds-color-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 0.75rem;
}
.ds-color-grid--6 {
  grid-template-columns: repeat(6, 1fr);
}
.ds-swatch {
  border-radius: 0.75rem;
  overflow: hidden;
  border: 1px solid rgba(208, 197, 175, 0.10);
}
.ds-swatch__color {
  width: 100%;
}
.ds-swatch__info {
  padding: 0.75rem;
  background: var(--c-surface-lowest);
}
.ds-swatch__name  { font-size: 0.625rem; font-weight: 700; color: var(--c-on-surface); }
.ds-swatch__hex   { font-size: 0.5625rem; color: var(--c-secondary); font-family: monospace; margin-top: 0.125rem; }
.ds-swatch__token { font-size: 0.5625rem; color: var(--c-secondary); margin-top: 0.125rem; }

/* ══════════════════════════════════════════════════
   BUTTONS — CUSTOM VARIANTS
══════════════════════════════════════════════════ */
.ds-row {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  align-items: center;
}

/* Golden — usa primary-container */
:deep(.p-button-golden) {
  background: var(--c-primary-container) !important;
  color: var(--c-on-primary-cnt) !important;
  border: none !important;
  border-radius: 0.75rem !important;
  font-weight: 700;
}
:deep(.p-button-golden:hover) {
  opacity: 0.88;
}

/* FAB primário */
:deep(.p-button-fab) {
  background: var(--c-primary) !important;
  color: var(--c-on-primary) !important;
  border: none !important;
  box-shadow: 0 4px 12px rgba(115, 92, 0, 0.30) !important;
  width: 3rem;
  height: 3rem;
}

/* FAB dourado */
:deep(.p-button-fab-golden) {
  background: var(--c-primary-container) !important;
  color: var(--c-on-primary-cnt) !important;
  border: none !important;
  box-shadow: 0 4px 12px rgba(212, 175, 55, 0.35) !important;
  width: 3rem;
  height: 3rem;
}

/* ══════════════════════════════════════════════════
   FIELDS
══════════════════════════════════════════════════ */
.ds-field {
  display: flex;
  flex-direction: column;
  gap: 0.375rem;
}
.ds-field__label {
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--c-on-surface-var);
  font-family: 'Manrope', sans-serif;
}
.ds-field__label--error    { color: var(--c-error); }
.ds-field__label--disabled { color: rgba(95, 94, 92, 0.5); }

.ds-field__hint {
  font-size: 0.625rem;
  color: var(--c-secondary);
  display: flex;
  align-items: center;
  gap: 0.25rem;
}
.ds-field__hint--primary  { color: var(--c-primary); font-weight: 600; }
.ds-field__hint--error    { color: var(--c-error); font-weight: 600; }
.ds-field__hint--disabled { color: rgba(95, 94, 92, 0.5); }

.ds-search-pill :deep(input),
.ds-search-pill {
  border-radius: 9999px !important;
  border: none !important;
  background: var(--c-surface-low) !important;
}

.w-full { width: 100%; }

.ds-check-row {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  cursor: pointer;
}
.ds-check-label           { font-size: 0.875rem; color: var(--c-on-surface); cursor: pointer; }
.ds-check-label--off      { color: var(--c-secondary); }
.ds-check-label--disabled { opacity: 0.40; cursor: not-allowed; }

.ds-toggle-row   { display: flex; align-items: center; justify-content: space-between; }
.ds-toggle-label { font-size: 0.875rem; color: var(--c-on-surface); }
.ds-toggle-label--off { color: var(--c-secondary); }

/* ══════════════════════════════════════════════════
   TYPE SCALE
══════════════════════════════════════════════════ */
.ds-type-scale { display: flex; flex-direction: column; gap: 1.5rem; }
.ds-type-row {
  padding-bottom: 1.5rem;
  border-bottom: 1px solid rgba(208, 197, 175, 0.10);
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

/* ══════════════════════════════════════════════════
   TIMELINE
══════════════════════════════════════════════════ */
.ds-timeline-item {
  position: relative;
  padding-left: 2rem;
}
.ds-timeline-dot {
  position: absolute;
  left: 0;
  top: 0.375rem;
  width: 1rem;
  height: 1rem;
  border-radius: 50%;
  border: 2px solid var(--c-outline-var);
  background: var(--c-bg);
  z-index: 1;
}
.ds-timeline-dot--active { border-color: var(--c-primary); }
.ds-timeline-line {
  position: absolute;
  left: 0.4375rem;
  top: 0;
  bottom: 0;
  width: 1px;
  background: rgba(208, 197, 175, 0.30);
}

/* ══════════════════════════════════════════════════
   STATS & ANATOMY
══════════════════════════════════════════════════ */
.ds-stat-mini {
  background: var(--c-surface-lowest);
  border-radius: 0.75rem;
  padding: 0.75rem;
}

.ds-anatomy-card {
  padding: 1.25rem;
  margin-bottom: 0.5rem;
  text-align: center;
}
.ds-anatomy-card--base {
  background: var(--c-surface-lowest);
  border-radius: 0.625rem;
  border: 1px solid rgba(208, 197, 175, 0.10);
  box-shadow: 0 1px 3px rgba(28, 27, 26, 0.06);
}
.ds-anatomy-card--elevated {
  background: var(--c-surface-lowest);
  border-radius: 0.75rem;
  border: 1px solid rgba(208, 197, 175, 0.20);
  box-shadow: 0 4px 12px rgba(28, 27, 26, 0.10);
}
.ds-anatomy-card--section {
  background: var(--c-surface-low);
  border-radius: 1rem;
  border: 1px solid rgba(208, 197, 175, 0.10);
}

/* ══════════════════════════════════════════════════
   CALENDAR CHIP
══════════════════════════════════════════════════ */
.ds-cal-day {
  padding: 0.5rem;
  border-radius: 0.5rem;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}
.ds-cal-day--today { background: rgba(115, 92, 0, 0.05); }
.ds-cal-day__num   { font-size: 0.625rem; font-weight: 700; color: var(--c-on-surface); }
.ds-cal-event {
  padding: 0.125rem 0.25rem;
  font-size: 0.5625rem;
  font-weight: 700;
  border-radius: 0.25rem;
  text-align: center;
}
.ds-cal-event--primary   { background: var(--c-primary-container); color: var(--c-on-primary-cnt); }
.ds-cal-event--secondary { background: #e5e2de; color: #656461; border: 1px solid rgba(208, 197, 175, 0.20); }

/* ══════════════════════════════════════════════════
   PROFILE CHIP
══════════════════════════════════════════════════ */
.ds-profile-chip {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem;
  background: var(--c-surface-lowest);
  border-radius: 0.75rem;
  border: 1px solid rgba(208, 197, 175, 0.10);
  box-shadow: 0 1px 3px rgba(28, 27, 26, 0.06);
  width: fit-content;
}

/* ══════════════════════════════════════════════════
   BADGE DEMO
══════════════════════════════════════════════════ */
.ds-badge-demo {
  position: relative;
  display: inline-flex;
  align-items: flex-start;
}
.ds-badge-demo :deep(.p-badge) {
  position: absolute;
  top: -0.5rem;
  right: -0.5rem;
  min-width: 1.125rem;
  height: 1.125rem;
  font-size: 0.5rem;
}

/* ══════════════════════════════════════════════════
   ICON BOX (used in dark card & tokens)
══════════════════════════════════════════════════ */
.ds-icon-box {
  width: 2.5rem;
  height: 2.5rem;
  background: var(--c-primary-container);
  border-radius: 0.75rem;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

/* ══════════════════════════════════════════════════
   SIDEBAR / PANELMENU
══════════════════════════════════════════════════ */
:deep(.ds-sidebar-menu) {
  background: var(--c-surface-low);
  border: 1px solid rgba(208, 197, 175, 0.15);
  border-radius: 0.75rem;
  padding: 1.25rem;
}
:deep(.ds-sidebar-menu .p-panelmenu-header) {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 1.5rem;
}
:deep(.ds-sidebar-menu .p-panelmenu-header-content) {
  background: transparent !important;
  border: none !important;
  padding: 0 !important;
  font-family: 'Newsreader', serif;
  font-weight: 700;
  font-size: 1rem;
  color: var(--c-on-surface);
  pointer-events: none;
}
:deep(.ds-sidebar-menu .p-panelmenu-content) {
  background: transparent;
  border: none;
  padding: 0;
}
:deep(.ds-sidebar-menu .p-menuitem-link) {
  border-radius: 0.5rem !important;
  padding: 0.625rem 1rem !important;
  gap: 0.75rem;
  font-family: 'Newsreader', serif;
  font-size: 0.875rem;
  color: var(--c-secondary);
  transition: background 0.15s, color 0.15s;
}
:deep(.ds-sidebar-menu .p-menuitem-link:hover) {
  background: var(--c-bg) !important;
  color: var(--c-on-surface) !important;
}
/* Active item (Planejamento) */
:deep(.ds-sidebar-menu .ds-nav-active .p-menuitem-link) {
  background: var(--c-primary-container) !important;
  color: var(--c-on-primary-cnt) !important;
  font-style: italic;
}

/* ══════════════════════════════════════════════════
   BOTTOM NAV
══════════════════════════════════════════════════ */
.ds-bottom-nav {
  background: var(--c-bg);
  border-radius: 0.75rem;
  border: 1px solid rgba(208, 197, 175, 0.15);
  overflow: hidden;
}
.ds-bottom-nav__inner {
  display: flex;
  justify-content: space-around;
  align-items: center;
  padding: 1rem;
  border-bottom: 1px solid rgba(208, 197, 175, 0.10);
}
.ds-bottom-nav__item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.25rem;
  font-size: 0.625rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: var(--c-secondary);
  background: none;
  border: none;
  cursor: pointer;
  transition: color 0.15s;
  padding: 0;
}
.ds-bottom-nav__item--active {
  color: var(--c-primary);
}
.ds-bottom-nav__fab {
  margin-top: -2rem;
}
.ds-bottom-nav__hint {
  padding: 0.75rem;
}

/* ══════════════════════════════════════════════════
   HEADER SAMPLE
══════════════════════════════════════════════════ */
.ds-header-sample {
  background: var(--c-bg);
  border-radius: 0.75rem;
  border: 1px solid rgba(208, 197, 175, 0.15);
  box-shadow: 0 4px 20px rgba(28, 27, 26, 0.05);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.75rem 1.25rem;
}

/* ══════════════════════════════════════════════════
   TOASTS (preview estáticos)
══════════════════════════════════════════════════ */
.ds-toast-preview {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  padding: 0.75rem 1rem;
  background: var(--c-surface-lowest);
  border-radius: 0.75rem;
  border: 1px solid;
  box-shadow: 0 4px 20px rgba(28, 27, 26, 0.10);
  animation: dsSlideIn 0.35s cubic-bezier(0.22, 1, 0.36, 1) both;
}
.ds-toast-preview--success { border-color: rgba(46, 125, 50, 0.20); }
.ds-toast-preview--error   { border-color: rgba(186, 26, 26, 0.20); }
.ds-toast-preview--warn    { border-color: rgba(230, 81, 0, 0.20); }
.ds-toast-preview--info    { border-color: rgba(115, 92, 0, 0.20); }

.ds-toast-preview__icon {
  width: 2rem;
  height: 2rem;
  border-radius: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  margin-top: 0.125rem;
}
.ds-toast-preview__body { flex: 1; min-width: 0; }
.ds-toast-preview__title {
  font-size: 0.875rem;
  font-weight: 700;
  color: var(--c-on-surface);
}
.ds-toast-preview__sub {
  font-size: 0.75rem;
  color: var(--c-secondary);
  margin-top: 0.125rem;
}
.ds-toast-preview__close {
  color: var(--c-secondary);
  background: none;
  border: none;
  cursor: pointer;
  padding: 0.125rem;
  transition: color 0.15s;
}
.ds-toast-preview__close:hover { color: var(--c-on-surface); }

@keyframes dsSlideIn {
  from { transform: translateX(20px); opacity: 0; }
  to   { transform: translateX(0);    opacity: 1; }
}

/* ══════════════════════════════════════════════════
   EMPTY / LOADING STATES
══════════════════════════════════════════════════ */
.ds-empty-state {
  padding: 2rem;
  background: var(--c-surface-lowest);
  border-radius: 0.75rem;
  border: 1px dashed rgba(208, 197, 175, 0.15);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  text-align: center;
}

.ds-loading-state {
  padding: 2rem;
  background: var(--c-surface-lowest);
  border-radius: 0.75rem;
  border: 1px solid rgba(208, 197, 175, 0.15);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1rem;
}

.ds-bounce-dot {
  width: 0.5rem;
  height: 0.5rem;
  background: var(--c-primary);
  border-radius: 50%;
  animation: dsBounce 0.8s ease-in-out infinite alternate;
}
@keyframes dsBounce {
  from { transform: translateY(0); }
  to   { transform: translateY(-6px); }
}

/* ══════════════════════════════════════════════════
   DATATABLE
══════════════════════════════════════════════════ */
:deep(.ds-table) {
  border-radius: 0.75rem;
  overflow: hidden;
  border: 1px solid rgba(208, 197, 175, 0.20);
}
:deep(.ds-table .p-datatable-thead > tr > th) {
  font-family: 'Manrope', sans-serif;
  font-size: 0.6875rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

/* ══════════════════════════════════════════════════
   TOKENS CARD
══════════════════════════════════════════════════ */
.ds-tokens-card {
  background: var(--c-inverse);
  border-radius: 1rem;
  border: 1px solid rgba(208, 197, 175, 0.10);
  padding: 1.5rem;
  color: #fdf9f6;
}
.ds-tokens-section-title {
  font-family: 'Manrope', sans-serif;
  font-size: 0.5625rem;
  font-weight: 700;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: var(--c-primary-container);
  margin-bottom: 0.25rem;
}
.ds-tokens-row {
  display: flex;
  justify-content: space-between;
  gap: 0.5rem;
  color: #e5e2df;
}
.ds-tokens-val { color: #ffe088; }

/* ══════════════════════════════════════════════════
   FOOTER
══════════════════════════════════════════════════ */
.ds-footer {
  border-top: 1px solid rgba(208, 197, 175, 0.20);
  margin-top: 1rem;
}
.ds-footer__inner {
  max-width: 64rem;
  margin: 0 auto;
  padding: 2rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.ds-code {
  font-family: monospace;
  background: var(--c-surface);
  padding: 0.125rem 0.5rem;
  border-radius: 0.25rem;
  font-size: 0.75rem;
}

/* ══════════════════════════════════════════════════
   MISC
══════════════════════════════════════════════════ */
.mt-1 { margin-top: 0.25rem; }
.mt-2 { margin-top: 0.5rem; }
.mt-3 { margin-top: 0.75rem; }
.mt-4 { margin-top: 1rem; }
.mt-8 { margin-top: 2rem; }
.mb-1 { margin-bottom: 0.25rem; }
.mb-2 { margin-bottom: 0.5rem; }
.mb-3 { margin-bottom: 0.75rem; }
.mb-4 { margin-bottom: 1rem; }
.mb-5 { margin-bottom: 1.25rem; }
.mb-8 { margin-bottom: 2rem; }
.mb-10 { margin-bottom: 2.5rem; }
</style>