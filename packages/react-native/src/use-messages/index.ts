import { useMessages as useReactUseMessages, Chat, FullMessage } from '@minchat/react'

interface File {
    uri: string;
    fileName?: string;
    type: string;
}

interface SendMessage {
    text?: string;
    file?: File;
    created_at?: string;
}


const useMessages = (chat?: Chat, reverse?: boolean) => {

    const {
        sendMessage: reactSendMessage,
        ...rest
    } = useReactUseMessages(chat, reverse)

    const sendMessage = async (message: SendMessage, callback?: ( data: FullMessage) => void) => {
        // let file: AltFile | undefined = undefined
        let file
        if (message.file) {
            try {
                const response = await fetch(message.file.uri);
                const blobObj = await response.blob();

                const name = message.file.uri.split('/').pop()
                const buffer = new Blob([blobObj]);

                file = {
                    type: blobObj.type,
                    name: name ? name : "",
                    blob: buffer
                }

            } catch (e) {
                console.log(e)
            }
        }

        //todo create the file 
        reactSendMessage({
            ...message,
            file
        }, callback)
    }

    return {
        ...rest,
        sendMessage,
    }

}

export default useMessages