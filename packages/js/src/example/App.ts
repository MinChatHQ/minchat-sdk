import MinChat from '..';
import { MinChatInstance } from '../minchat-instance';
import { ChildComponent } from './ChildComponent';

export class App {
  private minchatInstance?: MinChatInstance;
  private container: HTMLElement;
  private apiKey: string;
  private test: boolean;

  constructor(container: HTMLElement, apiKey: string, test: boolean) {
    this.container = container;
    this.apiKey = apiKey;
    this.test = test;
    this.init();
  }

  async init() {
    const instance = MinChat.getInstance(this.apiKey).init({ test: this.test });
    await instance.connectUser({ username: 'fredrick', name: 'Fred' });
    this.minchatInstance = instance;

    const chats = await instance.getChats(1);
    console.log(chats);

    const messages = await chats.chats[0].getMessages();
    console.log(messages);

    const user = await instance.fetchUserById("cmbpfo0gd0003yn25cw4ydt7x");
    console.log({ fetchedUserfortesting: user });

    this.render();
  }

  render() {
    if (this.minchatInstance) {
      // Clear container
      this.container.innerHTML = '';
      new ChildComponent(this.container, this.minchatInstance);
    } else {
      this.container.innerHTML = '<div>Loading...</div>';
    }
  }
} 