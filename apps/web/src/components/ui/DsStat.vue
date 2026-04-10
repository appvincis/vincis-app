<!-- components/ui/DsStat.vue -->
<script setup>
import DsCard from './DsCard.vue'
import DsBadge from './DsBadge.vue'

defineProps({
  title: { type: String, default: '' },
  value: { type: [String, Number], default: '' },
  icon: { type: String, default: '' },
  severity: { 
    type: String, 
    default: 'primary',
    validator: (value) => ['primary', 'secondary', 'success', 'info', 'warning', 'danger'].includes(value)
  }
})
</script>

<template>
  <DsCard class="stat-card">
    <div class="flex items-start justify-between">
      <div>
        <p class="text-[10px] font-label font-bold text-secondary uppercase tracking-widest">
          {{ title }}
        </p>
        <p class="text-2xl font-serif font-bold text-on-surface mt-2">
          {{ value }}
        </p>
      </div>
      <div 
        class="w-10 h-10 rounded-lg flex items-center justify-center"
        :class="{
          'bg-primary/10 text-primary': severity === 'primary',
          'bg-secondary/10 text-secondary': severity === 'secondary',
          'bg-success/10 text-success': severity === 'success',
          'bg-info/10 text-info': severity === 'info',
          'bg-warning/10 text-warning': severity === 'warning',
          'bg-danger/10 text-danger': severity === 'danger'
        }"
      >
        <i :class="`pi ${icon} text-xl`"></i>
      </div>
    </div>
    <slot name="footer" />
  </DsCard>
</template>

<style scoped>
.stat-card :deep(.p-card-body) {
  padding: 1.25rem;
}

.stat-card :deep(.p-card-content) {
  padding: 0;
}
</style>