<script setup>
import Toast from 'primevue/toast'
import { useToast } from 'primevue/usetoast'

const toast = useToast()

const showToast = (options) => {
  toast.add(options)
}

// Métodos auxiliares para diferentes tipos de toast
const success = (summary, detail, life = 3000) => {
  toast.add({ severity: 'success', summary, detail, life })
}

const error = (summary, detail, life = 5000) => {
  toast.add({ severity: 'error', summary, detail, life })
}

const warn = (summary, detail, life = 4000) => {
  toast.add({ severity: 'warn', summary, detail, life })
}

const info = (summary, detail, life = 3000) => {
  toast.add({ severity: 'info', summary, detail, life })
}

defineExpose({ showToast, success, error, warn, info })
</script>

<template>
  <Toast v-bind="$attrs" />
</template>