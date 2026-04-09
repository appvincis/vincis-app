<template>
  <button :class="['ds-btn', isFab ? 'ds-btn--fab' : `ds-btn--${variant}`]">
    <i v-if="icon" :class="icon"></i>
    <slot />
  </button>
</template>

<script setup>
defineProps({
  variant: { type: String, default: 'primary' },
  icon: String,
  isFab: Boolean
})
</script>