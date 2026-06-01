<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '../../stores/auth'
import { usePlan } from '../../hooks/usePlan'
import Menu from 'primevue/menu'
import StudyPlanSwitcher from './StudyPlanSwitcher.vue'
import { useStudyPlanStore } from '../../stores/study-plan'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()
const { plan } = usePlan()
const studyPlanStore = useStudyPlanStore()

const menu = ref()
const studyPlanSwitcherRef = ref()

const userMenuItems = ref([
  {
    label: 'Perfil',
    icon: 'pi pi-user',
    command: () => {
      router.push('/private/profile')
    }
  },
  {
    label: 'Meu Plano',
    icon: 'pi pi-star',
    command: () => {
      router.push('/private/plans')
    }
  },
  {
    label: 'Trocar de Plano',
    icon: 'pi pi-arrow-right-arrow-left',
    command: () => {
      studyPlanSwitcherRef.value?.open()
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
  { id: 'planner', label: 'Planner', icon: 'pi-clock', path: '/private/planner', isPremium: false },
  { id: 'tasks', label: 'Tarefas', icon: 'pi-check-circle', path: '/private/tasks', isPremium: false },
  { id: 'error-logs', label: 'Caderno de Erros', icon: 'pi-pencil', path: '/private/error-logs', isPremium: false },
  { id: 'editais', label: 'Editais', icon: 'pi-file-pdf', path: '/private/editais', isPremium: false },
  { id: 'performance', label: 'Desempenho', icon: 'pi-chart-bar', path: '/private/performance', isPremium: false },
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

    <!-- Navigation Links -->
    <nav class="flex-1 space-y-2 overflow-y-auto mb-4 pr-2 custom-scrollbar">
      <router-link v-for="item in visibleNavItems" :key="item.id" :to="item.path"
        class="flex items-center gap-3 px-4 min-h-[42px] rounded-xl transition-all" :class="isActive(item.path)
          ? 'bg-primary-container text-on-surface shadow-sm'
          : 'text-on-surface-muted hover:bg-background dark:hover:bg-surface-dark-elevated'">
        <i class="pi text-[18px]" :class="item.icon"
          :style="isActive(item.path) ? { textShadow: '0 0 1px currentColor' } : {}"></i>
        <span class="text-sm tracking-wide font-sans" :class="isActive(item.path) ? 'font-bold' : 'font-medium'">
          {{ item.label }}
        </span>
      </router-link>
    </nav>

    <!-- Upgrade CTA -->
    <div v-if="!plan.isPremium"
      class="mt-auto mb-3 p-3 rounded-xl bg-primary-container/30 border border-primary/10 flex flex-col gap-1.5 relative overflow-hidden shrink-0">
      <!-- Glow effect -->
      <div class="absolute -top-6 -right-6 w-20 h-20 bg-primary/20 rounded-full blur-xl pointer-events-none"></div>

      <div class="flex items-center gap-1.5 z-10">
        <i class="pi pi-star-fill text-primary text-[10px]"></i>
        <span class="text-[13px] font-bold text-on-surface font-sans leading-none">Plano Free</span>
      </div>
      <p class="text-[11px] text-on-surface-muted leading-tight z-10 font-sans">
        Desbloqueie recursos avançados.
      </p>
      <router-link to="/private/plans"
        class="mt-0.5 w-full text-center py-1.5 px-3 bg-primary text-on-primary rounded-md text-[11px] font-bold transition-all hover:bg-primary/90 hover:shadow-sm hover:-translate-y-0.5 active:translate-y-0 z-10 font-sans">
        Fazer Upgrade
      </router-link>
    </div>

    <!-- User Footer Profile -->
    <div class="pt-4 border-t border-outline-variant/30 shrink-0" :class="{ 'mt-auto': plan.isPremium }">
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
          <div class="flex items-center gap-1.5 mt-0.5">
            <p class="text-[10px] font-label font-bold uppercase tracking-widest text-primary truncate">
              {{ plan.isPremium ? 'Premium' : 'Estudante' }}
            </p>
            <i v-if="plan.isPremium" class="pi pi-verified text-primary" style="font-size: 10px;"></i>
          </div>
        </div>
      </div>
      <Menu ref="menu" :model="userMenuItems" :popup="true" :pt="{
        root: { class: 'bg-surface-container-lowest border border-outline-variant/30 rounded-xl shadow-xl w-56 mt-2 overflow-hidden' },
        menu: { class: 'p-1.5 outline-none flex flex-col gap-0.5' },
        action: { class: 'flex items-center gap-3 px-3 py-2 rounded-lg text-on-surface-muted hover:bg-background hover:text-primary transition-all cursor-pointer group' },
        icon: { class: 'text-[16px] group-hover:scale-110 transition-transform' },
        label: { class: 'text-[13px] font-sans font-medium' },
        separator: { class: 'border-t border-outline-variant/20 my-1 mx-2' }
      }">
        <template #start>
          <div class="px-2 py-3 flex items-center gap-3 border-b border-outline-variant/20 mx-1.5 mb-1.5">
            <div
              class="w-9 h-9 rounded-full bg-surface-container-lowest border border-outline-variant/40 shadow-sm text-primary font-bold flex items-center justify-center shrink-0 uppercase text-xs">
              {{ studyPlanStore.activePlanName ? studyPlanStore.activePlanName.substring(0, 2) : 'NA' }}
            </div>
            <div class="flex flex-col min-w-0">
              <span class="text-[9px] font-bold text-on-surface-muted uppercase tracking-widest leading-none mb-1">
                Plano Ativo
              </span>
              <span class="text-[13px] font-bold text-on-surface truncate font-sans leading-tight">
                {{ studyPlanStore.activePlanName || 'Nenhum' }}
              </span>
            </div>
          </div>
        </template>
      </Menu>
    </div>

    <!-- Hidden Modal for Plan Switching -->
    <StudyPlanSwitcher ref="studyPlanSwitcherRef" />
  </aside>
</template>

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
  width: 4px;
}

.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}

.custom-scrollbar::-webkit-scrollbar-thumb {
  background: color-mix(in srgb, var(--color-on-surface) 10%, transparent);
  border-radius: 10px;
}

.custom-scrollbar:hover::-webkit-scrollbar-thumb {
  background: color-mix(in srgb, var(--color-on-surface) 20%, transparent);
}
</style>