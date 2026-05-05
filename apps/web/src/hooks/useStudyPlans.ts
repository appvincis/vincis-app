import { useQuery, useMutation, useQueryClient } from '@tanstack/vue-query'
import { api } from '../lib/axios'
import { useStudyPlanStore } from '../stores/study-plan'

export interface StudyPlan {
    id: number
    name: string
    description: string
    is_active: boolean
}

export const useStudyPlansQuery = () => {
    return useQuery({
        queryKey: ['study-plans'],
        queryFn: async () => {
            const { data } = await api.get<StudyPlan[]>('/study-plans')
            return data
        }
    })
}

export const useCreateStudyPlanMutation = () => {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: async (newPlan: Partial<StudyPlan>) => {
            const { data } = await api.post<{ studyPlan: StudyPlan }>('/study-plans', newPlan)
            return data.studyPlan
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['study-plans'] })
        }
    })
}

export const useSelectStudyPlanMutation = () => {
    const studyPlanStore = useStudyPlanStore()
    const queryClient = useQueryClient()
    
    return useMutation({
        mutationFn: async ({ id, name }: { id: number, name: string }) => {
            await studyPlanStore.selectPlan(id, name)
        },
        onSuccess: () => {
            // After selecting a plan, we might want to invalidate disciplines since they are plan-specific
            queryClient.invalidateQueries({ queryKey: ['disciplines'] })
        }
    })
}

export const useAuthMeQuery = () => {
    return useQuery({
        queryKey: ['auth-me'],
        queryFn: async () => {
            const { data } = await api.get<{ user: any }>('/auth/me')
            return data.user
        }
    })
}
