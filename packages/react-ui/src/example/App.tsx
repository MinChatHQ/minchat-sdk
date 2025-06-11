import { BrowserRouter, Route, Routes } from 'react-router-dom';
import './App.css';
// import { io } from 'socket.io-client';
import { MinChatUI } from '..';
import { useState } from 'react';

const devKey = "CMBPFNMXW0000WEV26EYE6TUT";
const prodKey = "";

const apiKey = devKey;

const user1 = {
  username: "user11",
  name: "Markus User 1",
  avatar: "https://google.com"
};

const user2 = {
  username: "user22",
  name: "Jack User Hey 2",
  avatar: "https://google.com"
};

const user3 = {
  username: "user33",
  name: "Danny User 3",
  avatar: "https://google.com"
};

const user4 = {
  username: "user44",
  name: "Annie User 4",
};

const user5 = {
  username: "user55",
  name: "Gerald User 5",
};

const user6 = {
  username: "user66",
  name: "Faith User 6",
};

const user7 = {
  username: "user77",
  name: "Faith User 7",
};

function App() {
  const [selectedUser, setSelectedUser] = useState(user1);

  // React.useEffect(() => {
  //   const socket = io("https://api.minchat.io", { transports: ['websocket'] });
  //   socket.emit('room.user.join', { channelUserId: "clrdntfdp0001k9e1jubalkok", apiKey: apiKey });
  //   socket.emit('room.join', { channelId: "clrdnttr30005k9e1mcs7cf2y", apiKey: apiKey });
  //   socket.on('typing.start', (userData) => {
  //     console.log({ started: userData });
  //   });
  //   socket.on('typing.stop', (userData) => {
  //     console.log({ stopped: userData });
  //   });
  // }, []);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/user-1" element={
          <div>
            <button onClick={() => setSelectedUser(user2)}>Change to user 2</button>
            <MinChatUI
              theme='red'
              test={true}
              user={selectedUser}
              startConversation={async (minchat) => {
                const user = await minchat.createUser(user2);
                return [user.id];
              }}
              groupChatTitle="Dize"
              apiKey={apiKey}
            />
          </div>
        } />
        <Route path="/user-2" element={
          <MinChatUI
            test={true}
            height='400px'
            user={user2}
            apiKey={apiKey}
          />
        } />
        <Route path="/user-3" element={
          <MinChatUI
            test={true}
            user={user3}
            demo
            apiKey={apiKey}
          />
        } />
        <Route path="/user-6" element={
          <div style={{ width: "100%" }}>
            <div style={{ width: '80rem' }}>
              <MinChatUI
                test={true}
                user={user6}
                startConversation={async (minchat) => {
                  const user = await minchat.createUser(user1);
                  return user.username;
                }}
                apiKey={apiKey}
                theme='black'
                colorSet={{
                  "--outgoing-message-text-color": "#FF0000",
                  "--outgoing-message-background-color": "rgb(255, 255, 0)",
                  "--outgoing-message-timestamp-color": "#FF0000",
                  "--outgoing-message-checkmark-color": "#FF0000",
                  "--outgoing-message-loader-color": "#FF0000",
                  "--outgoing-message-link-color": "rgb(0, 128, 0)",
                  "--messagelist-background-color": "pink",
                }}
              />
            </div>
          </div>
        } />
        <Route path="/user-1-2" element={
          <div className='container'>
            <MinChatUI
              test={true}
              openChatId='clqdhzd6f000ltcdofbp5vedo'
              groupChatTitle='Groupies'
              user={user1}
              apiKey={apiKey}
              renderIsTyping={({ user }) => <div>{user.name} is typing</div>}
              renderEmptyMessages={() => <div>No Messages Here</div>}
            />
            <MinChatUI
              test={true}
              startConversation={async (minchat) => {
                const u1 = await minchat.createUser(user1);
                const u3 = await minchat.createUser(user3);
                return u1.username;
              }}
              user={user2}
              apiKey={apiKey}
              mobileView={false}
            />
          </div>
        } />
        <Route path="/all-users" element={
          <div className='container'>
            <div className='sq'>
              <div className='innersq'>
                <MinChatUI
                  groupChatTitle='Redemption arc'
                  startConversation={async (minchat) => {
                    const user = await minchat.createUser(user2);
                    return user.username;
                  }}
                  height='100%'
                  test={true}
                  user={user1}
                  apiKey={apiKey}
                />
              </div>
            </div>
            <div className='sq'>
              <div className='innersq'>
                <MinChatUI
                  groupChatTitle='The Gamers'
                  height='100%'
                  test={true}
                  user={user2}
                  apiKey={apiKey}
                />
              </div>
            </div>
            <div className='sq'>
              <div className='innersq'>
                <MinChatUI
                  height='100%'
                  test={true}
                  user={user3}
                  apiKey={apiKey}
                />
              </div>
            </div>
            <div className='sq'>
              <div className='innersq'>
                <MinChatUI
                  groupChatTitle='The Gamers'
                  height='100%'
                  test={true}
                  user={user4}
                  apiKey={apiKey}
                />
              </div>
            </div>
          </div>
        } />
        <Route index element={
          <div>
            <a href='/all-users'>All Users</a><br />
            <a href='/user-1-2'>User 1 + User 2</a><br />
            <a href='/user-1'>User 1</a><br />
            <a href='/user-2'>User 2</a><br />
            <a href='/user-3'>User 3</a><br />
            <a href='/user-6'>User 6</a><br />
          </div>
        } />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
