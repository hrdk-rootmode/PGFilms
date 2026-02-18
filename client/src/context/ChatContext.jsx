// src/context/ChatContent.jsx
import React, { createContext, useContext, useState } from 'react'

const ChatContext = createContext()

export const useChatContext = () => {
    const context = useContext(ChatContext)
    if (!context) {
        throw new Error('useChatContext must be used within ChatProvider')
    }
    return context
}

export const ChatProvider = ({ children }) => {
    const [isOpen, setIsOpen] = useState(false)
    const [initialMessage, setInitialMessage] = useState(null)

    const openChat = (message = null) => {
        setInitialMessage(message)
        setIsOpen(true)
    }

    const closeChat = () => {
        setIsOpen(false)
        setInitialMessage(null)
    }

    const toggleChat = () => {
        setIsOpen(!isOpen)
    }

    return (
        <ChatContext.Provider value={{
            isOpen,
            setIsOpen,
            openChat,
            closeChat,
            toggleChat,
            initialMessage,
            clearInitialMessage: () => setInitialMessage(null)
        }}>
            {children}
        </ChatContext.Provider>
    )
}
