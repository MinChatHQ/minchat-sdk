import { useState, useEffect, useContext } from 'react'
import Chat from './chat'
import MinChatContext from './MinChatContext'
import useUser from './useUser'
import { FullMessage } from '@minchat/js/dist/types/full-message'
import { SendMessage } from '@minchat/js/dist/types/send-message'
import { MessagesResponse } from '@minchat/js/dist/types/messages-response'

/**
 * 
 * @param chat - the chat object to get messages for
 * @param reverse - whether to reverse the order of the messages
 * @returns 
 */
const useMessages = (chat?: Chat, reverse?: boolean) => {

    const [messages, setMessages] = useState<Array<FullMessage>>()/*<Array<{ userId: string, text: string }>>*/
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState()
    const [paginateLoading, setPaginateLoading] = useState(true)

    const user = useUser()

    const { setUpdateChatOrder, setChats, chats, setOnChatNewChat } = useContext(MinChatContext)

    const [paginationCount, setPaginationCount] = useState(1)

    //keeps track of which pages have already been inserted into the chats state
    const [pagesInserted, setPagesInserted] = useState<number[]>([])


    useEffect(() => {
        //find the exact channel in the chats array and update its information because the messages have beeing successfully retrieved
        //which means the chat objects channel Id has be updated and can be found in the chats array
        if (chats && messages && chat) {
            setChats((currentChats) => {
                if (!currentChats) return []

                return currentChats.map(chatItem => {
                    if (chatItem.getId() === chat.getId()) {
                        //determine whether to set the group name to the chats object chat or to the local chat object
                        if (chat.getTitle() !== "Group Chat") {
                            chatItem.setTitle(chat.getTitle())
                        } else {
                            chat.setTitle(chatItem.getTitle())
                        }
                    }
                    return chatItem
                })
            })
        }
    }, [messages])

    useEffect(() => {
        //the paginationCount has been reset because the chat object has changed so query first page of messages
        if (paginationCount == 1 && pagesInserted.length == 0) {
            //query messages of new chat object

            paginate()
        }
    }, [paginationCount, pagesInserted])


    useEffect(() => {
        setPaginationCount(1)
        setPagesInserted([])

        if (chat) {
            //the chat object has changed so clear the list of messages of the previous chat object and start loading to query new messages
            setMessages(undefined)
            setLoading(true)
            setPaginateLoading(true)

            chat.jsChat.onMessage((message: FullMessage) => {
                /** a new message has been received */
                if (message) {

                    addNewMessage(message)

                    setUpdateChatOrder((val: number) => val + 1)
                } else {
                    console.log("error")
                }
            })

            chat.jsChat.onError((error: any) => {
                setError(error)
            })
        }
        return () => {
            if (chat) {
                chat.release()
            }
        };

    }, [chat])


    /**
     * add a new message to the messages array
     */
    const addNewMessage = (message: FullMessage) => {
        setMessages((existingData) => {
            const newMessages = existingData ? [...existingData] : []
            if (reverse) {
                newMessages.unshift(message)
            } else {
                newMessages.push(message)
            }

            return newMessages
        })
    }

    /**
     * 
     */
    const paginate = async () => {
        setPaginateLoading(true)
        setError(undefined)
        let messageResponse: MessagesResponse | null = null
        if (chat) {
            messageResponse = await chat.jsChat.getMessages(paginationCount)
        }

        setPaginationCount(count => count + 1)

        //todo handle when its an error response
        if (messageResponse && !pagesInserted.includes(messageResponse.page)) {

            //add the current page to the list of included pages already
            setPagesInserted(currentPagesInserted => {
                if (messageResponse) {
                    currentPagesInserted.push(messageResponse.page)
                }
                return currentPagesInserted
            })

            //add chats to the end of the chats list
            setMessages((currentMessages) => {
                // clean up the current messages by replacing any temporary messages
                const newCurrentMessages = currentMessages && currentMessages.map((message: FullMessage) => {
                    if (message.metadata && message.metadata.replacedWithServerData && messageResponse) {
                        // go through all the server messages to determine which one needs to be replaced onto the local messages
                        for (const serverMessage of messageResponse.messages) {
                            if ((serverMessage.metadata && serverMessage.metadata.minchatMessageIdentifier) === message.metadata.minchatMessageIdentifier) {
                                return serverMessage
                            }
                        }

                    }
                    return message
                })

                const currentMessagesSet = new Set(newCurrentMessages && newCurrentMessages.map(({ id }) => id))

                //do not add a message that already exists in the messages array
                const messagesResponseArray = messageResponse && messageResponse.messages.filter((message: FullMessage) => !currentMessagesSet.has(message.id))

                // TODO do the messages need to be ordered by date?

                if (messagesResponseArray) {
                    if (newCurrentMessages) {
                        if (reverse) {
                            return [...newCurrentMessages, ...messagesResponseArray.reverse()]
                        } else {
                            return [...messagesResponseArray, ...newCurrentMessages]
                        }
                    } else {
                        if (reverse) {
                            return messagesResponseArray.reverse()
                        } else {
                            return messagesResponseArray
                        }
                    }
                } else {
                    return newCurrentMessages
                }
            })
            setLoading(false)
        }

        setPaginateLoading(false)

    }


    /**
    * 
    * @param param0 
    * @param callback - callback function to know the status of the message being sent whether it was successful or there was an error
    */
    const sendMessage = (message: SendMessage, callback?: (data: FullMessage) => void) => {

        if (chat) {
            setOnChatNewChat && setOnChatNewChat(chat)

            const dateCreated = new Date().toISOString()
            const meta = message.metadata ? message.metadata : {}
            meta.minchatMessageIdentifier = dateCreated

            if (user) {
                addNewMessage({
                    text: message.text,
                    user: user,
                    loading: true,
                    createdAt: dateCreated,
                    id: dateCreated,
                    metadata: {
                        ...meta,
                        replacedWithServerData: "true"
                    }
                })
            }

            chat.jsChat.sendMessage({
                ...message,
                metadata: meta,
            }, (data: FullMessage) => {

                //find and replace the message that has the same created_at value as the one thats returned in the data object
                if (data) {
                    setMessages((messagesValue: any) => {
                        if (!messagesValue) return messagesValue

                        const newMessages = messagesValue.map((message: FullMessage) => {
                            if ((message.metadata && message.metadata.minchatMessageIdentifier) === dateCreated) {
                                return data
                            } else {
                                return message
                            }
                        })

                        return newMessages
                    })
                }

                //execute the callback function
                if (callback) {
                    callback(data)
                }
            })

            setUpdateChatOrder((val: number) => val + 1)
        }
    }

    return {
        messages,
        loading,
        error,
        paginate,
        sendMessage,
        paginateLoading
    }

}

export default useMessages