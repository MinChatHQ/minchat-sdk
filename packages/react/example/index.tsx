import 'react-app-polyfill/ie11';
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { MinChatProvider, useMinChat, useChats, useMessages, useUser, Chat } from '../.';


const apiKey = "CLQAJZ09B00007STC893B3TCL"

/**
 * 
 * @returns 
 */
const App = () => {

  return (
    <MinChatProvider
      test
      apiKey={apiKey}
      user={{
        username: "user2",
        name: "Markus",
        avatar: "https://google.com"
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

  const minchat = useMinChat()

  const [messageText, setMessageText] = React.useState("Hello World")
  const [file, setFile] = React.useState<any>()

  const [selectedChat, setSelectedChat] = React.useState<Chat | undefined>()


  React.useEffect(() => {
    const setup = async () => {
      if (minchat) {
        const user = await minchat.createUser({ username: "user3", name: "Jack User 3" })
        const chat = await minchat.chat(user.username)
        console.log({ chat })
        if (chat) {
          setSelectedChat(chat)
        }
      }
    }

    setup()
  }, [minchat])



  const { sendMessage, messages, loading, paginate: paginateMessages } = useMessages(selectedChat)

  console.log({ messages })


  const handleSendMessage = () => {
    sendMessage({
      file,
      text: messageText
    },
      (data) => { console.log("send message response", { data }) })
  }


  const handlePaginate = () => {
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
      <button onClick={handlePaginate}>Paginate</button>

    </div>
  )
}

ReactDOM.render(<App />, document.getElementById('root'));
