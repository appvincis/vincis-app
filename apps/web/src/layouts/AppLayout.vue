<script setup lang="ts">
import { computed, ref } from 'vue'
import AppSidebar from '../components/layout/AppSidebar.vue'
import AITutorDrawer from '../components/layout/AITutorDrawer.vue'
import { useAuthStore } from '../stores/auth'
import Toast from 'primevue/toast'

const authStore = useAuthStore()

const firstName = computed(() => {
  const name = authStore.user?.name || 'Estudante'
  return name.split(' ')[0]
})

const isAITutorOpen = ref(false)
</script>

<template>
  <div class="min-h-screen flex bg-background dark:bg-surface-dark">
    <Toast />
    <!-- Navigation Sidebar & Mobile Bar -->
    <AppSidebar />

    <!-- Main Content Shell -->
    <div 
      class="flex-1 md:ml-64 flex flex-col min-h-screen transition-all duration-300"
    >
      <!-- Main Page Content -->
      <main class="flex-1 relative p-6 md:p-8 max-w-7xl w-full mx-auto pb-8">
        <router-view v-slot="{ Component }">
          <transition name="page-fade" mode="out-in">
            <component :is="Component" />
          </transition>
        </router-view>
      </main>
    </div>

    <!-- AI Tutor Drawer -->
    <AITutorDrawer :isOpen="isAITutorOpen" @close="isAITutorOpen = false" />

    <!-- Floating Action Button for AI Tutor -->
    <button 
      @click="isAITutorOpen = !isAITutorOpen"
      class="fixed bottom-6 right-6 md:bottom-10 md:right-10 w-14 h-14 bg-primary text-on-primary rounded-full shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 transition-all flex items-center justify-center z-40 border-4 border-background dark:border-surface-dark group"
      :class="isAITutorOpen ? 'opacity-0 pointer-events-none translate-y-4' : 'opacity-100 translate-y-0'"
    >
      <i class="pi pi-sparkles text-xl group-hover:animate-pulse"></i>
    </button>
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
