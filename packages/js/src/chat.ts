import ChatConfig from "./configs/chat-config";
import axios from "axios"
import Config from "./configs/config";
import { User } from "./types/user";
import { SendMessage } from "./types/send-message";
import { transformMessage, transformMessagesResponse } from "./transformers";
import { FullMessage } from "./types/full-message";
import { MessagesResponse } from "./types/messages-response";
import { prepareFileForUpload } from "./utils/file-utils";



class Chat {
    // the config object for ChatBunny
    mainConfig: Config
    //the config object for this chat object
    config: ChatConfig


    constructor(minChatConfig: Config) {
        this.mainConfig = minChatConfig
        this.config = new ChatConfig()
    }


    getId() {
        return this.config.channelId
    }

    getTitle() {
        return this.config.title
    }

    setTitle(title: string) {
        this.config.title = title
    }

    getChatAvatar() {
        return this.config.avatar
    }

    getMembers(): User[] {
        return this.config.members
    }

    getMemberIds(): string[] {
        return this.config.memberIds
    }

    getLastMessage(): FullMessage | undefined {
        return this.config.lastMessage
    }

    /**
     * notify the chat that a message has been seen. if the messageId is not defined then it will notify the chat that the lastMessage has been seen
     */
    setSeen(messageId?: string | null) {
        this.mainConfig?.socket?.emit('message.seen', {
            lastMessageId: messageId || this.config.lastMessage?.id,
            user: this.mainConfig.user,
            apiKey: this.mainConfig.apiKey,
        })
    }



    /**
     * 
     */
    async getMessages(page?: number, callback?: (messages: MessagesResponse) => void): Promise<MessagesResponse> {
        await this.mainConfig.waitForInstanceReady()

        if (this.mainConfig.user || this.mainConfig.demo) {

            try {
                const params = {
                    chat_id: this.config.channelId,
                    user_id: this.mainConfig.user?.id || "demo",
                    page

                }

                //todo dynamically switch url between development and production
                const response = await axios.get((this.mainConfig.test ? this.mainConfig.localhostPath : this.mainConfig.productionPath) + '/v1/messages', {
                    headers: {
                        Authorization: "Bearer " + this.mainConfig.apiKey
                    },
                    params
                })

                //update the channel id if one does not already exists
                if (response.data.channelId && !this.config.channelId) {
                    this.config.channelId = response.data.channelId
                }

                //join the channel
                this.joinRoom()

                const messagesResponse = transformMessagesResponse(response.data)
                callback && callback(messagesResponse)

                return messagesResponse
            } catch (e) {
                console.log(e)
            }

        }

        const response: MessagesResponse = {
            success: false,
            messages: [],
            page: 0,
            totalMessages: 0,
            totalPages: 0,
        }

        callback && callback(response)
        return response

    }

    /**
     * 
     * @param param0 
     * @param callback - callback function to know the status of the message being sent whether it was successful or there was an error
     */
    async sendMessage(sendMessageData: SendMessage, callback?: (data: FullMessage) => void) {

        await this.mainConfig.waitForInstanceReady()

        if (this.mainConfig.user) {
            let dateCreated = new Date()

            const meta = sendMessageData.metadata ? sendMessageData.metadata : {}
            meta.minchatJSIdentifier = dateCreated.toISOString()

            //update the last message of this chat item //update it still even if the message fails to send
            this.config.lastMessage = {
                user: this.mainConfig.user,
                text: sendMessageData.text,
                createdAt: dateCreated,
                metadata: sendMessageData.metadata
            }


            let processedFile = prepareFileForUpload(sendMessageData.file)

            if (processedFile)
                this.config.lastMessage.file = {
                    type: processedFile.type,
                    url: "",
                    size: processedFile.size,
                    name: processedFile.name
                }

            //emit the message to the socket server
            this.mainConfig?.socket?.emit('message', {
                text: sendMessageData.text,
                file: processedFile?.file,
                metadata: sendMessageData.metadata,
                apiKey: this.mainConfig.apiKey,
                chat_id: this.config.channelId,
                user_id: this.mainConfig.user.id,

            },
                // callback function from the socket server which is when when the emit succeeds or fails
                (response: any) => {

                    // let success = false
                    //update the channel id of the chat based on the response from the server
                    if (response && response.chat_id) {
                        this.config.channelId = response.chat_id
                        // success = true
                    }

                    const transformedMessage = transformMessage(response)

                    //update the lastMessage if its still the current sent message that is the last message
                    if (this.config.lastMessage && this.config.lastMessage.metadata?.minchatJSIdentifier === response.metadata?.minchatJSIdentifier) {
                        this.config.lastMessage = transformedMessage
                        // success = true
                    }

                    //pass on to the callback if it is defined
                    callback && transformedMessage && callback(transformedMessage)
                });
        }
    }

    /**
     * an internal function to join the room
     */
    joinRoom() {
        //channel is already defined so listen to the room
        if (this.config.channelId) {
            this.mainConfig?.socket?.emit('room.join', {
                channelId: this.config.channelId,
                apiKey: this.mainConfig.apiKey
            })
        }
    }

    onMessage(listener: (data: FullMessage) => void) {
        this.joinRoom()
        this.mainConfig?.socket?.on('message', (data: any) => {
            //update the last message
            if (data.success) {
                const transformedMessage = transformMessage(data)
                this.config.lastMessage = transformedMessage

                listener && transformedMessage && listener(transformedMessage)
            }
        });

    }

    /**
     * handle on message seen
     * @param listener 
     */
    onMessageSeen(listener: (messageId: string) => void) {
        this.mainConfig?.socket?.on('message.seen', (data: any) => {
            listener && listener(data)
        });
    }


    // handle user starts typing
    onTypingStarted(listener: (user: User) => void) {
        this.joinRoom()
        this.mainConfig?.socket?.on('typing.start', (data: any) => {
            listener && listener(data)
        });
    }

    // handle user stops typing
    onTypingStopped(listener: (user: User) => void) {
        this.joinRoom()
        this.mainConfig?.socket?.on('typing.stop', (data: any) => {
            listener && listener(data)
        });
    }

    // // handle user who just entered the chat
    // onUserLeft(callback: { callback: (user: User) => void }) {

    // }

    // // handle user who just left the chat
    // onUserEntered(callback: { callback: (user: User) => void }) {

    // }

    async startTyping() {
        await this.mainConfig.waitForInstanceReady()

        this.mainConfig?.socket?.emit('typing.start', {
            channelId: this.config.channelId,
            user: this.mainConfig.user,
            apiKey: this.mainConfig.apiKey,
        })
    }

    async stopTyping() {
        await this.mainConfig.waitForInstanceReady()

        this.mainConfig?.socket?.emit('typing.stop', {
            channelId: this.config.channelId,
            user: this.mainConfig.user,
            apiKey: this.mainConfig.apiKey,
        })
    }


    onError(listener: (data: any) => void) {
        this.mainConfig?.socket?.on('error', (data: any) => {
            listener && listener(data.message)
        });
    }

    release() {
        this.mainConfig?.socket?.emit('room.leave', {
            channelId: this.config.channelId,
            apiKey: this.mainConfig.apiKey
        })

        this.mainConfig?.socket?.off('message')
        this.mainConfig?.socket?.off('error')

    }
}

export default Chat