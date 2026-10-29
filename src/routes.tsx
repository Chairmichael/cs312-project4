import { createBrowserRouter, RouterProvider } from 'react-router'
/* pages and layout */
import Layout from './layout'
import Login from './pages/Login'
import Signup from './pages/Signup'
// import Connect from './pages/Connect'

const router = createBrowserRouter([
  {
    path: '/',
    Component: Layout,
    children: [
      { path: '/login', Component: Login },
      { path: '/signup', Component: Signup },
    ],
  },
])

export function AppRouter() {
  return <RouterProvider router={router} />;
}
