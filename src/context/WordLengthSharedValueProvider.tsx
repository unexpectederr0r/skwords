import React, { createContext, useContext, useState } from 'react'

const SharedValueContext = createContext(null)

export const useWordLengthSharedValue = () => useContext(SharedValueContext)

export const WordLengthSharedValueProvider = ({ children, initialStateValue }) => {
    const [sharedValue, setSharedValue] = useState(initialStateValue?initialStateValue:null)
    return (
        <SharedValueContext.Provider value={{ sharedValue, setSharedValue }}>
            {children}
        </SharedValueContext.Provider>
    )
}