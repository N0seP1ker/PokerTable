# 🚀 Quick Startup Guide

## Choose Your Method

### ⚡ **Recommended: One-Click Startup**

#### **Windows Users:**

**Option 1 - Double-click:**
```
start.bat
```
Just double-click the `start.bat` file!

**Option 2 - PowerShell:**
```powershell
.\start.ps1
```

**Option 3 - Command Prompt:**
```cmd
start.bat
```

#### **Mac/Linux Users:**

```bash
npm start
```

This will:
- ✅ Start the backend server (port 3001)
- ✅ Start the frontend server (port 3000)
- ✅ Display the link in your terminal
- ✅ Automatically open your browser

---

### 🛠️ **Manual Startup (If you prefer control)**

Open **TWO** terminal windows:

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

---

### 📋 **Using npm from root directory**

If you're in the root `PokerTable/` directory:

```bash
npm run dev
```

This uses `concurrently` to run both servers in one terminal.

---

## 🌐 Access the App

Once started, open your browser and go to:

```
http://localhost:3000
```

**Copy this link** and share it with friends to play together!

---

## 🎮 How to Play

1. **Create a Room** - Click "Create Room" and enter a room name
2. **Choose a Seat** - Click on an empty seat (marked "SIT")
3. **Invite Friends** - Share the room link with them
4. **Chat** - Use the chat box in the bottom-left corner
5. **Start Game** - Host clicks "Start Game" when ready (needs 2+ players)

---

## 🛑 Stopping the Servers

### If you used automatic startup:
- Close the terminal windows that appeared

### If you used manual startup:
- Press `Ctrl+C` in each terminal window

---

## ⚠️ Troubleshooting

**"Port 3000 already in use"**
- Something else is using that port
- Stop other apps or change the port in `frontend/vite.config.ts`

**"Port 3001 already in use"**
- Stop other apps or change `PORT` in backend `.env` file

**Dependencies not installed?**
```bash
cd backend && npm install
cd ../frontend && npm install
```

**Still not working?**
- Make sure you have Node.js installed (v16 or higher)
- Make sure you have npm installed
- Run `npm install` in the root directory

---

## 📊 File Structure

```
PokerTable/
├── start.bat          # ← Double-click this (Windows)
├── start.ps1          # ← PowerShell version (Windows)
├── start.js           # ← Node.js version (Cross-platform)
├── package.json       # ← npm scripts
├── frontend/          # React app
├── backend/           # Node.js server
└── test_poker_comprehensive.py  # Run tests
```

---

## 🎯 Quick Links

- **Frontend:** http://localhost:3000
- **Backend:** http://localhost:3001
- **Health Check:** http://localhost:3001/api/health

---

**Ready to play? Just run `start.bat` and enjoy! 🃏**
