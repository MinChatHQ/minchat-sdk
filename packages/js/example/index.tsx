import 'react-app-polyfill/ie11';
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import MinChat, { } from '../.';
import { MinChatInstance } from '../dist/minchat-instance';


const testApiKey = "cm3q5j3bn0000dp2k7yukhbwk"
const prodAPiKey = ""

const apiKey = prodAPiKey

/**
 * 
 * @returns 
 */
const App = () => {
  const [minchatInstance, setMinChatInstance] = React.useState<MinChatInstance>()

  React.useEffect(() => {
    const setup = async () => {
      const instance = MinChat.getInstance(apiKey).init({ test: false })
      await instance.connectUser({ username: "fredrick", name: "Fred" })
      setMinChatInstance(instance)
    }

    setup()

  }, [])

  return (
    minchatInstance ? <ChildComponent
      instance={minchatInstance}
    />
      :
      <div> </div>
  );
};

const ChildComponent = ({ instance }: { instance: MinChatInstance }) => {
  const [selectedFile, setSelectedFile] = React.useState<any>();
  const [selectedChatFile, setSelectedChatFile] = React.useState<any>();
  const [messageFile, setMessageFile] = React.useState<any>();


  const createUser = async () => {
    const createdUser = await instance.createUser({
      username: "the_user",
      name: "Test",
      avatar: selectedFile
    })

    const groupChat = await instance.groupChat({
      memberUsernames: [createdUser.username],
      avatar: selectedChatFile
    })


    groupChat?.sendMessage({
      file: messageFile
    }, (message) => console.log({ message }))

    console.log({ groupChat })

    const { chats } = await instance.getChats()
    console.log({ chats })

  }

  return <div >
    <div>
      <label>User Avatar</label>
      <input
        type='file'
        onChange={e => setSelectedFile(e?.target?.files && e?.target?.files[0])}
      />
    </div>

    <div>
      <label>Chat Avatar</label>
      <input
        type='file'
        onChange={e => setSelectedChatFile(e?.target?.files && e?.target?.files[0])}
      />
    </div>

    <div>
      <label>Message File</label>
      <input
        type='file'
        onChange={e => setMessageFile(e?.target?.files && e?.target?.files[0])}
      />
    </div>
    <button
      onClick={createUser}
    >Create User</button>

  </div>
}

const Test = () => {
  const [chats, setChats] = React.useState<any[]>()

  React.useEffect(() => {
    const init = async () => {
      const currentUser = {
        username: "micheal",
        name: "Micheal Saunders",
      }

      const minchat = MinChat.getInstance(apiKey)
      await minchat.connectUser(currentUser)

      const otherUser = await minchat.createUser({
        username: "example-jackal",
        name: "Example Name",
      })

      //Open chat with otherUser
      const openedChatConnection = await minchat.chat(otherUser.username);
      //Send message to other user
      openedChatConnection?.sendMessage({ text: "Hello World!" }, (message) => console.log({ message }));

      console.log({ openedChatConnection })

      //Retrive all chats for auth user
      minchat.getChats(1 /** page to query **/)
        .then(({ chats, page, totalChats, totalPages }) => {
          console.log(chats)
          setChats(chats)
        })
    }

    init()
  }, [])

  return <div>Chats: {chats?.length}</div>
}

ReactDOM.render(<Test />, document.getElementById('root'));
