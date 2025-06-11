import { MinChatProvider } from '..';
import { ChildComponent } from './ChildComponent';

const apiKey = "CMBPFNMXW0000WEV26EYE6TUT";

function App() {
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
    </MinChatProvider>
  );
}

export default App;
