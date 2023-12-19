export type User = {
    id: string
    username: string
    name: string
    avatar?: string
    createdAt: Date
    metadata?: Record<string, string | number>
}

