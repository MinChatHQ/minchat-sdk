import Chat from "./chat"
import { MinChatInstance } from "./minchat-instance"

import { ChatsResponse } from "./types/chats-response"
import { File, AltFile } from "./types/file"
import { Message } from "./types/message"
import { User } from "./types/user"
import { UserProps } from "./types/user-props"
import { FullMessage } from "./types/full-message"
import { GroupChatProps } from "./types/group-chat-props"
import { MessagesResponse } from "./types/messages-response"
import { SendMessage } from "./types/send-message"
import { Status } from "./enums/status"

class MinChat {
   static getInstance(MINCHAT_API_KEY: string): MinChatInstance {
      return new MinChatInstance(MINCHAT_API_KEY)
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



export {
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
   Status
}


export default MinChat