import { useQuery, useMutation, useQueryClient } from '@tanstack/vue-query'
import { api } from '../lib/axios'
import { useStudyPlanStore } from '../stores/study-plan'
import { unref, computed, type Ref } from 'vue'

type MaybeRef<T> = T | Ref<T>

export interface Discipline {
    id: number
    name: string
    color: string
    weight: number
}

export interface Topic {
    id: number
    name: string
    description?: string
    isCompleted: boolean
    disciplineId: number
}

export const useDisciplinesQuery = () => {
    const studyPlanStore = useStudyPlanStore()
    return useQuery({
        queryKey: ['disciplines'],
        queryFn: async () => {
            const { data } = await api.get<Discipline[]>('/disciplines')
            return data
        },
        enabled: computed(() => studyPlanStore.hasActivePlan)
    })
}

export const useCreateDisciplineMutation = () => {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: async (newDiscipline: Partial<Discipline>) => {
            const { data } = await api.post<{ discipline: Discipline }>('/disciplines', newDiscipline)
            return data.discipline
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['disciplines'] })
        }
    })
}

export const useUpdateDisciplineMutation = () => {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: async ({ id, ...updates }: Partial<Discipline> & { id: number }) => {
            const { data } = await api.patch<{ discipline: Discipline }>(`/disciplines/${id}`, updates)
            return data.discipline
        },
        onSuccess: (updatedDiscipline) => {
            queryClient.invalidateQueries({ queryKey: ['disciplines'] })
        }
    })
}

export const useDeleteDisciplineMutation = () => {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: async (id: number) => {
            await api.delete(`/disciplines/${id}`)
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['disciplines'] })
        }
    })
}

// Topics
export const useTopicsQuery = (disciplineId: MaybeRef<number | undefined>) => {
    return useQuery({
        queryKey: computed(() => ['topics', unref(disciplineId)]),
        queryFn: async () => {
            const id = unref(disciplineId)
            if (!id) return []
            const { data } = await api.get<Topic[]>(`/topics/discipline/${id}`)
            return data
        },
        enabled: computed(() => !!unref(disciplineId))
    })
}

export const useCreateTopicMutation = () => {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: async (newTopic: Partial<Topic>) => {
            const { data } = await api.post<{ topic: Topic }>('/topics', newTopic)
            return data.topic
        },
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['topics', variables.disciplineId] })
        }
    })
}

export const useUpdateTopicMutation = () => {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: async ({ id, ...updates }: Partial<Topic> & { id: number }) => {
            const { data } = await api.patch<{ topic: Topic }>(`/topics/${id}`, updates)
            return data.topic
        },
        onSuccess: (updatedTopic) => {
            queryClient.invalidateQueries({ queryKey: ['topics', updatedTopic.disciplineId] })
        }
    })
}

export const useDeleteTopicMutation = () => {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: async ({ id, disciplineId }: { id: number, disciplineId: number }) => {
            await api.delete(`/topics/${id}`)
        },
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['topics', variables.disciplineId] })
        }
    })
}
