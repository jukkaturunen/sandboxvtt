import React from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import FrontPage from './pages/FrontPage'
import SandboxPage from './pages/SandboxPage'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<FrontPage />} />
        <Route path="/sandbox/:id" element={<SandboxPage />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
