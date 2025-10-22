import sys
import os
sys.path.append(os.path.join(os.path.dirname(__file__), 'backend'))

# Fix Windows encoding for Unicode characters
if sys.platform == 'win32':
    import io
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
    sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8', errors='replace')

from poker_game.game_engine import GameEngine
from poker_game.models import PlayerAction, GamePhase, Card, Rank, Suit
from poker_game.hand_evaluator import HandEvaluator, HandRank


def test_player_management():
    """Test adding and managing players"""
    print("=== Testing Player Management ===")

    engine = GameEngine("test_room", small_blind=10, big_blind=20)

    # Add players
    assert engine.add_player("p1", "Alice", 1000, 1), "Failed to add player 1"
    assert engine.add_player("p2", "Bob", 1000, 2), "Failed to add player 2"

    # Try to add player with duplicate seat
    assert not engine.add_player("p3", "Charlie", 1000, 1), "Should not allow duplicate seat"

    # Add player with different seat
    assert engine.add_player("p3", "Charlie", 1000, 3), "Failed to add player 3"

    assert len(engine.game_state.players) == 3, f"Expected 3 players, got {len(engine.game_state.players)}"
    print("✓ Player management tests passed")


def test_game_start():
    """Test game initialization"""
    print("\n=== Testing Game Start ===")

    engine = GameEngine("test_room", small_blind=5, big_blind=10)

    # Try to start with no players
    assert not engine.start_game(), "Should not start game with no players"

    # Add one player
    engine.add_player("p1", "Alice", 1000, 1)
    assert not engine.start_game(), "Should not start game with only 1 player"

    # Add second player
    engine.add_player("p2", "Bob", 1000, 2)
    assert engine.start_game(), "Should start game with 2 players"

    # Verify game state
    assert engine.game_state.phase == GamePhase.PRE_FLOP, "Game should be in PRE_FLOP phase"
    assert engine.game_state.pot == 15, f"Pot should be 15 (blinds), got {engine.game_state.pot}"
    assert len(engine.game_state.players["p1"].hole_cards) == 2, "Player 1 should have 2 hole cards"
    assert len(engine.game_state.players["p2"].hole_cards) == 2, "Player 2 should have 2 hole cards"

    print("✓ Game start tests passed")


def test_player_actions():
    """Test player action validation and execution"""
    print("\n=== Testing Player Actions ===")

    engine = GameEngine("test_room", small_blind=10, big_blind=20)
    engine.add_player("p1", "Alice", 1000, 1)
    engine.add_player("p2", "Bob", 1000, 2)
    engine.add_player("p3", "Charlie", 1000, 3)
    engine.start_game()

    # Charlie should be first to act (seat 3, after big blind)
    current_player = engine._get_current_player()
    assert current_player.id == "p3", f"Expected p3 to act first, got {current_player.id}"

    # Charlie calls
    assert engine.player_action("p3", PlayerAction.CALL), "Charlie should be able to call"
    assert engine.game_state.players["p3"].current_bet == 20, "Charlie's bet should be 20"

    # Alice should act next
    current_player = engine._get_current_player()
    assert current_player.id == "p1", f"Expected p1 to act next, got {current_player.id}"

    # Alice tries to check (invalid - needs to call or raise)
    assert not engine.player_action("p1", PlayerAction.CHECK), "Alice should not be able to check"

    # Alice raises to 50
    assert engine.player_action("p1", PlayerAction.RAISE, 50), "Alice should be able to raise"
    assert engine.game_state.current_bet == 60, f"Current bet should be 60, got {engine.game_state.current_bet}"

    print("✓ Player action tests passed")


