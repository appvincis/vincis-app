<script setup lang="ts">
defineProps<{
  modelValue?: string;
  label?: string;
  options: { value: string; label: string }[];
  placeholder?: string;
  disabled?: boolean;
  error?: string;
  hint?: string;
}>();

defineEmits<{
  (e: 'update:modelValue', value: string): void;
}>();
</script>

<template>
  <div class="flex flex-col gap-1.5 w-full">
    <label
      v-if="label"
      class="block text-xs font-label font-semibold"
      :class="error ? 'text-error' : 'text-on-surface-variant'"
    >
      {{ label }}
    </label>

    <div class="relative">
      <select
        :value="modelValue"
        :disabled="disabled"
        @change="$emit('update:modelValue', ($event.target as HTMLSelectElement).value)"
        class="w-full appearance-none bg-surface-container-low border rounded-lg py-2.5 pl-4 pr-10 text-sm font-body transition-all"
        :class="[
          error
            ? 'border-2 border-error bg-error-container/30 text-error'
            : 'border-outline-variant/40 focus:ring-2 focus:ring-primary/50 focus:border-primary',
          disabled && 'bg-surface-container-high/60 border-outline-variant/20 text-secondary/60 cursor-not-allowed',
        ]"
      >
        <option v-if="placeholder" value="" disabled selected>{{ placeholder }}</option>
        <option
          v-for="opt in options"
          :key="opt.value"
          :value="opt.value"
        >{{ opt.label }}</option>
      </select>
      <span class="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-secondary text-lg pointer-events-none">
        expand_more
      </span>
    </div>

    <p v-if="error" class="text-[10px] text-error font-semibold flex items-center gap-1">
      <span class="material-symbols-outlined" style="font-size: 11px;">error</span>
      {{ error }}
    </p>
    <p v-else-if="hint" class="text-[10px] text-secondary">{{ hint }}</p>
  </div>
</template>