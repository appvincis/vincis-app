<script setup>
defineProps({
  items: {
    type: Array,
    default: () => []
  },
  activeItem: {
    type: String,
    default: ''
  }
})

defineEmits(['update:activeItem'])
</script>

<template>
  <div class="ds-sidebar">
    <!-- Header do Sidebar -->
    <div class="ds-sidebar__header">
      <div class="ds-sidebar__logo">
        <span class="ds-sidebar__logo-text">V</span>
      </div>
      <div>
        <p class="ds-sidebar__title">Vincis</p>
        <p class="ds-sidebar__subtitle">Academic Portal</p>
      </div>
    </div>
    
    <!-- Itens de navegação -->
    <div class="ds-sidebar__nav">
      <button
        v-for="item in items"
        :key="item.id"
        class="ds-sidebar__item"
        :class="{ 'ds-sidebar__item--active': activeItem === item.id }"
        @click="$emit('update:activeItem', item.id)"
      >
        <span 
          class="material-symbols-outlined"
          :class="{ 'ds-sidebar__icon--active': activeItem === item.id }"
        >{{ item.icon }}</span>
        <span class="ds-sidebar__item-label">{{ item.label }}</span>
      </button>
    </div>
  </div>
</template>

<style scoped>
.ds-sidebar {
  width: 16rem;
  background: var(--surface-container-low, #f7f3f0);
  border-radius: 0.75rem;
  padding: 1.25rem;
  border: 1px solid rgba(208, 197, 175, 0.15);
}

/* Header */
.ds-sidebar__header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 1.5rem;
}

.ds-sidebar__logo {
  width: 2.25rem;
  height: 2.25rem;
  background: var(--primary-container, #d4af37);
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 0.5rem;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}

.ds-sidebar__logo-text {
  color: var(--on-primary-container, #554300);
  font-family: 'Newsreader', serif;
  font-weight: bold;
  font-size: 1.125rem;
}

.ds-sidebar__title {
  font-family: 'Newsreader', serif;
  font-weight: bold;
  font-size: 1rem;
  line-height: 1.2;
  color: var(--on-surface, #1c1b1a);
}

.ds-sidebar__subtitle {
  font-size: 0.5625rem;
  font-weight: 700;
  letter-spacing: 0.22em;
  text-transform: uppercase;
  color: var(--secondary, #5f5e5c);
}

/* Navegação */
.ds-sidebar__nav {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.ds-sidebar__item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.625rem 1rem;
  width: 100%;
  border-radius: 0.5rem;
  background: transparent;
  border: none;
  cursor: pointer;
  font-family: 'Newsreader', serif;
  font-size: 0.875rem;
  color: var(--secondary, #5f5e5c);
  transition: all 0.2s ease;
  text-align: left;
}

.ds-sidebar__item:hover {
  background: var(--surface-bright, #fdf9f6);
}

/* Item ativo - igual à referência */
.ds-sidebar__item--active {
  background: var(--primary-container, #d4af37);
  color: var(--on-surface, #1c1b1a);
  font-style: italic;
}

/* Ícones */
.material-symbols-outlined {
  font-size: 1.25rem;
  font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
}

.ds-sidebar__icon--active {
  font-variation-settings: 'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24;
}

.ds-sidebar__item-label {
  font-size: 0.875rem;
}
</style>