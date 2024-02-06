type File = {
    type: "gif" | "video" | "image" | "file"
    url: string
    name?: string
    size?: string
}

export type Message = {
    id?: string
    text?: string
    file?: File
    // tracks whether the message has been seen or not
    seen?: boolean
    metadata?: Record<string, string | number | boolean>

    createdAt?: Date
    updatedAt?: Date
}