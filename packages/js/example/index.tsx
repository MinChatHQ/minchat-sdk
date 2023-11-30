import 'react-app-polyfill/ie11';
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import MinChat, { } from '../.';
import { MinChatInstance } from '../dist/minchat-instance';


const apiKey = ""

/**
 * 
 * @returns 
 */
const App = () => {
  const [minchatInstance, setMinChatInstance] = React.useState<MinChatInstance>()

  React.useEffect(() => {
    const setup = async () => {
      const instance = MinChat.getInstance(apiKey).init({ test: true })
      await instance.connectUser({ username: "fred", name: "Fred" })
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
      username: "test",
      name: "Test",
      avatar: selectedFile
    })

    const groupChat = await instance.groupChat({
      memberUsernames: [createdUser.username],
      avatar: selectedChatFile
    })

    console.log({ chatAvatar: groupChat?.getChatAvatar() })

    groupChat?.sendMessage({
      file: messageFile
    }, (message) => console.log({ message }))
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

ReactDOM.render(<App />, document.getElementById('root'));
