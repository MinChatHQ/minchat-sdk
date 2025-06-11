import type { AltFile, File } from "./file"

export type UpdateUserProps = {
    name?: string,
    avatar?: string | File | AltFile,
    metadata?: Record<string, string | number | boolean>
}

