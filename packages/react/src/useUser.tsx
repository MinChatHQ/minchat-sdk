import { useContext } from "react"
import MinChatContext from "./MinChatContext"


/**
 * get the user object thats attached to the minchat object
 * @returns 
 */
const useUser = () => {
    const { user } = useContext(MinChatContext)

    return user
}

export default useUser