from typing import Dict, List, Optional, Tuple
from .models import GameState, Player, PlayerAction, GamePhase, Card, Rank, Suit
from .hand_evaluator import HandEvaluator
import random


class GameEngine:
    def __init__(self, room_id: str, small_blind: int = 10, big_blind: int = 20):
        self.game_state = GameState(
            room_id=room_id,
            players={},
            deck=[],
            community_cards=[],
            pot=0,
            current_bet=0,
            phase=GamePhase.WAITING,
            dealer_position=0,
            small_blind_position=0,
            big_blind_position=0,
            current_player_position=0,
            small_blind_amount=small_blind,
            big_blind_amount=big_blind
        )
    
    def add_player(self, player_id: str, player_name: str, chips: int, seat_number: int) -> bool:
        if seat_number in [p.seat_number for p in self.game_state.players.values()]:
            return False
        
        from .models import PlayerStatus
        player = Player(
            id=player_id,
            name=player_name,
            chips=chips,
            status=PlayerStatus.SITTING,
            seat_number=seat_number
        )
        self.game_state.players[player_id] = player
        return True
    
    def start_game(self) -> bool:
        seated_players = self.game_state.get_seated_players()
        if len(seated_players) < 2:
            return False
        
        self._reset_game_state()
        self._deal_hole_cards()
        self._post_blinds()
        self.game_state.phase = GamePhase.PRE_FLOP
        self._set_first_player_to_act()
        return True
    
    def player_action(self, player_id: str, action: PlayerAction, amount: int = 0) -> bool:
        if not self._is_valid_action(player_id, action, amount):
            return False
        
        player = self.game_state.players[player_id]
        
        if action == PlayerAction.FOLD:
            player.has_folded = True
        
        elif action == PlayerAction.CHECK:
            pass
        
        elif action == PlayerAction.CALL:
            call_amount = min(self.game_state.current_bet - player.current_bet, player.chips)
            player.chips -= call_amount
            player.current_bet += call_amount
            self.game_state.pot += call_amount
            
            if player.chips == 0:
                player.is_all_in = True
        
        elif action in [PlayerAction.BET, PlayerAction.RAISE]:
            bet_amount = min(amount, player.chips)
            player.chips -= bet_amount
            player.current_bet += bet_amount
            self.game_state.pot += bet_amount
            self.game_state.current_bet = player.current_bet
            
            if player.chips == 0:
                player.is_all_in = True
        
        elif action == PlayerAction.ALL_IN:
            all_in_amount = player.chips
            player.chips = 0
            player.current_bet += all_in_amount
            self.game_state.pot += all_in_amount
            self.game_state.current_bet = max(self.game_state.current_bet, player.current_bet)
            player.is_all_in = True
        
        if self._is_betting_round_complete():
            self._advance_to_next_phase()
        else:
            self._advance_to_next_player()
        
        return True
    
    def _is_valid_action(self, player_id: str, action: PlayerAction, amount: int) -> bool:
        if player_id not in self.game_state.players:
            return False
        
        player = self.game_state.players[player_id]
        
        if player.has_folded or player.is_all_in:
            return False
        
        current_player = self._get_current_player()
        if not current_player or current_player.id != player_id:
            return False
        
        if action == PlayerAction.CHECK:
            return player.current_bet == self.game_state.current_bet
        
        elif action == PlayerAction.CALL:
            return player.current_bet < self.game_state.current_bet
        
        elif action in [PlayerAction.BET, PlayerAction.RAISE]:
            return amount > 0 and amount <= player.chips
        
        return True
    
    def _is_betting_round_complete(self) -> bool:
        active_players = [p for p in self.game_state.get_active_players() if not p.is_all_in]
        
        if len(active_players) <= 1:
            return True
        
        for player in active_players:
            if player.current_bet != self.game_state.current_bet:
                return False
        
        return True
    
    def _advance_to_next_phase(self):
        self._reset_player_bets()
        
        if self.game_state.phase == GamePhase.PRE_FLOP:
            self._deal_flop()
            self.game_state.phase = GamePhase.FLOP
        
        elif self.game_state.phase == GamePhase.FLOP:
            self._deal_turn()
            self.game_state.phase = GamePhase.TURN
        
        elif self.game_state.phase == GamePhase.TURN:
            self._deal_river()
            self.game_state.phase = GamePhase.RIVER
        
        elif self.game_state.phase == GamePhase.RIVER:
            self.game_state.phase = GamePhase.SHOWDOWN
            self._determine_winner()
            return
        
        self._set_first_player_to_act()
    
    def _advance_to_next_player(self):
        seated_players = sorted(self.game_state.get_seated_players(), key=lambda p: p.seat_number)
        current_idx = next(i for i, p in enumerate(seated_players) 
                          if p.seat_number == self.game_state.current_player_position)
        
        next_idx = (current_idx + 1) % len(seated_players)
        next_player = seated_players[next_idx]
        
        while next_player.has_folded or next_player.is_all_in:
            next_idx = (next_idx + 1) % len(seated_players)
            next_player = seated_players[next_idx]
        
        self.game_state.current_player_position = next_player.seat_number
    
    def _get_current_player(self) -> Optional[Player]:
        for player in self.game_state.players.values():
            if player.seat_number == self.game_state.current_player_position:
                return player
        return None
    
    def _reset_game_state(self):
        self.game_state.deck = self.game_state._create_deck()
        random.shuffle(self.game_state.deck)
        self.game_state.community_cards = []
        self.game_state.pot = 0
        self.game_state.current_bet = 0
        
        for player in self.game_state.players.values():
            player.hole_cards = []
            player.current_bet = 0
            player.has_folded = False
            player.is_all_in = False
    
    def _deal_hole_cards(self):
        active_players = self.game_state.get_seated_players()
        for _ in range(2):
            for player in active_players:
                if self.game_state.deck:
                    player.hole_cards.append(self.game_state.deck.pop())
    
    def _post_blinds(self):
        seated_players = sorted(self.game_state.get_seated_players(), key=lambda p: p.seat_number)
        
        if len(seated_players) >= 2:
            self.game_state.small_blind_position = seated_players[0].seat_number
            self.game_state.big_blind_position = seated_players[1].seat_number
            
            small_blind_player = seated_players[0]
            big_blind_player = seated_players[1]
            
            small_blind_amount = min(self.game_state.small_blind_amount, small_blind_player.chips)
            big_blind_amount = min(self.game_state.big_blind_amount, big_blind_player.chips)
            
            small_blind_player.chips -= small_blind_amount
            small_blind_player.current_bet = small_blind_amount
            self.game_state.pot += small_blind_amount
            
            big_blind_player.chips -= big_blind_amount
            big_blind_player.current_bet = big_blind_amount
            self.game_state.pot += big_blind_amount
            self.game_state.current_bet = big_blind_amount
    
    def _set_first_player_to_act(self):
        seated_players = sorted(self.game_state.get_seated_players(), key=lambda p: p.seat_number)
        
        if self.game_state.phase == GamePhase.PRE_FLOP:
            if len(seated_players) >= 3:
                self.game_state.current_player_position = seated_players[2].seat_number
            else:
                self.game_state.current_player_position = seated_players[0].seat_number
        else:
            self.game_state.current_player_position = seated_players[0].seat_number
    
    def _deal_flop(self):
        if len(self.game_state.deck) >= 3:
            for _ in range(3):
                self.game_state.community_cards.append(self.game_state.deck.pop())
    
    def _deal_turn(self):
        if self.game_state.deck:
            self.game_state.community_cards.append(self.game_state.deck.pop())
    
    def _deal_river(self):
        if self.game_state.deck:
            self.game_state.community_cards.append(self.game_state.deck.pop())
    
    def _reset_player_bets(self):
        self.game_state.current_bet = 0
        for player in self.game_state.players.values():
            player.current_bet = 0
    
    def _determine_winner(self):
        active_players = [p for p in self.game_state.get_active_players()]
        
        if len(active_players) == 1:
            winner = active_players[0]
            winner.chips += self.game_state.pot
            self.game_state.pot = 0
            return
        
        player_hands = {}
        for player in active_players:
            hand_rank, tiebreakers = HandEvaluator.evaluate_hand(
                player.hole_cards, self.game_state.community_cards
            )
            player_hands[player.id] = (hand_rank, tiebreakers)
        
        best_hand = None
        winners = []
        
        for player_id, hand in player_hands.items():
            if best_hand is None or HandEvaluator.compare_hands(hand, best_hand) > 0:
                best_hand = hand
                winners = [player_id]
            elif HandEvaluator.compare_hands(hand, best_hand) == 0:
                winners.append(player_id)
        
        pot_share = self.game_state.pot // len(winners)
        for winner_id in winners:
            self.game_state.players[winner_id].chips += pot_share
        
        self.game_state.pot = 0