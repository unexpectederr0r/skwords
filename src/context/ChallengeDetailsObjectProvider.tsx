import React, { createContext, useContext, useState } from 'react'

const SharedValueContext = createContext(null)

export const useChallengeDetailsObjectSharedValue = () => useContext(SharedValueContext)

export const ChallengeDetailsObjectSharedValueProvider = ({ children, initialStateValue }) => {
    const [sharedValue, setSharedValue] = useState(initialStateValue?initialStateValue:null)
    return (
        <SharedValueContext.Provider value={{ sharedValue, setSharedValue }}>
            {children}
        </SharedValueContext.Provider>
    )
}