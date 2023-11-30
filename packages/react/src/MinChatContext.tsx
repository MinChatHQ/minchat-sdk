import { createContext } from "react";
import MinChatInstanceReact from "./MinChatInstanceReact";
import Chat from "./chat";
import { User } from "@minchat/js/dist/types/user";
import { Message } from "@minchat/js/dist/types/message";

//todo possibly persist the cache for messages here
export default createContext<{
    minChat?: MinChatInstanceReact,
    user?: User | null,
    updateChatOrder: number,
    setUpdateChatOrder: any,
    chats?: Chat[],
    setChats: React.Dispatch<React.SetStateAction<Chat[] | undefined>>
    onMessage?: (message: Message) => void
    onChatNewChat?: Chat
    setOnChatNewChat?: React.Dispatch<React.SetStateAction<Chat | undefined>>
}>({
    updateChatOrder: 0,
    setUpdateChatOrder: () => { },
    setChats: () => { },
})