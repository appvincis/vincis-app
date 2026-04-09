<template>
  <div :class="['ds-card', variant]">
    <slot name="header"></slot>
    <div class="ds-card-content">
      <slot></slot>
    </div>
  </div>
</template>

<script setup>
defineProps({
  variant: { type: String, default: 'base' } // 'base', 'elevated', 'dark'
});
</script>

<style scoped>
.ds-card {
  border-radius: 1.5rem;
  padding: 1.5rem;
  transition: all 0.3s ease;
}
.ds-card.base { background: rgba(253, 249, 246, 0.03); border: 1px solid rgba(208, 197, 175, 0.15); }
.ds-card.elevated { background: #252420; box-shadow: 0 8px 32px rgba(0,0,0,0.4); }
</style>