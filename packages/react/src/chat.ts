import type { FullMessage, User, Chat as ChatJS, Status } from "@minchat/js";

class Chat {
    jsChat: ChatJS

    constructor(jsChat: ChatJS) {
        this.jsChat = jsChat
    }

    release() {
        this.jsChat.release()
    }


    getChatAvatar() {
        return this.jsChat.getChatAvatar()
    }

    getId() {
        return this.jsChat.getId()
    }

    getTitle() {
        return this.jsChat.getTitle()
    }

    setTitle(title: string) {
        return this.jsChat.setTitle(title)
    }

    getLastMessage(): FullMessage | undefined {
        return this.jsChat.getLastMessage()
    }

    getMembers(): User[] {
        return this.jsChat.getMembers()
    }

    getMemberIds(): string[] {
        return this.jsChat.getMemberIds()
    }

    getMetadata() {
        return this.jsChat.getMetadata()
    }

    async setMetaData(metadata: Record<string, string | number | boolean>) {
        return this.jsChat.setMetaData(metadata)
    }

    onTypingStopped(listener: (user: User) => void) {
        return this.jsChat.onTypingStopped(listener)
    }
    onTypingStarted(listener: (user: User) => void) {
        return this.jsChat.onTypingStarted(listener)
    }

    async onMemberStatusChanged(listener: (memberId: string, status: Status) => void) {
        return this.jsChat.onMemberStatusChanged(listener)
    }

    onAiAction(listener: (data: {
        event: string,
        chatbotUsername: string
    }) => void) {
        return this.jsChat.onAiAction(listener)
    }

    async startTyping() {
        return this.jsChat.startTyping()
    }

    async stopTyping() {
        return this.jsChat.stopTyping()
    }

    setSeen(messageId?: string | null) {
        return this.jsChat.setSeen(messageId)
    }

    async removeMemberById(userId: string) {
        return this.jsChat.removeMemberById(userId)
    }

    async removeMember(username: string) {
        return this.jsChat.removeMember(username)
    }

    async addMember(username: string) {
        return this.jsChat.addMember(username)
    }

    async addMemberById(userId: string) {
        return this.jsChat.addMemberById(userId)
    }
}

export default Chat