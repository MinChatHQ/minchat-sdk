import { MinChatProviderProps, MinChatProvider as ReactMinChatProvider } from '@minchat/react'
import React from 'react'

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