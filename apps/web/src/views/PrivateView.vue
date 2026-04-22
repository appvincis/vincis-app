<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { api } from '../lib/axios'
import { VCard, VBadge } from '../components/ui'

const isLoading = ref(true)
const user = ref<any>(null)
const errorMsg = ref('')

onMounted(async () => {
  try {
    const res = await api.get('/auth/me')
    user.value = res.data.user
  } catch (error: any) {
    console.error(error)
    errorMsg.value = 'Erro ao carregar dados do usuário.'
  } finally {
    isLoading.value = false
  }
})
</script>

<template>
  <div class="dashboard-view">
    <header class="view-header">
      <h1 class="text-4xl font-serif font-bold text-on-surface">Bem-vindo, {{ user?.name || 'Estudante' }}</h1>
      <p class="text-secondary mt-2">Aqui está um resumo do seu progresso acadêmico.</p>
    </header>

    <div v-if="isLoading" class="flex justify-center items-center h-64">
      <div class="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
    </div>

    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8 animate-fade-in">
      <VCard class="p-6">
        <h3 class="text-lg font-serif font-bold mb-4">Seu Perfil</h3>
        <div class="space-y-3">
          <div class="flex justify-between">
            <span class="text-secondary text-sm">Email</span>
            <span class="text-on-surface text-sm">{{ user?.email }}</span>
          </div>
          <div class="flex justify-between items-center">
            <span class="text-secondary text-sm">Status</span>
            <VBadge variant="success">Ativo</VBadge>
          </div>
        </div>
      </VCard>

      <VCard class="p-6">
        <h3 class="text-lg font-serif font-bold mb-4">Próximas Tarefas</h3>
        <p class="text-secondary text-sm italic">Nenhuma tarefa para hoje.</p>
      </VCard>

      <VCard class="p-6">
        <h3 class="text-lg font-serif font-bold mb-4">Plano de Estudo</h3>
        <p class="text-secondary text-sm">Você ainda não selecionou um plano ativo.</p>
      </VCard>
    </div>
  </div>
</template>

<style scoped>
.dashboard-view {
  width: 100%;
}

.view-header {
  margin-bottom: 2rem;
}

.animate-fade-in {
  animation: fadeIn 0.5s ease-out;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>
