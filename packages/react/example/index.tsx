import 'react-app-polyfill/ie11';
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { MinChatProvider, useMinChat, useChats, useMessages, useUser, Chat } from '../.';


const apiKey = ""

/**
 * 
 * @returns 
 */
const App = () => {

  return (
    <MinChatProvider
      demo
      test={true}
      apiKey={apiKey}
      user={{
        username: "user2",
        name: "Markus",
        avatar: "https://google.com"
      }}
      onMessage={(message, chat) => {
        const name = chat.getTitle()
        console.log("onMessage, ", { name })
      }}
    >
      <ChildComponent />
      {/*  */}
    </MinChatProvider>
  );
};


/**
 * 
 * @returns 
 */
const ChildComponent = () => {
  // const { chats } = useChats()

  const minchat = useMinChat()

  const { chats, paginate: paginateChats } = useChats()

  console.log({ chats })
  const [messageText, setMessageText] = React.useState("Hello World")
  const [file, setFile] = React.useState<any>()

  const [selectedChat, setSelectedChat] = React.useState<Chat | undefined>()

  // const chat = minchat.chat({ id: "user2", name: "Jack User 2" })

  //start a groupchat
  const groupChat = minchat.groupChat({
    name: "Dynamo",
    members: [{ id: "user2", name: "Adam Steven" }, { id: "user1", name: "Markus" }]
  })

  const chat = minchat.chat({
    id: 'user191',
    name: 'Micheal Saunders',
    avatar: 'urltoavatar.com/michaelavatar.jpg',
  })

  const { sendMessage, messages, loading, paginate: paginateMessages } = useMessages(chat)



  React.useEffect(() => {
    if (selectedChat) {
      selectedChat.onTypingStarted((user) => {
        console.log({ startedTyping: user })
      })

      selectedChat.onTypingStopped((user) => {
        console.log({ stoppedTyping: user })
      })
    }
  }, [selectedChat])

  React.useEffect(() => {
    if (chats && chats.length > 0) {
      setSelectedChat(chats[1])
    }
  }, [chats])

  const handleSendMessage = () => {
    sendMessage({
      file,
      text: messageText
    },
      (err, data) => { console.log("send message response", { data, err }) })
  }


  const handlePaginate = () => {
    paginateChats()
    paginateMessages()

  }

  return (
    <div>
      <input
        type="file"
        onChange={e => setFile(e.target.files && e.target.files[0])}
      />
      <input
        onChange={e => setMessageText(e.target.value)}
      />
      <button onClick={handleSendMessage}>Send</button>
      <button onClick={() => setSelectedChat(minchat.chat({ id: "adam", name: "Adam Steven" }))}>Switch chat</button>
      <button onClick={handlePaginate}>Paginate</button>

    </div>
  )
}

ReactDOM.render(<App />, document.getElementById('root'));
