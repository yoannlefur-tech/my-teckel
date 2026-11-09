import { CssBaseline, ThemeProvider, createTheme } from '@mui/material'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider theme={createTheme()}>
      <CssBaseline />
      <App />
    </ThemeProvider>
  </StrictMode>,
)
