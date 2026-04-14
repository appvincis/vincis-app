<script setup>
import Checkbox from 'primevue/checkbox'

defineProps({
  modelValue: { type: Boolean, default: false },
  binary: { type: Boolean, default: true }
})
defineEmits(['update:modelValue'])
</script>

<template>
  <Checkbox 
    :modelValue="modelValue"
    @update:modelValue="$emit('update:modelValue', $event)"
    :binary="binary"
    v-bind="$attrs"
  />
</template>