import { useQuery, useMutation, useQueryClient } from '@tanstack/vue-query'
import { api } from '../lib/axios'
import { useStudyPlanStore } from '../stores/study-plan'
import { computed, unref, type Ref } from 'vue'

type MaybeRef<T> = T | Ref<T>

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
    // Campos de Relatório Pós-Sessão
    modalities?: string[]
    topicId?: number | null
    questionsDone?: number
    questionsCorrect?: number
    discipline?: {
        id: number
        name: string
        color: string
    }
    topic?: {
        id: number
        name: string
    } | null
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
    // Campos de Relatório Pós-Sessão
    modalities?: string[]
    topicId?: number | null
    questionsDone?: number
    questionsCorrect?: number
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

export const useDisciplineFocusSessionsQuery = (disciplineId: MaybeRef<number | undefined>) => {
    return useQuery({
        queryKey: computed(() => ['focus-sessions', 'discipline', unref(disciplineId)]),
        queryFn: async () => {
            const id = unref(disciplineId)
            if (!id) return []
            const { data } = await api.get<FocusSession[]>(`/focus-sessions/discipline/${id}`)
            return data
        },
        enabled: computed(() => !!unref(disciplineId))
    })
}
