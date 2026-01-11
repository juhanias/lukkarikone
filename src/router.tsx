import { createBrowserRouter } from 'react-router-dom'
import Layout from './components/Layout'
import Schedule from './pages/Schedule'
import Settings from './pages/Settings'
import ErrorPage from './pages/ErrorPage'
import RootRedirect from './components/RootRedirect'

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
    basename: '/',
  }
);