import { useMinChat, useChats, useMessages, useUser, User } from '@minchat/react';
import React, { useContext, useEffect, useRef, useState } from 'react'
import Chat from '@minchat/react/src/chat';
import styled from 'styled-components';
import UiContext from '../../UiContext';
import {
  MainContainer,
  useCheckIsMobile,
  Sidebar,
  ConversationList,
  ConversationHeader,
  MessageHeader,
  MessageList,
  MessageListBackground,
  MessageInput,
  useTypingListener,
  MessageContainer,
} from "@minchat/react-chat-ui";
import ConversationType from '@minchat/react-chat-ui/dist/ConversationType';
import MinChatInstanceReact from '@minchat/react/dist/MinChatInstanceReact';
import { RenderProps } from '../..';
import useThrottle from '../../hooks/useThrottle';


interface Props extends RenderProps {
  // start a conversation with one or more users
  startConversation?: (minchat: MinChatInstanceReact) => Promise<string | Array<string>> | string | Array<string>
  groupChatTitle?: string
  mobileView?: boolean
  themeColor: string
}

interface ContainerProps {
  height: string
}

const Container = styled.div<ContainerProps>`
  position: relative;
  height: ${({ height }) => height == "full" ? "100vh" : height};
`

export default function Inbox({
  startConversation,
  groupChatTitle,
  mobileView,
  themeColor,

  // render props
  renderEmptyMessages = () => undefined,
  renderEmptyChats = () => undefined,
  renderLoader = () => undefined,
  renderChatListHeader = ({ isMobile }) => isMobile ? <ConversationHeader /> : <div />,
  renderChatItem = () => undefined,
  renderChatList = ({ connectedUser, chats, loading, selectedChat, paginate, openChat, isMobile }) => <ConversationList
    mobileView={isMobile}
    currentUserId={connectedUser.id}
    loading={loading}
    selectedConversationId={selectedChat ? selectedChat.getId() : undefined}
    customEmptyConversationsComponent={(() => renderEmptyChats({ isMobile }))()}
    customLoaderComponent={(() => renderLoader({ isMobile }))()}
    onConversationClick={index => chats && openChat(chats[index])}
    renderCustomConversationitem={(_, index) => chats ? renderChatItem({ chat: chats[index], isMobile }) : undefined}
    conversations={chats && chats.map((chat) => {
      const lastMessage = chat.getLastMessage()

      const returnVal: ConversationType = {
        title: chat.getTitle(),
        avatar: chat.getChatAvatar(),
        id: chat.jsChat.config.channelId
      }

      if (lastMessage) {
        returnVal.lastMessage = { ...lastMessage, media: lastMessage.file }
      }
      return returnVal
    })}
    onScrollToBottom={() => paginate()}
  />,
  renderMessageListHeader = ({ heading, clearMessageList, isMobile }) => <MessageHeader mobileView={isMobile} showBack={isMobile} onBack={clearMessageList}> {heading}</MessageHeader>,
  renderIsTyping = () => undefined,
  renderMessageList = ({ loading, messages, paginate, connectedUser, typingUser, isMobile }) => <MessageList
    mobileView={isMobile}
    themeColor={themeColor}
    typingIndicatorContent={typingUser ? `${typingUser.name} is typing` : ""}
    customTypingIndicatorComponent={(() => typingUser ? renderIsTyping({ user: typingUser, isMobile }) : undefined)()}
    showTypingIndicator={typingUser ? true : false}
    currentUserId={connectedUser.id}
    customEmptyMessagesComponent={(() => renderEmptyMessages({ isMobile }))()}
    customLoaderComponent={(() => renderLoader({ isMobile }))()}
    messages={messages && messages.map((message) => {
      if (message.file) {
        return {
          ...message,
          media: message.file
        }
      } else {
        return message
      }
    })}
    onScrollToTop={() => paginate()}
    loading={loading}
  />,
  renderInput = ({ sendMessage, sendFile, inputProps, isMobile }) => <MessageInput
    mobileView={isMobile}
    {...inputProps}
    onAttachClick={sendFile}
    onSendMessage={sendMessage} />,

}: Props) {

  const { chats, loading: chatsLoading, paginate: chatsPaginate, chatsOrdered } = useChats()

  const [selectedChat, setSelectedChat] = useState<Chat | null>()
  const [typingUser, setTypingUser] = useState<User | undefined>()

  const fileInputRef = React.createRef<any>();

  const { messages, loading: messagesLoading, sendMessage, paginate: messagesPaginate } = useMessages(selectedChat || undefined)

  const { throttledFunction: throttledChatsPaginate } = useThrottle(chatsPaginate, 2500)
  const { throttledFunction: throttledMessagesPaginate } = useThrottle(messagesPaginate, 2500)


  const minchat = useMinChat()

  const currentUser = useUser()

  const containerRef = useRef<any>(null)
  const isMobile = useCheckIsMobile(containerRef)

  const { setTyping, onKeyDown, onKeyUp } = useTypingListener({
    onStartTyping: () => { selectedChat && selectedChat.startTyping() },
    onEndTyping: () => { selectedChat && selectedChat.stopTyping() }
  })

  const { height: containerHeight } = useContext(UiContext)
  useEffect(() => {
    const setupStartConversation = async () => {
      if (startConversation && minchat) {
        let chat: Chat | null

        let usernames = await startConversation(minchat)

        if (!Array.isArray(usernames)) {
          usernames = [usernames]
        }

        if (usernames.length === 1 && !groupChatTitle) {
          chat = await minchat.chat((usernames)[0])
        } else {
          //it is a group chat with multiple people
          chat = await minchat.groupChat({ title: groupChatTitle, memberUsernames: usernames })
        }


        setSelectedChat(chat)
      }
    }

    setupStartConversation()

  }, [startConversation, minchat])

  useEffect(() => {
    if (chats && !selectedChat && chatsOrdered > 0) {
      if (chats.length > 0 && !isMobile && !mobileView && !startConversation) {
        //using this method because if I use chats[0] it isnt selecting the correct first item
        const chat = chats.slice(0, 1)[0];
        setSelectedChat(chat)
      }
    }
  }, [chats, chatsOrdered])


  useEffect(() => {
    //setSeen on the selected chat
    if (selectedChat) {
      selectedChat.jsChat.setSeen()

      selectedChat.onTypingStarted((user) => {
        setTypingUser(user)
      })

      selectedChat.onTypingStopped((_) => {
        setTypingUser(undefined)
      })
    }
  }, [selectedChat])


  /**
   * 
   */
  const openFileSelector = () => {
    fileInputRef.current.click();
  }

  /**
   * 
   */
  const handleFileSelection = (event: any) => {
    if (event.target.files && event.target.files.length > 0) {
      const file = event.target.files[0]
      handleSendMessage({ file })
    }
  };


  /**
   * 
   * @param props 
   */
  const handleSendMessage = (props: { text?: string, file?: any }) => {
    setTyping(false)
    sendMessage(props)
    selectedChat && selectedChat.jsChat.setSeen()
  }

  /**
   * 
   */
  const ChatListHeader = () => renderChatListHeader({ isMobile: determineIsMobile() })

  /**
 * 
 */
  const ChatList = () => currentUser && renderChatList({
    connectedUser: currentUser,
    chats,
    loading: chatsLoading,
    paginate: throttledChatsPaginate,
    openChat: (chat) => setSelectedChat(chat),
    isMobile: determineIsMobile(),
    selectedChat
  })

  /**
 * 
 */
  const MessageListHeader = () => renderMessageListHeader({
    heading: (selectedChat && selectedChat.getTitle()) || "",
    clearMessageList: () => setSelectedChat(undefined),
    isMobile: determineIsMobile()
  })

  /**
 * 
 */
  const MessageList = () => currentUser && renderMessageList({
    paginate: throttledMessagesPaginate,
    messages,
    loading: messagesLoading,
    connectedUser: currentUser,
    typingUser,
    isMobile: determineIsMobile()
  })


  /**
 * 
 */
  const Input = () => renderInput({
    sendMessage: (text) => handleSendMessage({ text }),
    sendFile: () => openFileSelector(),
    inputProps: { onKeyDown, onKeyUp },
    isMobile: determineIsMobile()
  })


  const determineIsMobile = () => {
    if (typeof mobileView !== "undefined") {
      return mobileView
    } else {
      return isMobile
    }
  }

  return (
    <Container
      ref={containerRef}
      height={containerHeight}>
      {/* for handling picking files */}
      <input
        type="file"
        multiple={false}
        ref={fileInputRef}
        style={{ display: 'none' }}
        onChange={handleFileSelection}
      />

      <MainContainer style={{ height: '100%' }}>

        {determineIsMobile() ? (
          selectedChat ?
            <MessageContainer>
              {MessageListHeader()}
              {MessageList()}
              {Input()}
            </MessageContainer>
            :
            <div style={{ position: "relative", width: "100%" }}>
              {ChatListHeader()}
              {ChatList()}
            </div>
        )
          :

          /* desktop view */
          <>
            <Sidebar>
              {ChatListHeader()}
              {ChatList()}
            </Sidebar>

            <MessageContainer>
              {selectedChat ?
                <>
                  {MessageListHeader()}
                  {MessageList()}
                  {Input()}
                </>
                :
                <MessageListBackground
                  mobileView={determineIsMobile()} />
              }
            </MessageContainer>

          </>
        }
      </MainContainer>

    </Container>
  )
}