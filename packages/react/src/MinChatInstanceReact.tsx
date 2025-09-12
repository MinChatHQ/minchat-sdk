import MinChatJs, { type SingleChatProps } from "@minchat/js"

import Chat from "./chat";
import type { ManagerOptions, SocketOptions } from "socket.io-client";
import type { UserProps, GroupChatProps, User, ChatsResponse } from "@minchat/js";
import type { MinChatInstance } from "@minchat/js/dist/minchat-instance";
import type { UpdateUserProps } from "@minchat/js/dist/types/update-user-props";

export class MinChat {
    static getInstance(MINCHAT_API_KEY: string): MinChatInstanceReact {
        return new MinChatInstanceReact(MINCHAT_API_KEY)
    }
}

class MinChatInstanceReact {
    instance: MinChatInstance

    /**
     *  stores any created chat when starting a new chat to avoid recreating the chat over and over 
     * Key is the id of the user you are chatting with
     * value is the chat object
     * */
    //chats json variable with index types of string and value types of Chat
    chats: { [key: string]: Chat | null } = {}



    constructor(MINCHAT_API_KEY: string) {
        this.instance = MinChatJs.getInstance(MINCHAT_API_KEY)
    }

    init(configurations: {
        test: boolean,
        demo?: boolean,
        socketOptions?: Partial<ManagerOptions & SocketOptions>
    }): MinChatInstanceReact {
        this.instance.init(configurations)
        return this
    }


    async createUser(user: UserProps): Promise<User> {
        return await this.instance.createUser(user)
    }

    async fetchUser(username: string): Promise<User> {
        return await this.instance.fetchUser(username)
    }

    async fetchUserById(id: string): Promise<User> {
        return await this.instance.fetchUserById(id)
    }


    async updateUserById(userId: string, user: UpdateUserProps): Promise<User> {
        return await this.instance.updateUserById(userId, user)

    }

    async getChatById(chatId: string): Promise<Chat | undefined> {
        const chat = await this.instance.getChatById(chatId)
        return chat ? new Chat(chat) : undefined
    }

    async getChats(page?: number, limit?: number): Promise<Chat[]> {
        const chats = await this.instance.getChats(page, limit)
        return chats.chats.map(chat => new Chat(chat))
    }


    async connectUser(user: UserProps): Promise<MinChatInstanceReact> {
        await this.instance.connectUser(user)
        return this
    }

    getConnectedUser = (): User | undefined => {
        return this.instance.getConnectedUser()
    }

    async chat(withUsername: string, options?: SingleChatProps): Promise<Chat | null> {
        //check if the chat already exists in the chats json object
        if (this.chats[withUsername]) {
            const foundChat = this.chats[withUsername]
            return foundChat
        } else {
            const jsChat = await this.instance.chat(withUsername, options)
            let chat = null

            if (jsChat) {
                chat = new Chat(jsChat)
                this.chats[withUsername] = chat
            }

            return chat
        }
    }

    async deleteUser(username: string): Promise<Boolean> {
        return await this.instance.deleteUser(username)
    }

    async deleteUserById(id: string): Promise<Boolean> {
        return await this.instance.deleteUserById(id)
    }

    async groupChat(params: GroupChatProps): Promise<Chat | null> {
        //put the id's of the users in the group chat into a string array
        // const ids = params.members.map(member => member.id)
        //sort the array
        // ids.sort()
        //join the array into a string
        // const joinedId = ids.join("-")
        //check if the chat already exists in the chats json object
        // if (this.chats[joinedId]) {
        //     //the chat was already created, so just update any information if necessary
        //     const alreadyExistingChat = this.chats[joinedId]

        //     if (params.name && params.name.trim().length > 0) {
        //         alreadyExistingChat.setName(params.name.trim())
        //         this.chats[joinedId] = alreadyExistingChat
        //     }

        //     return alreadyExistingChat
        // } else {
        const jsChat = await this.instance.groupChat(params)

        let chat = null

        if (jsChat) {
            chat = new Chat(jsChat)
        }
        // this.chats[joinedId] = chat

        return chat
        // }
    }

    /**
     * 
     * @param chatId 
     */
    async deleteChat(chatId: string): Promise<boolean> {
        chatId
        return false
        // return await this.instance.deleteChat(chatId)
    }

}

export default MinChatInstanceReact