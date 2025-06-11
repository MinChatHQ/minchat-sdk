import type { AltFile, File } from "./file"

export type UserProps = {
    username: string
    name: string,
    avatar?: string | File | AltFile | null,
    metadata?: Record<string, string | number | boolean>
}

