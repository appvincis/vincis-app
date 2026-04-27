import axios from 'axios'

export const api = axios.create({
  baseURL: 'http://localhost:4000',
  withCredentials: true, // Garante que mandaremos e receberemos os cookies
})

// Flag para evitar loops infinitos de refresh
let isRefreshing = false

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

      if (!isRefreshing) {
        isRefreshing = true
        originalRequest._retry = true

        try {
          // Tenta renovar o token usando o refresh_token (cookie HttpOnly)
          await api.post('/auth/refresh')
          isRefreshing = false

          // Retenta a requisição original com o novo access_token
          return api(originalRequest)
        } catch (refreshError) {
          isRefreshing = false
          // Refresh falhou — sessão expirada de verdade
          return Promise.reject(refreshError)
        }
      }
    }

    return Promise.reject(error)
  }
)
