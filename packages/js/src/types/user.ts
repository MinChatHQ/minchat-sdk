export type User = {
    id: string
    username: string
    name: string
    avatar?: string
    lastActive: Date
    metadata?: Record<string, string | number | boolean>

    createdAt: Date
    updatedAt?: Date
}

