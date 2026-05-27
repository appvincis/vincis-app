<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '../../stores/auth'
import { usePlan } from '../../hooks/usePlan'
import Menu from 'primevue/menu'
import StudyPlanSwitcher from './StudyPlanSwitcher.vue'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()
const { plan } = usePlan()

const menu = ref()

const userMenuItems = ref([
  {
    label: 'Perfil',
    icon: 'pi pi-user',
    command: () => {
      router.push('/private/profile')
    }
  },
  {
    separator: true
  },
  {
    label: 'Sair',
    icon: 'pi pi-sign-out',
    command: () => {
      authStore.logout()
    }
  }
])

const toggleUserMenu = (event: any) => {
  menu.value.toggle(event)
}

const navItems = [
  { id: 'dashboard', label: 'Dashboard', icon: 'pi-th-large', path: '/private', isPremium: false },
  { id: 'disciplinas', label: 'Disciplinas', icon: 'pi-book', path: '/private/disciplinas', isPremium: false },
  { id: 'tasks', label: 'Tarefas', icon: 'pi-check-circle', path: '/private/tasks', isPremium: false },
  { id: 'performance', label: 'Desempenho', icon: 'pi-chart-bar', path: '/private/performance', isPremium: false },
  { id: 'plans', label: 'Plano', icon: 'pi-box', path: '/private/plans', isPremium: false },
  { id: 'premium', label: 'Premium', icon: 'pi-verified', path: '/private/premium', isPremium: true },
]

const isActive = (path: string) => {
  if (path === '/private') return route.path === '/private'
  return route.path.startsWith(path)
}

// Filtra itens que exigem Premium: só exibe se o usuário tiver assinatura ativa
const visibleNavItems = computed(() =>
  navItems.filter(item => !item.isPremium || plan.value.isPremium)
)

const userInitials = computed(() => {
  const name = authStore.user?.name || 'AV'
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((n: string) => n[0]!.toUpperCase())
    .join('')
})
</script>

<template>
  <!-- Desktop Sidebar -->
  <aside
    class="hidden md:flex flex-col h-screen w-64 bg-surface-container-low dark:bg-surface-dark p-6 fixed left-0 top-0 z-40 border-r soft-brutalist-border">
    <!-- Brand Logo Header -->
    <div class="mb-8 select-none">
      <h1
        class="text-xl font-bold text-on-surface dark:text-surface-container-lowest font-serif leading-none tracking-tight">
        Vincis</h1>
      <p class="text-[10px] font-sans font-bold uppercase tracking-widest text-on-surface-muted mt-1.5">Academic Portal
      </p>
    </div>

    <!-- Study Plan Switcher -->
    <div class="mb-5">
      <StudyPlanSwitcher />
    </div>

    <!-- Navigation Links -->
    <nav class="flex-1 space-y-3">
      <router-link v-for="item in visibleNavItems" :key="item.id" :to="item.path"
        class="flex items-center gap-3 px-4 min-h-[48px] rounded-xl transition-all" :class="isActive(item.path)
          ? 'bg-primary-container text-on-surface shadow-sm'
          : 'text-on-surface-muted hover:bg-background dark:hover:bg-surface-dark-elevated'">
        <i class="pi text-[20px]" :class="item.icon"
          :style="isActive(item.path) ? { textShadow: '0 0 1px currentColor' } : {}"></i>
        <span class="text-sm tracking-wide font-sans" :class="isActive(item.path) ? 'font-bold' : 'font-medium'">
          {{ item.label }}
        </span>
      </router-link>
    </nav>

    <!-- User Footer Profile -->
    <div class="mt-auto pt-6 border-t border-outline-variant/30">
      <div
        class="flex items-center gap-3 w-full p-1.5 hover:bg-background dark:hover:bg-surface-dark-elevated rounded-xl cursor-pointer transition-all overflow-hidden"
        @click="toggleUserMenu">
        <div
          class="w-10 h-10 rounded-full bg-primary-container flex-shrink-0 flex items-center justify-center ring-2 ring-outline-variant/20 overflow-hidden">
          <img v-if="authStore.user?.avatar" :src="authStore.user.avatar" :alt="authStore.user?.name"
            class="w-full h-full object-cover" />
          <span v-else class="text-sm font-headline font-bold text-on-primary-container leading-none">
            {{ userInitials }}
          </span>
        </div>

        <div class="overflow-hidden text-left leading-tight">
          <p class="text-sm font-bold font-headline text-on-surface truncate">
            {{ authStore.user?.name || 'Alex Vincis' }}
          </p>
          <p class="text-[10px] font-label font-bold uppercase tracking-widest text-primary mt-0.5 truncate">
            Senior Scholar
          </p>
        </div>
      </div>
      <Menu ref="menu" :model="userMenuItems" :popup="true" />
    </div>
  </aside>
</template>
