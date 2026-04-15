<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps({
  severity: {
    type: String,
    default: null
  },
  variant: {
    type: String,
    default: 'info'
  },
  title: {
    type: String,
    default: ''
  },
  message: {
    type: String,
    default: ''
  },
  dismissible: {
    type: Boolean,
    default: false
  }
})

const alertSeverity = computed(() => {
  return props.severity || props.variant
})

defineEmits(['close'])

const icons: Record<string, string> = {
  success: 'check_circle',
  error: 'error',
  warning: 'warning',
  info: 'info'
}
</script>

<template>
  <div 
    class="ds-alert" 
    :class="`ds-alert--${alertSeverity}`"
  >
    <div class="ds-alert__icon">
      <span class="material-symbols-outlined">{{ icons[alertSeverity] || 'info' }}</span>
    </div>
    <div class="ds-alert__content">
      <p v-if="title" class="ds-alert__title">{{ title }}</p>
      <p v-if="message" class="ds-alert__message">{{ message }}</p>
    </div>
    <button 
      v-if="dismissible" 
      class="ds-alert__close"
      @click="$emit('close')"
    >
      <span class="material-symbols-outlined">close</span>
    </button>
  </div>
</template>

<style scoped>
.ds-alert {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  padding: 0.75rem 1rem;
  background: var(--surface-container-lowest);
  border-radius: 0.75rem;
  border: 1px solid transparent;
  transition: all 0.2s ease;
}

.ds-alert__icon {
  width: 2rem;
  height: 2rem;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  border-radius: 0.5rem;
}

.ds-alert__icon .material-symbols-outlined {
  font-size: 1.25rem;
  font-variation-settings: 'FILL' 1;
}

.ds-alert__content {
  flex: 1;
  padding-top: 0.25rem;
}

.ds-alert__title {
  font-weight: 700;
  font-size: 0.875rem;
  margin-bottom: 0.125rem;
  color: var(--on-surface);
}

.ds-alert__message {
  font-size: 0.75rem;
  color: var(--secondary);
  line-height: 1.4;
}

.ds-alert__close {
  background: none;
  border: none;
  color: var(--secondary);
  cursor: pointer;
  padding: 0.25rem;
  border-radius: 0.375rem;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.2s;
}

.ds-alert__close:hover {
  background: var(--surface-container-high);
  color: var(--on-surface);
}

/* Severities */
.ds-alert--success {
  border-color: rgba(46, 125, 50, 0.2);
}
.ds-alert--success .ds-alert__icon {
  background: #E8F5E9;
  color: #2E7D32;
}

.ds-alert--error {
  border-color: rgba(186, 26, 26, 0.2);
}
.ds-alert--error .ds-alert__icon {
  background: #FEEBEE;
  color: #BA1A1A;
}

.ds-alert--warning {
  border-color: rgba(230, 81, 0, 0.2);
}
.ds-alert--warning .ds-alert__icon {
  background: #FFF3E0;
  color: #E65100;
}

.ds-alert--info {
  border-color: rgba(115, 92, 0, 0.2);
}
.ds-alert--info .ds-alert__icon {
  background: var(--primary-fixed);
  color: var(--primary);
}
</style>
