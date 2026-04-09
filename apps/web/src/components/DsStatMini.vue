<template>
  <div class="ds-stat-mini">
    <div class="ds-stat-mini__icon">
      <i :class="icon"></i>
    </div>
    <div>
      <p class="ds-stat-mini__label">{{ label }}</p>
      <p class="ds-stat-mini__value">{{ value }}</p>
    </div>
  </div>
</template>

<script setup>
defineProps(['icon', 'label', 'value'])
</script>

<style scoped>
.ds-stat-mini {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1rem;
  background: rgba(253, 249, 246, 0.05);
  border-radius: 1rem;
}
.ds-stat-mini__icon {
  color: #d4af37;
  font-size: 1.25rem;
}
.ds-stat-mini__label {
  font-size: 0.625rem;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: #938f84;
}
.ds-stat-mini__value {
  font-family: 'Newsreader', serif;
  font-size: 1.125rem;
  color: #fdf9f6;
}
</style>