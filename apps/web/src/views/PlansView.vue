<script setup lang='ts'>
import { VButton } from '@/components/ui';
import { ref } from 'vue';

const currentPlan = ref("BASIC")

function handleChangePlan(plan: string) {
    currentPlan.value = plan
}
</script>

<template>
    <header class="view-header">
        <h1 class="text-4xl font-serif font-bold text-on-surface">Planos</h1>
        <p class="text-secondary mt-2">Gerencie seus planos do Vincis.</p>
    </header>

    <main class="cards-container">
        <div class="plan-card common">
            <div class="card-body">
                <h3 class="text-3xl font-bold">Basic</h3>
                <p class="mt-6 font-bold text-secondary">Plano gratuito</p>
                <p class="mt-6">Acesso à criação de planos de estudos, disciplinas e tópicos.</p>
                <p class="mt-2">Acesso à lalalalaala.</p>
                <p class="mt-2">Acesso à asudasudashdakshd.</p>
                <p class="mt-2">Acesso à asudasudashdakshda12371273127398.</p>
            </div>
            <VButton @click="handleChangePlan('BASIC')" :disabled="currentPlan === 'BASIC'" class="w-full">
                {{ currentPlan === "BASIC" ? "Atual" : "Selecionar Plano" }}
            </VButton>
        </div>
        <div class="plan-card premium">
            <div class="card-body">
                <h3 class="text-3xl font-bold">Premium</h3>
                <p class="mt-6 font-bold">Plano pago</p>
                <p class="mt-6">Acesso a todas as funcionalidades do plano básico.</p>
                <p class="mt-4">Acesso à área de simulados.</p>
                <p class="mt-4">Acesso à área de questões comentadas.</p>
                <p class="mt-4">Acesso à área de estatísticas.</p>
            </div>
            <VButton @click="handleChangePlan('PREMIUM')" :disabled="currentPlan === 'PREMIUM'" class="w-full">
                {{ currentPlan === "PREMIUM" ? "Atual" : "Selecionar Plano" }}
            </VButton>
        </div>
    </main>
</template>

<style scoped>
.view-header {
    margin-bottom: 2rem;
}

.plan-card {
    padding: 2rem;
    border-radius: var(--border-radius-xl);
    width: 500px;
    height: 550px;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
}

.plan-card.common {
    border: 1px solid black;
}

.plan-card.premium {
    background: var(--primary-container);
}

.cards-container {
    display: flex;
    align-items: center;
    justify-content: space-evenly;
}
</style>