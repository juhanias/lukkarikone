import { MotionConfig } from "framer-motion";
import { NuqsAdapter } from "nuqs/adapters/react-router";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { I18nextProvider } from "react-i18next";
import { RouterProvider } from "react-router-dom";
import "./tw.css";
import { NotificationProvider } from "./components/notifications/NotificationProvider";
import { ThemeProvider } from "./components/ThemeProvider";
import i18n from "./i18n";
import { router } from "./router";

createRoot(document.getElementById("root")!).render(
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
);
