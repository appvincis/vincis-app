<script setup lang="ts">
import { computed } from 'vue'
import AppSidebar from '../components/layout/AppSidebar.vue'
import { useAuthStore } from '../stores/auth'

const authStore = useAuthStore()

const firstName = computed(() => {
  const name = authStore.user?.name || 'Estudante'
  return name.split(' ')[0]
})
</script>

<template>
  <div class="min-h-screen flex bg-background dark:bg-surface-dark">
    <!-- Navigation Sidebar & Mobile Bar -->
    <AppSidebar />

    <!-- Main Content Shell -->
    <div class="flex-1 md:ml-64 flex flex-col min-h-screen">


      <!-- Main Page Content -->
      <main class="flex-1 p-6 md:p-8 max-w-7xl w-full mx-auto pb-8">
        <router-view v-slot="{ Component }">
          <transition name="page-fade" mode="out-in">
            <component :is="Component" />
          </transition>
        </router-view>
      </main>
    </div>
  </div>
</template>

<style scoped>
/* Page transitions */
.page-fade-enter-active,
.page-fade-leave-active {
  transition: opacity 0.25s ease, transform 0.25s ease;
}

.page-fade-enter-from {
  opacity: 0;
  transform: translateY(8px);
}

.page-fade-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}
</style>
