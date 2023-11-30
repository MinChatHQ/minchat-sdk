import React, { useEffect, useState } from 'react'
import { ManagerOptions, SocketOptions } from 'socket.io-client'
import MinChatContext from './MinChatContext'
import { UserProps } from '@minchat/js/dist/types/user-props'
import { Message } from '@minchat/js/dist/types/message'
import { User } from '@minchat/js/dist/types/user'
import MinChatInstanceReact, { MinChat } from './MinChatInstanceReact'
import Chat from './chat'

export type Props = {
    apiKey: string
    children?: any
    user: UserProps
    demo?: boolean
    test?: boolean
    socketOptions?: Partial<ManagerOptions & SocketOptions>
    onMessage?: (message: Message) => void
}

export default function MinChatProvider({
    apiKey,
    children,
    user,
    demo = false,
    test = false,
    socketOptions,
    onMessage
}: Props) {

    const [minchat, setMinchat] = useState<MinChatInstanceReact>()


    // is called to reorder the chats array when a new message is sent or recieved 
    const [updateChatOrder, setUpdateChatOrder] = useState<number>(0)

    const [chats, setChats] = useState<Chat[]>()

    //keeps track of the chat objects (conversations)
    const [onChatNewChat, setOnChatNewChat] = useState<Chat>()

    /** 
     * this is the user thats stored in the MinChat context
    */
    const [contextUser, setContextUser] = useState<User | null>()



    useEffect(() => {
        const setupMinChat = async () => {
            const instance = MinChat.getInstance(apiKey).init({ test, demo, socketOptions })
            setMinchat(instance)
        }

        setupMinChat()

    }, [])

    useEffect(() => {
        if (minchat && user) {
            const updateConnectedUser = async () => {
                await minchat.connectUser(user)
                setContextUser(minchat.instance.getConnectedUser())
            }

            updateConnectedUser()
        }
    }, [user, minchat])




    return <MinChatContext.Provider value={{
        minChat: minchat,
        updateChatOrder,
        setUpdateChatOrder,
        chats,
        setChats,
        onMessage,
        user: contextUser,
        onChatNewChat,
        setOnChatNewChat
    }} >{children}</MinChatContext.Provider>

}