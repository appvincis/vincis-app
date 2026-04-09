<template>
  <div class="ds-input-group">
    <label v-if="label" class="ds-label">{{ label }}</label>
    <input 
      v-bind="$attrs" 
      :value="modelValue" 
      @input="$emit('update:modelValue', $event.target.value)"
      class="ds-input"
    />
  </div>
</template>

<script setup>
defineProps(['label', 'modelValue'])
defineEmits(['update:modelValue'])
</script>