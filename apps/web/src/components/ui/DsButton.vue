<script setup>
import { computed } from 'vue'
import Button from 'primevue/button'

const props = defineProps({
  variant: {
    type: String,
    default: 'primary'
  },
  severity: {
    type: String,
    default: null
  }
})

// Mapeia variant para severity do PrimeVue
const buttonSeverity = computed(() => {
  if (props.severity) return props.severity
  
  const map = {
    'primary': 'primary',
    'secondary': 'secondary',
    'error': 'danger',
    'success': 'success',
    'warning': 'warn'
  }
  
  return map[props.variant] || props.variant
})
</script>

<template>
  <Button 
    :severity="buttonSeverity"
    v-bind="$attrs"
  >
    <slot />
  </Button>
</template>