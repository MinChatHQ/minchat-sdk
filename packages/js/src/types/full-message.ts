import type { Message } from "./message";
import type { User } from "./user";

export interface FullMessage extends Message {
    user: User
    loading?: boolean
}