import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useSocket } from '../hooks/useSocket'
import type { GameState, PlayerAction } from '../../../shared/types/index'

const TablePage: React.FC = () => {
  const { roomId } = useParams<{ roomId: string }>()
  const [gameState, setGameState] = useState<GameState | null>(null)
  const [error, setError] = useState('')
  
  const { socket } = useSocket()
  const navigate = useNavigate()

  useEffect(() => {
    if (!socket || !roomId) return

    socket.on('game_started', (initialGameState) => {
      setGameState(initialGameState)
    })

    socket.on('game_state_updated', (updatedGameState) => {
      setGameState(updatedGameState)
    })

    socket.on('player_action_made', (playerId, action) => {
      console.log(`Player ${playerId} made action:`, action)
    })

    socket.on('error', (message) => {
      setError(message)
    })

    return () => {
      socket.off('game_started')
      socket.off('game_state_updated')
      socket.off('player_action_made')
      socket.off('error')
    }
  }, [socket, roomId])

  const handlePlayerAction = (action: PlayerAction) => {
    if (!socket) return
    socket.emit('player_action', action)
  }

  const goBackToRoom = () => {
    navigate(`/room/${roomId}`)
  }

  if (!gameState) {
    return (
      <div className="container">
        <div className="card">
          <div style={{ textAlign: 'center', padding: '40px 20px' }}>
            <p>Loading game...</p>
            <button className="btn btn-secondary" onClick={goBackToRoom}>
              Back to Room
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
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h2>Poker Table</h2>
          <button className="btn btn-secondary" onClick={goBackToRoom}>
            Back to Room
          </button>
        </div>

        {/* Game Info */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px', marginBottom: '20px' }}>
          <div style={{ textAlign: 'center', padding: '12px', background: 'rgba(255, 255, 255, 0.05)', borderRadius: '6px' }}>
            <div style={{ fontSize: '14px', color: '#9ca3af' }}>Pot</div>
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#10b981' }}>${gameState.pot}</div>
          </div>
          <div style={{ textAlign: 'center', padding: '12px', background: 'rgba(255, 255, 255, 0.05)', borderRadius: '6px' }}>
            <div style={{ fontSize: '14px', color: '#9ca3af' }}>Current Bet</div>
            <div style={{ fontSize: '24px', fontWeight: 'bold' }}>${gameState.currentBet}</div>
          </div>
        </div>

        {/* Community Cards */}
        <div style={{ marginBottom: '20px' }}>
          <h3 style={{ marginBottom: '12px', textAlign: 'center' }}>Community Cards</h3>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '8px' }}>
            {gameState.communityCards.length > 0 ? (
              gameState.communityCards.map((card, index) => (
                <div
                  key={index}
                  style={{
                    width: '60px',
                    height: '80px',
                    background: '#ffffff',
                    color: '#000000',
                    border: '1px solid #ccc',
                    borderRadius: '8px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '12px',
                    fontWeight: 'bold'
                  }}
                >
                  <div>{card.rank}</div>
                  <div style={{ fontSize: '16px' }}>
                    {card.suit === 'hearts' && '♥️'}
                    {card.suit === 'diamonds' && '♦️'}
                    {card.suit === 'clubs' && '♣️'}
                    {card.suit === 'spades' && '♠️'}
                  </div>
                </div>
              ))
            ) : (
              <div style={{ color: '#9ca3af', fontStyle: 'italic' }}>
                No community cards yet
              </div>
            )}
          </div>
        </div>

        {/* Game Phase */}
        <div style={{ textAlign: 'center', marginBottom: '20px' }}>
          <div style={{ 
            display: 'inline-block',
            padding: '8px 16px',
            background: 'rgba(59, 130, 246, 0.2)',
            borderRadius: '20px',
            fontSize: '14px',
            fontWeight: 'bold',
            textTransform: 'capitalize'
          }}>
            {gameState.gamePhase}
          </div>
        </div>
      </div>

      {/* Action Buttons - Basic Implementation */}
      <div className="card">
        <h3 style={{ marginBottom: '16px', textAlign: 'center' }}>Your Actions</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
          <button
            className="btn btn-danger"
            onClick={() => handlePlayerAction({ type: 'fold', timestamp: Date.now() })}
          >
            Fold
          </button>
          <button
            className="btn btn-secondary"
            onClick={() => handlePlayerAction({ type: 'check', timestamp: Date.now() })}
          >
            Check
          </button>
          <button
            className="btn btn-primary"
            onClick={() => handlePlayerAction({ 
              type: 'call', 
              amount: gameState.currentBet,
              timestamp: Date.now() 
            })}
          >
            Call ${gameState.currentBet}
          </button>
          <button
            className="btn btn-primary"
            onClick={() => handlePlayerAction({ 
              type: 'bet', 
              amount: gameState.currentBet * 2,
              timestamp: Date.now() 
            })}
          >
            Raise ${gameState.currentBet * 2}
          </button>
        </div>
        
        <div style={{ marginTop: '16px', textAlign: 'center', fontSize: '14px', color: '#9ca3af' }}>
          <p>⚠️ Game logic is basic - full poker rules coming soon</p>
        </div>
      </div>
    </div>
  )
}

export default TablePage