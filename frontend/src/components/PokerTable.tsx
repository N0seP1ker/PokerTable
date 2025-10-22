import React from 'react';
import './PokerTable.css';

interface Seat {
  position: number;
  player: {
    id: string;
    name: string;
    chips: number;
    cards?: string[];
  } | null;
  isEmpty: boolean;
}

interface PokerTableProps {
  seats: Seat[];
  pot: number;
  communityCards: string[];
  currentPlayerId?: string;
  onSeatClick: (position: number) => void;
}

const PokerTable: React.FC<PokerTableProps> = ({
  seats,
  pot,
  communityCards,
  currentPlayerId,
  onSeatClick
}) => {
  const getCardImage = (card: string) => {
    // Convert card format from "ACE_hearts" to "ace_of_hearts.svg"
    if (!card) return '';
    const parts = card.toLowerCase().split('_');
    const rank = parts[0];
    const suit = parts[1];
    return `/assets/cards/${rank}_of_${suit}.svg`;
  };

  const getSeatPosition = (position: number) => {
    // Position seats in an oval around the table (10 seats)
    const angle = (position / 10) * 2 * Math.PI - Math.PI / 2;
    const radiusX = 45; // Horizontal radius percentage
    const radiusY = 35; // Vertical radius percentage

    const x = 50 + radiusX * Math.cos(angle);
    const y = 50 + radiusY * Math.sin(angle);

    return { left: `${x}%`, top: `${y}%` };
  };

  return (
    <div className="poker-table-container">
      <div className="poker-table">
        {/* The green felt oval */}
        <div className="table-felt">
          {/* Pot display in the center */}
          <div className="pot-display">
            <div className="pot-amount">{pot}</div>
          </div>

          {/* Community cards */}
          {communityCards.length > 0 && (
            <div className="community-cards">
              {communityCards.map((card, index) => (
                <div key={index} className="card">
                  <img src={getCardImage(card)} alt={card} />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Seats around the table */}
        {seats.map((seat) => (
          <div
            key={seat.position}
            className={`seat ${seat.isEmpty ? 'empty' : 'occupied'} ${
              seat.player?.id === currentPlayerId ? 'current-player' : ''
            }`}
            style={getSeatPosition(seat.position)}
            onClick={() => seat.isEmpty && onSeatClick(seat.position)}
          >
            {seat.isEmpty ? (
              <div className="seat-label">
                <span className="seat-number">{seat.position + 1}</span>
                <span className="sit-text">SIT</span>
              </div>
            ) : (
              <div className="player-info">
                <div className="player-name">{seat.player?.name}</div>
                <div className="player-chips">{seat.player?.chips}</div>
                {seat.player?.cards && seat.player.cards.length > 0 && (
                  <div className="player-cards">
                    {seat.player.cards.map((card, index) => (
                      <div key={index} className="card mini">
                        <img src={getCardImage(card)} alt={card} />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default PokerTable;