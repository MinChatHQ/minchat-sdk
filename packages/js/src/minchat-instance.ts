import Chat from "./chat"
import Config from "./configs/config"
import { transformChat, transformChatsResponse, transformUser } from "./transformers";
import { ChatsResponse } from "./types/chats-response";
import { GroupChatProps } from "./types/group-chat-props";
import { SingleChatProps } from "./types/single-chat-props";
import { UpdateUserProps } from "./types/update-user-props";
import { User } from "./types/user"
import { UserProps } from "./types/user-props";
import { prepareFileForUpload } from "./utils/file-utils";
import getAxios from "./utils/get-axios";
import { io, ManagerOptions, SocketOptions } from "socket.io-client"

const axios = getAxios()


export class MinChatInstance {
    config: Config

    constructor(MINCHAT_API_KEY: string) {
        this.config = new Config()
        this.config.apiKey = MINCHAT_API_KEY

    }


    /**
   * 
   */
    async getChats(page?: number): Promise<ChatsResponse> {
        await this.config.waitForInstanceReady()

        if (this.config.user || this.config.demo) {
            try {

                const params = {
                    user_id: this.config.user?.id || "demo",
                    page
                }

                const response = await axios.get((this.config.test ? this.config.localhostPath : this.config.productionPath) + '/v1/chat/list', {
                    headers: {
                        'Authorization': "Bearer " + this.config.apiKey,
                    },
                    params
                })

                //return the data in the function if using async await
                return transformChatsResponse(response.data, this.config)

            } catch (e) {
                console.log(e)
            }
        }

        const response: ChatsResponse = {
            success: false,
            chats: [],
            page: 0,
            totalChats: 0,
            totalPages: 0,
        }

        return response
    }

    onChat(listener: (chat: Chat) => void) {
        this.config.socket?.on('chat', async (data) => {
            if (data.success) {
                const chat = transformChat(data, this.config)
                listener && listener(chat)
            }
        });
    }

    /**
     * used internally to configure the instance as a test or production instance
     * @param test set the value of the test variable, this also initializes the socket connection. determines whether to use localhost or production url
     */
    init(configurations: {
        test: boolean,
        demo?: boolean,
        socketOptions?: Partial<ManagerOptions & SocketOptions>
    }): MinChatInstance {

        this.config.test = configurations.test
        configurations.demo && (this.config.demo = configurations.demo)
        if (configurations.demo) this.config.apiKey = "demo"

        this.config.socketOptions = configurations.socketOptions
        let options = { transports: ['websocket'] }
        if (configurations.socketOptions) options = { ...options, ...configurations.socketOptions }
        this.config.socket = io(this.config.test ? this.config.localhostPath : this.config.productionPath, options);
        return this
    }


    async fetchUser(username: string): Promise<User> {
        const response = await axios.get((this.config.test ? this.config.localhostPath : this.config.productionPath) + '/v1/user', {
            headers: {
                'Authorization': "Bearer " + this.config.apiKey
            },
            params: {
                username
            }
        })

        return transformUser(response.data.user)
    }

    async deleteUser(username: string): Promise<Boolean> {
        const user = await this.fetchUser(username)
        return await this.deleteUserById(user.id)
    }

    async deleteUserById(id: string): Promise<Boolean> {
        const response = await axios.delete((this.config.test ? this.config.localhostPath : this.config.productionPath) + '/v1/user/' + id, {
            headers: {
                'Authorization': "Bearer " + this.config.apiKey
            },
        })

        if (response) {
            return true
        } else {
            return false
        }

    }

    async fetchUserById(id: string): Promise<User> {
        const response = await axios.get((this.config.test ? this.config.localhostPath : this.config.productionPath) + '/v1/user', {
            headers: {
                'Authorization': "Bearer " + this.config.apiKey
            },
            params: {
                id
            }
        })

        return transformUser(response.data.user)
    }


    async updateUserById(userId: string, user: UpdateUserProps): Promise<User> {
        const { avatar, metadata, ...restUser } = user
        const data = new FormData()

        metadata && data.append("metadata", JSON.stringify(metadata))

        Object.entries(restUser).forEach(([key, value]) => {
            data.append(key, value);
        });

        if (avatar) {
            if (typeof avatar === "string") {
                data.append("avatar", avatar)
            } else {
                const avatarFile = prepareFileForUpload(avatar)
                data.append("avatar_file", avatarFile?.file.buffer)
            }
        }



        const response = await axios.patch((this.config.test ? this.config.localhostPath : this.config.productionPath) + '/v1/user/' + userId,
            data,
            {
                headers: {
                    'Authorization': "Bearer " + this.config.apiKey
                },
            })

        return transformUser(response.data.user)
    }


