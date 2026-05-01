export type CreateDisciplineInput = {
    name: string
    color: string
    weight?: number
}

export type UpdateDisciplineInput = {
    name?: string
    color?: string
    weight?: number
}
