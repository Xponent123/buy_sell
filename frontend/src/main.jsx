import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Provider } from "./components/ui/provider"
import './index.css'
import App from './App.jsx'
import { BrowserRouter as Router } from 'react-router-dom'
import { ThemeProvider } from '../context/ThemeContext'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ThemeProvider>
      <Provider>
        <Router>
          <App />
        </Router>
      </Provider>
    </ThemeProvider>
  </StrictMode>,
)