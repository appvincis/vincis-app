<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  title: string
  value: string | number
  suffix?: string
  icon: string
  iconColorClass?: string
  iconBgClass?: string
  badgeText?: string
  badgeColorClass?: string
  badgeBgClass?: string
  showProgress?: boolean
  progressPercent?: number
}>()

const iconColor = computed(() => props.iconColorClass || 'text-primary')
const iconBg = computed(() => props.iconBgClass || 'bg-primary/10')
const badgeColor = computed(() => props.badgeColorClass || 'text-green-600')
const badgeBg = computed(() => props.badgeBgClass || 'bg-green-50')
</script>

<template>
  <div class="bg-surface-container-lowest p-6 rounded-xl soft-brutalist-border hover:shadow-lg transition-all">
    <div class="flex justify-between items-start mb-4">
      <span class="p-2 rounded-lg" :class="iconBg">
        <i class="pi" :class="[icon, iconColor]"></i>
      </span>
      <span v-if="badgeText" class="text-xs font-label font-bold px-2 py-0.5 rounded" :class="[badgeColor, badgeBg]">
        {{ badgeText }}
      </span>
    </div>
    <p class="text-sm font-label text-secondary mb-1">{{ title }}</p>
    <div class="flex items-end gap-2">
      <h4 class="text-4xl font-headline font-bold">
        {{ value }}
        <span v-if="suffix && !showProgress" class="text-lg font-label text-secondary ml-1">{{ suffix }}</span>
      </h4>
      <span v-if="suffix && showProgress" class="text-xl font-headline text-secondary mb-1">{{ suffix }}</span>
    </div>
    
    <div v-if="showProgress" class="w-full bg-surface-container h-1 mt-4 rounded-full overflow-hidden">
      <div class="bg-primary h-full transition-all duration-500" :style="`width: ${progressPercent || 0}%`"></div>
    </div>
  </div>
</template>
