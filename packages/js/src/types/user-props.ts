import { AltFile, File } from "./file"

export type UserProps = {
    username: string
    name: string,
    avatar?: string | File | AltFile,
    metadata?: Record<string, string | number>
}

