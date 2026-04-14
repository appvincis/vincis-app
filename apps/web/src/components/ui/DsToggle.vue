<script setup>
import ToggleSwitch from 'primevue/toggleswitch'

defineProps({
  modelValue: { type: Boolean, default: false }
})
defineEmits(['update:modelValue'])
</script>

<template>
  <ToggleSwitch 
    :modelValue="modelValue"
    @update:modelValue="$emit('update:modelValue', $event)"
    v-bind="$attrs"
  />
</template>