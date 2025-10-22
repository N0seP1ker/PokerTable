import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useSocket } from '../hooks/useSocket'
import PokerTable from '../components/PokerTable'
import ChatBox from '../components/ChatBox'
import type { Room, Player, TableSettings } from '../../../shared/types/index'
import './RoomPage.css'

interface Message {
  id: string;
  sender: string;
  text: string;
  timestamp: Date;
  isSystem?: boolean;
}

const RoomPage: React.FC = () => {
  const { roomId } = useParams<{ roomId: string }>()
  const [room, setRoom] = useState<Room | null>(null)
  const [currentPlayerId, setCurrentPlayerId] = useState<string>('')
  const [messages, setMessages] = useState<Message[]>([])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showSettings, setShowSettings] = useState(false)

  const { socket } = useSocket()
  const navigate = useNavigate()

  useEffect(() => {
    if (!socket || !roomId) return

    // Socket event handlers
    socket.on('room_joined', (roomData, playerId) => {
      setRoom(roomData)
      setCurrentPlayerId(playerId)
      addSystemMessage('You joined the room')
    })

    socket.on('room_created', (roomData, playerId) => {
      setRoom(roomData)
      setCurrentPlayerId(playerId)
      addSystemMessage('Room created successfully')
    })

    socket.on('player_joined', (player: Player) => {
      setRoom(prev => prev ? { ...prev, players: [...prev.players, player] } : null)
      addSystemMessage(`${player.name} joined the room`)
    })

    socket.on('player_left', (playerId: string) => {
      const leavingPlayer = room?.players.find(p => p.id === playerId)
      setRoom(prev => prev ? {
        ...prev,
        players: prev.players.filter(p => p.id !== playerId),
        seats: prev.seats.map(seat =>
          seat.player?.id === playerId
            ? { ...seat, player: null, isEmpty: true }
            : seat
        )
      } : null)
      if (leavingPlayer) {
        addSystemMessage(`${leavingPlayer.name} left the room`)
      }
    })

    socket.on('seat_claimed', (seatPosition: number, player: Player) => {
      setRoom(prev => prev ? {
        ...prev,
        seats: prev.seats.map((seat, index) =>
          index === seatPosition
            ? { ...seat, player, isEmpty: false }
            : seat.player?.id === player.id
            ? { ...seat, player: null, isEmpty: true }
            : seat
        ),
        players: prev.players.map(p =>
          p.id === player.id ? { ...p, seatPosition: player.seatPosition, chips: player.chips } : p
        )
      } : null)
      addSystemMessage(`${player.name} sat at seat ${seatPosition + 1}`)
    })

    socket.on('seat_released', (seatPosition: number) => {
      setRoom(prev => prev ? {
        ...prev,
        seats: prev.seats.map((seat, index) =>
          index === seatPosition ? { ...seat, player: null, isEmpty: true } : seat
        )
      } : null)
    })

    socket.on('settings_updated', (settings: TableSettings) => {
      setRoom(prev => prev ? { ...prev, settings } : null)
      addSystemMessage('Game settings updated')
    })

    socket.on('game_started', (_gameState) => {
      navigate(`/table/${roomId}`)
    })

    socket.on('error', (message) => {
      setError(message)
      setLoading(false)
    })

    return () => {
      socket.off('room_joined')
      socket.off('room_created')
      socket.off('player_joined')
      socket.off('player_left')
      socket.off('seat_claimed')
      socket.off('seat_released')
      socket.off('settings_updated')
      socket.off('game_started')
      socket.off('error')
    }
  }, [socket, roomId, navigate])

  const addSystemMessage = (text: string) => {
    const message: Message = {
      id: Date.now().toString(),
      sender: 'System',
      text,
      timestamp: new Date(),
      isSystem: true
    }
    setMessages(prev => [...prev, message])
  }

  const handleSendMessage = (text: string) => {
    const currentPlayer = room?.players.find(p => p.id === currentPlayerId)
    if (!currentPlayer) return

    const message: Message = {
      id: Date.now().toString(),
      sender: currentPlayer.name,
      text,
      timestamp: new Date(),
      isSystem: false
    }
    setMessages(prev => [...prev, message])
    // TODO: Emit to socket to broadcast to other players
  }

  const isHost = room && currentPlayerId === room.hostId
  const currentPlayer = room?.players.find(p => p.id === currentPlayerId)
  const seatedPlayersCount = room?.seats.filter(seat => !seat.isEmpty).length || 0

  const handleClaimSeat = (seatPosition: number) => {
    if (!socket) return
    socket.emit('claim_seat', seatPosition)
  }

  const handleLeaveSeat = () => {
    if (!socket) return
    socket.emit('leave_seat')
  }

  const handleUpdateSettings = (newSettings: Partial<TableSettings>) => {
    if (!socket) return
    socket.emit('update_settings', newSettings)
  }

  const handleStartGame = () => {
    if (!socket) return
    setLoading(true)
    socket.emit('start_game')
  }

  const copyRoomLink = () => {
    const link = `${window.location.origin}/?room=${roomId}`
    navigator.clipboard.writeText(link).then(() => {
      addSystemMessage('Room link copied to clipboard!')
    }).catch(() => {
      // Fallback for browsers that don't support clipboard API
      addSystemMessage(`Share this link: ${link}`)
    })
  }

  if (!room) {
    return (
      <div className="room-page">
        <div className="waiting-screen">
          <h2>Room not found</h2>
          <p>You haven't joined this room yet.</p>
          <button
            className="btn btn-primary"
            onClick={() => navigate(`/?room=${roomId}`)}
          >
            Go to Landing Page to Join
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="room-page">
      {/* Top Bar */}
      <div className="top-bar">
        <div className="room-info">
          <h2>{room.name}</h2>
          <span className="room-id">Room ID: {room.id}</span>
        </div>
        <div className="top-bar-actions">
          <button className="btn btn-secondary" onClick={copyRoomLink}>
            📋 Copy Link
          </button>
          {isHost && (
            <>
              <button
                className="btn btn-secondary"
                onClick={() => setShowSettings(!showSettings)}
              >
                ⚙️ Settings
              </button>
              <button
                className="btn btn-primary"
                onClick={handleStartGame}
                disabled={loading || seatedPlayersCount < 2}
              >
                {loading ? 'Starting...' :
                 seatedPlayersCount < 2 ? 'Need 2+ players' :
                 `Start Game`}
              </button>
            </>
          )}
        </div>
      </div>

      {error && <div className="error-banner">{error}</div>}

      {/* Settings Panel */}
      {showSettings && isHost && (
        <div className="settings-panel">
          <div className="settings-content">
            <h3>Game Settings</h3>
            <button className="close-btn" onClick={() => setShowSettings(false)}>×</button>

            <div className="settings-grid">
              <div className="setting-group">
                <label>Small Blind</label>
                <input
                  type="number"
                  min="1"
                  value={room.settings.smallBlind}
                  onChange={(e) => handleUpdateSettings({ smallBlind: parseInt(e.target.value) })}
                />
              </div>

              <div className="setting-group">
                <label>Big Blind</label>
                <input
                  type="number"
                  min="2"
                  value={room.settings.bigBlind}
                  onChange={(e) => handleUpdateSettings({ bigBlind: parseInt(e.target.value) })}
                />
              </div>

              <div className="setting-group">
                <label>
                  <input
                    type="checkbox"
                    checked={room.settings.anteEnabled}
                    onChange={(e) => handleUpdateSettings({ anteEnabled: e.target.checked })}
                  />
                  Enable Ante
                </label>
                {room.settings.anteEnabled && (
                  <input
                    type="number"
                    min="0"
                    value={room.settings.ante}
                    onChange={(e) => handleUpdateSettings({ ante: parseInt(e.target.value) })}
                    placeholder="Ante amount"
                  />
                )}
              </div>

              <div className="setting-group">
                <label>Decision Timer</label>
                <select
                  value={room.settings.decisionTimer}
                  onChange={(e) => handleUpdateSettings({
                    decisionTimer: parseInt(e.target.value) as 20 | 40
                  })}
                >
                  <option value={20}>20 seconds</option>
                  <option value={40}>40 seconds</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Poker Table */}
      <PokerTable
        seats={room.seats}
        pot={0}
        communityCards={[]}
        currentPlayerId={currentPlayerId}
        onSeatClick={handleClaimSeat}
      />

      {/* Chat Box */}
      <ChatBox
        messages={messages}
        onSendMessage={handleSendMessage}
      />

      {/* Waiting Message */}
      {!room.gameStarted && (
        <div className="waiting-overlay">
          <div className="waiting-message">
            <h3>⏳ Waiting for others</h3>
            <p>Share this link with <strong>your friends!</strong></p>
            <button className="btn btn-success" onClick={copyRoomLink}>
              COPY LINK
            </button>
            {!isHost && (
              <p style={{ marginTop: '20px', opacity: 0.7 }}>
                Waiting for host to start the game...
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default RoomPage