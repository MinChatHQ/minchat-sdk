import MinChatJs from "@minchat/js"

import Chat from "./chat";
import { ManagerOptions, SocketOptions } from "socket.io-client";
import { UserProps } from "@minchat/js/dist/types/user-props";
import { MinChatInstance } from "@minchat/js/dist/minchat-instance";
import { GroupChatProps } from "@minchat/js/dist/types/group-chat-props";
import { User } from "@minchat/js/dist/types/user";
import { UpdateUserProps } from "@minchat/js/dist/types/update-user-props";

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


    async createUser(user: UserProps, callback?: (user: User) => void): Promise<User> {
        return await this.instance.createUser(user, callback)
    }

    async fetchUser(username: string, callback?: (user: User) => void): Promise<User> {
        return await this.instance.fetchUser(username, callback)
    }

    async fetchUserById(id: string, callback?: (user: User) => void): Promise<User> {
        return await this.instance.fetchUserById(id, callback)
    }


    async updateUserById(userId: string, user: UpdateUserProps, callback?: (user: User) => void): Promise<User> {
        return await this.instance.updateUserById(userId, user, callback)

    }


    async connectUser(user: UserProps): Promise<MinChatInstanceReact> {
        await this.instance.connectUser(user)
        return this
    }

    async chat(withUsername: string, callback?: (chats: Chat | null) => void): Promise<Chat | null> {
        //check if the chat already exists in the chats json object
        if (this.chats[withUsername]) {
            const foundChat = this.chats[withUsername]
            callback && callback(foundChat)
            return foundChat
        } else {
            const jsChat = await this.instance.chat(withUsername)
            let chat = null

            if (jsChat) {
                chat = new Chat(jsChat)
                this.chats[withUsername] = chat
            }

            callback && callback(chat)
            return chat
        }
    }

    async groupChat(params: GroupChatProps, callback?: (chats: Chat | null) => void): Promise<Chat | null> {
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

        callback && callback(chat)
        return chat
        // }
    }
}

export default MinChatInstanceReact