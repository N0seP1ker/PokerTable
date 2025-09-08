# PokerTable Lite

A lightweight online poker site for up to 10 players. Inspired by PokerNow, but only with the necessary features to play with friends.

## Features
- Login via main page or direct room link.
- Host can configure (all these take effect on the next round):
  - Small/big blind
  - Ante toggle
  - Straddle toggle
  - Run it twice: always | ask | not allowed
  - Decision timer: 20s | 40s
  - Seats: player's choice | randomly assigned
- Host starts the game; table shows cards, pot, chips, action buttons.
- Host can pause the game, or terminate it
- Host can approve players' requests to sit down with a given stack, and remove or add chips to their stack
- 

## Tech Stack (planned)
- **Frontend**: React/Next.js, Tailwind (mobile-first design).
- **Backend**: Python (Django) + WebSockets (Socket.IO).
- **Shared**: TypeScript interfaces for models and game state.

