import React, { createContext, useContext, useState } from 'react'
const SharedValueContext = createContext(null)
export const useHomescreenFilterCategorySharedValue = () => useContext(SharedValueContext)
export const HomescreenFilterCategorySharedValueProvider = ({ children, initialStateValue }) => {
    const [sharedValue, setSharedValue] = useState(initialStateValue?initialStateValue:null)
    return (
        <SharedValueContext.Provider value={{ sharedValue, setSharedValue }}>
            {children}
        </SharedValueContext.Provider>
    )
}