    async createUser(user: UserProps): Promise<User> {
        const { avatar, metadata, ...restUser } = user
        const data = new FormData()

        metadata && data.append("metadata", JSON.stringify(metadata))

        Object.entries(restUser).forEach(([key, value]) => {
            data.append(key, value);
        });

        if (avatar) {
            if (typeof avatar === "string") {
                data.append("avatar", avatar)
            } else {
                const avatarFile = prepareFileForUpload(avatar)
                data.append("avatar_file", avatarFile?.file.buffer)
            }
        }

        const response = await axios.post((this.config.test ? this.config.localhostPath : this.config.productionPath) + '/v1/user', data, {
            headers: {
                'Authorization': "Bearer " + this.config.apiKey,
                'Content-Type': 'multipart/form-data',
            },
        })

        return transformUser(response.data.user)
    }

    async getUsers(usernames: string[]): Promise<User[]> {

        const response = await axios.get((this.config.test ? this.config.localhostPath : this.config.productionPath) + '/v1/user/list', {
            headers: {
                'Authorization': "Bearer " + this.config.apiKey
            },
            params: {
                usernames
            }
        })


        const users: User[] = []

        response.data.users.forEach((user: any) => {
            users.push(transformUser(user))
        })

        return users
    }


    async connectUser(user: UserProps): Promise<MinChatInstance> {
        if (user) {
            if (this.config.user?.id) {
                //remove old user from listening to the user room events if user variable is defined
                this.config.socket?.emit('room.user.leave',
                    {
                        channelUserId: this.config.user.id,
                        apiKey: this.config.apiKey
                    })
            }

            this.config.user = await this.createUser(user)

            //add the new user to be listening to the user room events`

            this.config.socket?.emit('room.user.join', {
                channelUserId: this.config.user.id,
                apiKey: this.config.apiKey
            })
        }

        return this
    }

    getConnectedUser = (): User | undefined => {
        return this.config.user
    }

    async chat(withUsername: string, options?: SingleChatProps): Promise<Chat | undefined> {
        await this.config.waitForInstanceReady()

        if (this.config.user) {
            const chat = new Chat(this.config)
            const members = await this.getUsers([withUsername])

            try {
                const response = await axios.post((this.config.test ? this.config.localhostPath : this.config.productionPath) + '/v1/chat', {
                    usernames: [this.config.user.username, withUsername],
                    user_id: this.config.user.id,
                    metadata: options?.metadata
                }, {
                    headers: {
                        'Authorization': "Bearer " + this.config.apiKey
                    },
                })

                chat.config.members = members
                chat.config.memberIds = response.data.participant_user_ids?.filter((id: string) => id !== this.config.user?.id)
                chat.config.channelId = response.data.id
                chat.config.metadata = response.data.metadata
                chat.config.avatar = members[0]?.avatar
                chat.config.title = members[0]?.name && members[0]?.name.trim().length > 0 ? members[0].name : "No Name"

            } catch (e) {
                console.log(e)
                return undefined
            }

            return chat
        } else {
            return undefined
        }
    }

    async groupChat({ memberUsernames, title, avatar, metadata }: GroupChatProps): Promise<Chat | undefined> {
        await this.config.waitForInstanceReady()

        if (this.config.user) {

            const chat = new Chat(this.config)

            let data = new FormData();

            data.append("user_id", this.config.user.id)
            title && data.append("title", title)
            data.append("usernames", this.config.user.username)
            metadata && data.append("metadata", JSON.stringify(metadata))

            for (const username of memberUsernames) {
                data.append("usernames", username)
            }


            if (avatar) {
                if (typeof avatar === "string") {
                    data.append("avatar", avatar)
                } else {
                    const avatarFile = prepareFileForUpload(avatar)
                    avatarFile && data.append("avatar_file", avatarFile?.file.buffer)

                }
            }

            const response = await axios.post((this.config.test ? this.config.localhostPath : this.config.productionPath) + '/v1/chat', data, {
                headers: {
                    'Authorization': "Bearer " + this.config.apiKey,
                    "Content-Type": "multipart/form-data",
                    "Accept": "application/json"
                },
            })


            chat.config.members = await this.getUsers(memberUsernames)
            chat.config.memberIds = response.data.participant_user_ids?.filter((id: string) => id !== this.config.user?.id)
            chat.config.channelId = response.data.id
            chat.config.metadata = response.data.metadata
            chat.config.avatar = response.data.avatar
            chat.config.title = response.data.title && response.data.title.trim().length > 0 ? response.data.title.trim() : "Group Chat"

            return chat
        } else {
            return undefined
        }
    }

    async deleteChat(chatId: string): Promise<boolean> {
        try {
            const response = await axios.delete((this.config.test ? this.config.localhostPath : this.config.productionPath) + '/v1/chat/' + chatId, {
                headers: {
                    'Authorization': "Bearer " + this.config.apiKey
                },
            });

            return response.data.success
        } catch (e) {
            return false
        }
    }
}