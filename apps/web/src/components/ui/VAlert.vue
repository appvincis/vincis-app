<script setup lang="ts">
defineProps<{
  variant?: 'success' | 'error' | 'warning' | 'info';
  title?: string;
  message?: string;
  dismissible?: boolean;
}>();

defineEmits<{
  (e: 'dismiss'): void;
}>();

const iconMap = {
  success: 'check_circle',
  error:   'error',
  warning: 'warning',
  info:    'info',
} as const;
</script>

<template>
  <div
    class="flex items-start gap-3 px-4 py-3 bg-surface-container-lowest rounded-xl shadow-lg vincis-toast"
    :class="{
      'border border-success/20': !variant || variant === 'success',
      'border border-error/20':   variant === 'error',
      'border border-warning/20': variant === 'warning',
      'border border-primary/20': variant === 'info',
    }"
  >
    <!-- Icon -->
    <div
      class="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5"
      :class="{
        'bg-success-container': !variant || variant === 'success',
        'bg-error-container':   variant === 'error',
        'bg-warning-container': variant === 'warning',
        'bg-primary-fixed':     variant === 'info',
      }"
    >
      <span
        class="material-symbols-outlined"
        style="font-size: 18px; font-variation-settings: 'FILL' 1;"
        :class="{
          'text-success': !variant || variant === 'success',
          'text-error':   variant === 'error',
          'text-warning': variant === 'warning',
          'text-primary': variant === 'info',
        }"
      >{{ iconMap[variant ?? 'success'] }}</span>
    </div>

    <!-- Content -->
    <div class="flex-1 min-w-0">
      <p v-if="title" class="text-sm font-bold text-on-surface">{{ title }}</p>
      <p v-if="message" class="text-xs text-secondary mt-0.5">{{ message }}</p>
      <slot />
    </div>

    <!-- Dismiss button -->
    <button
      v-if="dismissible"
      class="text-secondary hover:text-on-surface ml-1 transition-colors"
      @click="$emit('dismiss')"
    >
      <span class="material-symbols-outlined text-lg">close</span>
    </button>
  </div>
</template>