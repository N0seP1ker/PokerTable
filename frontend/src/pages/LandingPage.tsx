import React, { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useSocket } from '../hooks/useSocket'
import { getDeviceFingerprint } from '../utils/deviceFingerprint'
import './LandingPage.css'

const LandingPage: React.FC = () => {
  const [playerName, setPlayerName] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [deviceId, setDeviceId] = useState<string>('')

  const { socket } = useSocket()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  // Get device fingerprint on mount
  useEffect(() => {
    getDeviceFingerprint().then(setDeviceId)
  }, [])

  // Check for saved player name in localStorage
  useEffect(() => {
    const savedName = localStorage.getItem('pokerPlayerName')
    if (savedName) {
      setPlayerName(savedName)
    }
  }, [])

  // Check if there's a room ID in the URL (direct link to room)
  useEffect(() => {
    const urlRoomId = searchParams.get('room')
    const savedName = localStorage.getItem('pokerPlayerName')

    // If there's a room in URL and we have a saved name, auto-join
    if (urlRoomId && savedName && socket && deviceId) {
      setLoading(true)
      socket.emit('join_room', urlRoomId, savedName, deviceId)
    }
  }, [searchParams, socket, deviceId])

  useEffect(() => {
    if (!socket) return

    socket.on('room_created', (room, _playerId) => {
      setLoading(false)
      navigate(`/room/${room.id}`)
    })

    socket.on('room_joined', (room, _playerId) => {
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!socket || !playerName.trim()) {
      setError('Please enter your name')
      return
    }

    const trimmedName = playerName.trim()

    // Save player name to localStorage for persistence
    localStorage.setItem('pokerPlayerName', trimmedName)

    setLoading(true)
    setError('')

    // Ensure we have device ID
    const currentDeviceId = deviceId || await getDeviceFingerprint()
    if (!deviceId) {
      setDeviceId(currentDeviceId)
    }

    // Check if joining existing room or creating new one
    const urlRoomId = searchParams.get('room')
    if (urlRoomId) {
      socket.emit('join_room', urlRoomId, trimmedName, currentDeviceId)
    } else {
      // Auto-create a room with the player's name
      const roomName = `${trimmedName}'s Room`
      socket.emit('create_room', roomName, trimmedName, currentDeviceId)
    }
  }

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPlayerName(e.target.value)
    if (error) setError('')
  }

  return (
    <div className="landing-page">
      <div className="landing-container">
        {/* Logo/Title */}
        <div className="landing-header">
          <h1 className="landing-title">
            🃏<br />
            Friendly Poker
          </h1>
          <p className="landing-subtitle">Play Texas Hold'em with friends</p>
        </div>

        {/* Name Input Form */}
        <form onSubmit={handleSubmit} className="landing-form">
          {error && (
            <div className="landing-error">
              {error}
            </div>
          )}

          <div className="input-container">
            <input
              type="text"
              value={playerName}
              onChange={handleNameChange}
              placeholder="Enter your name"
              maxLength={20}
              className="landing-input"
              autoFocus
              disabled={loading}
            />
          </div>

          <button
            type="submit"
            className="landing-button"
            disabled={loading || !playerName.trim()}
          >
            {loading ? (
              <span className="loading-spinner">⏳</span>
            ) : (
              searchParams.get('room') ? 'Join Room' : 'Create Room'
            )}
          </button>

          <p className="landing-hint">
            {searchParams.get('room')
              ? 'You\'ve been invited to a poker room'
              : 'A new room will be created for you'}
          </p>
        </form>

        {/* Footer Info */}
        <div className="landing-footer">
          <p>• Up to 10 players</p>
          <p>• Mobile & Desktop friendly</p>
        </div>
      </div>
    </div>
  )
}

export default LandingPage
