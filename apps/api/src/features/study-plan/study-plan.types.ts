export type CreateStudyPlanInput = {
    name: string
    description: string
    is_active: boolean
}

export type UpdateStudyPlanInput = {
    name?: string
    description?: string
}