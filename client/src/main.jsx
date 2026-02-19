import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'

// Performance: Disable StrictMode in production for better performance
const isDev = import.meta.env.DEV

// Prevent layout flash by adding loaded class after CSS loads
document.getElementById('root').classList.add('loaded')

ReactDOM.createRoot(document.getElementById('root')).render(
  isDev ? (
    <React.StrictMode>
      <App />
    </React.StrictMode>
  ) : (
    <App />
  )
)