<script setup lang="ts">
defineProps<{
  variant?: 'base' | 'elevated' | 'section' | 'ai-dark' | 'timeline-active' | 'timeline-pending';
  padding?: boolean;
}>();
</script>

<template>
  <!-- AI Dark card -->
  <div
    v-if="variant === 'ai-dark'"
    class="relative overflow-hidden bg-on-surface rounded-2xl shadow-xl"
    :class="padding !== false && 'p-6'"
  >
    <!-- Glow effect -->
    <div class="absolute -right-12 -top-12 w-48 h-48 bg-primary opacity-10 rounded-full blur-3xl pointer-events-none" />
    <div class="relative z-10">
      <slot />
    </div>
  </div>

  <!-- Timeline active -->
  <div
    v-else-if="variant === 'timeline-active'"
    class="relative pl-8"
  >
    <div class="absolute left-0 top-1.5 w-4 h-4 rounded-full border-2 border-primary bg-background z-10" />
    <div class="absolute left-[7px] top-0 bottom-0 w-0.5 bg-outline-variant/30" />
    <div class="p-4 bg-surface-container-lowest rounded-[10px] border border-primary/40 shadow-sm">
      <slot />
    </div>
  </div>

  <!-- Timeline pending -->
  <div
    v-else-if="variant === 'timeline-pending'"
    class="relative pl-8"
  >
    <div class="absolute left-0 top-1.5 w-4 h-4 rounded-full border-2 border-outline-variant bg-background z-10" />
    <div class="absolute left-[7px] top-0 bottom-0 w-0.5 bg-outline-variant/30" />
    <div class="p-4 bg-surface-container-low/50 rounded-[10px] border border-dashed border-outline-variant/50">
      <slot />
    </div>
  </div>

  <!-- Section card -->
  <div
    v-else-if="variant === 'section'"
    class="bg-surface-container-low rounded-2xl border border-outline-variant/10"
    :class="padding !== false && 'p-6'"
  >
    <slot />
  </div>

  <!-- Elevated card -->
  <div
    v-else-if="variant === 'elevated'"
    class="bg-surface-container-lowest rounded-xl border border-outline-variant/20 shadow-md"
    :class="padding !== false && 'p-6'"
  >
    <slot />
  </div>

  <!-- Base card (default) -->
  <div
    v-else
    class="bg-surface-container-lowest rounded-[10px] border border-outline-variant/10 shadow-sm"
    :class="padding !== false && 'p-4'"
  >
    <slot />
  </div>
</template>