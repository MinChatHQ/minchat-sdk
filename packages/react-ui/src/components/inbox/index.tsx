import { useMinChat, useChats, useMessages, useUser, type User , type Chat, MinChatInstanceReact} from '@minchat/react';
import React, { useContext, useEffect, useRef, useState } from 'react'
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
  type ConversationType,
} from "@minchat/react-chat-ui";
import { type RenderProps } from '../..';
import useThrottle from '../../hooks/useThrottle';
import { Status } from '@minchat/js';

interface Props extends RenderProps {
  // start a conversation with one or more users
  startConversation?: (minchat: MinChatInstanceReact) => Promise<string | Array<string>> | string | Array<string>
  startConversationMetadata?: Record<string, string | number | boolean>
  groupChatTitle?: string
  mobileView?: boolean
  showAttachButton?: boolean
  showSendButton?: boolean
  disableInput?: boolean
  demo: boolean
  openChatId?: string
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
  startConversationMetadata,
  groupChatTitle,
  mobileView,
  showAttachButton = true,
  showSendButton = true,
  disableInput = false,
  demo,
  openChatId,
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
      let lastMessage = chat.getLastMessage()

      const returnVal: ConversationType = {
        title: chat.getTitle(),
        avatar: chat.getChatAvatar(),
        id: chat.jsChat.config.channelId,
      }

      if (lastMessage) {

        returnVal.lastMessage = {
          ...lastMessage,
          createdAt: lastMessage.createdAt,
          media: lastMessage.file,
        }

        //the selected chat is open so messages have been read
        if (selectedChat && (selectedChat.getId() === chat.getId())) {
          if (chat.jsChat.config.lastMessage &&
            chat.jsChat.config.lastMessage.metadata) {
            chat.jsChat.config.lastMessage.metadata.unread = false
          }
          lastMessage = chat.getLastMessage()
        }

        returnVal.unread = lastMessage && lastMessage.metadata && lastMessage.metadata.unread as boolean

      }
      return returnVal
    })}
    onScrollToBottom={() => paginate()}
  />,
  renderMessageListHeader = ({ heading, clearMessageList, isMobile, lastActive }) => {
    return <MessageHeader
      lastActive={demo ? new Date() : lastActive}
      mobileView={isMobile}
      showBack={isMobile}
      onBack={clearMessageList}> {heading}</MessageHeader>
  },
  renderIsTyping = () => undefined,
  renderMessageList = ({ loading, messages, paginate, connectedUser, typingUser, isMobile }) => <MessageList
    mobileView={isMobile}
    typingIndicatorContent={typingUser ? `${typingUser.name} is typing` : ""}
    customTypingIndicatorComponent={(() => typingUser ? renderIsTyping({ user: typingUser, isMobile }) : undefined)()}
    showTypingIndicator={typingUser ? true : false}
    currentUserId={connectedUser.id}
    customEmptyMessagesComponent={(() => renderEmptyMessages({ isMobile }))()}
    customLoaderComponent={(() => renderLoader({ isMobile }))()}
    messages={messages && messages.map((ogMessage) => {
      const { createdAt, ...message } = ogMessage
      if (message.file) {
        return {
          ...message,
          createdAt,
          media: message.file,
        }
      } else {
        return {
          ...message,
          createdAt,
        }
      }
    })}
    onScrollToTop={() => paginate()}
    loading={loading}
  />,
  renderInput = ({ sendMessage, sendFile, inputProps, isMobile }) => <MessageInput
    mobileView={isMobile}
    {...inputProps}
    showAttachButton={showAttachButton}
    showSendButton={showSendButton}
    disabled={disableInput}
    onAttachClick={sendFile}
    onSendMessage={sendMessage} />,

}: Props) {

  const { chats, loading: chatsLoading, paginate: chatsPaginate, chatsOrdered } = useChats()

  const [selectedChat, setSelectedChat] = useState<Chat | null>()
  const [typingUser, setTypingUser] = useState<User | undefined>()
  const [lastOnline, setLastOnline] = useState<Date | undefined>()

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

          chat = await minchat.chat((usernames)[0], { metadata: startConversationMetadata })
        } else {
          //it is a group chat with multiple people
          chat = await minchat.groupChat({
            title: groupChatTitle,
            memberUsernames: usernames,
            metadata: startConversationMetadata
          })
        }


        setSelectedChat(chat)
      }
    }

    setupStartConversation()

  }, [startConversation, minchat])

  useEffect(() => {
    if (chats) {
      if (openChatId) {
        for (const chat of chats) {
          const chatId = chat.getId()
          if (chatId && (chatId.toLowerCase() === openChatId.toLowerCase())) {
            setSelectedChat(chat)
            break
          }
        }
      } else {
        if (!selectedChat && chatsOrdered > 0) {
          if (chats.length > 0 && !isMobile && !mobileView && !startConversation) {
            //using this method because if I use chats[0] it isnt selecting the correct first item
            const chat = chats.slice(0, 1)[0];
            setSelectedChat(chat)
          }
        }
      }
    }
  }, [chats, chatsOrdered, openChatId])

  let lastActiveIntervalId: any


  useEffect(() => {
    // clear the interval when the selected chat changes
    clearInterval(lastActiveIntervalId)
    setLastOnline(undefined)

    async function init() {
      if (selectedChat) {
        selectedChat.onTypingStarted((user) => {
          setTypingUser(user)
        })

        selectedChat.onTypingStopped((_) => {
          setTypingUser(undefined)
        })

        const memberIds = selectedChat.getMemberIds()

        if (memberIds.length === 1 && minchat) {
          // query last active
          const user = await minchat.fetchUserById(memberIds[0])
          setLastOnline(user.lastActive)
          // add listener
          selectedChat.onMemberStatusChanged((_, status) => {
            if (status === Status.ONLINE) {
              lastActiveIntervalId = setInterval(() => {
                setLastOnline(new Date())
              }, 50_000)

              setLastOnline(new Date())
            } else {
              // its offline so disable the online interval update
              clearInterval(lastActiveIntervalId)
            }
          })
        } else {
          setLastOnline(undefined)
        }
      }
    }

    init()

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
  }

  /**
   * 
   */
  const ChatListHeaderComponent = () => renderChatListHeader({ isMobile: determineIsMobile() })

  /**
 * 
 */
  const ChatListComponent = () => currentUser && renderChatList({
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
  const MessageListHeaderComponent = () => renderMessageListHeader({
    heading: (selectedChat && selectedChat.getTitle()) || "",
    clearMessageList: () => setSelectedChat(undefined),
    isMobile: determineIsMobile(),
    lastActive: lastOnline
  })

  /**
 * 
 */
  const MessageListComponent = () => currentUser && renderMessageList({
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
  const InputComponent = () => renderInput({
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
              {MessageListHeaderComponent()}
              {MessageListComponent()}
              {InputComponent()}
            </MessageContainer>
            :
            <div style={{ position: "relative", width: "100%" }}>
              {ChatListHeaderComponent()}
              {ChatListComponent()}
            </div>
        )
          :

          /* desktop view */
          <>
            <Sidebar>
              {ChatListHeaderComponent()}
              {ChatListComponent()}
            </Sidebar>

            <MessageContainer>
              {selectedChat ?
                <>
                  {MessageListHeaderComponent()}
                  {MessageListComponent()}
                  {InputComponent()}
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