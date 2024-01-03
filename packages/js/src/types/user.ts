export type User = {
    id: string
    username: string
    name: string
    avatar?: string
    createdAt: Date
    lastActive: Date
    metadata?: Record<string, string | number | boolean>
}

