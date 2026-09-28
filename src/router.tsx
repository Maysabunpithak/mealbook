import { createBrowserRouter } from 'react-router'
import Layout from './Layout'
import HomePage from './pages/HomePage'
import RecipePage from './pages/RecipePage'
import CollectionPage from './pages/CollectionPage'
import RandomPage from './pages/RandomPage'
import AboutPage from './pages/AboutPage'
export const router = createBrowserRouter([
  { path: '/', element: <Layout />, children: [
    { index: true, element: <HomePage /> },
    { path: 'recipe/:id', element: <RecipePage /> },
    { path: 'collection', element: <CollectionPage /> },
    { path: 'random', element: <RandomPage /> },
    { path: 'about', element: <AboutPage /> },
    { path: '*', element: <p>ไม่พบหน้าที่ต้องการ</p> },
  ] },
])
