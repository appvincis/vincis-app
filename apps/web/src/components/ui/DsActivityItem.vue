<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  title: string
  moduleName: string
  timeSpent: string
  status: 'Completo' | 'Em Andamento' | 'Pausado'
  icon: string
}>()

const statusColors = computed(() => {
  switch (props.status) {
    case 'Completo':
      return {
        bg: 'bg-green-50',
        text: 'text-green-700',
        dot: 'bg-green-500'
      }
    case 'Em Andamento':
      return {
        bg: 'bg-amber-50',
        text: 'text-amber-700',
        dot: 'bg-amber-500'
      }
    default:
      return {
        bg: 'bg-surface-container-high',
        text: 'text-secondary',
        dot: 'bg-secondary'
      }
  }
})
</script>

<template>
  <div class="flex items-center justify-between p-5 bg-surface-container-lowest rounded-xl soft-brutalist-border hover:bg-surface-container-low transition-all group">
    <div class="flex items-center gap-5">
      <div class="w-12 h-12 flex items-center justify-center bg-surface-container-low rounded-lg group-hover:bg-white transition-colors">
        <i class="pi text-primary text-xl" :class="icon"></i>
      </div>
      <div>
        <h5 class="font-headline font-bold text-lg">{{ title }}</h5>
        <p class="text-xs font-label text-secondary uppercase tracking-wider">Módulo: {{ moduleName }}</p>
      </div>
    </div>
    
    <div class="flex items-center gap-12">
      <div class="hidden sm:block text-right">
        <p class="text-sm font-label font-bold">{{ timeSpent }}</p>
        <p class="text-[10px] text-secondary font-label">Tempo de Sessão</p>
      </div>
      <div class="flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold font-label" :class="[statusColors.bg, statusColors.text]">
        <span class="w-1.5 h-1.5 rounded-full" :class="statusColors.dot"></span>
        {{ status }}
      </div>
      <i class="pi pi-ellipsis-v text-outline-variant hover:text-on-surface cursor-pointer"></i>
    </div>
  </div>
</template>
