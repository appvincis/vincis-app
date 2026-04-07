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
    class="flex items-center gap-3 cursor-pointer group"
    :class="disabled && 'opacity-40 cursor-not-allowed'"
  >
    <!-- Custom checkbox box -->
    <div
      class="w-5 h-5 rounded flex items-center justify-center flex-shrink-0 transition-colors"
      :class="
        modelValue
          ? 'bg-primary'
          : 'border-2 border-outline-variant group-hover:border-primary'
      "
      @click="!disabled && $emit('update:modelValue', !modelValue)"
    >
      <span
        v-if="modelValue"
        class="material-symbols-outlined text-on-primary"
        style="font-size: 14px;"
      >check</span>
    </div>

    <!-- Hidden native input for a11y -->
    <input
      type="checkbox"
      class="sr-only"
      :checked="modelValue"
      :disabled="disabled"
      @change="$emit('update:modelValue', ($event.target as HTMLInputElement).checked)"
    />

    <!-- Label text -->
    <span
      class="text-sm font-body"
      :class="modelValue ? 'text-on-surface' : 'text-secondary'"
    >
      {{ label }}
      <slot />
    </span>
  </label>
</template>