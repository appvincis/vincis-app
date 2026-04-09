<template>
  <div :class="['ds-card', `ds-card--${variant}`]">
    <slot />
  </div>
</template>

<script setup>
defineProps({
  variant: { type: String, default: 'base' } // 'base', 'elevated', 'dark'
})
</script>