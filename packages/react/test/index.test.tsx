import React, { useEffect, useState } from 'react';
import { render, screen, waitFor, } from '@testing-library/react';
// import '@testing-library/jest-dom/extend-expect';
import { Chat, MinChatProvider, useChats, useMessages, useMinChat } from "../src"
import axios from "axios";
import '@testing-library/jest-dom';

describe("MinChat Instance", () => {
    let userId: string
    let apiKey: string

    beforeAll(async () => {
        const response = await axios.get("http://localhost:4000/sdk-test")
        userId = response.data.userId
        apiKey = response.data.apiKey
    })

    afterAll(async () => {
        await axios.post("http://localhost:4000/sdk-test", {
            user_id: userId
        })
    })


    // it('should send and receive messages in group chat', async (done) => {
    //     const user1 = { username: "group-user1", name: "User1" }
    //     const user2 = { username: "group-user2", name: "User2" }
    //     const user3 = { username: "group-user3", name: "User3" }


    //     const instance1 = await prepareInstance(user1)
    //     const instance2 = await prepareInstance(user2)
    //     const instance3 = await prepareInstance(user3)

    //     // keeps track of all the messages that have been sent to be able to compare
    //     const messages: string[] = []

    //     //keeps track of when to call done when the last message gets received
    //     let lastMessageRecievedByCount = 0

    //     // keeps track of the number of messages recieved by each user (used to know who the message came from)
    //     let user1MessageCount = 0
    //     let user2MessageCount = 0
    //     let user3MessageCount = 0


    //     // instance 1 should receive the response
    //     instance1.onChat(async (chat) => {
    //         if (user1MessageCount === 0) {
    //             user1MessageCount++

    //             expect(chat.getLastMessage()?.text).toEqual("Hi")
    //             expect(chat.getLastMessage()?.user.id).toEqual(instance2.config.user.id)
    //             expect(chat.getLastMessage()?.user.username).toEqual(instance2.config.user.username)
    //         } else if (user1MessageCount === 1) {
    //             user1MessageCount++

    //             expect(chat.getLastMessage()?.text).toEqual("Hey")
    //             expect(chat.getLastMessage()?.user.id).toEqual(instance3.config.user.id)
    //             expect(chat.getLastMessage()?.user.username).toEqual(instance3.config.user.username)

    //             const messagesResponse = await chat.getMessages()

    //             expect(messagesResponse.messages.length).toEqual(messages.length)

    //             for (let i = 0; i < messages.length; i++) {
    //                 expect(messagesResponse.messages[i].text).toEqual(messages[i])
    //             }

    //             lastMessageRecievedByCount++
    //             if (lastMessageRecievedByCount === 2) done()
    //         }
    //     })


    //     // instance 2 should receive the initial message 
    //     instance2.onChat(async (chat) => {
    //         if (user2MessageCount === 0) {
    //             user2MessageCount++
    //             expect(chat.getLastMessage()?.text).toEqual("Hello")
    //             expect(chat.getLastMessage()?.user.id).toEqual(instance1.config.user.id)
    //             expect(chat.getLastMessage()?.user.username).toEqual(instance1.config.user.username)

    //             // user 2 send a message back to the group
    //             chat.sendMessage({ text: "Hi" })
    //             messages.push("Hi")
    //         }
    //         else if (user2MessageCount === 1) {
    //             user2MessageCount++
    //             expect(chat.getLastMessage()?.text).toEqual("Hey")
    //             expect(chat.getLastMessage()?.user.id).toEqual(instance3.config.user.id)
    //             expect(chat.getLastMessage()?.user.username).toEqual(instance3.config.user.username)

    //             lastMessageRecievedByCount++
    //             if (lastMessageRecievedByCount === 2) done()
    //         }
    //     })

    //     // instance 3 should receive the initial message
    //     instance3.onChat(async (chat) => {

    //         if (user3MessageCount === 0) {
    //             user3MessageCount++

    //             expect(chat.getLastMessage()?.text).toEqual("Hello")
    //             expect(chat.getLastMessage()?.user.id).toEqual(instance1.config.user.id)
    //             expect(chat.getLastMessage()?.user.username).toEqual(instance1.config.user.username)
    //         } else if (user3MessageCount === 1) {
    //             user3MessageCount++

    //             expect(chat.getLastMessage()?.text).toEqual("Hi")
    //             expect(chat.getLastMessage()?.user.id).toEqual(instance2.config.user.id)
    //             expect(chat.getLastMessage()?.user.username).toEqual(instance2.config.user.username)

    //             // user 3 send a message back to the group
    //             chat.sendMessage({ text: "Hey" })
    //             messages.push("Hey")
    //         }
    //     })

    //     // start by user 1 sending a message to the group
    //     const chat1 = await instance1.groupChat({
    //         memberIds: [instance2.config.user.id, instance3.config.user.id],
    //     })

    //     chat1?.sendMessage({ text: "Hello" })
    //     messages.push("Hello")
    // })



    // it("should indicate typing in 1 on 1 chat", async (done) => {
    //     const user1 = { username: "user1-typing", name: "User1" }
    //     const user2 = { username: "user2-typing", name: "User2" }

    //     const instance1 = await prepareInstance(user1)
    //     const instance2 = await prepareInstance(user2)

    //     const chat1 = await instance1.chat(instance2.config.user.id)

    //     chat1?.sendMessage({ text: "Hello" }, async () => {

    //         const { chats } = await instance2.getChats()
    //         const chat2 = chats[0]

    //         chat2.onTypingStopped((user) => {
    //             expect(user.id).toEqual(instance1.config.user.id)
    //             expect(user.username).toEqual(instance1.config.user.username)

    //             chat2.stopTyping()
    //         })

    //         chat1?.onTypingStopped((user) => {
    //             expect(user.id).toEqual(instance2.config.user.id)
    //             expect(user.username).toEqual(instance2.config.user.username)

    //             done()
    //         })

    //         chat2?.onTypingStarted((user) => {
    //             expect(user.id).toEqual(instance1.config.user.id)
    //             expect(user.username).toEqual(instance1.config.user.username)

    //             chat2.startTyping()
    //         })

    //         chat1?.onTypingStarted((user) => {
    //             expect(user.id).toEqual(instance2.config.user.id)
    //             expect(user.username).toEqual(instance2.config.user.username)

    //             chat1.stopTyping()
    //         })

    //         // wait 2 seconds with await
    //         await new Promise((resolve) => {
    //             setTimeout(() => {
    //                 resolve(null)
    //             }, 2000)
    //         })


    //         chat1?.startTyping()

    //     })

    // })

    it("should not add chat to chats array if a message hasnt been sent", async () => {

        /**
         * 
         */
        const MockComponent = () => {
            const [complete, setComplete] = useState(false)

            const minchat = useMinChat()
            const { chats } = useChats()

            useEffect(() => {
                expect(chats?.length).toBeFalsy()
            }, [chats])


            useEffect(() => {
                if (minchat) {
                    const setupChat = async () => {
                        // test for a new chat to appear on the chats list after you send the first message
                        const createdUser3 = await minchat.createUser({ username: 'minchat-no-chats-inbox1', name: "NO CHats User" })

                        await minchat.chat(createdUser3.username)
                        //wait 6 seconds to see if chats list updates
                        setTimeout(() => setComplete(true), 6_000)
                    }

                    setupChat()
                }
            }, [minchat])

            return <div>{complete && "complete"}</div>;

        };
        render(
            <MinChatProvider
                test
                apiKey={apiKey}
                user={{ username: "no-chat-leak1", name: "No Chat Leak" }}>
                <MockComponent />
            </MinChatProvider>
        );


        await waitFor(() => {
            expect(screen.getByText('complete')).toBeInTheDocument();
        }, { timeout: 15_000 });
    }, 20_000)



    it("should get demo chats and messages", async () => {

        /**
         * 
         */
        const MockComponent = () => {
            const [activeChat, setActiveChat] = React.useState<any>(null)
            const { chats } = useChats()

            useEffect(() => {
                if (chats && chats?.length > 0) {
                    expect(chats.length).toBeGreaterThanOrEqual(1)
                    for (const chat of chats) {
                        expect(chat.getLastMessage()?.createdAt).toBeDefined()
                    }
                    setActiveChat(chats[0])
                }
            }, [chats])

            return <div>
                <ChildComponent
                    chat={activeChat} />
            </div>;
        };

        /**
       * 
       */
        const ChildComponent = ({ chat }: any) => {
            const { messages, sendMessage } = useMessages(chat)
            const [complete, setComplete] = useState(false)

            const messageText = "Hey"

            useEffect(() => {
                const verify = async () => {
                    if (messages) {
                        switch (messages?.length) {

                            case 0:
                                break;
                            case 7:
                                expect(messages.length).toEqual(7)
                                for (const message of messages) {
                                    expect(message?.createdAt).toBeDefined()
                                }
                                sendMessage({ text: messageText })
                                break;
                            case 8:
                                //wait 4 seconds
                                await new Promise((resolve) => {
                                    setTimeout(() => {
                                        resolve(null)
                                    }, 4000)
                                })

                                for (const message of messages) {
                                    expect(message?.createdAt).toBeDefined()
                                }

                                expect(messages[7].text).toEqual(messageText)
                                expect(messages[6].text).not.toEqual(messageText)
                                expect(messages[5].text).not.toEqual(messageText)
                                expect(messages[4].text).not.toEqual(messageText)
                                expect(messages[3].text).not.toEqual(messageText)
                                expect(messages[2].text).not.toEqual(messageText)
                                expect(messages[1].text).not.toEqual(messageText)

                                expect(messages.length).toEqual(8)
                                setComplete(true)
                                break
                            default:
                                throw Error();
                        }
                    }
                }

                verify()

            }, [messages])

            return <div>{complete && "complete"}</div>;
        };

        render(
            <MinChatProvider
                test
                demo
                apiKey={apiKey}
                user={{ username: "demo", name: "demo" }}>
                <MockComponent />
            </MinChatProvider>
        );


        await waitFor(() => {
            expect(screen.getByText('complete')).toBeInTheDocument();
        }, { timeout: 15_000 });
    }, 20_000)


    it('bug fix test: should not have duplicate chats last message', async () => {
        const user1 = { username: "user1-duplicate-message", name: "User1" }
        const user2 = { username: "user2-duplicate-message", name: "User2" }

        const MockComponent1 = () => {

            const [activeChat, setActiveChat] = useState<any>()
            const [activeChat2, setActiveChat2] = useState<any>()
            const [activeChat3, setActiveChat3] = useState<any>()

            const minchat = useMinChat()
            const { sendMessage } = useMessages(activeChat)
            const { sendMessage: sendMessage2 } = useMessages(activeChat2)
            const { sendMessage: sendMessage3 } = useMessages(activeChat3)


            useEffect(() => {
                const executeMessageSend = async () => {
                    if (activeChat) {
                        sendMessage({ text: "Hey" })


                        sendMessage({ text: "Hey" })
                        await new Promise((resolve) => {
                            setTimeout(() => {
                                resolve(null)
                            }, 4_000)
                        })
                        sendMessage({ text: "Hey" })
                    }
                }

                executeMessageSend()
            }, [activeChat])

            useEffect(() => {
                if (activeChat) {
                    sendMessage2({ text: "Hey1" })
                    sendMessage2({ text: "Hey1" })
                    sendMessage2({ text: "Hey1" })
                }
            }, [activeChat2])

            useEffect(() => {
                if (activeChat) {
                    sendMessage3({ text: "Hey2" })
                    sendMessage3({ text: "Hey2" })
                    sendMessage3({ text: "Hey2" })
                }
            }, [activeChat3])

            useEffect(() => {
                const setupChat = async () => {
                    if (minchat) {
                        const createdUser2 = await minchat.createUser(user2)
                        const chat = await minchat.groupChat({ memberUsernames: [createdUser2.username], title: "G1" })
                        const chat2 = await minchat.groupChat({ memberUsernames: [createdUser2.username], title: "G2" })
                        const chat3 = await minchat.groupChat({ memberUsernames: [createdUser2.username], title: "G3" })
                        setActiveChat(chat)
                        setActiveChat2(chat2)
                        setActiveChat3(chat3)


                    }
                }

                setupChat()
            }, [minchat])

            return <div></div>;


        }

        const MockComponent2 = () => {
            const { chats } = useChats() //TODO test when a new chat is recieved
            const [complete, setComplete] = useState(false)


            useEffect(() => {
                const verify = async () => {
                    //verify that the chats dont all have the same last message which would indicate an error
                    if (chats?.length === 3) {
                        // wait 10 seconds for any additional messages to get
                        await new Promise((resolve) => {
                            setTimeout(() => {
                                resolve(null)
                            }, 10_000)
                        })


                        expect(chats[0].getLastMessage()?.text).not.toEqual(chats[1].getLastMessage()?.text)
                        expect(chats[1].getLastMessage()?.text).not.toEqual(chats[2].getLastMessage()?.text)
                        expect(chats[0].getLastMessage()?.text).not.toEqual(chats[2].getLastMessage()?.text)

                        for (const chat of chats) {
                            expect(chat.getLastMessage()?.createdAt).toBeDefined()
                        }
                        setComplete(true)

                    }
                }

                verify()

            }, [chats])

            return <div>{complete && "complete"}</div>;

        }
        render(
            <MinChatProvider
                test
                apiKey={apiKey}
                user={user1}>
                <MockComponent1 />
            </MinChatProvider>
        );



        render(
            <MinChatProvider
                test
                apiKey={apiKey}
                user={user2}>
                <MockComponent2 />
            </MinChatProvider>
        );

        await waitFor(() => {
            expect(screen.getByText('complete')).toBeInTheDocument();
        }, { timeout: 25_000 });
    }, 30_000)

    /**
     * 
     */
    it('should send and receive messages in 1 on 1 chat', async () => {
        const user1 = { username: "user1-send-receive", name: "User1" }
        const user2 = { username: "user2-send-receive", name: "User2" }


        /**
         * USER 1   
         */
        const MockComponent1 = () => {
            const minchat = useMinChat()
            const { chats } = useChats() //TODO test when a new chat is recieved
            const [activeChat, setActiveChat] = React.useState<any>(null)
            const [thirdChat, setThirdChat] = React.useState<any>(null)

            const { sendMessage: thirdChatSendMessage } = useMessages(thirdChat)

            useEffect(() => {
                if (thirdChat) {
                    thirdChatSendMessage({ text: "H" })
                }
            }, [thirdChat])



            let instantiateOnce = false

            useEffect(() => {
                if (chats?.length === 1 && !instantiateOnce) {
                    instantiateOnce = true
                    expect(chats[0].getId()).toEqual(thirdChat?.getId())
                    expect(chats[0].getTitle()).toEqual(thirdChat?.getTitle())

                    for (const chat of chats) {

                        const lastMessage = chat.getLastMessage()

                        if (lastMessage) {
                            expect(chat.getLastMessage()?.createdAt).toBeDefined()
                            expect(chats[0].getMetadata()?.test).toEqual(true)
                        }
                    }

                    const setupChat = async () => {
                        if (minchat) {
                            const createdUser2 = await minchat.createUser(user2)
                            const chat = await minchat.chat(createdUser2.username, { metadata: { test: true } })
                            expect(chat?.getTitle()).toEqual(createdUser2.name)
                            await chat?.setMetaData({ updated: true })
                            expect(chat?.getMetadata()).toEqual({ test: true, updated: true })

                            setActiveChat(chat)
                        }
                    }

                    setupChat()
                }
            }, [chats])

            useEffect(() => {
                if (minchat) {
                    const setupChat = async () => {
                        // test for a new chat to appear on the chats list after you send the first message
                        const createdUser3 = await minchat.createUser({ username: 'minchat-first-message-chat', name: "First Message User" })

                        const chat3 = await minchat.chat(createdUser3.username, { metadata: { test: true } })
                        expect(chat3?.getMetadata()?.test).toEqual(true)

                        setThirdChat(chat3)
                    }

                    setupChat()
                }
            }, [minchat])

            return <div><ChildComponent1
                chat={activeChat} /></div>;
        };


        let messageSent = false

        /**
         * 
         */
        const ChildComponent1 = ({ chat }: any) => {
            const { messages, sendMessage } = useMessages(chat)
            const [complete, setComplete] = useState(false)


            useEffect(() => {
                if (chat && !messageSent) {
                    messageSent = true
                    sendMessage({ text: "Hello" })
                }
            }, [chat])

            useEffect(() => {
                const verify = async () => {
                    if (messages) {
                        switch (messages?.length) {
                            case 0:
                                break
                            case 1:
                                // first message that gets sent
                                expect(messages[0].text).toEqual("Hello")
                                expect(messages[0].user.name).toEqual(user1.name)
                                expect(messages[0].user.username).toEqual(user1.username)
                                for (const message of messages) {
                                    expect(message?.createdAt).toBeDefined()
                                }
                                break
                            case 2:
                                // second message that is received
                                expect(messages[1].text).toEqual("Received")
                                expect(messages[1].user.name).toEqual(user2.name)
                                expect(messages[1].user.username).toEqual(user2.username)
                                for (const message of messages) {
                                    expect(message?.createdAt).toBeDefined()
                                }
                                //wait 4 seconds
                                await new Promise((resolve) => {
                                    setTimeout(() => {
                                        resolve(null)
                                    }, 4000)
                                })


                                expect(messages[0].text).toEqual("Hello")
                                expect(messages[1].text).toEqual("Received")


                                setComplete(true)
                                break
                            default:
                                throw Error()
                        }
                    }
                }

                verify()

            }, [messages])
            return <div>{complete && "complete"}</div>;
        };



        /**
         * USER 2
         */
        const MockComponent2 = () => {

            const [activeChat, setActiveChat] = React.useState<any>(null)
            const { chats } = useChats()

            useEffect(() => {
                if (chats && chats?.length > 0) {
                    setActiveChat(chats[0])
                    expect(chats[0].getTitle()).toEqual(user1.name)
                    expect(chats[0].getMetadata()?.test).toEqual(true)


                }
            }, [chats])

            return <div>
                <ChildComponent2
                    chat={activeChat} />
            </div>;
        };


        let loadingVerified = false

        /**
         * 
         */
        const ChildComponent2 = ({ chat }: any) => {
            const { messages, sendMessage } = useMessages(chat)


            useEffect(() => {
                if (messages) {
                    switch (messages?.length) {
                        case 0:
                            break
                        case 1:
                            // first message that gets sent
                            expect(messages[0].text).toEqual("Hello")
                            expect(messages[0].user.name).toEqual(user1.name)
                            expect(messages[0].user.username).toEqual(user1.username)

                            // wait 4 second to allow for the state of the first component to update
                            setTimeout(() => {
                                sendMessage({ text: "Received" })
                            }, 4000)

                            break
                        case 2:

                            if (!loadingVerified) {
                                loadingVerified = true
                                expect(messages[1].loading).toEqual(true)
                            } else {
                                expect(messages[1].loading).toBeFalsy()
                            }

                            // second message that is received
                            expect(messages[1].text).toEqual("Received")
                            expect(messages[1].user.name).toEqual(user2.name)
                            expect(messages[1].user.username).toEqual(user2.username)
                            break
                        default:
                            throw Error()
                    }
                }
            }, [messages])
            return <div>Hello</div>;
        };

        render(
            <MinChatProvider
                test
                apiKey={apiKey}
                user={user1}>
                <MockComponent1 />
            </MinChatProvider>
        );



        render(
            <MinChatProvider
                test
                apiKey={apiKey}
                user={user2}>
                <MockComponent2 />
            </MinChatProvider>
        );

        await waitFor(() => {
            expect(screen.getByText('complete')).toBeInTheDocument();
        }, { timeout: 25_000 });
    }, 30_000)

    it('should create and fetch users', async () => {


        const MockComponent = () => {
            const minchat = useMinChat()
            const [complete, setComplete] = React.useState<any>(null)


            useEffect(() => {
                if (minchat) {
                    const setup = async () => {
                        const metadata = { test: "test" }
                        const createdUser = await minchat.createUser({ username: "guy-fetch", name: "Hosts", metadata })
                        let fetchedUser = await minchat.fetchUser(createdUser.username)
                        const fetchedUserById = await minchat.fetchUserById(createdUser.id)


                        expect(fetchedUser).toEqual(createdUser)
                        expect(fetchedUserById).toEqual(createdUser)
                        expect(fetchedUser?.metadata).toEqual(metadata)
                        expect(createdUser?.metadata).toEqual(metadata)

                        const newUser = {
                            name: "Updated Name",
                            avatar: "newavatarurl.com",
                            metadata: { test: "test2", age: 23 }
                        }

                        let updatedUser = await minchat.updateUserById(createdUser.id, newUser)
                        fetchedUser = await minchat.fetchUser(createdUser.username)


                        expect(fetchedUser?.metadata).toEqual(newUser.metadata)
                        expect(updatedUser?.metadata).toEqual(newUser.metadata)
                        expect(fetchedUser?.name).toEqual(newUser.name)
                        expect(updatedUser?.name).toEqual(newUser.name)
                        expect(fetchedUser?.avatar).toEqual(newUser.avatar)
                        expect(updatedUser?.avatar).toEqual(newUser.avatar)

                        // check if its able to update just a single field
                        updatedUser = await minchat.updateUserById(createdUser.id, { name: "Jacky" })
                        fetchedUser = await minchat.fetchUser(createdUser.username)

                        expect(fetchedUser?.name).toEqual("Jacky")
                        expect(updatedUser?.name).toEqual("Jacky")

                        setComplete(true)

                    }

                    setup()
                }
            }, [minchat])


            return <div>{complete && "complete"}</div>;

        };


        render(
            <MinChatProvider
                test
                apiKey={apiKey}
                user={{ username: "hey", name: "Hey" }}>
                <MockComponent />
            </MinChatProvider>
        );

        await waitFor(() => {
            expect(screen.getByText('complete')).toBeInTheDocument();
        }, { timeout: 15_000 });
    }, 20_000)


    /**
     * 
     */
    it("should set seen and listen for message seen", async () => {
        const user1 = { username: "user1-seen", name: "User1" }
        const user2 = { username: "user2-seen", name: "User2" }

        /**
         * USER 1   
         */
        const MockComponent1 = () => {
            const { chats } = useChats()

            useEffect(() => {
                if (chats && chats[0]) {
                    chats[0].setSeen()
                }
            }, [chats])

            return <div />
        };

        /**
         * USER 2
         */
        const MockComponent2 = () => {
            const minchat = useMinChat()
            const [activeChat, setActiveChat] = React.useState<any>(null)

            useEffect(() => {
                const setup = async () => {
                    if (minchat) {
                        const user = await minchat.createUser(user1)
                        const chat = await minchat.chat(user.username)
                        setActiveChat(chat)
                    }
                }

                setup()
            }, [minchat])

            return <div>
                <ChildComponent2
                    chat={activeChat} />
            </div>;
        };

        /**
         * 
         */
        const ChildComponent2 = ({ chat }: { chat: Chat }) => {
            const [complete, setComplete] = useState(false)
            const { sendMessage, messages } = useMessages(chat)

            useEffect(() => {
                if (messages && messages[0]?.seen === true) {
                    setComplete(true)
                }
            }, [messages])

            useEffect(() => {
                async function setup() {

                    if (chat) {
                        sendMessage({ text: "Hello" })
                    }
                }

                setup()

            }, [chat])
            return <div>{complete && "complete"}</div>;
        };

        render(
            <MinChatProvider
                test
                apiKey={apiKey}
                user={user1}>
                <MockComponent1 />
            </MinChatProvider>
        );



        render(
            <MinChatProvider
                test
                apiKey={apiKey}
                user={user2}>
                <MockComponent2 />
            </MinChatProvider>
        );

        await waitFor(() => {
            expect(screen.getByText('complete')).toBeInTheDocument();
        }, { timeout: 20_000 });
    }, 30_000)


    /**
    * 
    */
    it('should update and delete message', async () => {
        const user1 = { username: "user1-update-delete", name: "User1" }
        const user2 = { username: "user2-update-delete", name: "User2" }


        /**
         * USER 1   
         */
        const MockComponent1 = () => {
            const minchat = useMinChat()
            const { chats } = useChats()
            const [activeChat, setActiveChat] = React.useState<any>(null)

            let instantiateOnce = false

            useEffect(() => {
                if (!instantiateOnce && minchat) {
                    instantiateOnce = true

                    const setupChat = async () => {
                        const createdUser2 = await minchat.createUser(user2)
                        const chat = await minchat.chat(createdUser2.username)
                        setActiveChat(chat)
                    }

                    setupChat()
                }
            }, [chats])

            return <div><ChildComponent1 chat={activeChat} /></div>;
        };


        let messageSent = false
        let messageUpdated = false

        /**
         * 
         */
        const ChildComponent1 = ({ chat }: any) => {
            const { messages, sendMessage, updateMessage, deleteMessage } = useMessages(chat)
            const [complete, setComplete] = useState(false)

            useEffect(() => {
                async function init() {
                    if (chat && !messageSent) {
                        messageSent = true
                        sendMessage({ text: "Hello" })


                        // wait 1 seconds with await
                        await new Promise((resolve) => {
                            setTimeout(() => {
                                resolve(null)
                            }, 1000)
                        })
                        sendMessage({ text: "Hello2" })
                    }
                }

                init()
            }, [chat])

            useEffect(() => {
                const verify = async () => {
                    if (messages) {
                        switch (messages?.length) {
                            case 0:
                                break
                            case 1:
                                if (messageUpdated) {
                                    expect(messages.length).toEqual(1)
                                    expect(messages[0].text).toEqual("Updated")
                                    setComplete(true)
                                }
                                break
                            case 2:
                                //update the first message
                                if (!messages[0].loading) {
                                    if (!messageUpdated) {
                                        messageUpdated = true

                                        // wait 1 seconds with await
                                        await new Promise((resolve) => {
                                            setTimeout(() => {
                                                resolve(null)
                                            }, 2000)
                                        })

                                        updateMessage(messages[0].id || "", { text: "Updated" })
                                    } else {
                                        if (messages[0].text === "Updated") {
                                            // only delete message if updated message
                                            deleteMessage(messages[1].id || "")
                                        }
                                    }
                                }
                                break
                            default:
                                console.log({ messages })
                                throw Error()
                        }
                    }
                }

                verify()

            }, [messages])

            return <div>{complete && "complete"}</div>;
        };



        render(
            <MinChatProvider
                test
                apiKey={apiKey}
                user={user1}>
                <MockComponent1 />
            </MinChatProvider>
        );

        await waitFor(() => {
            expect(screen.getByText('complete')).toBeInTheDocument();
        }, { timeout: 25_000 });
    }, 30_000)
})


