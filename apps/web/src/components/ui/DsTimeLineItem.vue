<script setup>
defineProps({
  title: { type: String, default: '' },
  subtitle: { type: String, default: '' },
  time: { type: String, default: '' },
  active: { type: Boolean, default: false },
  pending: { type: Boolean, default: false }
})
</script>

<template>
  <div class="relative pl-8">
    <div 
      class="absolute left-0 top-1.5 w-4 h-4 rounded-full border-2"
      :class="active ? 'border-primary bg-background' : 'border-outline-variant bg-background'"
    ></div>
    <div class="absolute left-[7px] top-0 bottom-0 w-0.5 bg-outline-variant/30"></div>
    <div 
      class="p-4 rounded-[10px]"
      :class="[
        active ? 'bg-surface-container-lowest border border-primary/40 shadow-sm' : '',
        pending ? 'bg-surface-container-low/50 border border-dashed border-outline-variant/50' : ''
      ]"
    >
      <span class="text-[10px] font-bold text-primary uppercase tracking-widest mb-1 block">{{ time }}</span>
      <h4 class="font-serif font-bold" :class="active ? 'text-on-surface text-lg' : 'text-secondary text-lg'">{{ title }}</h4>
      <p class="text-xs" :class="active ? 'text-secondary' : 'text-secondary/60'">{{ subtitle }}</p>
    </div>
  </div>
</template>