def test_folding():
    """Test fold functionality"""
    print("\n=== Testing Folding ===")

    engine = GameEngine("test_room", small_blind=10, big_blind=20)
    engine.add_player("p1", "Alice", 1000, 1)
    engine.add_player("p2", "Bob", 1000, 2)
    engine.add_player("p3", "Charlie", 1000, 3)
    engine.start_game()

    # Charlie folds
    assert engine.player_action("p3", PlayerAction.FOLD), "Charlie should be able to fold"
    assert engine.game_state.players["p3"].has_folded, "Charlie should be marked as folded"

    # Alice raises
    assert engine.player_action("p1", PlayerAction.RAISE, 50), "Alice should be able to raise"

    # Bob should be able to fold, call, or raise
    current_player = engine._get_current_player()
    assert current_player.id == "p2", "Bob should be current player"

    # Bob folds
    assert engine.player_action("p2", PlayerAction.FOLD), "Bob should be able to fold"
    assert engine.game_state.players["p2"].has_folded, "Bob should be marked as folded"

    # With only one active player, Alice should win the pot immediately
    # (In a real game, this would be handled by the showdown logic)

    print("✓ Folding tests passed")


def test_all_in():
    """Test all-in functionality"""
    print("\n=== Testing All-In ===")

    engine = GameEngine("test_room", small_blind=10, big_blind=20)
    engine.add_player("p1", "Alice", 100, 1)  # Short stack
    engine.add_player("p2", "Bob", 1000, 2)
    engine.start_game()

    # Alice should be first to act (after big blind)
    # Alice goes all-in with remaining chips
    initial_chips = engine.game_state.players["p1"].chips
    assert engine.player_action("p1", PlayerAction.ALL_IN), "Alice should be able to go all-in"
    assert engine.game_state.players["p1"].chips == 0, "Alice should have 0 chips after all-in"
    assert engine.game_state.players["p1"].is_all_in, "Alice should be marked as all-in"

    print("✓ All-in tests passed")


def test_hand_rankings():
    """Test various poker hand rankings"""
    print("\n=== Testing Hand Rankings ===")

    test_cases = [
        # (hole_cards, community_cards, expected_rank)
        (
            [Card(Rank.ACE, Suit.HEARTS), Card(Rank.KING, Suit.HEARTS)],
            [Card(Rank.QUEEN, Suit.HEARTS), Card(Rank.JACK, Suit.HEARTS),
             Card(Rank.TEN, Suit.HEARTS), Card(Rank.TWO, Suit.SPADES), Card(Rank.THREE, Suit.CLUBS)],
            HandRank.ROYAL_FLUSH
        ),
        (
            [Card(Rank.NINE, Suit.DIAMONDS), Card(Rank.EIGHT, Suit.DIAMONDS)],
            [Card(Rank.SEVEN, Suit.DIAMONDS), Card(Rank.SIX, Suit.DIAMONDS),
             Card(Rank.FIVE, Suit.DIAMONDS), Card(Rank.TWO, Suit.SPADES), Card(Rank.THREE, Suit.CLUBS)],
            HandRank.STRAIGHT_FLUSH
        ),
        (
            [Card(Rank.ACE, Suit.HEARTS), Card(Rank.ACE, Suit.DIAMONDS)],
            [Card(Rank.ACE, Suit.CLUBS), Card(Rank.ACE, Suit.SPADES),
             Card(Rank.KING, Suit.HEARTS), Card(Rank.TWO, Suit.SPADES), Card(Rank.THREE, Suit.CLUBS)],
            HandRank.FOUR_OF_A_KIND
        ),
        (
            [Card(Rank.KING, Suit.HEARTS), Card(Rank.KING, Suit.DIAMONDS)],
            [Card(Rank.KING, Suit.CLUBS), Card(Rank.QUEEN, Suit.SPADES),
             Card(Rank.QUEEN, Suit.HEARTS), Card(Rank.TWO, Suit.SPADES), Card(Rank.THREE, Suit.CLUBS)],
            HandRank.FULL_HOUSE
        ),
        (
            [Card(Rank.ACE, Suit.HEARTS), Card(Rank.KING, Suit.HEARTS)],
            [Card(Rank.QUEEN, Suit.HEARTS), Card(Rank.JACK, Suit.HEARTS),
             Card(Rank.NINE, Suit.HEARTS), Card(Rank.TWO, Suit.SPADES), Card(Rank.THREE, Suit.CLUBS)],
            HandRank.FLUSH
        ),
        (
            [Card(Rank.NINE, Suit.HEARTS), Card(Rank.EIGHT, Suit.DIAMONDS)],
            [Card(Rank.SEVEN, Suit.CLUBS), Card(Rank.SIX, Suit.SPADES),
             Card(Rank.FIVE, Suit.HEARTS), Card(Rank.TWO, Suit.SPADES), Card(Rank.THREE, Suit.CLUBS)],
            HandRank.STRAIGHT
        ),
        (
            [Card(Rank.QUEEN, Suit.HEARTS), Card(Rank.QUEEN, Suit.DIAMONDS)],
            [Card(Rank.QUEEN, Suit.CLUBS), Card(Rank.JACK, Suit.SPADES),
             Card(Rank.NINE, Suit.HEARTS), Card(Rank.TWO, Suit.SPADES), Card(Rank.THREE, Suit.CLUBS)],
            HandRank.THREE_OF_A_KIND
        ),
        (
            [Card(Rank.JACK, Suit.HEARTS), Card(Rank.JACK, Suit.DIAMONDS)],
            [Card(Rank.TEN, Suit.CLUBS), Card(Rank.TEN, Suit.SPADES),
             Card(Rank.NINE, Suit.HEARTS), Card(Rank.TWO, Suit.SPADES), Card(Rank.THREE, Suit.CLUBS)],
            HandRank.TWO_PAIR
        ),
        (
            [Card(Rank.ACE, Suit.HEARTS), Card(Rank.ACE, Suit.DIAMONDS)],
            [Card(Rank.KING, Suit.CLUBS), Card(Rank.QUEEN, Suit.SPADES),
             Card(Rank.JACK, Suit.HEARTS), Card(Rank.TWO, Suit.SPADES), Card(Rank.THREE, Suit.CLUBS)],
            HandRank.PAIR
        ),
        (
            [Card(Rank.ACE, Suit.HEARTS), Card(Rank.KING, Suit.DIAMONDS)],
            [Card(Rank.QUEEN, Suit.CLUBS), Card(Rank.JACK, Suit.SPADES),
             Card(Rank.NINE, Suit.HEARTS), Card(Rank.TWO, Suit.SPADES), Card(Rank.THREE, Suit.CLUBS)],
            HandRank.HIGH_CARD
        ),
    ]

    for i, (hole, community, expected_rank) in enumerate(test_cases):
        hand_rank, tiebreakers = HandEvaluator.evaluate_hand(hole, community)
        assert hand_rank == expected_rank, f"Test case {i+1}: Expected {expected_rank.name}, got {hand_rank.name}"
        print(f"  ✓ {expected_rank.name} correctly identified")

    print("✓ Hand ranking tests passed")


