# PokerTable
A lightweight online poker site for up to 10 players. Inspired by PokerNow, but only with the necessary features to play with friends.

## Features
- Login via main page or direct room link.
- **Automatic Reconnection**: If you disconnect (network issue, browser refresh, etc.), you can rejoin with the same name and keep your seat and chips for up to 5 minutes.
- **Device Recognition**: The same device can always use the same username when reconnecting to a room.
- **Duplicate Name Protection**: Different devices cannot use the same name in the same room.
- Host can configure (all these take effect on the next round):
  - Small/Big blind
  - Ante toggle
  - Straddle toggle
  - Run it twice: always | ask | not allowed
  - Decision timer: 20s | 40s
  - Seats: players choice | randomly assigned
- Host starts the game; table shows cards, pot, chips, action buttons.
- Host can pause the game, or terminate it.
- **Automatic Host Transfer**: If the host disconnects permanently, host privileges transfer to the next player.
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
✅ **Automatic reconnection system** - players keep their seat, chips, and can rejoin with the same name
✅ Device fingerprinting for persistent player identity

---

## 🔄 Reconnection System

The app uses device fingerprinting to identify players across sessions:

- **Automatic**: Players who disconnect can rejoin within 5 minutes by entering the same name
- **Preserves State**: Keeps seat position, chip count, and game state
- **Device-Based**: Same device = same player identity (works across browser refreshes)
- **Name Protection**: Prevents other devices from stealing your username in a room
- **Visual Feedback**: Other players see "disconnected (can reconnect)" when someone drops

**How it works:**
1. Each device gets a unique fingerprint on first visit
2. When joining a room, device ID + name is registered
3. On disconnect, player stays in room for 5 minutes
4. On rejoin with same name from same device, all data is restored
5. After 5 minutes, the seat is freed for others

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

