import { createBrowserRouter, Navigate, RouterProvider } from 'react-router'
/* pages and layout */
import Layout from './layout'
import Login from './pages/LoginPage'

const router = createBrowserRouter([
  {
    path: '/',
    Component: Layout,
    children: [
      { path: '/signin', element: <Login /> },
      { path: '/signup', element: <Login formType="signup" /> },
      { path: '/login', element: <Navigate to="/signin" replace /> },
    ],
  },
])

export default function AppRouter() {
  return <RouterProvider router={router} />;
}
