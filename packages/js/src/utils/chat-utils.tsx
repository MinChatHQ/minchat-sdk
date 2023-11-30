import Chat from "../chat";
import Config from "../configs/config";
import { transformMessage } from "../transformers";

export const processChatItem = async (serverChat: any, config: Config) => {
   const chat = new Chat(config)
   chat.config.channelId = serverChat.id
   chat.config.title = serverChat.title
   chat.config.memberIds = await serverChat.participant_user_ids
   chat.config.lastMessage = transformMessage(serverChat.last_message)

   chat.config.avatar = serverChat.avatar

   return chat

}