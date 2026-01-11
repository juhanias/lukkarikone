import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { RouterProvider } from 'react-router-dom'
import { I18nextProvider } from 'react-i18next'
import { MotionConfig } from 'framer-motion'
import { NuqsAdapter } from 'nuqs/adapters/react-router'
import './tw.css'
import { router } from './router'
import { ThemeProvider } from './components/ThemeProvider'
import { NotificationProvider } from './components/notifications/NotificationProvider'
import i18n from './i18n'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <MotionConfig reducedMotion="user">
      <I18nextProvider i18n={i18n}>
        <ThemeProvider>
          <NotificationProvider>
            <NuqsAdapter>
              <RouterProvider router={router} />
            </NuqsAdapter>
          </NotificationProvider>
        </ThemeProvider>
      </I18nextProvider>
    </MotionConfig>
  </StrictMode>,
)
