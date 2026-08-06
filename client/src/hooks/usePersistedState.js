import { useState } from "react"

export default function usePersistedState(stateKey,initialState){
    const [state,setState] = useState(()=>{
        const persistentStatetJSON = localStorage.getItem(stateKey)
        if(!persistentStatetJSON){
            return initialState
        }

        const persistentStatetData = JSON.parse(persistentStatetJSON)

        return persistentStatetData
    })

    const setPersistentState = (data) =>{
        const persistedData = JSON.stringify(data)

        localStorage.setItem(stateKey,persistedData)
        setState(data)
    }


    return [
        state,
        setPersistentState
    ]
}
