import MinChat, { } from '..';
import { LOCALHOST_PATH } from '../configs/config';
import { Status } from '../enums/status';
import type { UserProps } from '../types/user-props';
import getAxios from '../utils/get-axios';
import { describe, it, expect, beforeAll, afterAll } from 'vitest'


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


    it('should get chats', async () => {
        const user1 = { username: "yes-chats", name: "User1" }
        const instance1 = await prepareInstance(user1)
        const user2 = await instance1.createUser({ username: "user2", name: "User2" })
        expect(user2.lastActive).toBeDefined()
        const chat = await instance1.chat(user2.username, { metadata: { test: 1 } })
        await new Promise<void>((resolve) => {
            chat?.sendMessage({ text: "Hey" }, async () => {
                const chatsResponse = await instance1.getChats()
                expect(chatsResponse.chats.length).toEqual(1)
                expect(chatsResponse.chats[0].getMetadata()?.test).toEqual(1)
                resolve()
            })
        })
    })

    it('should update the metadata', async () => {
        const user1 = { username: "metadata-chats", name: "User1" }
        const instance1 = await prepareInstance(user1)
        const user2 = await instance1.createUser({ username: "user2", name: "User2" })
        const chat = await instance1.chat(user2.username, { metadata: { test: 3 } })
        expect(chat?.getMetadata()).toEqual({ test: 3 })
        await chat?.setMetaData({ updated: true })
        expect(chat?.getMetadata()).toEqual({ test: 3, updated: true })
        await new Promise<void>((resolve) => {
            chat?.sendMessage({ text: "Hey" }, async () => {
                const chatsResponse = await instance1.getChats()
                expect(chatsResponse.chats[0].getMetadata()).toEqual({ test: 3, updated: true })
                resolve()
            })
        })
    })


    it('should not get chats that dont have a lastSent message', async () => {
        const user1 = { username: "no-chats", name: "User1" }

        const instance1 = await prepareInstance(user1)
        const user2 = await instance1.createUser({ username: "user2", name: "User2" })
        expect(user2.lastActive).toBeDefined()
        await instance1.chat(user2.username)

        const chatsResponse = await instance1.getChats()
        expect(chatsResponse.chats.length).toBeFalsy()
    })


    it('should send and receive messages in group chat', async () => {
        await new Promise<void>((resolve) => {
            async function runTest() {
                const user1 = { username: "group-user1", name: "User1" }
                const user2 = { username: "group-user2", name: "User2" }
                const user3 = { username: "group-user3", name: "User3" }
                const instance1 = await prepareInstance(user1)
                const instance2 = await prepareInstance(user2)
                const instance3 = await prepareInstance(user3)
                const messages: string[] = []
                let lastMessageRecievedByCount = 0
                let user1MessageCount = 0
                let user2MessageCount = 0
                let user3MessageCount = 0
                instance1.onChat(async (chat) => {
                    expect(chat?.getTitle()).toEqual("Group Chat")
                    expect(chat?.getMetadata()?.test2).toEqual(2)
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
                        if (lastMessageRecievedByCount === 2) resolve()
                    }
                })
                instance2.onChat(async (chat) => {
                    expect(chat?.getMetadata()?.test2).toEqual(2)
                    expect(chat?.getTitle()).toEqual("Group Chat")
                    if (user2MessageCount === 0) {
                        user2MessageCount++
                        expect(chat.getLastMessage()?.text).toEqual("Hello")
                        expect(chat.getLastMessage()?.user.id).toEqual(instance1.config.user?.id)
                        expect(chat.getLastMessage()?.user.username).toEqual(instance1.config.user?.username)
                        expect(chat.getLastMessage()?.createdAt).toBeDefined()
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
                        if (lastMessageRecievedByCount === 2) resolve()
                    }
                })
                instance3.onChat(async (chat) => {
                    expect(chat?.getTitle()).toEqual("Group Chat")
                    expect(chat?.getMetadata()?.test2).toEqual(2)
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
                        chat.sendMessage({ text: "Hey" })
                        messages.push("Hey")
                    }
                })
                const chat1 = await instance1.groupChat({
                    memberUsernames: [instance2.config.user?.username || "", instance3.config.user?.username || ""],
                    metadata: {
                        test2: 2
                    }
                })
                expect(chat1?.getMetadata()?.test2).toEqual(2)
                chat1?.sendMessage({ text: "Hello" })
                messages.push("Hello")
                expect(chat1?.getTitle()).toEqual("Group Chat")
            }
            runTest()
        })
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


    it('should add and remove participants from a chat', async () => {
        await new Promise<void>((resolve) => {
            async function runTest() {
                const instance = await prepareInstance({ name: "user1", username: "user1-add-participant" })
                const user1 = instance.getConnectedUser()
                const user2 = await instance.createUser({ name: "user2", username: "user2-add-participant" })
                const user3 = await instance.createUser({ name: "user3", username: "user3-add-participant" })
                const user4 = await instance.createUser({ name: "user4", username: "user4-add-participant" })
                const chat = await instance.groupChat({ memberUsernames: [user2.username] })
                chat?.sendMessage({ text: "Hello" }, async () => {
                    await chat?.removeMember(user1?.username || "")
                    let memberIds = chat.getMemberIds()
                    expect(memberIds.includes(user1?.id || "")).toEqual(false)
                    try {
                        await chat.removeMember(user1?.username || '')
                    } catch (e) {
                        throw Error()
                    }
                    memberIds = chat.getMemberIds()
                    expect(memberIds).toEqual(memberIds)
                    let members = chat.getMembers()
                    expect(members.sort()).toEqual([user2].sort())
                    await chat.addMemberById(user3.id)
                    await chat.addMember(user4.username)
                    await chat.addMember(user2.username)
                    await chat.addMember(user1?.username || "")
                    await chat.addMember(user2.username)
                    memberIds = chat.getMemberIds()
                    members = chat.getMembers()
                    expect(memberIds).toEqual([user2.id, user3.id, user4.id].sort())
                    expect(members).toEqual([user2, user3, user4].sort())
                    await chat.removeMemberById(user4.id)
                    memberIds = chat.getMemberIds()
                    members = chat.getMembers()
                    expect(memberIds).toEqual([user2.id, user3.id].sort())
                    expect(members).toEqual([user2, user3].sort())
                    resolve()
                })
            }
            runTest()
        })
    });

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


    it("should indicate typing in 1 on 1 chat", async () => {
        await new Promise<void>((resolve) => {
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
                        resolve()
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
                    await new Promise((resolve2) => {
                        setTimeout(() => {
                            resolve2(null)
                        }, 2000)
                    })
                    chat1?.startTyping()
                })
            }
            runTest()
        })
    })



    it("should set seen and listen for message seen", async () => {
        await new Promise<void>((resolve) => {
            async function runTest() {
                const user1 = { username: "user1-seen", name: "User1" }
                const user2 = { username: "user2-seen", name: "User2" }
                const instance1 = await prepareInstance(user1)
                const instance2 = await prepareInstance(user2)
                let sentMessageId: string | undefined = ""
                const chat1 = await instance1.chat(instance2.config.user?.username || "")
                chat1?.sendMessage({ text: "Hello" }, async () => {
                    const { chats } = await instance2.getChats()
                    const chat2 = chats[0]
                    chat2?.onMessageSeen(async (messageId) => {
                        expect(messageId).toBe(sentMessageId)
                        const { messages } = await chat2.getMessages()
                        expect(messages[1].seen).toBe(true)
                        resolve()
                    })
                    chat2.sendMessage({ text: "Hey" }, async (data) => {
                        sentMessageId = data.id
                        await new Promise((resolve2) => {
                            setTimeout(() => {
                                resolve2(null)
                            }, 2000)
                        })
                        chat1.setSeen(sentMessageId)
                    })
                })
            }
            runTest()
        })
    })



    it("should show user is active and update last seen", async () => {
        await new Promise<void>((resolve) => {
            async function runTest() {
                let user1: any = { username: "user1-active", name: "User1" }
                let user2: any = { username: "user2-active", name: "User2" }
                const instance = MinChat.getInstance(apiKey)
                instance.init({ test: true, demo: false })
                user1 = await instance.createUser(user1)
                user2 = await instance.createUser(user2)
                expect(user1.lastActive).toBeDefined()
                expect(user2.lastActive).toBeDefined()
                const instance1 = await prepareInstance({ username: user1.username, name: user1.name })
                let expectsRun = 0
                function finalize() {
                    expectsRun++
                    if (expectsRun >= 2) {
                        resolve()
                    }
                }
                const chat1 = await instance1.chat(user2.username)
                chat1?.onMemberStatusChanged(async (memberId, status) => {
                    expect(memberId).toBe(user2.id)
                    expect(status).toBe(Status.ONLINE)
                    const user = await instance.fetchUserById(user2.id)
                    expect(user.lastActive).toBeDefined()
                    expect(user.lastActive).not.toBe(user2.lastActive)
                    finalize()
                })
                const instance2 = await prepareInstance({ username: user2.username, name: user2.name })
                const chat2 = await instance2.chat(user1.username)
                chat2?.onMemberStatusChanged(async (memberId, status) => {
                    expect(memberId).toBe(user1.id)
                    expect(status).toBe(Status.ONLINE)
                    const user = await instance.fetchUserById(user1.id)
                    expect(user.lastActive).toBeDefined()
                    expect(user.lastActive).not.toBe(user1.lastActive)
                    finalize()
                })
            }
            runTest()
        })
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
    it('should send and receive messages in 1 on 1 chat', async () => {
        await new Promise<void>((resolve) => {
            async function runTest() {
                const user1 = { username: "user1-title", name: "User1" }
                const user2 = { username: "user2-title", name: "User2" }
                const instance1 = await prepareInstance(user1)
                const instance2 = await prepareInstance(user2)
                instance2.onChat((chat) => {
                    expect(chat.getTitle()).toEqual(user1.name)
                    expect(chat.getLastMessage()?.text).toEqual("Hello")
                    expect(chat.getLastMessage()?.user.id).toEqual(instance1.config.user?.id)
                    expect(chat.getLastMessage()?.user.username).toEqual(instance1.config.user?.username)
                    expect(chat.getLastMessage()?.createdAt).toBeDefined()
                    expect(chat.getLastMessage()?.createdAt instanceof Date).toEqual(true)
                    chat.sendMessage({
                        text: "Received", metadata: {
                            test: "test-meta-2"
                        }
                    })
                })
                let lastActionCount = 0
                const completeLastActionCount = () => {
                    lastActionCount++
                    if (lastActionCount === 3) resolve()
                }
                instance1.onChat(async (chat) => {
                    expect(chat.getTitle()).toEqual(user2.name)
                    expect(chat.getLastMessage()?.text).toEqual("Received")
                    expect(chat.getLastMessage()?.metadata?.test).toEqual("test-meta-2")
                    expect(chat.getLastMessage()?.user.id).toEqual(instance2.config.user?.id)
                    expect(chat.getLastMessage()?.user.username).toEqual(instance2.config.user?.username)
                    expect(chat.getLastMessage()?.createdAt).toBeDefined()
                    expect(chat.getLastMessage()?.createdAt instanceof Date).toEqual(true)
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
        })
    })

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



    it('should delete a user', async () => {

        const createUser = {
            username: "delete-username",
            name: "test",
        }

        const createUser2 = {
            username: "delete-username2",
            name: "test",
        }

        const createUser3 = {
            username: "delete-username3",
            name: "test",
        }

        const minchat = await prepareInstance(createUser)
        const minchat2 = await prepareInstance(createUser2)

        const user1 = await minchat.createUser(createUser)
        const user2 = await minchat.createUser(createUser2)
        const user3 = await minchat.createUser(createUser3)


        const chat = await minchat.chat(user2.username)
        const chat2 = await minchat.groupChat({ memberUsernames: [user2.username, user3.username] })
        const chatForUser2 = await minchat2.groupChat({ memberUsernames: [user1.username, user3.username] })

        await chat?.sendMessage({ text: "Hello" })
        await chat2?.sendMessage({ text: "Hello" })
        await chatForUser2?.sendMessage({ text: "Hello" })

        await minchat.deleteUser(user1.username)

        const conversations = await minchat2.getChats()

        expect(conversations.chats.length).toEqual(1)
        expect(conversations.totalChats).toEqual(1)

        const messages = await chatForUser2?.getMessages()

        expect(messages?.messages.length).toEqual(1)
        expect(messages?.totalMessages).toEqual(1)

        const chatsNull = await minchat.getChats()
        //try to query conversation using a deleted userId

        expect(chatsNull.chats.length).toEqual(0)
        expect(chatsNull.totalChats).toEqual(0)

        const messagesNull = await chat?.getMessages()

        //try to query messages using a deleted userId
        expect(messagesNull?.messages.length).toEqual(0)
        expect(messagesNull?.totalMessages).toEqual(0)

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



    it("should recieve message seen if request made through API", async () => {
        await new Promise<void>((resolve) => {
            async function runTest() {
                const user1 = { username: "user1-seen-api", name: "User1" }
                const user2 = { username: "user2-seen-api", name: "User2" }
                const instance1 = await prepareInstance(user1)
                const instance2 = await prepareInstance(user2)
                let sentMessageId: string | undefined = ""
                const chat1 = await instance1.chat(instance2.config.user?.username || "")
                chat1?.sendMessage({ text: "Hello" }, async () => {
                    const { chats } = await instance2.getChats()
                    const chat2 = chats[0]
                    chat2?.onMessageSeen(async (messageId) => {
                        expect(messageId).toBe(sentMessageId)
                        const { messages } = await chat2.getMessages()
                        expect(messages[1].seen).toBe(true)
                        resolve()
                    })
                    chat2.sendMessage({ text: "Hey" }, async (data) => {
                        sentMessageId = data.id
                        await new Promise((resolve2) => {
                            setTimeout(() => {
                                resolve2(null)
                            }, 2000)
                        })
                        await getAxios().post(LOCALHOST_PATH + `/v1/messages/${sentMessageId}/seen`, {
                            user_id: instance1.getConnectedUser()?.id
                        }, {
                            headers: {
                                "Authorization": "Bearer " + apiKey,
                            }
                        })
                    })
                })
            }
            runTest()
        })
    })

    /**
 * 
 */
    it('should recieve message if message sent through API', async () => {
        await new Promise<void>((resolve) => {
            async function runTest() {
                const user1 = { username: "user1-title-api", name: "User1" }
                const user2 = { username: "user2-title-api", name: "User2" }
                const instance1 = await prepareInstance(user1)
                const instance2 = await prepareInstance(user2)
                const chat1 = await instance1.chat(instance2.config.user?.username || "")
                let doneCounter = 0
                function checkDone() {
                    doneCounter++
                    if (doneCounter >= 2) {
                        resolve()
                    }
                }
                chat1?.onMessage((message) => {
                    expect(message.text).toEqual("Hello")
                    expect(message.createdAt).toBeDefined()
                    expect(message?.createdAt instanceof Date).toEqual(true)
                    expect(message.user.id).toEqual(instance2.config.user?.id)
                    expect(message.user.username).toEqual(instance2.config.user?.username)
                    checkDone()
                })
                instance1.onChat((chat) => {
                    expect(chat.getTitle()).toEqual(user2.name)
                    expect(chat.getLastMessage()?.text).toEqual("Hello")
                    expect(chat.getLastMessage()?.user.id).toEqual(instance2.config.user?.id)
                    expect(chat.getLastMessage()?.user.username).toEqual(instance2.config.user?.username)
                    expect(chat.getLastMessage()?.createdAt).toBeDefined()
                    expect(chat.getLastMessage()?.createdAt instanceof Date).toEqual(true)
                    checkDone()
                })
                const data = new FormData()
                data.append("chat_id", chat1?.getId() as string)
                data.append("user_id", instance2.getConnectedUser()?.id as string)
                data.append("text", "Hello")
                await getAxios().post(LOCALHOST_PATH + "/v1/messages", data, {
                    headers: {
                        "Authorization": "Bearer " + apiKey,
                        'Content-Type': 'multipart/form-data',
                    }
                })
            }
            runTest()
        })
    })



    /**
 * 
 */
    it('should update message if message sent through API and SDK', async () => {
        await new Promise<void>((resolve) => {
            async function runTest() {
                const user1 = { username: "user1-update-api", name: "User1" }
                const user2 = { username: "user2-update-api", name: "User2" }
                const instance1 = await prepareInstance(user1)
                const instance2 = await prepareInstance(user2)
                const chat1 = await instance1.chat(instance2.config.user?.username || "")
                const chat2 = await instance2.chat(instance1.config.user?.username || "")
                let doneCounter = 0
                function checkDone() {
                    doneCounter++
                    if (doneCounter >= 2) {
                        resolve()
                    }
                }
                chat1?.onMessageUpdated((message) => {
                    if (doneCounter === 0) {
                        expect(message.text).toEqual("Updated")
                    } else if (doneCounter === 1) {
                        expect(message.text).toEqual("Updated 2")
                    }
                    expect(message.createdAt).toBeDefined()
                    expect(message?.createdAt instanceof Date).toEqual(true)
                    expect(message.user.id).toEqual(instance2.config.user?.id)
                    expect(message.user.username).toEqual(instance2.config.user?.username)
                    checkDone()
                })
                chat2?.sendMessage({ text: "Hello" }, async (message) => {
                    const data = new FormData()
                    data.append("text", "Updated")
                    await getAxios().patch(LOCALHOST_PATH + `/v1/messages/${message.id}`, data, {
                        headers: {
                            "Authorization": "Bearer " + apiKey,
                            'Content-Type': 'multipart/form-data',
                        }
                    })
                    chat2.updateMessage(message?.id || "", { text: "Updated 2" })
                })
            }
            runTest()
        })
    })



    /**
 * 
 */
    it('should delete message if message sent through API and SDK', async () => {
        await new Promise<void>((resolve) => {
            async function runTest() {
                const user1 = { username: "user1-delete-api", name: "User1" }
                const user2 = { username: "user2-delete-api", name: "User2" }
                const instance1 = await prepareInstance(user1)
                const instance2 = await prepareInstance(user2)
                const chat1 = await instance1.chat(instance2.config.user?.username || "")
                const chat2 = await instance2.chat(instance1.config.user?.username || "")
                let doneCounter = 0
                function checkDone() {
                    doneCounter++
                    if (doneCounter >= 2) {
                        resolve()
                    }
                }
                let message1Id: string = ""
                let message2Id: string = ""
                chat1?.onMessageDeleted((messageId) => {
                    if (doneCounter === 0) {
                        expect(messageId).toEqual(message1Id)
                    } else if (doneCounter === 1) {
                        expect(messageId).toEqual(message2Id)
                    }
                    checkDone()
                })
                chat2?.sendMessage({ text: "msg1" }, (message) => message1Id = message.id || "")
                chat2?.sendMessage({ text: "msg2" }, (message) => message2Id = message.id || "")
                chat2?.sendMessage({ text: "msg3" })
                await new Promise((resolve2) => {
                    setTimeout(() => {
                        resolve2(null)
                    }, 3000)
                })
                await getAxios().delete(LOCALHOST_PATH + `/v1/messages/${message1Id}`, {
                    headers: {
                        "Authorization": "Bearer " + apiKey
                    }
                })
                chat2?.deleteMessage(message2Id)
            }
            runTest()
        })
    })

    it('should delete a chat', async () => {
        await new Promise<void>((resolve) => {
            const runTest = async () => {
                const user1 = { username: "delete-chat", name: "User1" }
                const instance1 = await prepareInstance(user1)
                const user2 = await instance1.createUser({ username: "delete-chat-2", name: "User2" })
                const user3 = await instance1.createUser({ username: "delete-chat-3", name: "User3" })
                const chat1 = await instance1.groupChat({ memberUsernames: [user2.username, user3.username], title: "Group Chat 1" })
                const chat2 = await instance1.groupChat({ memberUsernames: [user2.username, user3.username], title: "Group Chat 2" })
                await chat1?.sendMessage({ text: "Hey" })
                await chat2?.sendMessage({ text: "Hey 2" })
                let success = await instance1.deleteChat(chat1?.getId() || "")
                expect(success).toEqual(true)
                success = await instance1.deleteChat(chat1?.getId() || "")
                expect(success).toEqual(false)
                const chats = await instance1.getChats()
                expect(chats.chats.length).toEqual(1)
                expect(chats.totalChats).toEqual(1)
                expect(chats.chats[0].getId()).toEqual(chat2?.getId())
                const deletedMessages = await chat1?.getMessages()
                expect(deletedMessages?.messages.length).toEqual(0)
                expect(deletedMessages?.totalMessages).toEqual(0)
                expect(deletedMessages?.success).toEqual(false)
                resolve()
            }
            runTest()
        })
    })
})


