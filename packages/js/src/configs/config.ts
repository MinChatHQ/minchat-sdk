import { User } from "../types/user"
import { ManagerOptions, Socket, SocketOptions } from "socket.io-client"


export const LOCALHOST_PATH = "http://localhost:4000"
export const PRODUCTION_PATH = "https://api.minchat.io"

class Config {

    apiKey: string = ""
    demo: boolean = false

    /** if true then only localhost domains will be used */
    test: boolean = false

    localhostPath = LOCALHOST_PATH
    productionPath = PRODUCTION_PATH


    /** the socket gets assigned when the test value is assigned */
    socket?: Socket

    socketOptions?: Partial<ManagerOptions & SocketOptions> | undefined = undefined

    //the user object that gets initialized
    user?: User



    /**
   * waits for the minchat instance to be ready
   */
    async waitForInstanceReady() {
        let waitCount = 0
        const interval = 50

        // wait for config variables to be defined
        while (
            !this.user ||
            this.apiKey.length === 0
        ) {
            waitCount += interval
            await new Promise(resolve => setTimeout(resolve, interval));

            // set a timeout of 15 seconds
            if (waitCount > 15_000) {
                return false
            }
        }

        return true
    }
}

export default Config