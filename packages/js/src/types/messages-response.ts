import { FullMessage } from "./full-message"

export type MessagesResponse = {
    messages: FullMessage[],
    success: boolean,
    page: number,
    totalMessages: number,
    totalPages: number
}