def test_wheel_straight():
    """Test A-2-3-4-5 straight (wheel)"""
    print("\n=== Testing Wheel Straight (A-2-3-4-5) ===")

    hole = [Card(Rank.ACE, Suit.HEARTS), Card(Rank.TWO, Suit.DIAMONDS)]
    community = [Card(Rank.THREE, Suit.CLUBS), Card(Rank.FOUR, Suit.SPADES),
                 Card(Rank.FIVE, Suit.HEARTS), Card(Rank.KING, Suit.SPADES), Card(Rank.QUEEN, Suit.CLUBS)]

    hand_rank, tiebreakers = HandEvaluator.evaluate_hand(hole, community)
    assert hand_rank == HandRank.STRAIGHT, f"Expected STRAIGHT, got {hand_rank.name}"
    assert tiebreakers[0] == 5, f"Wheel straight should have high card of 5, got {tiebreakers[0]}"

    print("✓ Wheel straight test passed")


def test_hand_comparison():
    """Test comparing hands"""
    print("\n=== Testing Hand Comparison ===")

    # Royal flush vs straight flush
    hand1 = (HandRank.ROYAL_FLUSH, [14])
    hand2 = (HandRank.STRAIGHT_FLUSH, [9])
    assert HandEvaluator.compare_hands(hand1, hand2) > 0, "Royal flush should beat straight flush"

    # Pair of aces vs pair of kings
    hand1 = (HandRank.PAIR, [14, 13, 12, 11])
    hand2 = (HandRank.PAIR, [13, 14, 12, 11])
    assert HandEvaluator.compare_hands(hand1, hand2) > 0, "Pair of aces should beat pair of kings"

    # Same pair, different kickers
    hand1 = (HandRank.PAIR, [10, 14, 13, 12])
    hand2 = (HandRank.PAIR, [10, 14, 13, 11])
    assert HandEvaluator.compare_hands(hand1, hand2) > 0, "Better kicker should win"

    # Identical hands
    hand1 = (HandRank.PAIR, [10, 14, 13, 12])
    hand2 = (HandRank.PAIR, [10, 14, 13, 12])
    assert HandEvaluator.compare_hands(hand1, hand2) == 0, "Identical hands should tie"

    print("✓ Hand comparison tests passed")


