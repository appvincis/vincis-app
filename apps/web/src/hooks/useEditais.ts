import { useQuery, useMutation, useQueryClient } from '@tanstack/vue-query';
import { api } from '../lib/axios';

export interface Edital {
    id: number;
    title: string;
    description?: string;
    fileUrl: string;
    fileSize: number;
    createdAt: string;
    parsedContent?: string;
}

export const useEditaisQuery = () => {
    return useQuery({
        queryKey: ['editais'],
        queryFn: async () => {
            const { data } = await api.get<Edital[]>('/editais');
            return data;
        }
    });
};

export const useCreateEditalMutation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (formData: FormData) => {
            const { data } = await api.post<Edital>('/editais', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['editais'] });
        }
    });
};

export const useDeleteEditalMutation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (id: number) => {
            await api.delete(`/editais/${id}`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['editais'] });
        }
    });
};

export const useEditalSignedUrlMutation = () => {
    return useMutation({
        mutationFn: async (id: number) => {
            const { data } = await api.get<{ signedUrl: string }>(`/editais/${id}/url`);
            return data.signedUrl;
        }
    });
};

export const useExtractEditalMutation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (id: number) => {
            const { data } = await api.post<{ message: string; disciplinesCreated: number; topicsCreated: number; tokensSpent?: number }>(`/editais/${id}/extract`);
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['disciplines'] });
        }
    });
};
