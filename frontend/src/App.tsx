import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { SocketProvider } from './hooks/useSocket'
import LandingPage from './pages/LandingPage'
import RoomPage from './pages/RoomPage'
import TablePage from './pages/TablePage'
import './App.css'

function App() {
  return (
    <SocketProvider>
      <Router>
        <div className="app">
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/room/:roomId" element={<RoomPage />} />
            <Route path="/table/:roomId" element={<TablePage />} />
          </Routes>
        </div>
      </Router>
    </SocketProvider>
  )
}

export default App