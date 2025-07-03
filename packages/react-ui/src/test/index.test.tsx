import React, { useEffect } from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
// import '@testing-library/jest-dom/extend-expect';
import '@testing-library/jest-dom/vitest';
import MinChat, { MinChatProvider, useChats, useMessages } from '@minchat/react';
import { MinChatUI } from '..';
import { describe, it, expect, beforeAll, afterAll } from 'vitest'


// // This is Jest test setup file
// global.ResizeObserver = class ResizeObserver {
//     observe() {
//         // do nothing
//     }
//     unobserve() {
//         // do nothing
//     }
//     disconnect() {
//         // do nothing
//     }
// };


describe("MinChat Instance", () => {
    let userId: string
    let apiKey: string

    beforeAll(async () => {
        const response = await fetch("http://localhost:4000/sdk-test");
        const data = await response.json();
        userId = data.userId;
        apiKey = data.apiKey;
    })

    afterAll(async () => {
        await fetch("http://localhost:4000/sdk-test", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                user_id: userId
            })
        });
    })

    it("should show demo messages", async () => {


        const { findByTestId } = render(
            <MinChatUI
                theme='red'
                test={true}
                user={{ username: "demo", name: "Demo" }}
                apiKey={apiKey}
                demo
            />
        );

        const convoItem = await findByTestId('conversation-item');
        fireEvent.click(convoItem);

        const input = await findByTestId('message-input');
        const form = await findByTestId('message-form');

        // fireEvent.change(input, { target: { value: 'Hello' } });
        // fireEvent.submit(form);
        fireEvent.change(input, { target: { value: 'Complete' } });
        fireEvent.submit(form);


        await waitFor(() => {
            expect(screen.getByText('Complete')).toBeInTheDocument();
            const outgoingMessages = screen.getAllByTestId('outgoing-message')
            // console.log({ length: outgoingMessages.length })
            expect(outgoingMessages.length).toEqual(3)
        }, { timeout: 15_000 });


    }, 20_000)


    it('should send and receive messages in 1 on 1 chat', async () => {
        const user1 = { username: "user1-title", name: "User1" }
        const user2 = await MinChat.getInstance(apiKey).init({ test: true }).createUser({ username: "user2-title", name: "User2" })

        /**
         * USER 2
         */
        const MockComponent2 = () => {

            const [activeChat, setActiveChat] = React.useState<any>(null)
            const { chats } = useChats()

            useEffect(() => {
                if (chats && chats?.length > 0) {
                    setActiveChat(chats[0])
                }
            }, [chats])

            return <div>
                <ChildComponent2
                    chat={activeChat} />
            </div>;
        };

        /**
         * 
         */
        const ChildComponent2 = ({ chat }: any) => {
            const { messages, sendMessage } = useMessages(chat)


            useEffect(() => {
                switch (messages?.length) {
                    case 1:
                        // first message that gets sent
                        expect(messages[0].text).toEqual("Hello")
                        expect(messages[0].user.name).toEqual(user1.name)
                        expect(messages[0].user.username).toEqual(user1.username)

                        sendMessage({ text: "Received" })
                        break
                    case 2:
                        // second message that is received
                        expect(messages[1].text).toEqual("Received")
                        expect(messages[1].user.name).toEqual(user2.name)
                        expect(messages[1].user.username).toEqual(user2.username)
                        break
                }

            }, [messages])
            return <div></div>;
        };

        render(
            <MinChatProvider
                test
                apiKey={apiKey}
                user={user2}>
                <MockComponent2 />
            </MinChatProvider>
        );

        const { findByTestId } = render(
            <MinChatUI
                theme='red'
                test={true}
                user={user1}
                startConversation={async (minchat) => {
                    const user = await minchat.createUser(user2)
                    return user.username
                }}
                apiKey={apiKey}

            />
        );

        // send a message
        const input = await findByTestId('message-input');
        const form = await findByTestId('message-form');

        fireEvent.change(input, { target: { value: 'Hello' } });
        fireEvent.submit(form);

        const outGoingMessages = await screen.findAllByTestId('outgoing-message')

        await waitFor(() => {
            expect(screen.getByText('Received')).toBeInTheDocument();
            expect(outGoingMessages.length).toEqual(1)
        }, { timeout: 15_000 });
    }, 20_000)


})

