import Chat from "./chat"
import { MinChatInstance } from "./minchat-instance"

import type { ChatsResponse } from "./types/chats-response"
import type { File, AltFile } from "./types/file"
import type { Message } from "./types/message"
import type { User } from "./types/user"
import type { UserProps } from "./types/user-props"
import type { FullMessage } from "./types/full-message"
import type { GroupChatProps } from "./types/group-chat-props"
import type { SingleChatProps } from "./types/single-chat-props"
import type { MessagesResponse } from "./types/messages-response"
import  type { SendMessage } from "./types/send-message"
import  { Status } from "./enums/status"

class MinChat {
   static getInstance(MINCHAT_API_KEY: string): MinChatInstance {
      return new MinChatInstance(MINCHAT_API_KEY).init({ test: false })
   }
}

// declare global {
//    interface Window {
//       MinChat: {
//          getInstance: (MINCHAT_API_KEY: string | number) => MinChatInstance
//       };
//    }
// }

// if (window) {
//    window.MinChat = {
//       getInstance: MinChat.getInstance
//    }
// }



export { Status }

export type {
   Chat,
   ChatsResponse,
   File,
   AltFile,
   Message,
   User,
   UserProps,
   FullMessage,
   GroupChatProps,
   MessagesResponse,
   SendMessage,
   SingleChatProps,
}


export default MinChat