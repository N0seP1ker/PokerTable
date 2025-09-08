from enum import Enum
from dataclasses import dataclass
from typing import List, Optional, Dict
import random


class Suit(Enum):
    HEARTS = "hearts"
    DIAMONDS = "diamonds"
    CLUBS = "clubs"
    SPADES = "spades"


class Rank(Enum):
    TWO = 2
    THREE = 3
    FOUR = 4
    FIVE = 5
    SIX = 6
    SEVEN = 7
    EIGHT = 8
    NINE = 9
    TEN = 10
    JACK = 11
    QUEEN = 12
    KING = 13
    ACE = 14


@dataclass
class Card:
    rank: Rank
    suit: Suit
    
    def __str__(self):
        return f"{self.rank.name}_{self.suit.value}"


class PlayerStatus(Enum):
    STANDING = "standing"
    SITTING = "sitting"
    AWAY = "away"


class PlayerAction(Enum):
    FOLD = "fold"
    CHECK = "check"
    CALL = "call"
    BET = "bet"
    RAISE = "raise"
    ALL_IN = "all_in"


@dataclass
class Player:
    id: str
    name: str
    chips: int
    status: PlayerStatus = PlayerStatus.STANDING
    seat_number: Optional[int] = None
    hole_cards: List[Card] = None
    current_bet: int = 0
    has_folded: bool = False
    is_all_in: bool = False
    
    def __post_init__(self):
        if self.hole_cards is None:
            self.hole_cards = []


class GamePhase(Enum):
    WAITING = "waiting"
    PRE_FLOP = "pre_flop"
    FLOP = "flop"
    TURN = "turn"
    RIVER = "river"
    SHOWDOWN = "showdown"
    FINISHED = "finished"


@dataclass
class GameState:
    room_id: str
    players: Dict[str, Player]
    deck: List[Card]
    community_cards: List[Card]
    pot: int
    current_bet: int
    phase: GamePhase
    dealer_position: int
    small_blind_position: int
    big_blind_position: int
    current_player_position: int
    small_blind_amount: int
    big_blind_amount: int
    
    def __post_init__(self):
        if not self.deck:
            self.deck = self._create_deck()
            random.shuffle(self.deck)
        if not self.community_cards:
            self.community_cards = []
    
    def _create_deck(self) -> List[Card]:
        deck = []
        for suit in Suit:
            for rank in Rank:
                deck.append(Card(rank, suit))
        return deck
    
    def get_active_players(self) -> List[Player]:
        return [p for p in self.players.values() 
                if p.status == PlayerStatus.SITTING and not p.has_folded]
    
    def get_seated_players(self) -> List[Player]:
        return [p for p in self.players.values() 
                if p.status == PlayerStatus.SITTING]