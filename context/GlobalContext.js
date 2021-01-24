import React, {useState} from 'react'

export const GlobalContext = React.createContext(null)

const defaultState = {
  currentUser: {
    isLoggedIn: false,
    uid: "",
  },
};

export function GlobalContextProvider({children}) {
    const [globalState, setGlobalState] = useState(defaultState)

    return (
        <GlobalContext.Provider value={[globalState, setGlobalState]}>
            {children}
        </GlobalContext.Provider>
    )
}