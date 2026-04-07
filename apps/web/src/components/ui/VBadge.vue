<script setup lang="ts">
defineProps<{
  variant?: 'primary' | 'secondary' | 'success' | 'error' | 'warning' | 'info' | 'plain';
  shape?: 'rounded' | 'pill' | 'square';
}>();
</script>

<template>
  <span
    class="inline-flex items-center px-2.5 py-0.5 text-[9px] font-bold"
    :class="[
      // Shape
      shape === 'square'  ? 'rounded uppercase'          :
      shape === 'rounded' ? 'rounded-[10px] shadow-sm'   :
      'rounded-full',

      // Variant colors
      variant === 'primary'   ? 'bg-primary-container text-on-primary-container shadow-sm'          :
      variant === 'secondary' ? 'bg-secondary-container text-on-secondary-container border border-outline-variant/20' :
      variant === 'success'   ? 'bg-success-container text-success'                                 :
      variant === 'error'     ? 'bg-error-container text-on-error-container'                        :
      variant === 'warning'   ? 'bg-warning-container text-warning'                                 :
      variant === 'plain'     ? 'bg-surface-container-low text-on-surface'                          :
      /* default / info */      'bg-primary-container text-on-primary-container shadow-sm',
    ]"
  >
    <slot />
  </span>
</template>