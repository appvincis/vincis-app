<script setup lang="ts">
import { ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '../../stores/auth'
import { useLayoutStore } from '../../stores/layout'
import Avatar from 'primevue/avatar'
import Menu from 'primevue/menu'
import Button from 'primevue/button'
import Drawer from 'primevue/drawer'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()
const layoutStore = useLayoutStore()

const menu = ref()
const isMobileMenuOpen = ref(false)
const hoverTimeout = ref<ReturnType<typeof setTimeout> | null>(null)

const handleMouseEnter = () => {
  hoverTimeout.value = setTimeout(() => {
    layoutStore.setSidebarCollapsed(false)
  }, 500)
}

const handleMouseLeave = () => {
  if (hoverTimeout.value) {
    clearTimeout(hoverTimeout.value)
    hoverTimeout.value = null
  }
  layoutStore.setSidebarCollapsed(true)
}

const userMenuItems = ref([
  {
    label: 'Perfil',
    icon: 'pi pi-user',
    command: () => {
      router.push('/private/profile')
      isMobileMenuOpen.value = false
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
  { id: 'dashboard', label: 'Dashboard', icon: 'dashboard', path: '/private' },
  { id: 'study-plans', label: 'Planos de Estudo', icon: 'auto_stories', path: '/private/study-plans' },
  { id: 'tasks', label: 'Tarefas', icon: 'task_alt', path: '/private/tasks' },
  { id: 'performance', label: 'Desempenho', icon: 'analytics', path: '/private/performance' },
]

const isActive = (path: string) => {
  if (path === '/private') return route.path === '/private'
  return route.path.startsWith(path)
}
</script>

<template>
  <!-- Mobile Toggle (Only visible on small screens) -->
  <div class="mobile-header md:hidden">
    <Button icon="pi pi-bars" text @click="isMobileMenuOpen = true" />
    <span class="mobile-logo">V</span>
  </div>

  <!-- Desktop Sidebar -->
  <aside 
    class="app-sidebar hidden md:flex" 
    :class="{ 'app-sidebar--collapsed': layoutStore.isSidebarCollapsed }"
    @mouseenter="handleMouseEnter"
    @mouseleave="handleMouseLeave"
  >
    <div class="sidebar-header">
      <div class="logo-container">
        <span class="logo-v">V</span>
        <div class="logo-text" v-if="!layoutStore.isSidebarCollapsed">
          <span class="brand-name">Vincis</span>
          <span class="brand-tagline">Academic Portal</span>
        </div>
      </div>
    </div>

    <nav class="sidebar-nav">
      <router-link 
        v-for="item in navItems" 
        :key="item.id" 
        :to="item.path"
        class="nav-item"
        :class="{ 'nav-item--active': isActive(item.path) }"
      >
        <span class="material-symbols-outlined nav-icon">{{ item.icon }}</span>
        <span class="nav-label" v-if="!layoutStore.isSidebarCollapsed">{{ item.label }}</span>
      </router-link>
    </nav>

    <div class="sidebar-footer">
      <div class="user-profile" @click="toggleUserMenu">
        <Avatar 
          :image="authStore.user?.avatar" 
          shape="circle" 
          class="user-avatar"
          :label="!authStore.user?.avatar ? authStore.user?.name?.charAt(0) : ''"
        />
        <div class="user-info" v-if="!layoutStore.isSidebarCollapsed">
          <span class="user-name">{{ authStore.user?.name }}</span>
          <span class="user-role">Estudante</span>
        </div>
        <i class="pi pi-ellipsis-v footer-more" v-if="!layoutStore.isSidebarCollapsed"></i>
      </div>
      <Menu ref="menu" :model="userMenuItems" :popup="true" />
    </div>
  </aside>

  <!-- Mobile Drawer -->
  <Drawer v-model:visible="isMobileMenuOpen" header="Navegação" class="mobile-drawer">
    <template #header>
      <div class="logo-container">
        <span class="logo-v">V</span>
        <div class="logo-text">
          <span class="brand-name">Vincis</span>
          <span class="brand-tagline">Academic Portal</span>
        </div>
      </div>
    </template>
    
    <nav class="sidebar-nav pt-4">
      <router-link 
        v-for="item in navItems" 
        :key="item.id" 
        :to="item.path"
        class="nav-item"
        :class="{ 'nav-item--active': isActive(item.path) }"
        @click="isMobileMenuOpen = false"
      >
        <span class="material-symbols-outlined nav-icon">{{ item.icon }}</span>
        <span class="nav-label">{{ item.label }}</span>
      </router-link>
    </nav>

    <template #footer>
      <div class="sidebar-footer border-t border-outline-variant/20 pt-4">
        <div class="user-profile" @click="toggleUserMenu">
          <Avatar :image="authStore.user?.avatar" shape="circle" class="user-avatar" />
          <div class="user-info">
            <span class="user-name">{{ authStore.user?.name }}</span>
            <span class="user-role">Estudante</span>
          </div>
          <i class="pi pi-ellipsis-v footer-more"></i>
        </div>
      </div>
    </template>
  </Drawer>
</template>

<style scoped>
.app-sidebar {
  height: 100vh;
  width: 280px;
  background: var(--surface-container-low);
  border-right: 1px solid var(--outline-variant);
  display: flex;
  flex-direction: column;
  transition: width 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  overflow: hidden;
  position: relative;
  z-index: 100;
}

.app-sidebar--collapsed {
  width: 80px;
}

/* Header */
.sidebar-header {
  padding: 1.25rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 80px;
}

.logo-container {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  
}

.logo-v {
  width: 40px;
  height: 40px;
  background: var(--primary-container);
  color: var(--on-primary-container);
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 12px;
  font-family: var(--ds-font-serif);
  font-weight: 800;
  font-size: 1.5rem;
  flex-shrink: 0;
  box-shadow: 0 4px 12px rgba(115, 92, 0, 0.15);
  
}

.logo-text {
  display: flex;
  flex-direction: column;
  white-space: nowrap;
}

.brand-name {
  font-family: var(--ds-font-serif);
  font-weight: 700;
  font-size: 1.125rem;
  color: var(--on-surface);
  line-height: 1.2;
}

.brand-tagline {
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  color: var(--secondary);
}


/* Navigation */
.sidebar-nav {
  flex: 1;
  padding: 1rem 0.75rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.75rem 1rem;
  border-radius: 12px;
  color: var(--secondary);
  text-decoration: none;
  transition: background 0.2s ease, color 0.1s ease;
  white-space: nowrap;
}

.nav-item:hover {
  background: var(--surface-container-high);
  color: var(--on-surface)!important;
}

.nav-item--active {
  background: var(--primary-container) !important;
  color: var(--on-surface)!important;
  font-weight: 600 !important;
  font-style: italic !important;
  transition: none !important;
}

.nav-icon {
  font-size: 1.5rem;
  flex-shrink: 0;
}

.nav-item--active .nav-icon {
  font-variation-settings: 'FILL' 1;
}

.nav-label {
  font-family: var(--ds-font-serif);
  font-size: 1rem;
}

/* Footer */
.sidebar-footer {
  padding: 1rem;
  border-top: 1px solid var(--outline-variant);
  margin-bottom: 0.5rem;
}

.user-profile {
  display: flex;
  align-items: center;
  gap: 0.7rem;
  padding: 0.18rem;
  border-radius: 12px;
  cursor: pointer;
  transition: background 0.2s ease;
}

.user-profile:hover {
  background: var(--surface-container-high);
}

.user-avatar {
  width: 40px;
  height: 40px;
  flex-shrink: 0;
}

.user-info {
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.user-name {
  font-weight: 600;
  font-size: 0.875rem;
  color: var(--on-surface);
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;
}

.user-role {
  font-size: 0.75rem;
  color: var(--secondary);
}

.footer-more {
  margin-left: auto;
  color: var(--outline);
  font-size: 0.875rem;
}

/* Mobile specific */
.mobile-header {
  height: 60px;
  display: flex;
  align-items: center;
  padding: 0 1rem;
  background: var(--surface-container-low);
  border-bottom: 1px solid var(--outline-variant);
  gap: 1rem;
}

.mobile-logo {
  font-family: var(--ds-font-serif);
  font-weight: 800;
  font-size: 1.25rem;
  color: var(--primary);
}

/* Tailwind-like utilities for responsive hiding */
@media (min-width: 768px) {
  .hidden { display: none; }
  .md\:flex { display: flex; }
  .md\:hidden { display: none; }
}

@media (max-width: 767px) {
  .hidden { display: none; }
  .md\:flex { display: none; }
}
</style>
