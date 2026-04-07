<script setup lang="ts">
defineProps<{
  modelValue?: boolean;
  label?: string;
  disabled?: boolean;
}>();

defineEmits<{
  (e: 'update:modelValue', value: boolean): void;
}>();
</script>

<template>
  <label
    class="flex items-center justify-between cursor-pointer gap-4"
    :class="disabled && 'opacity-40 cursor-not-allowed'"
  >
    <span class="text-sm font-body" :class="modelValue ? 'text-on-surface' : 'text-secondary'">
      {{ label }}
      <slot />
    </span>

    <div
      class="relative w-10 h-5 rounded-full transition-colors"
      :class="modelValue ? 'bg-primary' : 'bg-outline-variant/40'"
      @click="!disabled && $emit('update:modelValue', !modelValue)"
    >
      <div
        class="absolute top-0.5 w-4 h-4 bg-white rounded-full shadow-sm transition-all"
        :class="modelValue ? 'right-0.5' : 'left-0.5'"
      />
    </div>

    <!-- Hidden native input for a11y -->
    <input
      type="checkbox"
      class="sr-only"
      :checked="modelValue"
      :disabled="disabled"
      @change="$emit('update:modelValue', ($event.target as HTMLInputElement).checked)"
    />
  </label>
</template>