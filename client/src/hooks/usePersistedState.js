import { useCallback, useState } from "react"
import { readItem, writeItem } from "../utils/storage.js"

export default function usePersistedState(stateKey,initialState){
    const [state,setState] = useState(()=>{
        const persistentStatetJSON = readItem(stateKey)
        if(!persistentStatetJSON){
            return initialState
        }

        try {
            return JSON.parse(persistentStatetJSON)
        } catch {
            return initialState
        }
    })

    const setPersistentState = useCallback((data) =>{
        writeItem(stateKey, JSON.stringify(data))
        setState(data)
    }, [stateKey])


    return [
        state,
        setPersistentState
    ]
}
