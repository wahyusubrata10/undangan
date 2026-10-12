import { lazy, StrictMode, Suspense } from 'react'
import { createRoot } from 'react-dom/client'
import '@fontsource/cormorant-garamond/300.css'
import '@fontsource/cormorant-garamond/300-italic.css'
import '@fontsource/cormorant-garamond/400.css'
import '@fontsource/cormorant-garamond/400-italic.css'
import '@fontsource/italiana/400.css'
import '@fontsource-variable/jost/wght.css'
import '@fontsource/noto-sans-balinese/400.css'
import './styles/index.css'
import { AppProvider } from './context'
import App from './App'

const Admin = lazy(() => import('./pages/Admin'))
const isAdmin = location.pathname.replace(/\/+$/, '') === '/admin'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {isAdmin ? (
      <Suspense fallback={null}>
        <Admin />
      </Suspense>
    ) : (
      <AppProvider>
        <App />
      </AppProvider>
    )}
  </StrictMode>,
)

requestAnimationFrame(() => document.getElementById('boot')?.remove())
