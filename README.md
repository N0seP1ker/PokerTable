# PokerTable
A lightweight online poker site for up to 10 players. Inspired by PokerNow, but only with the necessary features to play with friends.

## Features
- Login via main page or direct room link.
- Host can configure (all these take effect on the next round):
  - Small/Big blind
  - Ante toggle
  - Straddle toggle
  - Run it twice: always | ask | not allowed
  - Decision timer: 20s | 40s
  - Seats: players choice | randomly assigned
- Host starts the game; table shows cards, pot, chips, action buttons.
- Host can pause the game, or terminate it.
- Host can approve players' request to sit down with a given stack, and remove or add chips to their stack.
- All users can access a chatting interface with about 200 messages of history that is stored during the session.
- All users can access and download a game log of everyone's buy-in and buy-out and current stack.
- All users can access all hands they played during this session and choose to download it or not (whether specific cards in a hand is shown or not is decided by the player).
- All players are either in stand up (not occupying a seat), sit down (occupying a seat), or away (occupying a seat and not getting dealt a hand) mode. When a player gets back from away mode, they will automatically be penaltied a big blind into the pot.

## Tech Stack
- **Frontend**: React 18 + TypeScript, Vite, Socket.IO Client
- **Backend**: Node.js + Express, Socket.IO Server
- **Game Logic**: Python poker engine (hand evaluation, game rules)
- **Shared**: TypeScript interfaces for models and game state

---

## 🚀 Quick Start - ONE CLICK!

### **Windows:**
Just double-click: **`start.bat`**

### **Mac/Linux:**
```bash
npm start
```

Your browser will open automatically to `http://localhost:3000`

**That's it!** 🎉

---

## 📖 More Documentation

- **[📘 Detailed Startup Guide](STARTUP_GUIDE.md)** - All startup methods
- **[🎮 Getting Started Guide](START_HERE.md)** - How to play, features, and more

---

## 🎯 Already Implemented

✅ Real-time multiplayer with Socket.IO
✅ Beautiful oval green felt poker table
✅ 10-seat table with seat selection
✅ Live chat system (bottom-left corner)
✅ Room creation and joining with shareable links
✅ Host controls for game settings
✅ Responsive design (desktop & mobile)
✅ SVG card rendering (52 cards)
✅ Complete Python poker engine with hand evaluation
✅ Comprehensive test suite

---

## 🧪 Run Tests

```bash
python test_poker_comprehensive.py
```

Tests all poker hand rankings, betting logic, and game flow.

---

## 🎨 Current UI

- **Poker Table**: Oval green felt with 10 seats positioned around it
- **Chat Box**: Bottom-left corner with minimize/expand
- **Top Bar**: Room info, settings button, start game button
- **Seats**: Click empty seats marked "SIT" to sit down
- **Settings Panel**: Host can configure blinds, antes, timers

---

## 📝 Manual Startup (Optional)

If automatic startup doesn't work:

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

Then visit: http://localhost:3000

---

## 🔧 Troubleshooting

**Port already in use?**
- Change frontend port in `frontend/vite.config.ts`
- Change backend port with `PORT` environment variable

**Dependencies missing?**
```bash
cd backend && npm install
cd ../frontend && npm install
```

---

