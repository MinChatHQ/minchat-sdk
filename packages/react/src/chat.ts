import { FullMessage, User,Chat as ChatJS, Status } from "@minchat/js";

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

    onTypingStopped(listener: (user: User) => void) {
        return this.jsChat.onTypingStopped(listener)
    }
    onTypingStarted(listener: (user: User) => void) {
        return this.jsChat.onTypingStarted(listener)
    }

    async onMemberStatusChanged(listener: (memberId: string, status: Status) => void) {
        return this.jsChat.onMemberStatusChanged(listener)
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
}

export default Chat