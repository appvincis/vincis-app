<script setup lang="ts">
import { useAuthStore } from '../stores/auth'
import { VCard, VButton } from '../components/ui'
import Avatar from 'primevue/avatar'

const authStore = useAuthStore()
</script>

<template>
  <div class="profile-view">
    <header class="view-header">
      <h1 class="text-4xl font-serif font-bold text-on-surface">Seu Perfil</h1>
      <p class="text-secondary mt-2">Gerencie suas informações pessoais e preferências.</p>
    </header>

    <div class="mt-8 max-w-2xl">
      <VCard class="p-8">
        <div class="flex items-center gap-6 mb-8">
          <Avatar 
            :image="authStore.user?.avatar" 
            size="xlarge" 
            shape="circle" 
            class="profile-avatar shadow-lg"
          />
          <div>
            <h2 class="text-2xl font-serif font-bold text-on-surface">{{ authStore.user?.name }}</h2>
            <p class="text-secondary">{{ authStore.user?.email }}</p>
          </div>
        </div>

        <div class="space-y-6">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="profile-field">
              <label class="text-xs font-bold uppercase tracking-wider text-secondary">Nome Completo</label>
              <div class="p-3 bg-surface-container-low rounded-lg mt-1 border border-outline-variant/30">
                {{ authStore.user?.name }}
              </div>
            </div>
            <div class="profile-field">
              <label class="text-xs font-bold uppercase tracking-wider text-secondary">Email</label>
              <div class="p-3 bg-surface-container-low rounded-lg mt-1 border border-outline-variant/30">
                {{ authStore.user?.email }}
              </div>
            </div>
          </div>
          
          <div class="pt-4 border-t border-outline-variant/20 flex justify-end">
            <VButton variant="primary">Editar Perfil</VButton>
          </div>
        </div>
      </VCard>
    </div>
  </div>
</template>

<style scoped>
.view-header {
  margin-bottom: 2rem;
}

.profile-avatar {
  width: 100px;
  height: 100px;
  border: 4px solid var(--surface-container-lowest);
}
</style>
