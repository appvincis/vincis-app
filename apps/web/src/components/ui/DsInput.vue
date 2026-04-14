<!-- components/ui/DsInput.vue -->
<script setup>
import InputText from 'primevue/inputtext'

// Define o modelValue para suporte ao v-model
defineProps({
  modelValue: {
    type: [String, Number],
    default: ''
  }
})

defineEmits(['update:modelValue'])
</script>

<template>
  <InputText 
    :modelValue="modelValue"
    @update:modelValue="$emit('update:modelValue', $event)"
    v-bind="$attrs"
  />
</template>