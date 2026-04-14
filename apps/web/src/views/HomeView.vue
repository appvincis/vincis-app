<script setup lang="ts">
import DsButton from '@/components/ui/DsButton.vue';
import { globalCSS } from './vincis-primevue-theme.js'

</script>

<template>
  <h1 class="text-xl font-bold">Vincis</h1>
  <p class="text-red-500">
    Um app pra lacrar nos concursos
  </p>
  <div class="">
    <DsButton label="Clique aqui" severity="success" />

  </div>
  <DsButton label="Botão de perigo" severity="danger" />
  <h1>aaaaaaaaa</h1>
</template>