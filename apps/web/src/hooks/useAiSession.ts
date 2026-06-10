import { useQuery, useMutation, useQueryClient } from '@tanstack/vue-query'
import { computed, type Ref } from 'vue'
import { api } from '../lib/axios'

export interface AiSession {
    id: string
    title: string
    updatedAt: string
    editalId?: number | null
    messages?: AiMessage[]
}

export interface AiMessage {
    id: string
    role: 'user' | 'assistant'
    content: string
    tokens?: number | null
    createdAt: string
    sessionId: string
}

export const useAiSessionsQuery = () => {
    return useQuery({
        queryKey: ['ai-sessions'],
        queryFn: async () => {
            const { data } = await api.get<AiSession[]>('/ai/sessions')
            return data
        }
    })
}

export const useAiSessionQuery = (sessionId: Ref<string | null>) => {
    return useQuery({
        queryKey: computed(() => ['ai-sessions', sessionId.value]),
        queryFn: async () => {
            if (!sessionId.value) return null
            const { data } = await api.get<AiSession>(`/ai/sessions/${sessionId.value}`)
            return data
        },
        enabled: computed(() => !!sessionId.value)
    })
}

export const useDeleteAiSessionMutation = () => {
    const queryClient = useQueryClient()
    
    return useMutation({
        mutationFn: async (sessionId: string) => {
            const { data } = await api.delete(`/ai/sessions/${sessionId}`)
            return data
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['ai-sessions'] })
        }
    })
}
