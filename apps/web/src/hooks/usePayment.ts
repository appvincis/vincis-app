import { useMutation } from '@tanstack/vue-query'
import { api } from '../lib/axios'

export interface CheckoutResponse {
  checkoutUrl: string
  billingId: string
  devMode?: boolean
}

export function useGeneratePixMutation() {
  return useMutation({
    mutationFn: async (): Promise<CheckoutResponse> => {
      const response = await api.post<CheckoutResponse>('/payments/pix')
      return response.data
    }
  })
}

export function useSimulatePaymentMutation() {
  return useMutation({
    mutationFn: async (userId: string) => {
      // Fakes the webhook payload directly to our backend for Dev Mode testing
      const response = await api.post('/payments/webhook', {
        event: 'billing.paid',
        data: {
          status: 'PAID',
          metadata: { userId }
        }
      })
      return response.data
    }
  })
}
