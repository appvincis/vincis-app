<template>
  <div class="ds-stat">
    <i v-if="icon" :class="[icon, 'ds-stat__icon']"></i>
    <div class="ds-stat__content">
      <p class="ds-stat__label">{{ label }}</p>
      <p class="ds-stat__value">{{ value }}</p>
    </div>
  </div>
</template>

<script setup>
defineProps(['icon', 'label', 'value'])
</script>