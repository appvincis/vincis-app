<script setup>
import Select from 'primevue/select'

defineProps({
  modelValue: { type: [String, Object], default: null },
  options: { type: Array, default: () => [] },
  optionLabel: { type: String, default: 'label' },
  optionValue: { type: String, default: 'value' },
  placeholder: { type: String, default: 'Selecione...' }
})
defineEmits(['update:modelValue'])
</script>

<template>
  <Select 
    :modelValue="modelValue"
    @update:modelValue="$emit('update:modelValue', $event)"
    :options="options"
    :optionLabel="optionLabel"
    :optionValue="optionValue"
    :placeholder="placeholder"
    v-bind="$attrs"
  />
</template>