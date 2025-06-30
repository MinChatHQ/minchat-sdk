import MinChat, { type Chat, type FullMessage, MinChatProvider, type User, type UserProps, MinChatInstanceReact } from '@minchat/react';
import React from 'react';
import Inbox from './components/inbox';
import UiContext from './UiContext';
import './index.css'
import { MinChatUiProvider } from '@minchat/react-chat-ui';

type RenderInputProps = {
  sendMessage: (text?: string) => void
  /**
   * opens the file selector to choose a file to send
   */
  sendFile: () => void

  /**
   * added to the input element
   * @example {...inputProps}
   */
  inputProps: any
  isMobile: boolean
}

type RenderMessageListHeaderProps = {
  isMobile: boolean
  heading: string
  lastActive: Date | undefined
  /**
   * get rid of all the messages currently shown for the selected chat
   */
  clearMessageList: () => void

}

type RenderChatListProps = {
  connectedUser: User
  chats?: Chat[]
  selectedChat?: Chat | null
  loading: boolean,
  paginate: () => void
  openChat: (chat: Chat) => void
  isMobile: boolean
}

type RenderMessageListProps = {
  connectedUser: User,
  loading: boolean,
  messages?: FullMessage[]
  paginate: () => void,
  typingUser?: User
  isMobile: boolean
}

type RenderIsTypingProps = {
  user: User
  isMobile: boolean
}

type RenderChatItemProps = {
  chat: Chat
  isMobile: boolean
}

type RenderEmtpyChatsProps = {
  isMobile: boolean
}

type RenderEmptyMessagesProps = {
  isMobile: boolean
}

type RenderLoaderProps = {
  isMobile: boolean
}

type RenderChatListHeaderProps = {
  isMobile: boolean
}



/**
 * 
 */
export interface RenderProps {
  renderEmptyChats?: (props: RenderEmtpyChatsProps) => React.ReactNode | null
  renderEmptyMessages?: (props: RenderEmptyMessagesProps) => React.ReactNode | null
  renderChatItem?: (props: RenderChatItemProps) => React.ReactNode | null
  renderChatList?: (props: RenderChatListProps) => React.ReactNode | null
  renderLoader?: (props: RenderLoaderProps) => React.ReactNode | null
  renderMessageList?: (props: RenderMessageListProps) => React.ReactNode | null
  renderInput?: (props: RenderInputProps) => React.ReactNode | null
  // renderChatListHeader?: (props: RenderChatListHeaderProps) => React.ReactNode | null
  renderMessageListHeader?: (props: RenderMessageListHeaderProps) => React.ReactNode | null
  renderIsTyping?: (props: RenderIsTypingProps) => React.ReactNode | null
}

/**
 * 
 */
export interface Props extends RenderProps {
  apiKey: string,
  user: UserProps,
  height?: string | "full"
  // start a conversation with one or more users
  startConversation?: (minchat: MinChatInstanceReact) => Promise<string | Array<string>> | string | Array<string>
  startConversationMetadata?: Record<string, string | number | boolean>
  groupChatTitle?: string
  demo?: boolean
  test?: boolean
  mobileView?: boolean
  theme?: string
  colorSet?: {}
  showAttachButton?: boolean
  showSendButton?: boolean
  disableInput?: boolean
  openChatId?: string
  onAiAction?: (data: {
    event: string,
    chatbotUsername: string
  }) => void
}

export {
  MinChat
}

/**
 * MinChat UI component
 */
export function MinChatUI(props: Props) {
  // Only render in the browser
  if (typeof window === "undefined") {
    return null;
  }

  const {
    apiKey,
    user,
    height = "full",
    demo = false,
    test = false,
    theme = '#6ea9d7',
    colorSet,
    ...restProps
  } = props;

  return <MinChatProvider
    demo={demo}
    test={test}
    user={!demo ? user : { username: "martha", name: "Martha" }}
    apiKey={apiKey}>
    <MinChatUiProvider
      colorSet={colorSet}
      theme={theme}>
      <UiContext.Provider value={{ height }}>
        <Inbox
          demo={demo}
          {...restProps}
        />
      </UiContext.Provider>
    </MinChatUiProvider >
  </MinChatProvider>
};
