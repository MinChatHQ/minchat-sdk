import Chat from "../chat"
import { ChatsResponse } from "../types/chats-response"
import { FullMessage } from "../types/full-message"
import { MessagesResponse } from "../types/messages-response"
import { User } from "../types/user"
import Config from "../configs/config";

/**
 * transform the data from the api into a user object
 */
export const transformUser = (user: any): User => {
    const { created_at, last_active, ...rest } = user

    return {
        ...rest,
        createdAt: new Date(created_at),
        lastActive: new Date(last_active)

    }
}

export const transformMessage = (message: any): FullMessage | undefined => {
    if (message) {
        const { created_at, success, ...rest } = message

        const response = {
            ...rest,
            success,
            createdAt: new Date(created_at),
        }

        if (message.user) {
            response.user = transformUser(message.user)
        }

        return response
    }

    return undefined
}



export const transformMessagesResponse = (messagesResponse: any): MessagesResponse => {
    const { total_messages, total_pages, messages, ...rest } = messagesResponse

    return {
        ...rest,
        messages: messages.map((msg: any) => transformMessage(msg)),
        totalPages: total_pages,
        totalMessages: total_messages,
    }
}



export const transformChat = (serverChat: any, config: Config) => {
    const chat = new Chat(config)
    chat.config.channelId = serverChat.id
    chat.config.title = serverChat.title
    chat.config.memberIds = serverChat.participant_user_ids.filter((id: string) => id !== config.user?.id)
    chat.config.lastMessage = transformMessage(serverChat.last_message)
    chat.config.createdAt = new Date(serverChat.created_at)

    chat.config.avatar = serverChat.avatar

    return chat

}


export const transformChatsResponse = (chatsResponse: any, config: Config): ChatsResponse => {
    const { total_chats, total_pages, chats, ...rest } = chatsResponse

    return {
        ...rest,
        chats: chats.map((chat: any) => transformChat(chat, config)),
        totalPages: total_pages,
        totalChats: total_chats,
    }
}