import ChatConfig from "./configs/chat-config";
import axios from "axios"
import Config from "./configs/config";
import type { User } from "./types/user";
import type { SendMessage } from "./types/send-message";
import { transformMessage, transformMessagesResponse, transformUser } from "./transformers";
import type { FullMessage } from "./types/full-message";
import type { MessagesResponse } from "./types/messages-response";
import { prepareFileForUpload } from "./utils/file-utils";
import { Status } from "./enums/status";



class Chat {
    // the config object for ChatBunny
    mainConfig: Config
    //the config object for this chat object
    config: ChatConfig

    // Interval for chatbot activity updates
    private _chatbotInterval?: ReturnType<typeof setInterval>

    constructor(minChatConfig: Config) {
        this.mainConfig = minChatConfig
        this.config = new ChatConfig()

        this.onMemberStatusChanged(() => { })

    }

    async setMetaData(metadata: Record<string, string | number | boolean>) {
        if (this.config.channelId) {

            try {

                const response = await axios.patch((this.mainConfig.test ? this.mainConfig.localhostPath : this.mainConfig.productionPath) + '/v1/chat/' + this.config.channelId, {
                    metadata
                },
                    {
                        headers: {
                            Authorization: "Bearer " + this.mainConfig.apiKey
                        },
                    })

                //update the channel id if one does not already exists
                if (response.data.metadata) {
                    this.config.metadata = response.data.metadata
                }

                return response.data.metadata
            } catch (e) {
                console.log(e)
            }

        }
    }

    getMetadata() {
        return this.config.metadata
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

    async addMember(username: string) {
        if (this.config.channelId) {
            try {
                const response = await axios.get((this.mainConfig.test ? this.mainConfig.localhostPath : this.mainConfig.productionPath) + '/v1/user', {
                    headers: {
                        'Authorization': "Bearer " + this.mainConfig.apiKey
                    },
                    params: {
                        username
                    }
                })

                await this.addMemberById(response.data.user.id)

            } catch (e) {
                console.log(e)
            }
        }
    }


    async addMemberById(userId: string) {
        if (this.config.channelId) {

            try {

                const response = await axios.post((this.mainConfig.test ? this.mainConfig.localhostPath : this.mainConfig.productionPath) + '/v1/chat/' + this.config.channelId + '/participants', {
                    user_id: userId
                },
                    {
                        headers: {
                            Authorization: "Bearer " + this.mainConfig.apiKey
                        },
                    })

                // update the members
                if (response.data.success) {
                    const user = transformUser(response.data.participant)

                    //dont add member if its the connected user
                    if (this.mainConfig.user?.id !== user.id) {
                        let isAlreadyMember = false
                        this.config.members.forEach(member => {
                            if (member.id === user.id) isAlreadyMember = true
                        })

                        if (!isAlreadyMember) this.config.members.push(user)

                        if (!this.config.memberIds.includes(user.id)) this.config.memberIds.push(user.id)

                        //its a chatbot that was added
                        if (user.metadata?.chatbotId) {
                            this._initChatbots()
                        }
                    }
                }

            } catch (e) {
                console.log(e)
            }

        }
    }

    async removeMember(username: string) {
        const response = await axios.get((this.mainConfig.test ? this.mainConfig.localhostPath : this.mainConfig.productionPath) + '/v1/user', {
            headers: {
                'Authorization': "Bearer " + this.mainConfig.apiKey
            },
            params: {
                username
            }
        })

        await this.removeMemberById(response.data.user.id)
    }

    async removeMemberById(userId: string) {
        if (this.config.channelId) {

            try {

                const response = await axios.delete((this.mainConfig.test ? this.mainConfig.localhostPath : this.mainConfig.productionPath) + '/v1/chat/' + this.config.channelId + '/participants/' + userId,
                    {
                        headers: {
                            Authorization: "Bearer " + this.mainConfig.apiKey
                        },
                    })


                // update the members
                if (response.data.success) {
                    const user = transformUser(response.data.participant)

                    this.config.members = this.config.members.filter(member => member.id !== user.id)
                    this.config.memberIds = this.config.memberIds.filter(id => id !== user.id)

                }

            } catch (e) {
                console.log(e)
            }

        }
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
    async getMessages(page?: number): Promise<MessagesResponse> {
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
                this._joinRoom()

                const messagesResponse = transformMessagesResponse(response.data)

                return messagesResponse
            } catch (e) {
                // console.log(e)
            }

        }

        const response: MessagesResponse = {
            success: false,
            messages: [],
            page: 0,
            totalMessages: 0,
            totalPages: 0,
        }

        return response
    }

    /**
     * delete a message in the conversation
     * @param messageId 
     */
    async deleteMessage(messageId: string) {
        //emit the message to the socket server
        this.mainConfig?.socket?.emit('message.delete', {
            apiKey: this.mainConfig.apiKey,
            messageId
        })
    }

