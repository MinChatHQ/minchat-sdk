import 'react-app-polyfill/ie11';
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { MinChatUI } from '..';
import styled from 'styled-components'
import { BrowserRouter, Route, Switch } from 'react-router-dom';
import './index.css'
import { io } from "socket.io-client"

const devKey = "CLQAJZ09B00007STC893B3TCL"
const prodKey = ""


const apiKey = devKey

const user1 = {
  username: "user11",
  name: "Markus User 1",
  avatar: "https://google.com"
}

const user2 = {
  username: "user22",
  name: "Jack User Hey 2",
  avatar: "https://google.com"
}

const user3 = {
  username: "user33",
  name: "Danny User 3",
  avatar: "https://google.com"
}

const user4 = {
  username: "user44",
  name: "Annie User 4",
}

const user5 = {
  username: "user55",
  name: "Gerald User 5",
}

const user6 = {
  username: "user66",
  name: "Faith User 6",
}

const user7 = {
  username: "user77",
  name: "Faith User 7",
}

const App = () => {
  const [selectedUser, setSelectedUser] = React.useState(user1)

  React.useEffect(() => {
    const socket = io("https://api.minchat.io", { transports: ['websocket'] });

    socket.emit('room.user.join', { channelUserId: "clrdntfdp0001k9e1jubalkok", apiKey: apiKey })

    socket.emit('room.join', { channelId: "clrdnttr30005k9e1mcs7cf2y", apiKey: apiKey })

    socket.on('typing.start', (userData) => {
      console.log({ started: userData })
    })
    socket.on('typing.stop', (userData) => {
      console.log({ stopped: userData })
    })

  }, [])

  return (
    <BrowserRouter>
      <Switch>
        <Route path="/user-1">

          {/* <div  style={{width: "100%", display: "flex" ,backgroundColor: "red", padding:"16px", height: "30rem"}}> */}
          <div style={{}}>
            <button onClick={() => {
              setSelectedUser(user2)
            }}>Change to user 2</button>
            <MinChatUI
              // demo={true}
              theme='red'
              test={true}
              user={selectedUser}
              startConversation={async (minchat) => {
                const user = await minchat.createUser(user2)
                return [user.id]
              }}
              groupChatTitle="Dize"
              apiKey={apiKey}
            />
            {/* </div> */}
          </div>
        </Route>

        <Route path="/user-2">
          <MinChatUI
            test={true}
            // demo={true}
            height='400px'
            // startConversation={async (minchat) => {
            //   const userA = await minchat.createUser(user1)
            //   const userB = await minchat.createUser(user3)
            //   const userC = await minchat.createUser(user4)
            //   const userD = await minchat.createUser(user7)

            //   return [userA.username, userB.username, userC.username, userD.username]
            // }}
            user={user2}
            apiKey={apiKey}
          />
        </Route>

        <Route path="/user-3">
          <MinChatUI
            test={true}
            user={user3}
            demo
            // startConversation={[user1, user2, user4]}
            // startConversation={["user1", "user2"]}
            // groupChatTitle="Epic Gamers Group Chat"
            apiKey={apiKey}
          />
        </Route>

        <Route path="/user-6">
          <div style={{ width: "100%" }}>
            <div style={{ width: '80rem' }}>
              <MinChatUI
                test={true}
                user={user6}
                startConversation={async (minchat) => {
                  const user = await minchat.createUser(user1)

                  return user.username
                }}
                // groupChatTitle="Epic Gamers Group Chat"
                apiKey={apiKey}
                theme='black'
                colorSet={{
                  //outgoing message
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
        </Route>

        {/* user 1 and user 2 */}
        <Route path="/user-1-2">
          <div className='container'>
            <MinChatUI
              // demo={true}
              test={true}
              openChatId='clqdhzd6f000ltcdofbp5vedo'
              groupChatTitle='Groupies'

              user={user1}
              apiKey={apiKey}
              renderIsTyping={({ user }) => <div>{user.name} is typing</div>}
              renderEmptyMessages={() => <div>No Messages Here</div>}
            // renderInput={() => <input/>}
            />

            <MinChatUI
              test={true}
              // demo={true}
              startConversation={async (minchat) => {
                const u1 = await minchat.createUser(user1)
                const u3 = await minchat.createUser(user3)

                return u1.username
              }}
              user={user2}
              apiKey={apiKey}
              mobileView={false}
            // renderMessageList={() => <div style={{margin: "70px"}}> Messages </div>}
            // renderChatHeader={()=>undefined}
            />
          </div>
        </Route>



        {/* all users */}
        <Route path="/all-users">
          <div className='container'>

            {/* square 1 */}
            <div className='sq'>
              <div className='innersq'>
                <MinChatUI
                  groupChatTitle='Redemption arc'
                  startConversation={async (minchat) => {
                    const user = await minchat.createUser(user2)

                    return user.username
                  }}
                  height='100%'
                  test={true}
                  user={user1}
                  apiKey={apiKey}
                />
              </div>
            </div>

            {/* square 2 */}
            <div className='sq'>
              <div className='innersq'>
                <MinChatUI
                  groupChatTitle='The Gamers'
                  // startConversation={[user5, user1]}
                  height='100%'
                  test={true}
                  user={user2}
                  apiKey={apiKey}
                />
              </div>
            </div>

            {/* square 3 */}
            <div className='sq'>
              <div className='innersq'>
                <MinChatUI
                  // startConversation={[user5, user2]}
                  height='100%'
                  test={true}
                  user={user3}
                  apiKey={apiKey}
                />
              </div>
            </div>

            {/* square 4 */}
            <div className='sq'>
              <div className='innersq'>
                <MinChatUI
                  groupChatTitle='The Gamers'
                  // startConversation={user3}
                  height='100%'
                  test={true}
                  user={user4}
                  apiKey={apiKey}
                />
              </div>
            </div>


          </div>
        </Route>


        <Route exact path="/">
          <a href='/all-users'>All Users</a><br />
          <a href='/user-1-2'>User 1 + User 2</a><br />
          <a href='/user-1'>User 1</a><br />
          <a href='/user-2'>User 2</a><br />
          <a href='/user-3'>User 3</a><br />

          <a href='/user-6'>User 6</a><br />

        </Route>
      </Switch>
    </BrowserRouter>
  );
};

ReactDOM.render(<App />, document.getElementById('root'));