def test_betting_round_completion():
    """Test betting round completion logic"""
    print("\n=== Testing Betting Round Completion ===")

    engine = GameEngine("test_room", small_blind=10, big_blind=20)
    engine.add_player("p1", "Alice", 1000, 1)
    engine.add_player("p2", "Bob", 1000, 2)
    engine.add_player("p3", "Charlie", 1000, 3)
    engine.start_game()

    # Everyone calls
    engine.player_action("p3", PlayerAction.CALL)  # Charlie calls 20
    engine.player_action("p1", PlayerAction.CALL)  # Alice calls to 20
    engine.player_action("p2", PlayerAction.CHECK)  # Bob checks (already at 20)

    # Should advance to flop
    assert engine.game_state.phase == GamePhase.FLOP, f"Should advance to FLOP, got {engine.game_state.phase}"
    assert len(engine.game_state.community_cards) == 3, "Should deal 3 cards for flop"

    print("✓ Betting round completion test passed")


def test_game_phases():
    """Test progression through all game phases"""
    print("\n=== Testing Game Phase Progression ===")

    engine = GameEngine("test_room", small_blind=10, big_blind=20)
    engine.add_player("p1", "Alice", 1000, 1)
    engine.add_player("p2", "Bob", 1000, 2)
    engine.start_game()

    assert engine.game_state.phase == GamePhase.PRE_FLOP, "Should start in PRE_FLOP"

    # Complete pre-flop
    engine.player_action("p1", PlayerAction.CALL)
    engine.player_action("p2", PlayerAction.CHECK)

    assert engine.game_state.phase == GamePhase.FLOP, "Should advance to FLOP"
    assert len(engine.game_state.community_cards) == 3, "Should have 3 community cards"

    # Complete flop
    engine.player_action("p1", PlayerAction.CHECK)
    engine.player_action("p2", PlayerAction.CHECK)

    assert engine.game_state.phase == GamePhase.TURN, "Should advance to TURN"
    assert len(engine.game_state.community_cards) == 4, "Should have 4 community cards"

    # Complete turn
    engine.player_action("p1", PlayerAction.CHECK)
    engine.player_action("p2", PlayerAction.CHECK)

    assert engine.game_state.phase == GamePhase.RIVER, "Should advance to RIVER"
    assert len(engine.game_state.community_cards) == 5, "Should have 5 community cards"

    # Complete river
    engine.player_action("p1", PlayerAction.CHECK)
    engine.player_action("p2", PlayerAction.CHECK)

    assert engine.game_state.phase == GamePhase.SHOWDOWN, "Should advance to SHOWDOWN"

    print("✓ Game phase progression test passed")


def run_all_tests():
    """Run all tests"""
    try:
        test_player_management()
        test_game_start()
        test_player_actions()
        test_folding()
        test_all_in()
        test_hand_rankings()
        test_wheel_straight()
        test_hand_comparison()
        test_betting_round_completion()
        test_game_phases()

        print("\n" + "="*50)
        print("✓ ALL TESTS PASSED!")
        print("="*50)
        return True
    except AssertionError as e:
        print(f"\n✗ TEST FAILED: {e}")
        return False
    except Exception as e:
        print(f"\n✗ UNEXPECTED ERROR: {e}")
        import traceback
        traceback.print_exc()
        return False


if __name__ == "__main__":
    success = run_all_tests()
    sys.exit(0 if success else 1)