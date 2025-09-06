import React, { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useSocket } from '../hooks/useSocket'

const LandingPage: React.FC = () => {
  const [playerName, setPlayerName] = useState('')
  const [roomId, setRoomId] = useState('')
  const [roomName, setRoomName] = useState('')
  const [isCreating, setIsCreating] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  
  const { socket } = useSocket()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  
  // Check if there's a room ID in the URL (direct link to room)
  React.useEffect(() => {
    const urlRoomId = searchParams.get('room')
    if (urlRoomId) {
      setRoomId(urlRoomId)
      setIsCreating(false)
    }
  }, [searchParams])

  React.useEffect(() => {
    if (!socket) return

    socket.on('room_created', (room, playerId) => {
      setLoading(false)
      navigate(`/room/${room.id}`)
    })

    socket.on('room_joined', (room, playerId) => {
      setLoading(false)
      navigate(`/room/${room.id}`)
    })

    socket.on('error', (message) => {
      setLoading(false)
      setError(message)
    })

    return () => {
      socket.off('room_created')
      socket.off('room_joined')
      socket.off('error')
    }
  }, [socket, navigate])

  const handleCreateRoom = () => {
    if (!socket || !playerName.trim() || !roomName.trim()) {
      setError('Please fill in all fields')
      return
    }

    setLoading(true)
    setError('')
    socket.emit('create_room', roomName.trim(), playerName.trim())
  }

  const handleJoinRoom = () => {
    if (!socket || !playerName.trim() || !roomId.trim()) {
      setError('Please fill in all fields')
      return
    }

    setLoading(true)
    setError('')
    socket.emit('join_room', roomId.trim(), playerName.trim())
  }

  return (
    <div className="container">
      <div className="title">
        <h1>Friendly PokerTable</h1>
        <p>Play Texas Hold'em with friends</p>
      </div>

      <div className="card">
        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        <div className="form-group">
          <label htmlFor="playerName">Your Name</label>
          <input
            id="playerName"
            type="text"
            value={playerName}
            onChange={(e) => setPlayerName(e.target.value)}
            placeholder="Enter your name"
            maxLength={20}
          />
        </div>

        <div style={{ marginBottom: '24px' }}>
          <div style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
            <button
              className={`btn ${!isCreating ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setIsCreating(false)}
              style={{ flex: 1 }}
            >
              Join Room
            </button>
            <button
              className={`btn ${isCreating ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setIsCreating(true)}
              style={{ flex: 1 }}
            >
              Create Room
            </button>
          </div>

          {isCreating ? (
            <>
              <div className="form-group">
                <label htmlFor="roomName">Room Name</label>
                <input
                  id="roomName"
                  type="text"
                  value={roomName}
                  onChange={(e) => setRoomName(e.target.value)}
                  placeholder="Enter room name"
                  maxLength={30}
                />
              </div>
              <button
                className="btn btn-primary"
                onClick={handleCreateRoom}
                disabled={loading || !playerName.trim() || !roomName.trim()}
              >
                {loading ? 'Creating...' : 'Create & Join Room'}
              </button>
            </>
          ) : (
            <>
              <div className="form-group">
                <label htmlFor="roomId">Room ID</label>
                <input
                  id="roomId"
                  type="text"
                  value={roomId}
                  onChange={(e) => setRoomId(e.target.value)}
                  placeholder="Enter room ID"
                />
              </div>
              <button
                className="btn btn-primary"
                onClick={handleJoinRoom}
                disabled={loading || !playerName.trim() || !roomId.trim()}
              >
                {loading ? 'Joining...' : 'Join Room'}
              </button>
            </>
          )}
        </div>

        <div style={{ 
          textAlign: 'center', 
          fontSize: '14px', 
          color: '#9ca3af',
          lineHeight: '1.5'
        }}>
          <p>Share room links with friends to play together</p>
          <p>Up to 10 players • Mobile optimized</p>
        </div>
      </div>
    </div>
  )
}

export default LandingPage