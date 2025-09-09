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

## Tech Stack (planned)
- **Frontend**: React/Next.js, Tailwind (mobile-first design).
- **Backend**: Python (Django) + WebSockets (Socket.IO).
- **Shared**: TypeScript interfaces for models and game state.

