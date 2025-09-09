import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useSocket } from '../hooks/useSocket'
import type { Room, Player, TableSettings } from '../../../shared/types/index'

const RoomPage: React.FC = () => {
  const { roomId } = useParams<{ roomId: string }>()
  const [room, setRoom] = useState<Room | null>(null)
  const [currentPlayerId, setCurrentPlayerId] = useState<string>('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  
  const { socket } = useSocket()
  const navigate = useNavigate()

  useEffect(() => {
    if (!socket || !roomId) return

    // Socket event handlers
    socket.on('room_joined', (roomData, playerId) => {
      setRoom(roomData)
      setCurrentPlayerId(playerId)
    })

    socket.on('room_created', (roomData, playerId) => {
      setRoom(roomData)
      setCurrentPlayerId(playerId)
    })

    socket.on('player_joined', (player: Player) => {
      setRoom(prev => prev ? { ...prev, players: [...prev.players, player] } : null)
    })

    socket.on('player_left', (playerId: string) => {
      setRoom(prev => prev ? {
        ...prev,
        players: prev.players.filter(p => p.id !== playerId),
        seats: prev.seats.map(seat => 
          seat.player?.id === playerId 
            ? { ...seat, player: null, isEmpty: true }
            : seat
        )
      } : null)
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
    navigator.clipboard.writeText(link)
  }

  if (!room) {
    return (
      <div className="container">
        <div className="card">
          <div style={{ textAlign: 'center', padding: '40px 20px' }}>
            <p>Room not found or you haven't joined yet.</p>
            <button 
              className="btn btn-primary" 
              onClick={() => navigate(`/?room=${roomId}`)}
              style={{ marginTop: '16px' }}
            >
              Go to Landing Page to Join
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container">
      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      <div className="card" style={{ marginBottom: '20px' }}>
        <h2 style={{ marginBottom: '16px', textAlign: 'center' }}>{room.name}</h2>
        <div style={{ textAlign: 'center', marginBottom: '20px' }}>
          <p style={{ color: '#9ca3af', fontSize: '14px', marginBottom: '8px' }}>
            Room ID: {room.id}
          </p>
          <button className="btn btn-secondary" onClick={copyRoomLink}>
            Copy Room Link
          </button>
        </div>
      </div>

      {/* Players List */}
      <div className="card" style={{ marginBottom: '20px' }}>
        <h3 style={{ marginBottom: '16px' }}>Players ({room.players.length}/10)</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {room.players.map((player) => (
            <div
              key={player.id}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '8px 12px',
                background: 'rgba(255, 255, 255, 0.05)',
                borderRadius: '6px'
              }}
            >
              <span>
                {player.name}
                {player.isHost && <span style={{ color: '#fbbf24', marginLeft: '8px' }}>👑</span>}
                {player.seatPosition !== undefined && (
                  <span style={{ color: '#10b981', marginLeft: '8px' }}>
                    Seat {player.seatPosition + 1}
                  </span>
                )}
              </span>
              <span style={{ color: '#9ca3af', fontSize: '12px' }}>
                {player.isConnected ? 'Online' : 'Offline'}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Seat Selection */}
      <div className="card" style={{ marginBottom: '20px' }}>
        <h3 style={{ marginBottom: '16px' }}>Seats</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px' }}>
          {room.seats.map((seat, index) => (
            <button
              key={index}
              className={`btn ${
                seat.player?.id === currentPlayerId 
                  ? 'btn-primary' 
                  : seat.isEmpty 
                  ? 'btn-secondary' 
                  : 'btn-danger'
              }`}
              onClick={() => seat.isEmpty ? handleClaimSeat(index) : undefined}
              disabled={!seat.isEmpty && seat.player?.id !== currentPlayerId}
              style={{ padding: '12px 8px', fontSize: '14px' }}
            >
              Seat {index + 1}
              {seat.player && (
                <div style={{ fontSize: '12px', opacity: 0.8 }}>
                  {seat.player.name}
                </div>
              )}
            </button>
          ))}
        </div>
        
        {currentPlayer?.seatPosition !== undefined && (
          <button
            className="btn btn-danger"
            onClick={handleLeaveSeat}
            style={{ marginTop: '12px' }}
          >
            Leave Seat {currentPlayer.seatPosition + 1}
          </button>
        )}
      </div>

      {/* Host Settings */}
      {isHost && (
        <div className="card" style={{ marginBottom: '20px' }}>
          <h3 style={{ marginBottom: '16px' }}>Game Settings</h3>
          
          <div className="form-group">
            <label>Small Blind</label>
            <input
              type="number"
              min="1"
              value={room.settings.smallBlind}
              onChange={(e) => handleUpdateSettings({ smallBlind: parseInt(e.target.value) })}
            />
          </div>

          <div className="form-group">
            <label>Big Blind</label>
            <input
              type="number"
              min="2"
              value={room.settings.bigBlind}
              onChange={(e) => handleUpdateSettings({ bigBlind: parseInt(e.target.value) })}
            />
          </div>

          <div className="form-group">
            <label>
              <input
                type="checkbox"
                checked={room.settings.anteEnabled}
                onChange={(e) => handleUpdateSettings({ anteEnabled: e.target.checked })}
                style={{ marginRight: '8px', width: 'auto' }}
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
                style={{ marginTop: '8px' }}
              />
            )}
          </div>

          <div className="form-group">
            <label>
              <input
                type="checkbox"
                checked={room.settings.straddleEnabled}
                onChange={(e) => handleUpdateSettings({ straddleEnabled: e.target.checked })}
                style={{ marginRight: '8px', width: 'auto' }}
              />
              Enable Straddle
            </label>
          </div>

          <div className="form-group">
            <label>Run It Twice Policy</label>
            <select
              value={room.settings.runItTwicePolicy}
              onChange={(e) => handleUpdateSettings({ 
                runItTwicePolicy: e.target.value as 'always' | 'ask' | 'not_allowed' 
              })}
            >
              <option value="always">Always</option>
              <option value="ask">Ask Players</option>
              <option value="not_allowed">Not Allowed</option>
            </select>
          </div>

          <div className="form-group">
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
      )}

      {/* Start Game */}
      {isHost && (
        <div className="card">
          <button
            className="btn btn-primary"
            onClick={handleStartGame}
            disabled={loading || seatedPlayersCount < 2}
          >
            {loading ? 'Starting...' : 
             seatedPlayersCount < 2 ? 'Need at least 2 players' : 
             `Start Game (${seatedPlayersCount} players)`}
          </button>
        </div>
      )}

      {!isHost && (
        <div className="card">
          <p style={{ textAlign: 'center', color: '#9ca3af' }}>
            Waiting for host to start the game...
          </p>
        </div>
      )}
    </div>
  )
}

export default RoomPage