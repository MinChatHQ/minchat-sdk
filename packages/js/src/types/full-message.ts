import { Message } from "./message";
import { User } from "./user";

export interface FullMessage extends Message {
    user: User
    loading?: boolean
}