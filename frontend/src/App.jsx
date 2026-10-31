import { BrowserRouter, Navigate, Route, Routes, useParams } from 'react-router-dom'
import './App.css'
import Navbar from './components/Navbar.jsx'
import Footer from './components/Footer.jsx'
import Home from './pages/Home.jsx'
import ResumeAnalysis from './pages/ResumeAnalysis.jsx'
import Instructions from './pages/Instructions.jsx'
import Interview from './pages/Interview.jsx'
import Report from './pages/Report.jsx'
import { getActiveSessionId } from './lib/sessionStore.js'

function SessionPage({ component: Page }) {
  const { sessionId } = useParams()
  return <Page sessionId={sessionId} />
}

function ActiveSessionPage({ component: Page }) {
  const sessionId = getActiveSessionId()
  return <Page sessionId={sessionId} />
}

function AppLayout() {
  return (
    <div className="app-frame">
      <Navbar />
      <div className="demo-banner">
        <span className="demo-banner-dot" aria-hidden="true" />
        FastAPI stores session answers. Resume analysis, AI question generation, evaluation, and RAG sources are not implemented yet.
      </div>
      <main className="page-content">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/analysis" element={<ResumeAnalysis />} />
          <Route path="/instructions" element={<Instructions />} />
          <Route path="/interview" element={<ActiveSessionPage component={Interview} />} />
          <Route path="/interview/:sessionId" element={<SessionPage component={Interview} />} />
          <Route path="/report" element={<ActiveSessionPage component={Report} />} />
          <Route path="/report/:sessionId" element={<SessionPage component={Report} />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      <Footer />
    </div>
  )
}

function App() {
  return (
    <BrowserRouter>
      <AppLayout />
    </BrowserRouter>
  )
}

export default App
