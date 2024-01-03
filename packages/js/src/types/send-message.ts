import { AltFile, File } from "./file"


export type SendMessage = {
    text?: string
    file?: File | AltFile
    metadata?: Record<string, string | number | boolean>
}
