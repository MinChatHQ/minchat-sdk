import type { AltFile, File } from "./file"

export type GroupChatProps = {
    memberUsernames: string[]
    // memberIds?: string[]
    title?: string
    avatar?: string | File | AltFile | null

    metadata?: Record<string, string | number | boolean>

}