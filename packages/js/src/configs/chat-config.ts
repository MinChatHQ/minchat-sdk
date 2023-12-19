import { User } from "../types/user";
import { FullMessage } from "../types/full-message";

class ChatConfig {

    channelId?: string = undefined
    members: User[] = []
    memberIds: string[] = []


    title: string = ""
    lastMessage?: FullMessage

    //** the channel avatar */
    avatar?: string

    createdAt?: Date
}

export default ChatConfig