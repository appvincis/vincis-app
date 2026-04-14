<script setup>
import Chip from 'primevue/chip'
</script>

<template>
  <Chip v-bind="$attrs">
    <template v-for="(_, slotName) in $slots" #[slotName]="slotProps">
      <slot :name="slotName" v-bind="slotProps || {}" />
    </template>
  </Chip>
</template>