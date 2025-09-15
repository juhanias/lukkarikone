import { createBrowserRouter, Navigate } from 'react-router-dom'
import Layout from './components/Layout'
import Schedule from './pages/Schedule'
import Settings from './pages/Settings'
import ErrorPage from './pages/ErrorPage'

export const router = createBrowserRouter(
  [
    {
      path: "/",
      element: <Layout />,
      errorElement: <ErrorPage />,
      children: [
        {
          index: true,
          element: <Schedule />,
        },
        {
          path: "schedule",
          element: <Navigate to="/" replace />,
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