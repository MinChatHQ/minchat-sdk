import MinChat, { } from '..';
import { LOCALHOST_PATH } from '../configs/config';
import { UserProps } from '../types/user-props';
import getAxios from '../utils/get-axios';


// TODO VERIFY THE PAGES SYSTEM WORKS FOR CHATS AND MESSAGES

describe("MinChat Instance", () => {
    let userId: string
    let apiKey: string

    beforeAll(async () => {
        const response = await getAxios().get(LOCALHOST_PATH + "/sdk-test")
        userId = response.data.userId
        apiKey = response.data.apiKey
    })

    afterAll(async () => {
        await getAxios().post(LOCALHOST_PATH + "/sdk-test", {
            user_id: userId
        })
    })


    it('should get chats', (done) => {

        const runTest = async () => {
            const user1 = { username: "yes-chats", name: "User1" }

            const instance1 = await prepareInstance(user1)
            const user2 = await instance1.createUser({ username: "user2", name: "User2" })
            const chat = await instance1.chat(user2.username)
            chat?.sendMessage({ text: "Hey" }, async () => {
                const chatsResponse = await instance1.getChats()
                expect(chatsResponse.chats.length).toEqual(1)
                done()
            })
        }

        runTest()
    })


    it('should not get chats that dont have a lastSent message', async () => {
        const user1 = { username: "no-chats", name: "User1" }

        const instance1 = await prepareInstance(user1)
        const user2 = await instance1.createUser({ username: "user2", name: "User2" })
        await instance1.chat(user2.username)

        const chatsResponse = await instance1.getChats()
        expect(chatsResponse.chats.length).toBeFalsy()
    })


    it('should send and receive messages in group chat', (done) => {
        async function runTest() {
            const user1 = { username: "group-user1", name: "User1" }
            const user2 = { username: "group-user2", name: "User2" }
            const user3 = { username: "group-user3", name: "User3" }


            const instance1 = await prepareInstance(user1)
            const instance2 = await prepareInstance(user2)
            const instance3 = await prepareInstance(user3)

            // keeps track of all the messages that have been sent to be able to compare
            const messages: string[] = []

            //keeps track of when to call done when the last message gets received
            let lastMessageRecievedByCount = 0

            // keeps track of the number of messages recieved by each user (used to know who the message came from)
            let user1MessageCount = 0
            let user2MessageCount = 0
            let user3MessageCount = 0


            // instance 1 should receive the response
            instance1.onChat(async (chat) => {
                expect(chat?.getTitle()).toEqual("Group Chat")

                if (user1MessageCount === 0) {
                    user1MessageCount++

                    expect(chat.getLastMessage()?.text).toEqual("Hi")
                    expect(chat.getLastMessage()?.user.id).toEqual(instance2.config.user?.id)
                    expect(chat.getLastMessage()?.user.username).toEqual(instance2.config.user?.username)
                    expect(chat.getLastMessage()?.createdAt).toBeDefined()

                } else if (user1MessageCount === 1) {
                    user1MessageCount++

                    expect(chat.getLastMessage()?.text).toEqual("Hey")
                    expect(chat.getLastMessage()?.user.id).toEqual(instance3.config.user?.id)
                    expect(chat.getLastMessage()?.user.username).toEqual(instance3.config.user?.username)
                    expect(chat.getLastMessage()?.createdAt).toBeDefined()

                    const messagesResponse = await chat.getMessages()

                    expect(messagesResponse.messages.length).toEqual(messages.length)
                    expect(messagesResponse.messages[0].user.name).toEqual(instance1.config.user?.name)
                    expect(messagesResponse.messages[0].user.username).toEqual(instance1.config.user?.username)
                    expect(messagesResponse.messages[1].user.name).toEqual(instance2.config.user?.name)
                    expect(messagesResponse.messages[1].user.username).toEqual(instance2.config.user?.username)


                    for (let i = 0; i < messages.length; i++) {
                        expect(messagesResponse.messages[i].text).toEqual(messages[i])
                        expect(messagesResponse.messages[i].createdAt).toBeDefined()

                    }

                    lastMessageRecievedByCount++
                    if (lastMessageRecievedByCount === 2) done()
                }
            })


            // instance 2 should receive the initial message 
            instance2.onChat(async (chat) => {
                expect(chat?.getTitle()).toEqual("Group Chat")
                if (user2MessageCount === 0) {
                    user2MessageCount++
                    expect(chat.getLastMessage()?.text).toEqual("Hello")
                    expect(chat.getLastMessage()?.user.id).toEqual(instance1.config.user?.id)
                    expect(chat.getLastMessage()?.user.username).toEqual(instance1.config.user?.username)
                    expect(chat.getLastMessage()?.createdAt).toBeDefined()

                    // user 2 send a message back to the group
                    chat.sendMessage({ text: "Hi" })
                    messages.push("Hi")
                }
                else if (user2MessageCount === 1) {
                    user2MessageCount++
                    expect(chat.getLastMessage()?.text).toEqual("Hey")
                    expect(chat.getLastMessage()?.user.id).toEqual(instance3.config.user?.id)
                    expect(chat.getLastMessage()?.user.username).toEqual(instance3.config.user?.username)
                    expect(chat.getLastMessage()?.createdAt).toBeDefined()

                    lastMessageRecievedByCount++
                    if (lastMessageRecievedByCount === 2) done()
                }
            })

            // instance 3 should receive the initial message
            instance3.onChat(async (chat) => {
                expect(chat?.getTitle()).toEqual("Group Chat")

                if (user3MessageCount === 0) {
                    user3MessageCount++

                    expect(chat.getLastMessage()?.text).toEqual("Hello")
                    expect(chat.getLastMessage()?.user.id).toEqual(instance1.config.user?.id)
                    expect(chat.getLastMessage()?.user.username).toEqual(instance1.config.user?.username)
                    expect(chat.getLastMessage()?.createdAt).toBeDefined()

                } else if (user3MessageCount === 1) {
                    user3MessageCount++

                    expect(chat.getLastMessage()?.text).toEqual("Hi")
                    expect(chat.getLastMessage()?.user.id).toEqual(instance2.config.user?.id)
                    expect(chat.getLastMessage()?.user.username).toEqual(instance2.config.user?.username)
                    expect(chat.getLastMessage()?.createdAt).toBeDefined()

                    // user 3 send a message back to the group
                    chat.sendMessage({ text: "Hey" })
                    messages.push("Hey")
                }
            })

            // start by user 1 sending a message to the group
            const chat1 = await instance1.groupChat({
                memberUsernames: [instance2.config.user?.username || "", instance3.config.user?.username || ""],
            })

            chat1?.sendMessage({ text: "Hello" })
            messages.push("Hello")

            expect(chat1?.getTitle()).toEqual("Group Chat")
        }

        runTest()
    })


    //TODO CREATE A WORKING TEST FOR TYPING IN GROUP CHAT

    // it('should indicate typing in group chat', async (done) => {
    //     const user1 = { username: "group-user1-typing", name: "User1" }
    //     const user2 = { username: "group-user2-typing", name: "User2" }
    //     const user3 = { username: "group-user3-typing", name: "User3" }


    //     const instance1 = await prepareInstance(user1)
    //     const instance2 = await prepareInstance(user2)
    //     const instance3 = await prepareInstance(user3)

    //     const chat1 = await instance1.groupChat({
    //         memberIds: [instance2.config.user.id, instance3.config.user.id]
    //     })

    //     chat1.sendMessage({ text: "Hello" }, async () => {

    //         const chats2Response = await instance2.getChats()
    //         const chats3Response = await instance3.getChats()

    //         const chat2 = chats2Response.chats[0]
    //         const chat3 = chats3Response.chats[0]


    //         chat3.onTypingStopped((user) => {
    //             expect(user.id).toEqual(instance3.config.user.id)
    //             expect(user.username).toEqual(instance3.config.user.username)
    //         })


    //         chat3.onTypingStarted((user) => {
    //             expect(user.id).toEqual(instance1.config.user.id)
    //             expect(user.username).toEqual(instance1.config.user.username)

    //             chat3.startTyping()
    //         })

    //         chat2.onTypingStopped((user) => {
    //             expect(user.id).toEqual(instance1.config.user.id)
    //             expect(user.username).toEqual(instance1.config.user.username)
    //         })


    //         chat2?.onTypingStarted((user) => {
    //             expect(user.id).toEqual(instance1.config.user.id)
    //             expect(user.username).toEqual(instance1.config.user.username)
    //         })

    //         chat1?.onTypingStopped((user) => {
    //             expect(user.id).toEqual(instance2.config.user.id)
    //             expect(user.username).toEqual(instance2.config.user.username)

    //             done()
    //         })

    //         chat1?.onTypingStarted((user) => {
    //             expect(user.id).toEqual(instance3.config.user.id)
    //             expect(user.username).toEqual(instance3.config.user.username)

    //             chat1.stopTyping()
    //         })


    //         // wait 2 seconds with await
    //         await new Promise((resolve) => {
    //             setTimeout(() => {
    //                 resolve(null)
    //             }, 2000)
    //         })

    //         chat1.startTyping()

    //     })

    // })

    it("should get demo chats and messages", async () => {
        const instance = MinChat.getInstance("1")
        instance.init({ test: true, demo: true })
        instance.connectUser({ username: "demo-user", name: "Demo User" })
        // chats demo
        const chatsResponse = await instance.getChats()
        expect(chatsResponse.success).toEqual(true)
        expect(chatsResponse.chats.length).toBeGreaterThanOrEqual(1)
        expect(chatsResponse.totalChats).toBeGreaterThanOrEqual(1)

        for (const chat of chatsResponse.chats) {
            expect(chat.getLastMessage()?.createdAt).toBeDefined()
            // verify that createdAt is Date object
            expect(chat.getLastMessage()?.createdAt instanceof Date).toEqual(true)
        }

        const messagesResponse = await chatsResponse.chats[0].getMessages()

        expect(messagesResponse?.success).toEqual(true)
        expect(messagesResponse?.messages.length).toBeGreaterThanOrEqual(1)
        expect(messagesResponse?.totalMessages).toBeGreaterThanOrEqual(1)

        for (const message of messagesResponse?.messages) {
            expect(message.createdAt).toBeDefined()
            expect(message.createdAt instanceof Date).toEqual(true)

        }
    })


    it("should indicate typing in 1 on 1 chat", (done) => {
        async function runTest() {
            const user1 = { username: "user1-typing", name: "User1" }
            const user2 = { username: "user2-typing", name: "User2" }

            const instance1 = await prepareInstance(user1)
            const instance2 = await prepareInstance(user2)

            const chat1 = await instance1.chat(instance2.config.user?.username || "")

            expect(chat1?.getTitle()).toEqual(user2.name)

            chat1?.sendMessage({ text: "Hello" }, async () => {

                const { chats } = await instance2.getChats()

                for (const chat of chats) {
                    expect(chat.getLastMessage()?.createdAt).toBeDefined()
                    expect(chat.getLastMessage()?.createdAt instanceof Date).toEqual(true)

                }


                const chat2 = chats[0]

                expect(chat2?.getTitle()).toEqual(user1.name)


                chat2.onTypingStopped((user) => {
                    expect(user.id).toEqual(instance1.config.user?.id)
                    expect(user.username).toEqual(instance1.config.user?.username)

                    chat2.stopTyping()
                })

                chat1?.onTypingStopped((user) => {
                    expect(user.id).toEqual(instance2.config.user?.id)
                    expect(user.username).toEqual(instance2.config.user?.username)

                    done()
                })

                chat2?.onTypingStarted((user) => {
                    expect(user.id).toEqual(instance1.config.user?.id)
                    expect(user.username).toEqual(instance1.config.user?.username)

                    chat2.startTyping()
                })

                chat1?.onTypingStarted((user) => {
                    expect(user.id).toEqual(instance2.config.user?.id)
                    expect(user.username).toEqual(instance2.config.user?.username)

                    chat1.stopTyping()
                })

                // wait 2 seconds with await
                await new Promise((resolve) => {
                    setTimeout(() => {
                        resolve(null)
                    }, 2000)
                })


                chat1?.startTyping()

            })
        }

        runTest()
    })


    // it('bug fix test: should not have duplicate chats last message', (done) => {
    //     async function runTest() {
    //         const user1 = { username: "user1-duplicate-message", name: "User1" }
    //         const user2 = { username: "user2-duplicate-message", name: "User2" }

    //         const instance1 = await prepareInstance(user1)
    //         const instance2 = await prepareInstance(user2)

    //         const chats: Array<Chat> = []
    //         // instance 2 should receive the initial message 
    //         instance2.onChat((chat) => {
    //             chats.push(chat)
    //         })


    //         const user2Created = await instance1.createUser(user2)
    //         const chat1 = await instance1.groupChat({ memberUsernames: [user2Created.username], title: "G1" })
    //         const chat2 = await instance1.groupChat({ memberUsernames: [user2Created.username], title: "G1" })
    //         const chat3 = await instance1.groupChat({ memberUsernames: [user2Created.username], title: "G1" })


    //         chat1?.sendMessage({ text: "H1" })
    //         chat2?.sendMessage({ text: "H2" })
    //         chat3?.sendMessage({ text: "H3" })

    //         await new Promise((resolve) => {
    //             setTimeout(() => {
    //                 resolve(null)
    //             }, 4_000)
    //         })

    //         chat1?.sendMessage({ text: "H1" })

    //         await new Promise((resolve) => {
    //             setTimeout(() => {
    //                 resolve(null)
    //             }, 5_000)
    //         })

    //         expect(chats[0].getLastMessage()?.text).not.toEqual(chats[1].getLastMessage()?.text)
    //         expect(chats[1].getLastMessage()?.text).not.toEqual(chats[2].getLastMessage()?.text)
    //         expect(chats[0].getLastMessage()?.text).not.toEqual(chats[2].getLastMessage()?.text)
    //         expect(chats[1].getLastMessage()?.text).not.toEqual(chats[3].getLastMessage()?.text)
    //         expect(chats[2].getLastMessage()?.text).not.toEqual(chats[3].getLastMessage()?.text)


    //         done()
    //     }

    //     runTest()

    // }, 20_000)


    /**
     * 
     */
    it('should send and receive messages in 1 on 1 chat', (done) => {
        async function runTest() {

            const user1 = { username: "user1-title", name: "User1" }
            const user2 = { username: "user2-title", name: "User2" }

            const instance1 = await prepareInstance(user1)
            const instance2 = await prepareInstance(user2)

            // instance 2 should receive the initial message 
            instance2.onChat((chat) => {
                expect(chat.getTitle()).toEqual(user1.name)
                expect(chat.getLastMessage()?.text).toEqual("Hello")
                expect(chat.getLastMessage()?.user.id).toEqual(instance1.config.user?.id)
                expect(chat.getLastMessage()?.user.username).toEqual(instance1.config.user?.username)
                expect(chat.getLastMessage()?.createdAt).toBeDefined()
                expect(chat.getLastMessage()?.createdAt instanceof Date).toEqual(true)

                // send a message back
                chat.sendMessage({
                    text: "Received", metadata: {
                        test: "test-meta-2"
                    }
                })
            })

            let lastActionCount = 0

            const completeLastActionCount = () => {
                lastActionCount++
                if (lastActionCount === 3) done()
            }

            // instance 1 should receive a response
            instance1.onChat(async (chat) => {
                expect(chat.getTitle()).toEqual(user2.name)
                expect(chat.getLastMessage()?.text).toEqual("Received")
                expect(chat.getLastMessage()?.metadata?.test).toEqual("test-meta-2")
                expect(chat.getLastMessage()?.user.id).toEqual(instance2.config.user?.id)
                expect(chat.getLastMessage()?.user.username).toEqual(instance2.config.user?.username)
                expect(chat.getLastMessage()?.createdAt).toBeDefined()
                expect(chat.getLastMessage()?.createdAt instanceof Date).toEqual(true)

                // verify that all the messages are present that have been sent and recieved
                const messages = await chat.getMessages()

                expect(messages.messages.length).toEqual(2)
                expect(messages.messages[0].text).toEqual("Hello")
                expect(messages.messages[1].text).toEqual("Received")
                expect(messages.messages[0].metadata?.test).toEqual("test-meta")
                expect(messages.messages[1].metadata?.test).toEqual("test-meta-2")

                for (const message of messages.messages) {
                    expect(message.createdAt).toBeDefined()
                    expect(message?.createdAt instanceof Date).toEqual(true)

                }

                completeLastActionCount()
            })


            const chat1 = await instance1.chat(instance2.config.user?.username || "")


            chat1?.onMessage((message) => {
                expect(message.text).toEqual("Received")
                expect(message.metadata?.test).toEqual("test-meta-2")
                expect(message.createdAt).toBeDefined()
                expect(message?.createdAt instanceof Date).toEqual(true)
                expect(message.user.id).toEqual(instance2.config.user?.id)
                expect(message.user.username).toEqual(instance2.config.user?.username)

                completeLastActionCount()
            })

            chat1?.sendMessage({
                text: "Hello",
                metadata: {
                    test: "test-meta"
                }
            }, (message) => {
                expect(message.text).toEqual("Hello")
                expect(message.createdAt).toBeDefined()
                expect(message?.createdAt instanceof Date).toEqual(true)
                expect(message.user.id).toEqual(instance1.config.user?.id)
                expect(message.user.username).toEqual(instance1.config.user?.username)
                expect(message.metadata?.test).toEqual("test-meta")
                completeLastActionCount()

            })
        }

        runTest()

    }, 20_000)

    it('should create a group chat and give it a title', async () => {
        const instance = await prepareInstance({ username: "owner-group-title", name: "Owner" })
        const secondUser = await instance.createUser({ username: "second-user-group-title", name: "Second User" })
        const thirdUser = await instance.createUser({ username: "third-user-group-title", name: "Third User" })

        const chat = await instance.groupChat({
            memberUsernames: [secondUser.username, thirdUser.username],
            title: "Test Title",
            avatar: "img.co"
        })

        expect(chat?.config.title).toEqual("Test Title")
        expect(chat?.config.avatar).toEqual("img.co")

        // create a group chat with not title
        const chat2 = await instance.groupChat({
            memberUsernames: [secondUser.username, thirdUser.username]
        })


        expect(chat2?.config.title).toEqual("Group Chat")
        expect(chat2?.config.avatar).toBeFalsy()


    })



    it('should create a 1-1 chat and give it a title if no title is provided', async () => {
        const instance = await prepareInstance({ username: "owner-1on1-title", name: "Owner" })
        const secondUser = await instance.createUser({ username: "second-user-1on1-title", name: "Second User" })

        const chat = await instance.chat(secondUser.username)
        expect(chat?.config.title).toEqual(secondUser.name)

    })

    it('should create, update and fetch users', async () => {
        const minchat = await prepareInstance({ username: "hey", name: "Hey" })
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
    })



    const prepareInstance = async (user: UserProps) => {
        const instance = MinChat.getInstance(apiKey)
        instance.init({ test: true, demo: false })

        return await instance.connectUser(user)
    }
})


