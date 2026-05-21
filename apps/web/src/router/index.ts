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
      redirect: () => {
        const authStore = useAuthStore()
        return authStore.isAuthenticated ? '/private' : '/auth'
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
          path: 'study-plans',
          name: 'study-plans',
          component: () => import('../views/StudyPlansView.vue')
        }, {
          path: 'disciplinas',
          name: 'disciplinas',
          component: () => import('../views/DisciplinasView.vue')
        },
        {
          path: 'tasks',
          name: 'tasks',
          component: () => import('../views/PrivateView.vue')
        },
        {
          path: 'performance',
          name: 'performance',
          component: () => import('../views/PrivateView.vue')
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

router.beforeEach((to, from, next) => {
  const authStore = useAuthStore()

  if (to.path.startsWith('/private') && !authStore.isAuthenticated) {
    next('/auth')
  } else if (to.path === '/auth' && authStore.isAuthenticated) {
    next('/private')
  } else {
    next()
  }
})

export default router