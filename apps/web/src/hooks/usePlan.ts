import { computed } from 'vue'
import { useQuery, useMutation, useQueryClient } from '@tanstack/vue-query'
import { api } from '../lib/axios'
import { useAuthStore } from '../stores/auth'

export type PlanType = 'BASIC' | 'PREMIUM'

export interface UserPlan {
    type: PlanType
    isPremium: boolean
    isBasic: boolean
}

export const usePlan = () => {
    const authStore = useAuthStore()

    const { data, isLoading, isError, error } = useQuery({
        queryKey: ['user-plan'],
        queryFn: async () => {
            const { data } = await api.get<{ plan: PlanType }>('/users/plan')
            return data.plan
        },
        initialData: () => authStore.user?.plan as PlanType
    })

    const plan = computed<UserPlan>(() => {
        const type: PlanType = data.value ?? 'BASIC'
        return {
            type,
            isPremium: type === 'PREMIUM',
            isBasic: type === 'BASIC',
        }
    })

    return {
        plan,
        isLoading,
        isError,
        error,
    }
}

export const useUpdatePlanMutation = () => {
    const queryClient = useQueryClient()
    const authStore = useAuthStore()

    return useMutation({
        mutationFn: async (planType: PlanType) => {
            const { data } = await api.patch<{ plan: PlanType }>(`/users/plan/${planType}`)
            return data.plan
        },
        onSuccess: (newPlan) => {
            // Atualiza o cache do React Query
            queryClient.invalidateQueries({ queryKey: ['user-plan'] })
            // Sincroniza o store (e o localStorage) imediatamente
            authStore.updateProfile({ plan: newPlan })
        },
    })
}