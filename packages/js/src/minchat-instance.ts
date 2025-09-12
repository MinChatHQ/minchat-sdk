import Chat from "./chat"
import Config from "./configs/config"
import { transformChat, transformChatsResponse, transformUser } from "./transformers";
import type { ChatsResponse } from "./types/chats-response";
import type { GroupChatProps } from "./types/group-chat-props";
import type { SingleChatProps } from "./types/single-chat-props";
import type { UpdateUserProps } from "./types/update-user-props";
import type { User } from "./types/user"
import type { UserProps } from "./types/user-props";
import { prepareFileForUpload } from "./utils/file-utils";
import { io, type ManagerOptions, type SocketOptions } from "socket.io-client"

export class MinChatInstance {
    config: Config

    constructor(MINCHAT_API_KEY: string) {
        this.config = new Config()
        this.config.apiKey = MINCHAT_API_KEY

    }

    async getChatById(chatId: string): Promise<Chat | undefined> {
        await this.config.waitForInstanceReady()
        if (this.config.user || this.config.demo) {
            const response = await fetch((this.config.test ? this.config.localhostPath : this.config.productionPath) + '/v1/chat/' + chatId, {
                headers: {
                    'Authorization': "Bearer " + this.config.apiKey
                }
            });
            const data = await response.json();
            return transformChat(data, this.config);
        } else {
            return undefined
        }
    }

    /**
   * 
   */
    async getChats(page?: number, limit?: number): Promise<ChatsResponse> {
        await this.config.waitForInstanceReady()

        if (this.config.user || this.config.demo) {
            try {
                const params = new URLSearchParams({
                    user_id: this.config.user?.id || "demo",
                    ...(page !== undefined ? { page: String(page) } : {}),
                    ...(limit !== undefined ? { limit: String(limit) } : {})
                });
                const response = await fetch((this.config.test ? this.config.localhostPath : this.config.productionPath) + '/v1/chat/list?' + params.toString(), {
                    headers: {
                        'Authorization': "Bearer " + this.config.apiKey,
                    }
                });
                const data = await response.json();
                return transformChatsResponse(data, this.config);
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
        let options: any = { transports: ['websocket'] }
        if (configurations.socketOptions) options = { ...options, ...configurations.socketOptions }
        this.config.socket = io(this.config.test ? this.config.localhostPath : this.config.productionPath, options);
        return this
    }


    async fetchUser(username: string): Promise<User> {
        const params = new URLSearchParams({ username });
        const response = await fetch((this.config.test ? this.config.localhostPath : this.config.productionPath) + '/v1/user?' + params.toString(), {
            headers: {
                'Authorization': "Bearer " + this.config.apiKey
            }
        });
        const data = await response.json();
        return transformUser(data.user);
    }

    async deleteUser(username: string): Promise<Boolean> {
        const user = await this.fetchUser(username)
        return await this.deleteUserById(user.id)
    }

    async deleteUserById(id: string): Promise<Boolean> {
        const response = await fetch((this.config.test ? this.config.localhostPath : this.config.productionPath) + '/v1/user/' + id, {
            method: 'DELETE',
            headers: {
                'Authorization': "Bearer " + this.config.apiKey
            }
        });
        if (response.ok) {
            return true;
        } else {
            return false;
        }
    }

    async fetchUserById(id: string): Promise<User> {
        const params = new URLSearchParams({ id });
        const response = await fetch((this.config.test ? this.config.localhostPath : this.config.productionPath) + '/v1/user?' + params.toString(), {
            headers: {
                'Authorization': "Bearer " + this.config.apiKey
            }
        });
        const data = await response.json();
        return transformUser(data.user);
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

        const response = await fetch((this.config.test ? this.config.localhostPath : this.config.productionPath) + '/v1/user/' + userId, {
            method: 'PATCH',
            headers: {
                'Authorization': "Bearer " + this.config.apiKey
            },
            body: data
        });
        const resData = await response.json();
        return transformUser(resData.user);
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

        const response = await fetch((this.config.test ? this.config.localhostPath : this.config.productionPath) + '/v1/user', {
            method: 'POST',
            headers: {
                'Authorization': "Bearer " + this.config.apiKey
            },
            body: data
        });
        const resData = await response.json();
        return transformUser(resData.user);
    }

    async getUsers(usernames: string[]): Promise<User[]> {
        const params = new URLSearchParams();
        usernames.forEach(u => params.append('usernames[]', u));
        const response = await fetch((this.config.test ? this.config.localhostPath : this.config.productionPath) + '/v1/user/list?' + params.toString(), {
            headers: {
                'Authorization': "Bearer " + this.config.apiKey
            }
        });
        const data = await response.json();

        const users: User[] = [];
        data.users.forEach((user: any) => {
            users.push(transformUser(user));
        });
        return users;
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
                const response = await fetch((this.config.test ? this.config.localhostPath : this.config.productionPath) + '/v1/chat', {
                    method: 'POST',
                    headers: {
                        'Authorization': "Bearer " + this.config.apiKey,
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        usernames: [this.config.user.username, withUsername],
                        user_id: this.config.user.id,
                        metadata: options?.metadata
                    })
                });
                const resData = await response.json();
                chat.config.members = members;
                chat.config.memberIds = resData.participant_user_ids?.filter((id: string) => id !== this.config.user?.id);
                chat.config.channelId = resData.id;
                chat.config.metadata = resData.metadata;
                chat.config.avatar = members[0]?.avatar;
                chat.config.title = members[0]?.name && members[0]?.name.trim().length > 0 ? members[0].name : "No Name";
                chat._init();
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

            const response = await fetch((this.config.test ? this.config.localhostPath : this.config.productionPath) + '/v1/chat', {
                method: 'POST',
                headers: {
                    'Authorization': "Bearer " + this.config.apiKey,
                    'Accept': 'application/json'
                },
                body: data
            });
            const resData = await response.json();
            chat.config.members = await this.getUsers(memberUsernames);
            chat.config.memberIds = resData.participant_user_ids?.filter((id: string) => id !== this.config.user?.id);
            chat.config.channelId = resData.id;
            chat.config.metadata = resData.metadata;
            chat.config.avatar = resData.avatar;
            chat.config.title = resData.title && resData.title.trim().length > 0 ? resData.title.trim() : "Group Chat";
            chat._init();

            return chat
        } else {
            return undefined
        }
    }

    async deleteChat(chatId: string): Promise<boolean> {
        try {
            const response = await fetch((this.config.test ? this.config.localhostPath : this.config.productionPath) + '/v1/chat/' + chatId, {
                method: 'DELETE',
                headers: {
                    'Authorization': "Bearer " + this.config.apiKey
                }
            });
            const data = await response.json();
            console.log({ data })
            return data.success;
        } catch (e) {
            console.log({ e })
            return false
        }
    }
}