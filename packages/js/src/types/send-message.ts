import type { AltFile, File } from "./file"

export type SendMessage = {
    text?: string
    file?: File | AltFile | null
    metadata?: Record<string, string | number | boolean>
}
