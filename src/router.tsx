import { createBrowserRouter, Navigate } from "react-router-dom";
import Layout from "./components/Layout";
import RootRedirect from "./components/RootRedirect";
import ErrorPage from "./pages/ErrorPage";
import Schedule from "./pages/Schedule";
import Settings from "./pages/Settings";

export const router = createBrowserRouter(
  [
    {
      path: "/",
      element: <RootRedirect />,
      errorElement: <ErrorPage />,
    },
    {
      path: "/app",
      element: <Layout />,
      errorElement: <ErrorPage />,
      children: [
        {
          index: true,
          element: <Navigate to="/app/cal-1" replace />,
        },
        {
          path: ":calendarId",
          element: <Schedule />,
        },
        {
          path: "settings",
          element: <Settings />,
        },
      ],
    },
  ],
  {
    basename: "/",
  },
);
