# PokerTable Lite

A lightweight online poker site for up to 10 players. Inspired by PokerNow, but only with the necessary features to play with friends.

## Features
- Login via main page or direct room link.
- Host can configure (all these take effect on the next round):
  - Small/Big blind
  - Ante toggle
  - Straddle toggle
  - Run it twice: always | ask | not allowed
  - Decision timer: 20s | 40s
- Players can claim one of 10 seats.
- Host starts the game; table shows cards, pot, chips, action buttons.

## Tech Stack (planned)
- **Frontend**: React/Next.js, Tailwind (mobile-first design).
- **Backend**: Python (Django) + WebSockets (Socket.IO).
- **Shared**: TypeScript interfaces for models and game state.

