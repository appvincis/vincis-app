export type CreateTopicInput = {
    name: string
    description?: string
    disciplineId: number
}

export type UpdateTopicInput = {
    name?: string
    description?: string
    isCompleted?: boolean
}
