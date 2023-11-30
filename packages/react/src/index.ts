import useMessages from "./useMessages";
import useChats from "./useChats";
import MinChatProvider, { Props as MinChatProviderProps } from "./MinChatProvider";
import useMinChat from "./useMinChat";
import { MinChat } from "./MinChatInstanceReact";
import Chat from "./chat";
import useUser from "./useUser"

import {
   ChatsResponse,
   File,
   AltFile,
   Message,
   User,
   UserProps,
   FullMessage,
   GroupChatProps,
   MessagesResponse,
   SendMessage
} from '@minchat/js'


export {
   MinChatProvider,
   useMinChat,
   useMessages,
   useChats,
   useUser,
   Chat,

   MinChatProviderProps,
   ChatsResponse,
   File,
   AltFile,
   Message,
   User,
   UserProps,
   FullMessage,
   GroupChatProps,
   MessagesResponse,
   SendMessage
}

export default MinChat