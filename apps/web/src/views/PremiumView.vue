<script setup lang="ts">
import { api } from '@/lib/axios';
import { ref } from 'vue';

const mytext = ref("")

async function init() {
    const res = await api.get("/users/plan/premium")
    mytext.value = res.data
}

init()
</script>

<template>
    <h1> VOCÊ É PREMIUM BEBE!</h1>
    {{ mytext }}
</template>

<style scoped></style>