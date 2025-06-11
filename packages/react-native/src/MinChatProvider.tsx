import React from 'react'
import { type MinChatProviderProps, MinChatProvider as ReactMinChatProvider } from '@minchat/react'

const MinChatProvider = (props: MinChatProviderProps) => {
    return (
        <ReactMinChatProvider
            {...props}
            socketOptions={
                {
                    transports: ['websocket'], // you need to explicitly tell it to use websockets
                }
            }
        />
    )
}

export default MinChatProvider