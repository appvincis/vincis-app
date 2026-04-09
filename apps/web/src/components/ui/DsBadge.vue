<template>
  <span :class="['ds-badge', `ds-badge--${variant}`]">
    <slot />
  </span>
</template>

<script setup>
defineProps({
  variant: { type: String, default: 'primary' }
})
</script>