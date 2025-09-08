import sys
import os
sys.path.append(os.path.join(os.path.dirname(__file__), 'backend'))

from poker_game.game_engine import GameEngine
from poker_game.models import PlayerAction, GamePhase


def test_basic_game():
    print("=== Testing Basic Poker Game ===")
    
    # Create a new game
    engine = GameEngine("test_room", small_blind=10, big_blind=20)
    print(f"Created game room: {engine.game_state.room_id}")
    
    # Add players
    engine.add_player("player1", "Alice", 1000, seat_number=1)
    engine.add_player("player2", "Bob", 1000, seat_number=2)
    engine.add_player("player3", "Charlie", 1000, seat_number=3)
    
    print(f"Added {len(engine.game_state.players)} players")
    for player in engine.game_state.players.values():
        print(f"  {player.name}: {player.chips} chips, seat {player.seat_number}")
    
    # Start the game
    if engine.start_game():
        print("\n=== Game Started! ===")
        print(f"Phase: {engine.game_state.phase}")
        print(f"Pot: ${engine.game_state.pot}")
        print(f"Current bet: ${engine.game_state.current_bet}")
        
        # Show hole cards
        print("\nHole cards:")
        for player in engine.game_state.players.values():
            if player.hole_cards:
                cards_str = ", ".join([str(card) for card in player.hole_cards])
                print(f"  {player.name}: {cards_str}")
        
        # Show blinds
        print(f"\nBlinds posted:")
        for player in engine.game_state.players.values():
            if player.current_bet > 0:
                print(f"  {player.name}: ${player.current_bet}")
        
        # Get current player
        current_player = None
        for player in engine.game_state.players.values():
            if player.seat_number == engine.game_state.current_player_position:
                current_player = player
                break
        
        print(f"\nCurrent player to act: {current_player.name if current_player else 'None'}")
        
        # Test some actions
        print("\n=== Testing Player Actions ===")
        
        # Player calls
        if current_player:
            print(f"{current_player.name} calls ${engine.game_state.current_bet - current_player.current_bet}")
            engine.player_action(current_player.id, PlayerAction.CALL)
            print(f"Pot after call: ${engine.game_state.pot}")
        
        # Get next player
        current_player = None
        for player in engine.game_state.players.values():
            if player.seat_number == engine.game_state.current_player_position:
                current_player = player
                break
        
        if current_player:
            print(f"\nNext player: {current_player.name}")
            print(f"{current_player.name} raises to $50")
            engine.player_action(current_player.id, PlayerAction.RAISE, 50)
            print(f"Pot after raise: ${engine.game_state.pot}")
            print(f"Current bet: ${engine.game_state.current_bet}")
    
    else:
        print("Failed to start game - not enough players")


def test_hand_evaluation():
    print("\n=== Testing Hand Evaluation ===")
    
    from poker_game.hand_evaluator import HandEvaluator, HandRank
    from poker_game.models import Card, Rank, Suit
    
    # Test a few hands
    test_hands = [
        # Royal flush
        ([Card(Rank.ACE, Suit.HEARTS), Card(Rank.KING, Suit.HEARTS)], 
         [Card(Rank.QUEEN, Suit.HEARTS), Card(Rank.JACK, Suit.HEARTS), 
          Card(Rank.TEN, Suit.HEARTS), Card(Rank.NINE, Suit.SPADES), Card(Rank.TWO, Suit.CLUBS)]),
        
        # Pair of aces
        ([Card(Rank.ACE, Suit.HEARTS), Card(Rank.ACE, Suit.SPADES)], 
         [Card(Rank.KING, Suit.HEARTS), Card(Rank.QUEEN, Suit.DIAMONDS), 
          Card(Rank.JACK, Suit.CLUBS), Card(Rank.NINE, Suit.SPADES), Card(Rank.TWO, Suit.CLUBS)]),
        
        # High card king
        ([Card(Rank.KING, Suit.HEARTS), Card(Rank.JACK, Suit.SPADES)], 
         [Card(Rank.NINE, Suit.HEARTS), Card(Rank.SEVEN, Suit.DIAMONDS), 
          Card(Rank.FIVE, Suit.CLUBS), Card(Rank.THREE, Suit.SPADES), Card(Rank.TWO, Suit.CLUBS)])
    ]
    
    for i, (hole_cards, community_cards) in enumerate(test_hands):
        hand_rank, tiebreakers = HandEvaluator.evaluate_hand(hole_cards, community_cards)
        print(f"Hand {i+1}: {hand_rank.name}, tiebreakers: {tiebreakers}")
        
        hole_str = ", ".join([str(card) for card in hole_cards])
        community_str = ", ".join([str(card) for card in community_cards])
        print(f"  Hole: {hole_str}")
        print(f"  Community: {community_str}")


if __name__ == "__main__":
    test_basic_game()
    test_hand_evaluation()