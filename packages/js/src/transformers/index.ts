import { ChatsResponse } from "../types/chats-response"
import { FullMessage } from "../types/full-message"
import { MessagesResponse } from "../types/messages-response"
import { User } from "../types/user"

/**
 * transform the data from the api into a user object
 */
export const transformUser = (user: any): User => {
    const { created_at, ...rest } = user

    return {
        ...rest,
        createdAt: created_at
    }
}

/**
 * transform the data from the api into a user object
 */
export const transformMessage = (message: any): FullMessage | undefined => {
    if (message) {
        const { created_at, chat_id, ...rest } = message

        const response = {
            ...rest,
            chatId: chat_id,
            createdAt: created_at
        }

        if (message.user) {
            response.user = transformUser(message.user)
        }

        return response
    }

    return undefined
}



export const transformMessagesResponse = (messagesResponse: any): MessagesResponse => {
    const { total_messages, total_pages, ...rest } = messagesResponse

    return {
        ...rest,
        totalPages: total_pages,
        totalMessages: total_messages,
    }
}


export const transformChatsResponse = (chatsResponse: any): ChatsResponse => {
    const { total_chats, total_pages, ...rest } = chatsResponse

    return {
        ...rest,
        totalPages: total_pages,
        totalChats: total_chats,
    }
}