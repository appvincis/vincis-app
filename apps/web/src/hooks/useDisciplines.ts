import { useQuery, useMutation, useQueryClient } from '@tanstack/vue-query'
import { api } from '../lib/axios'
import { useStudyPlanStore } from '../stores/study-plan'
import { unref, computed, type Ref } from 'vue'

type MaybeRef<T> = T | Ref<T>

export interface Discipline {
    id: number
    name: string
    description?: string
    color: string
    weight: number
    isActive: boolean
    topics?: Topic[]
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
        mutationFn: async (newDiscipline: Omit<Partial<Discipline>, 'topics'>) => {
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

export const useBulkCreateDisciplinesMutation = () => {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: async (payload: { disciplines: any[] }) => {
            const { data } = await api.post<{ message: string, disciplinesCreated: number, topicsCreated: number }>('/disciplines/bulk', payload)
            return data
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['disciplines'] })
        }
    })
}

export const useBulkDeleteDisciplinesMutation = () => {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: async (ids: number[]) => {
            const { data } = await api.post<{ message: string }>('/disciplines/bulk-delete', { ids })
            return data
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['disciplines'] })
        }
    })
}

export const useBulkWeightUpdateDisciplinesMutation = () => {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: async (payload: { ids: number[], weight: number }) => {
            const { data } = await api.post<{ message: string }>('/disciplines/bulk-weight', payload)
            return data
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['disciplines'] })
        }
    })
}

export const useBulkStatusUpdateDisciplinesMutation = () => {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: async (payload: { ids: number[], isActive: boolean }) => {
            const { data } = await api.post<{ message: string }>('/disciplines/bulk-status', payload)
            return data
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['disciplines'] })
        }
    })
}

export const useGenerateTopicsForDisciplineMutation = () => {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: async ({ id, syllabusText }: { id: number, syllabusText: string }) => {
            const { data } = await api.post<{ message: string, topicsCreated: number, tokensSpent?: number }>(`/disciplines/${id}/generate-topics`, { syllabusText })
            return data
        },
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['topics', variables.id] })
            queryClient.invalidateQueries({ queryKey: ['disciplines'] })
        }
    })
}
