import Chat from "./chat"
import Config from "./configs/config"
import { transformChat, transformChatsResponse, transformUser } from "./transformers";
import { ChatsResponse } from "./types/chats-response";
import { GroupChatProps } from "./types/group-chat-props";
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
    async getChats(page?: number, callback?: (chats: ChatsResponse) => void): Promise<ChatsResponse> {
        await this.config.waitForInstanceReady()

        if (this.config.user || this.config.demo) {
            try {

                const params = {
                    user_id: this.config.user?.id || "demo",
                    page
                }

                const response = await axios.get((this.config.test ? this.config.localhostPath : this.config.productionPath) + '/v1/chat/list', {
                    headers: {
                        'Authorization': "Bearer " + this.config.apiKey
                    },
                    params
                })

                //pass the data into the callback
                callback && callback(response.data)

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

        callback && callback(response)
        return response
    }

    onChat(listener: (chat: Chat) => void) {
        this.config.socket?.on('chat', async (data) => {
            if (data.success) {
                const chat = await transformChat(data, this.config)
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


    async fetchUser(username: string, callback?: (user: User) => void): Promise<User> {
        const response = await axios.get((this.config.test ? this.config.localhostPath : this.config.productionPath) + '/v1/user', {
            headers: {
                'Authorization': "Bearer " + this.config.apiKey
            },
            params: {
                username
            }
        })

        callback && callback(response.data.user)
        return transformUser(response.data.user)
    }

    async fetchUserById(id: string, callback?: (user: User) => void): Promise<User> {
        const response = await axios.get((this.config.test ? this.config.localhostPath : this.config.productionPath) + '/v1/user', {
            headers: {
                'Authorization': "Bearer " + this.config.apiKey
            },
            params: {
                id
            }
        })

        callback && callback(response.data.user)
        return transformUser(response.data.user)
    }


    async updateUserById(userId: string, user: UpdateUserProps, callback?: (user: User) => void): Promise<User> {
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

        callback && callback(response.data.user)
        return transformUser(response.data.user)
    }


    async createUser(user: UserProps, callback?: (user: User) => void): Promise<User> {
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
                'Authorization': "Bearer " + this.config.apiKey
            },
        })

        callback && callback(response.data.user)
        return transformUser(response.data.user)
    }

    async getUsers(usernames: string[], callback?: (chats: User[]) => void): Promise<User[]> {

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

        callback && callback(users)
        return users
    }


    async connectUser(user: UserProps, callback?: (chats: MinChatInstance) => void): Promise<MinChatInstance> {
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

        callback && callback(this)
        return this
    }

    getConnectedUser = (): User | undefined => {
        return this.config.user
    }

    async chat(withUsername: string, callback?: (chats: Chat | null) => void): Promise<Chat | undefined> {
        await this.config.waitForInstanceReady()

        if (this.config.user) {
            const chat = new Chat(this.config)
            const members = await this.getUsers([withUsername])

            try {
                const response = await axios.post((this.config.test ? this.config.localhostPath : this.config.productionPath) + '/v1/chat', {
                    usernames: [this.config.user.username, withUsername],
                    user_id: this.config.user.id
                }, {
                    headers: {
                        'Authorization': "Bearer " + this.config.apiKey
                    },
                })

                chat.config.members = members
                chat.config.memberIds = response.data.participant_user_ids?.filter((id: string) => id !== this.config.user?.id)
                chat.config.channelId = response.data.id
                chat.config.avatar = members[0]?.avatar
                chat.config.title = members[0]?.name && members[0]?.name.trim().length > 0 ? members[0].name : "No Name"

            } catch (e) {
                console.log(e)
                callback && callback(null)
                return undefined
            }

            callback && callback(chat)
            return chat
        } else {
            return undefined
        }
    }

    async groupChat({ memberUsernames, title, avatar }: GroupChatProps, callback?: (chats: Chat | null) => void): Promise<Chat | undefined> {
        await this.config.waitForInstanceReady()

        if (this.config.user) {

            const chat = new Chat(this.config)

            let data = new FormData();

            data.append("user_id", this.config.user.id)
            title && data.append("title", title)
            data.append("usernames", this.config.user.username)

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
            chat.config.avatar = response.data.avatar
            chat.config.title = response.data.title && response.data.title.trim().length > 0 ? response.data.title.trim() : "Group Chat"

            callback && callback(chat)
            return chat
        } else {
            return undefined
        }
    }
}