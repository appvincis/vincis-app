export type CreateUserInput = {
    email: string
    name?: string
}

export type CreateUserFromAuthInput = {
    supabaseId: string
    email: string
    name?: string
}

export type UpdateUserInput = {
    email?: string
    name?: string
}