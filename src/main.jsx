import React from 'react'
import ReactDOM from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import App from './App.jsx'
import MutuoGuide from './MutuoGuide.jsx'
import MutuoRisparmiChiusuraGuide from './MutuoRisparmiChiusuraGuide.jsx'
import MutuoInvestimentoGuide from './MutuoInvestimentoGuide.jsx'
import InvestimentoGuide from './InvestimentoGuide.jsx'
import './index.css'

const router = createBrowserRouter(
  [
    { path: '/', element: <App /> },
    { path: '/mutuo', element: <MutuoGuide /> },
    { path: '/mutuo-risparmi-chiusura', element: <MutuoRisparmiChiusuraGuide /> },
    { path: '/mutuo-investimento', element: <MutuoInvestimentoGuide /> },
    { path: '/investimento', element: <InvestimentoGuide /> },
  ],
  {
    basename: import.meta.env.BASE_URL,
  }
)

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>,
)
