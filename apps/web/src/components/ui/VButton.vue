<script setup lang="ts">
defineProps<{
  variant?: 'primary' | 'primary-container' | 'secondary' | 'ghost' | 'error' | 'error-outline';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  icon?: string;
  iconPosition?: 'left' | 'right';
}>();
</script>

<template>
  <button
    :disabled="disabled || loading"
    :class="[
      // Base
      'inline-flex items-center justify-center gap-2 font-label font-bold text-sm rounded-lg transition-all select-none',
      // Size
      size === 'sm' ? 'px-4 py-1.5 text-xs' : size === 'lg' ? 'px-8 py-3 text-base' : 'px-6 py-2.5',
      // Variant: primary (dark)
      (!variant || variant === 'primary') && 'bg-primary text-on-primary shadow-sm hover:opacity-90 active:scale-95',
      // Variant: primary-container (golden)
      variant === 'primary-container' && 'bg-primary-container text-on-primary-container rounded-xl shadow-sm hover:opacity-90 active:scale-95',
      // Variant: secondary (outlined)
      variant === 'secondary' && 'bg-surface-container-highest text-on-surface border border-outline-variant/40 shadow-sm hover:bg-surface-container-high',
      // Variant: ghost
      variant === 'ghost' && 'text-primary hover:bg-primary/5',
      // Variant: error (filled)
      variant === 'error' && 'bg-error text-on-error hover:opacity-90 active:scale-95',
      // Variant: error-outline
      variant === 'error-outline' && 'bg-error-container text-on-error-container border border-error/20 hover:bg-error/10',
      // Disabled state
      (disabled || loading) && 'opacity-40 cursor-not-allowed pointer-events-none',
      loading && 'cursor-wait',
    ]"
  >
    <!-- Left icon slot or prop -->
    <span
      v-if="icon && iconPosition !== 'right'"
      class="material-symbols-outlined text-lg leading-none"
    >{{ icon }}</span>
    <slot name="icon-left" />

    <!-- Spinner (loading) -->
    <span v-if="loading" class="vincis-spinner" />

    <!-- Label -->
    <slot />

    <!-- Right icon -->
    <span
      v-if="icon && iconPosition === 'right'"
      class="material-symbols-outlined text-lg leading-none"
    >{{ icon }}</span>
    <slot name="icon-right" />
  </button>
</template>