    /**
     * 
     * @param param0 
     * @param callback - callback function to know the status of the message being sent whether it was successful or there was an error
     */
    async updateMessage(messageId: string, sendMessageData: SendMessage, callback?: (data: FullMessage) => void) {

        await this.mainConfig.waitForInstanceReady()

        let processedFile = prepareFileForUpload(sendMessageData.file)

        //emit the message to the socket server
        this.mainConfig?.socket?.emit('message.update', {
            text: sendMessageData.text,
            file: processedFile?.file,
            metadata: sendMessageData.metadata,
            apiKey: this.mainConfig.apiKey,
            messageId
        },
            (response: any) => {
                const transformedMessage = transformMessage(response)
                //pass on to the callback if it is defined
                callback && transformedMessage && callback(transformedMessage)
            });
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
    _joinRoom() {
        //channel is already defined so listen to the room
        if (this.config.channelId) {
            this.mainConfig?.socket?.emit('room.join', {
                channelId: this.config.channelId,
                apiKey: this.mainConfig.apiKey
            })
        }
    }


    onAiAction(listener: (data: {
        event: string,
        chatbotUsername: string
        chat_id: string
    }) => void) {
        this._joinRoom()
        this.mainConfig?.socket?.on('ai.event', (data: any) => {
            listener && listener(data)
        });
    }

    onMessage(listener: (data: FullMessage) => void) {
        this._joinRoom()
        this.mainConfig?.socket?.on('message', (data: any) => {
            //update the last message
            if (data.success) {
                const transformedMessage = transformMessage(data)
                this.config.lastMessage = transformedMessage

                listener && transformedMessage && listener(transformedMessage)
            }
        });
    }


    onMessageUpdated(listener: (data: FullMessage) => void) {
        this._joinRoom()
        this.mainConfig?.socket?.on('message.update', (data: any) => {
            if (data.success) {
                const transformedMessage = transformMessage(data)
                listener && transformedMessage && listener(transformedMessage)
            }
        });
    }

    onMessageDeleted(listener: (messageId: string) => void) {

        this._joinRoom()
        this.mainConfig?.socket?.on('message.delete', (data: any) => {
            listener && listener(data)
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
        this._joinRoom()
        this.mainConfig?.socket?.on('typing.start', (data: any) => {
            listener && listener(data)
        });
    }

    // handle user stops typing
    onTypingStopped(listener: (user: User) => void) {
        this._joinRoom()
        this.mainConfig?.socket?.on('typing.stop', (data: any) => {
            listener && listener(data)
        });
    }

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


    /**
     * 
     */
    async onMemberStatusChanged(listener: (memberId: string, status: Status) => void) {
        this._joinRoom()

        this.mainConfig?.socket?.on('user.status', (data: { memberId: string, status: string }) => {
            let status: Status | null = null

            // check if the status differs from the already existing status and only execute if its different
            switch (data.status) {
                case "online":
                    // should not previously be in the online array
                    if (!this.config.memberIdsOnline.includes(data.memberId)) {
                        status = Status.ONLINE
                        this.config.memberIdsOnline.push(data.memberId)
                    }
                    break
                default:
                    if (this.config.memberIdsOnline.includes(data.memberId)) {
                        status = Status.OFFLINE
                        this.config.memberIdsOnline = this.config.memberIdsOnline.filter(id => id !== data.memberId)
                    }
                    break
            }


            if (status !== null) {
                listener && listener(data.memberId, status)
            }
        })
    }

    /**
     * 
     */
    _init() {
        this._initChatbots()
        this._initMemberStatusPolling()
    }

    /**
     * 
     */
    private _initMemberStatusPolling() {
        const _makeQuery = () => {

            this.mainConfig?.socket?.emit('user.status', {
                memberId: this.mainConfig.user?.id,
                apiKey: this.mainConfig.apiKey,
                channelId: this.config.channelId
            },
            )
        }

        // execute the first time
        _makeQuery()

        // if its less than 10 members then check trigger 20 seconds, for group chats check trigger 5 minutes
        const interval = this.config.memberIds.length === 10 ? 20_000 : (60_000 * 5)
        setInterval(_makeQuery, interval)
    }

    onError(listener: (data: any) => void) {
        this.mainConfig?.socket?.on('error', (data: any) => {
            listener && listener(data?.message)
        });
    }

    release() {
        this.mainConfig?.socket?.emit('room.leave', {
            channelId: this.config.channelId,
            apiKey: this.mainConfig.apiKey
        })

        this.mainConfig?.socket?.off('message')
        this.mainConfig?.socket?.off('error')

        // Clear chatbot interval if set
        if (this._chatbotInterval) {
            clearInterval(this._chatbotInterval)
            this._chatbotInterval = undefined
        }
    }

    private _initChatbots() {
        // Only set up the interval if it doesn't already exist
        if (this._chatbotInterval) return

        const chatbot = this.config.members.find(member => member.metadata?.chatbotId)

        if (!chatbot) return

        this._chatbotInterval = setInterval(() => {
            for (const member of this.config.members) {
                if (member.metadata && member.metadata.chatbotId) {
                    member.lastActive = new Date()
                    // Ensure chatbot is in memberIdsOnline
                    if (!this.config.memberIdsOnline.includes(member.id)) {
                        this.config.memberIdsOnline.push(member.id)
                    }
                }
            }
        }, 40_000)
    }
}

export default Chat