import Chat from "../chat"

export type ChatsResponse = {
    chats: Chat[],
    success: boolean,
    page: number,
    totalChats: number,
    totalPages: number
 }