import { AltFile, File } from "./file"

export type GroupChatProps = {
    memberUsernames: string[]
    // memberIds?: string[]
    title?: string
    avatar?: string | File | AltFile
}