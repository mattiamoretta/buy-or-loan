import React from 'react'
import ReactDOM from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import App from './App.jsx'
import Mutuo from './guides/Mutuo.jsx'
import MutuoRisparmiChiusura from './guides/MutuoRisparmiChiusura.jsx'
import MutuoInvestimento from './guides/MutuoInvestimento.jsx'
import Investimento from './guides/Investimento.jsx'
import './index.css'

const router = createBrowserRouter([
  { path: '/', element: <App /> },
  { path: '/mutuo', element: <Mutuo /> },
  { path: '/mutuo-risparmi-chiusura', element: <MutuoRisparmiChiusura /> },
  { path: '/mutuo-investimento', element: <MutuoInvestimento /> },
  { path: '/investimento', element: <Investimento /> },
])

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>,
)
