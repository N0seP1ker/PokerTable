import sys
import os
sys.path.append(os.path.join(os.path.dirname(__file__), 'backend'))

from poker_game.game_engine import GameEngine
from poker_game.models import PlayerAction, GamePhase

engine = GameEngine("test_room", small_blind=10, big_blind=20)
engine.add_player("p1", "Alice", 1000, 1)
engine.add_player("p2", "Bob", 1000, 2)
engine.add_player("p3", "Charlie", 1000, 3)
engine.start_game()

print("=== PRE-FLOP ===")
print(f"Phase: {engine.game_state.phase}")
print(f"Current player position: {engine.game_state.current_player_position}")
current = engine._get_current_player()
print(f"Current player: {current.name if current else 'None'}")

# Charlie folds
print("\n--- Charlie folds ---")
result = engine.player_action("p3", PlayerAction.FOLD)
print(f"Fold result: {result}")
print(f"Phase after fold: {engine.game_state.phase}")
print(f"Current player position: {engine.game_state.current_player_position}")
current = engine._get_current_player()
print(f"Current player: {current.name if current else 'None'}")

# Alice calls
print("\n--- Alice calls ---")
result = engine.player_action("p1", PlayerAction.CALL)
print(f"Call result: {result}")
print(f"Phase after call: {engine.game_state.phase}")
print(f"Current player position: {engine.game_state.current_player_position}")
current = engine._get_current_player()
print(f"Current player: {current.name if current else 'None'}")

# Bob's turn
print("\n--- Bob's turn ---")
print(f"Bob's current bet: {engine.game_state.players['p2'].current_bet}")
print(f"Game current bet: {engine.game_state.current_bet}")
print(f"Can Bob check? {engine.game_state.players['p2'].current_bet == engine.game_state.current_bet}")

# Try to check
result = engine.player_action("p2", PlayerAction.CHECK)
print(f"Check result: {result}")