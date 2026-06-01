// apps/web/src/router/index.ts
import { createRouter, createWebHistory } from 'vue-router'
import AppLayout from '../layouts/AppLayout.vue'

import { useAuthStore } from '../stores/auth'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: () => import('../views/LandingPage.vue'),
      beforeEnter: (to, from, next) => {
        const authStore = useAuthStore()
        if (authStore.isAuthenticated) {
          next('/private')
        } else {
          next()
        }
      }
    },
    {
      path: '/design-system',
      name: 'design-system',
      component: () => import('../views/DesignSystem.vue')
    },
    {
      path: '/auth',
      name: 'auth',
      component: () => import('../views/AuthView.vue')
    },
    {
      path: '/private',
      component: AppLayout,
      meta: { requiresAuth: true },
      children: [
        {
          path: '',
          name: 'dashboard',
          component: () => import('../views/PrivateView.vue')
        },
        {
          path: 'disciplinas',
          name: 'disciplinas',
          component: () => import('../views/DisciplinasView.vue')
        },
        {
          path: 'tasks',
          name: 'tasks',
          component: () => import('../views/TasksView.vue')
        },
        {
          path: 'performance',
          name: 'performance',
          component: () => import('../views/PerformanceView.vue')
        },
        {
          path: 'profile',
          name: 'profile',
          component: () => import('../views/ProfileView.vue')
        },
        {
          path: 'plans',
          name: 'plans',
          component: () => import('../views/PlansView.vue')
        },
        {
          path: 'error-logs',
          name: 'error-logs',
          component: () => import('../views/ErrorLogsView.vue')
        },
        {
          path: 'editais',
          name: 'editais',
          component: () => import('../views/EditaisView.vue')
        },
        {
          path: 'premium',
          name: 'premium',
          component: () => import('../views/PremiumView.vue'),
          meta: { requiresPremium: true }
        }
      ]
    },
    {
      path: '/old-ds',
      name: 'old-ds',
      beforeEnter() {
        window.location.href = '/design-system.html'
      }
    }
  ],
})

router.beforeEach((to, from) => {
  const authStore = useAuthStore()

  if (to.path.startsWith('/private') && !authStore.isAuthenticated) {
    return '/auth'
  } else if (to.path === '/auth' && authStore.isAuthenticated) {
    return '/private'
  }

  if (to.meta.requiresPremium) {
    const isPremium = authStore.user?.plan === 'PREMIUM'
    if (!isPremium) {
      return '/private/plans'
    }
  }
})

export default router