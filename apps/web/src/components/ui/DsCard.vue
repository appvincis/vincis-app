<!-- components/ui/DsCard.vue -->
<script setup>
defineProps({
  variant: {
    type: String,
    default: 'base'
  }
})
</script>

<template>
  <div 
    class="ds-card"
    :class="`ds-card--${variant}`"
  >
    <slot />
  </div>
</template>

<style scoped>
.ds-card {
  background: var(--surface-container-lowest, #ffffff);
  border-radius: 0.75rem;
  padding: 1.5rem;
}

.ds-card--base {
  border: 1px solid rgba(208, 197, 175, 0.1);
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}

.ds-card--elevated {
  border: 1px solid rgba(208, 197, 175, 0.2);
  box-shadow: 0 4px 12px rgba(28, 27, 26, 0.08);
}
</style>