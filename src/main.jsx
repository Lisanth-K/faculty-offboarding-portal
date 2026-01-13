import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'

// 1. Tailwind Base (MUST BE FIRST)
import './styles/index.css'      

// 2. Your Custom Styles
import './styles/components.css'
import './styles/layout.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)