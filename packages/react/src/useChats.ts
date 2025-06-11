import { useState, useEffect, useContext } from 'react'
import Chat from './chat'
import MinChatContext from './MinChatContext'
import useMinChat from './useMinChat'
import useUser from './useUser'
import type { FullMessage } from '@minchat/js'

const useChats = () => {
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState()
    const [paginateLoading, setPaginateLoading] = useState(true)

    //keeps track of which pages have already been inserted into the chats state
    const [pagesInserted, setPagesInserted] = useState<number[]>([])

    const [paginationCount, setPaginationCount] = useState(1)

    const { updateChatOrder, chats, setChats, onMessage, onChatNewChat, setOnChatNewChat } = useContext(MinChatContext)



    //** keeps track o how many times the chats get ordered */
    const [chatsOrdered, setChatsOrdered] = useState(0)

    const minChat = useMinChat()

    const user = useUser()

    useEffect(() => {
        if (chats && onChatNewChat) {

            sendToContextOnMessageListener(onChatNewChat.getLastMessage())

            setChats(currentChats => {
                const chatExists = chats.find(chat => chat.getId() === onChatNewChat.getId())

                let updatedChats

                if (chatExists) {
                    // chat exists so just replace the chat object
                    updatedChats = currentChats ? currentChats.map(chat => (
                        chat.getId() === onChatNewChat.getId() ? onChatNewChat : chat
                    )) : currentChats
                } else {
                    // chat doesnt exist so add a new chat
                    updatedChats = currentChats ? [onChatNewChat, ...currentChats] : [onChatNewChat]
                }

                return updatedChats ? orderChats(updatedChats) : updatedChats
            })

        }
    }, [onChatNewChat])




    const orderChats = (chats: Chat[]) => {
        return chats.sort((a, b) => {
            let aTime = null
            let bTime = null
            if (a.jsChat.config.lastMessage) {
                aTime = a.jsChat.config.lastMessage.createdAt
            }
            if (b.jsChat.config.lastMessage) {
                bTime = b.jsChat.config.lastMessage.createdAt
            }

            if (aTime && bTime) {
                const aDate = new Date(aTime)
                const bDate = new Date(bTime)
                return bDate.getTime() - aDate.getTime()
            } else {
                return 0
            }
        })
    }

    useEffect(() => {
        // order the chats by the time of each chat's last sent message
        if (chats) {
            setChats(currentChats => currentChats ? orderChats(currentChats) : undefined)
            setChatsOrdered(count => count + 1)
        }
    }, [chats, updateChatOrder])



    useEffect(() => {
        if (minChat && user) {
            // only query the chats when the minchat object thats in the MinChatContext has been assigned with config properties
            paginate()

            //add onChat listener
            minChat.instance.onChat((jsChat) => {
                const reactChat = new Chat(jsChat)
                setOnChatNewChat && setOnChatNewChat(reactChat)
            })
        }
    }, [minChat, user])


    /**
     * 
     * @param chat the chat that the message was sent in
     */
    const sendToContextOnMessageListener = (message?: FullMessage) => {
        //dont execute the listener if the message was sent by the current user
        if (message && message.user.id !== (user && user.id)) {
            onMessage && onMessage(message)
        }
    }

    const paginate = async () => {
        if (minChat) {
            setPaginateLoading(true)
            setError(undefined)
            const jsChatsList = await minChat.instance.getChats(paginationCount)


            setPaginationCount(count => count + 1)

            if (!pagesInserted.includes(jsChatsList.page)) {
                //add the current page to the list of included pages already
                setPagesInserted(currentPagesInserted => {
                    currentPagesInserted.push(jsChatsList.page)
                    return currentPagesInserted
                })

                const reactChats = jsChatsList.chats.map(jsChat => new Chat(jsChat))

                //todo handle when its an error response

                //add chats to the end of the chats list
                setChats(currentChats => {
                    if (currentChats) {
                        return [...reactChats, ...currentChats]
                    } else {
                        return reactChats
                    }
                })

                setPaginateLoading(false)
                setLoading(false)
            }
        }

    }

    return {
        chats,
        loading,
        error,
        paginate,
        paginateLoading,
        chatsOrdered
    }

}

export default useChats