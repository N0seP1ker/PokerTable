# 🃏 Friendly Poker Table - Quick Start Guide

## 🚀 Getting Started

### Start the Application

#### Option 1: Start Backend and Frontend Separately

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```
The backend will start on http://localhost:3001

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```
The frontend will start on http://localhost:3000

### How to Play

1. **Open the app** at http://localhost:3000
2. **Create a room** or join an existing one
3. **Choose a seat** at the poker table (click on empty seats marked with "SIT")
4. **Chat** with other players using the chat box in the bottom left
5. **Start the game** (host only) once at least 2 players are seated
6. **Share the room link** with friends to invite them!

## 📁 Project Structure

```
PokerTable/
├── frontend/              # React + TypeScript frontend
│   ├── src/
│   │   ├── components/   # PokerTable, ChatBox components
│   │   ├── pages/        # LandingPage, RoomPage, TablePage
│   │   └── hooks/        # Socket.IO connection hook
│   └── public/
│       └── assets/       # Card SVGs and game assets
│           └── cards/    # 52 card SVG files
│
├── backend/              # Node.js + TypeScript backend
│   ├── src/
│   │   └── server.ts    # Socket.IO server
│   └── poker_game/      # Python poker game logic
│       ├── models.py           # Card, Player, GameState models
│       ├── hand_evaluator.py   # Poker hand evaluation
│       └── game_engine.py      # Game logic and rules
│
└── shared/              # Shared TypeScript types
    └── types/
```

## ✨ Features

### Current Features:
- ✅ **Real-time multiplayer** via Socket.IO
- ✅ **10-seat poker table** with oval green felt design
- ✅ **Live chat system** for player communication
- ✅ **Room creation and joining** with shareable links
- ✅ **Seat selection** - click to sit/stand
- ✅ **Host controls** - game settings and start game
- ✅ **Responsive design** - works on desktop and mobile
- ✅ **Card rendering** - SVG cards for crisp display
- ✅ **Python poker engine** - complete hand evaluation and game logic

### Game Settings (Host Only):
- Small/Big Blind amounts
- Ante (optional)
- Decision timer (20s or 40s)
- Straddle option
- Run it twice policy

## 🧪 Testing

Run the comprehensive poker logic tests:
```bash
python test_poker_comprehensive.py
```

This tests:
- Player management
- Game initialization
- Betting actions (fold, call, raise, check, all-in)
- All poker hand rankings
- Game phase progression
- Winner determination

## 🎨 Card Assets

All 52 card SVG files are located in:
```
frontend/public/assets/cards/
```

Card naming format: `{rank}_of_{suit}.svg`
Examples: `ace_of_spades.svg`, `king_of_hearts.svg`, `2_of_diamonds.svg`

## 🔧 Tech Stack

**Frontend:**
- React 18
- TypeScript
- Socket.IO Client
- React Router
- Vite

**Backend:**
- Node.js + Express
- Socket.IO Server
- TypeScript
- Python (poker game logic)

## 📝 Next Steps

To continue development:
1. Implement actual gameplay in TablePage.tsx
2. Connect Python poker engine to Socket.IO server
3. Add betting controls and action buttons
4. Implement card dealing animations
5. Add sound effects and notifications
6. Add player statistics and hand history
7. Implement reconnection logic

## 🐛 Troubleshooting

**Frontend won't start?**
```bash
cd frontend
npm install
npm run dev
```

**Backend won't start?**
```bash
cd backend
npm install
npm run dev
```

**Port already in use?**
- Frontend: Change port in `frontend/vite.config.ts`
- Backend: Set `PORT` environment variable

**Cards not showing?**
- Make sure all 52 SVG files are in `frontend/public/assets/cards/`
- Check browser console for 404 errors

## 🎮 Have Fun Playing!

Enjoy your friendly poker game! 🃏♠️♥️♦️♣️
