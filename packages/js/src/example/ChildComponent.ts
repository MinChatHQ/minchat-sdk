import { MinChatInstance } from "../minchat-instance";

export class ChildComponent {
    private container: HTMLElement;
    private instance: MinChatInstance;
    private selectedFile: File | null = null;
    private selectedChatFile: File | null = null;
    private messageFile: File | null = null;
    private messageText: string = '';

    constructor(container: HTMLElement, instance: MinChatInstance) {
        this.container = container;
        this.instance = instance;
        this.render();
    }

    render() {
        this.container.innerHTML = `
      <div>
        <label>User Avatar</label>
        <input type='file' id='user-avatar-input' />
      </div>
      <div>
        <label>Chat Avatar</label>
        <input type='file' id='chat-avatar-input' />
      </div>
      <div>
        <label>Message File</label>
        <input type='file' id='message-file-input' />
      </div>
      <button id='create-user-btn'>Create User</button>

       <div>
        <label>Message Text</label>
        <input type='text' id='message-text-input' />
      <button id='send-message-btn'>Send Message</button>
      </div>
      
      <div id='output'></div>
    `;
        (this.container.querySelector('#user-avatar-input') as HTMLInputElement).addEventListener('change', e => {
            const files = (e.target as HTMLInputElement).files;
            this.selectedFile = files && files[0] ? files[0] : null;
        });
        (this.container.querySelector('#chat-avatar-input') as HTMLInputElement).addEventListener('change', e => {
            const files = (e.target as HTMLInputElement).files;
            this.selectedChatFile = files && files[0] ? files[0] : null;
        });
        (this.container.querySelector('#message-file-input') as HTMLInputElement).addEventListener('change', e => {
            const files = (e.target as HTMLInputElement).files;
            this.messageFile = files && files[0] ? files[0] : null;
        });
        (this.container.querySelector('#message-text-input') as HTMLInputElement).addEventListener('change', e => {
            const value = (e.target as HTMLInputElement).value;
            this.messageText = value;
        });
        (this.container.querySelector('#create-user-btn') as HTMLButtonElement).addEventListener('click', () => this.createUser());
        (this.container.querySelector('#send-message-btn') as HTMLButtonElement).addEventListener('click', () => this.sendMessage());
    }


    async sendMessage() {
        const output = this.container.querySelector('#output') as HTMLElement;
        try {
            await this.instance.createUser({username: 'js-test', name: "No Name"})
            const chat = await this.instance.chat('js-test')
            chat?.sendMessage({ text: this.messageText, file: this.messageFile }, (message) => {
                output.innerText = `Message sent: ${message?.text}
File Sent: ${message?.file?.url}`;
            })

        } catch (err) {
            output.innerText = 'Error: ' + (err as Error).message;
        }
    }

    async createUser() {
        const output = this.container.querySelector('#output') as HTMLElement;
        try {
            const createdUser = await this.instance.createUser({
                username: 'the_user',
                name: 'Test',
                avatar: this.selectedFile,
            });
            const groupChat = await this.instance.groupChat({
                memberUsernames: [createdUser.username],
                avatar: this.selectedChatFile,
            });
            groupChat?.sendMessage({ file: this.messageFile }, (message: any) => {
                output.innerText = 'Message sent: ' + JSON.stringify(message);
            });
            output.innerText = 'Group chat created: ' + JSON.stringify(groupChat);
            const { chats } = await this.instance.getChats();
            output.innerText += '\nChats: ' + JSON.stringify(chats);
        } catch (err) {
            output.innerText = 'Error: ' + (err as Error).message;
        }
    }
} 