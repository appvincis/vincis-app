import { useQuery, useMutation, useQueryClient } from '@tanstack/vue-query'
import { api } from '../lib/axios'
import { computed, unref, type Ref } from 'vue'
import { useStudyPlanStore } from '../stores/study-plan'

type MaybeRef<T> = T | Ref<T>

export const DIAGNOSTICO_OPTIONS = [
    'Lacuna Teórica',
    'Falta de Atenção',
    'Interpretação',
    'Pegadinha',
    'Falta de Tempo',
] as const

export type DiagnosticoType = typeof DIAGNOSTICO_OPTIONS[number]

export interface ErrorLog {
    id: number
    analise: string
    correcao: string | null
    fonte: string | null
    diagnostico: DiagnosticoType | null
    topicText: string | null
    isResolved: boolean
    resolvedAt: string | null
    topicId: number | null
    topic: {
        id: number
        name: string
        discipline: { id: number; name: string; color: string }
    } | null
    createdAt: string
    updatedAt: string
}

export interface ErrorLogFilters {
    disciplineId?: number
    topicId?: number
}

export const useErrorLogsQuery = (filters: MaybeRef<ErrorLogFilters> = {}) => {
    const studyPlanStore = useStudyPlanStore()
    return useQuery({
        queryKey: computed(() => {
            const f = unref(filters)
            return ['error-logs', studyPlanStore.activePlanId, f.disciplineId, f.topicId]
        }),
        queryFn: async () => {
            const f = unref(filters)
            const params = new URLSearchParams()
            if (f.disciplineId) params.set('disciplineId', String(f.disciplineId))
            if (f.topicId)      params.set('topicId',      String(f.topicId))
            const qs = params.toString() ? `?${params.toString()}` : ''
            const { data } = await api.get<ErrorLog[]>(`/error-logs${qs}`)
            return data
        }
    })
}

export const useCreateErrorLogMutation = () => {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: async (payload: {
            analise: string
            correcao?: string
            fonte?: string
            diagnostico?: DiagnosticoType
            topicText?: string
            topicId?: number
        }) => {
            const { data } = await api.post<{ errorLog: ErrorLog }>('/error-logs', payload)
            return data.errorLog
        },
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['error-logs'] })
    })
}

export const useUpdateErrorLogMutation = () => {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: async ({ id, ...updates }: { id: number } & Partial<ErrorLog> & { isResolved?: boolean }) => {
            const { data } = await api.patch<{ errorLog: ErrorLog }>(`/error-logs/${id}`, updates)
            return data.errorLog
        },
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['error-logs'] })
    })
}

export const useDeleteErrorLogMutation = () => {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: async (id: number) => { await api.delete(`/error-logs/${id}`) },
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['error-logs'] })
    })
}
