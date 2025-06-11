import { useEffect, useState } from 'react';
import { Chat, useMessages,useMinChat } from '..';

export const ChildComponent = () => {
  const minchat = useMinChat();
  const [messageText, setMessageText] = useState("Hello World");
  const [file, setFile] = useState<any>();
  const [selectedChat, setSelectedChat] = useState<Chat | undefined >();

  useEffect(() => {
    const setup = async () => {
      if (minchat) {
        const user = await minchat.createUser({ username: "user3", name: "Jack User 3" });
        const chat = await minchat.chat(user.username);
        if (chat) {
          setSelectedChat(chat);
        }
      }
    };
    setup();
  }, [minchat]);

  const { sendMessage, messages, loading, paginate: paginateMessages } = useMessages(selectedChat);

  const handleSendMessage = () => {
    sendMessage({ file, text: messageText }, (data: any) => { console.log("send message response", { data }); });
  };

  const handlePaginate = () => {
    paginateMessages();
  };

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
  );
}; 