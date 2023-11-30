import { createContext } from "react";

type Props = {
    height: string | "full"
}

export default createContext<Props>({ height: "full" })