<script setup>
import Dialog from 'primevue/dialog'

defineProps({
  visible: { type: Boolean, default: false },
  header: { type: String, default: '' },
  closable: { type: Boolean, default: true },
  modal: { type: Boolean, default: true }
})
defineEmits(['update:visible'])
</script>

<template>
  <Dialog 
    :visible="visible"
    @update:visible="$emit('update:visible', $event)"
    :header="header"
    :closable="closable"
    :modal="modal"
    v-bind="$attrs"
  >
    <template v-for="(_, slotName) in $slots" #[slotName]="slotProps">
      <slot :name="slotName" v-bind="slotProps || {}" />
    </template>
  </Dialog>
</template>