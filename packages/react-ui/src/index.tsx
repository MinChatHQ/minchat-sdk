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
  avatar: string | undefined
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
  renderEmptyChats?: (props: RenderEmtpyChatsProps) => React.ReactNode | null | undefined
  renderEmptyMessages?: (props: RenderEmptyMessagesProps) => React.ReactNode | null | undefined
  renderChatItem?: (props: RenderChatItemProps) => React.ReactNode | null | undefined
  renderChatList?: (props: RenderChatListProps) => React.ReactNode | null | undefined
  renderLoader?: (props: RenderLoaderProps) => React.ReactNode | null | undefined
  renderMessageList?: (props: RenderMessageListProps) => React.ReactNode | null | undefined
  renderInput?: (props: RenderInputProps) => React.ReactNode | null | undefined
  // renderChatListHeader?: (props: RenderChatListHeaderProps) => React.ReactNode | null
  renderMessageListHeader?: (props: RenderMessageListHeaderProps) => React.ReactNode | null | undefined
  renderIsTyping?: (props: RenderIsTypingProps) => React.ReactNode | null | undefined
  renderMessageThemeColor?: (props: FullMessage) => string | undefined
  /**
   * Function to determine if a chat item should be hidden. If it returns true, the chat will be hidden.
   */
  hideChatItem?: (chat: Chat) => boolean
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
    chat_id: string,
    event: string,
    chatbotUsername: string
  }) => void
  /**
   * Function to determine if a chat item should be hidden. If it returns true, the chat will be hidden.
   */
  hideChatItem?: (chat: Chat) => boolean
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
            hideChatItem={props.hideChatItem}
          />

      </UiContext.Provider>
    </MinChatUiProvider >
  </MinChatProvider>
};
