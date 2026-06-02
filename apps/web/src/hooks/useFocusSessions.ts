import { useQuery, useMutation, useQueryClient } from '@tanstack/vue-query'
import { api } from '../lib/axios'
import { useStudyPlanStore } from '../stores/study-plan'
import { computed } from 'vue'

export interface FocusSession {
    id: number
    duration: number
    focusTime: number
    breakTime: number
    longBreakTime: number
    cyclesTarget: number
    cyclesCompleted: number
    isCompleted: boolean
    startedAt: string
    finishedAt?: string
    disciplineId: number
    discipline?: {
        id: number
        name: string
        color: string
    }
}

export interface CreateFocusSessionPayload {
    disciplineId: number
    duration: number
    focusTime: number
    breakTime: number
    longBreakTime: number
    cyclesTarget: number
    cyclesCompleted: number
    isCompleted: boolean
    startedAt: string
    finishedAt?: string
}

export const useFocusSessionsQuery = () => {
    const studyPlanStore = useStudyPlanStore()
    return useQuery({
        queryKey: ['focus-sessions'],
        queryFn: async () => {
            const { data } = await api.get<FocusSession[]>('/focus-sessions')
            return data
        },
        enabled: computed(() => studyPlanStore.hasActivePlan)
    })
}

export const useCreateFocusSessionMutation = () => {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: async (payload: CreateFocusSessionPayload) => {
            const { data } = await api.post<{ session: FocusSession }>('/focus-sessions', payload)
            return data.session
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['focus-sessions'] })
        }
    })
}
