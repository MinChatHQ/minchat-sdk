import { useContext } from "react"
import MinChatContext from "./MinChatContext"
import MinChatInstanceReact from "./MinChatInstanceReact"

/**
 * hook to get the chatbunny instance
 */
const useMinChat = (): MinChatInstanceReact | undefined => {
    const { minChat } = useContext(MinChatContext)

    return minChat
}

export default useMinChat