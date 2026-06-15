import axios from 'axios'

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:4000',
  withCredentials: true, // Garante que mandaremos e receberemos os cookies
})

let isRefreshing = false
let failedQueue: any[] = []

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error)
    } else {
      prom.resolve(token)
    }
  })

  failedQueue = []
}

api.interceptors.request.use((config) => {
  try {
    const studyPlanData = localStorage.getItem('study-plan')
    if (studyPlanData) {
      const parsed = JSON.parse(studyPlanData)
      if (parsed.activePlanId) {
        config.headers['x-study-plan-id'] = parsed.activePlanId.toString()
      }
    }
  } catch (e) {
    console.error('Failed to parse study-plan from localStorage', e)
  }
  return config
})

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config

    // Se recebeu 401 e ainda não tentou refresh nessa request
    if (error.response?.status === 401 && !originalRequest._retry) {
      // Se a própria rota de refresh ou logout falhou, não tenta de novo
      if (originalRequest.url === '/auth/refresh' || originalRequest.url === '/auth/logout') {
        return Promise.reject(error)
      }

      if (isRefreshing) {
        // Se já tem um refresh em andamento, adiciona essa request na fila
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject })
        })
          .then(() => {
            return api(originalRequest)
          })
          .catch((err) => {
            return Promise.reject(err)
          })
      }

      isRefreshing = true
      originalRequest._retry = true

      try {
        // Tenta renovar o token usando o refresh_token (cookie HttpOnly)
        await api.post('/auth/refresh')
        
        processQueue(null)
        isRefreshing = false

        // Retenta a requisição original
        return api(originalRequest)
      } catch (refreshError) {
        processQueue(refreshError, null)
        isRefreshing = false
        // Refresh falhou — sessão expirada de verdade
        return Promise.reject(refreshError)
      }
    }

    return Promise.reject(error)
  }
)
