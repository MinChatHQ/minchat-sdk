import type { User } from "../types/user";
import type { FullMessage } from "../types/full-message";

class ChatConfig {

    channelId?: string = undefined
    members: User[] = []
    memberIds: string[] = []
    
    // keeps track of the members of the chat that are online
    memberIdsOnline: string[] = []

    title: string = ""
    lastMessage?: FullMessage

    //** the channel avatar */
    avatar?: string

    createdAt?: Date

    metadata?: Record<string, string | number | boolean>

}

export default ChatConfig