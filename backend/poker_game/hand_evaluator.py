from enum import Enum
from typing import List, Tuple, Dict
from collections import Counter
from .models import Card, Rank, Suit


class HandRank(Enum):
    HIGH_CARD = 1
    PAIR = 2
    TWO_PAIR = 3
    THREE_OF_A_KIND = 4
    STRAIGHT = 5
    FLUSH = 6
    FULL_HOUSE = 7
    FOUR_OF_A_KIND = 8
    STRAIGHT_FLUSH = 9
    ROYAL_FLUSH = 10


class HandEvaluator:
    @staticmethod
    def evaluate_hand(hole_cards: List[Card], community_cards: List[Card]) -> Tuple[HandRank, List[int]]:
        all_cards = hole_cards + community_cards
        best_hand = HandEvaluator._find_best_five_card_hand(all_cards)
        return HandEvaluator._evaluate_five_cards(best_hand)
    
    @staticmethod
    def _find_best_five_card_hand(cards: List[Card]) -> List[Card]:
        from itertools import combinations
        
        if len(cards) < 5:
            return cards
        
        best_hand = None
        best_rank = None
        best_tiebreakers = None
        
        for five_cards in combinations(cards, 5):
            hand_rank, tiebreakers = HandEvaluator._evaluate_five_cards(list(five_cards))
            
            if best_hand is None or HandEvaluator._is_better_hand(
                hand_rank, tiebreakers, best_rank, best_tiebreakers
            ):
                best_hand = list(five_cards)
                best_rank = hand_rank
                best_tiebreakers = tiebreakers
        
        return best_hand
    
    @staticmethod
    def _evaluate_five_cards(cards: List[Card]) -> Tuple[HandRank, List[int]]:
        ranks = [card.rank.value for card in cards]
        suits = [card.suit for card in cards]
        
        rank_counts = Counter(ranks)
        is_flush = len(set(suits)) == 1
        is_straight = HandEvaluator._is_straight(ranks)
        
        sorted_ranks = sorted(ranks, reverse=True)
        count_groups = sorted(rank_counts.values(), reverse=True)
        
        if is_straight and is_flush:
            if sorted_ranks == [14, 13, 12, 11, 10]:
                return HandRank.ROYAL_FLUSH, [14]
            else:
                return HandRank.STRAIGHT_FLUSH, [max(ranks) if max(ranks) != 14 or min(ranks) != 2 else 5]
        
        if count_groups == [4, 1]:
            four_kind = [rank for rank, count in rank_counts.items() if count == 4][0]
            kicker = [rank for rank, count in rank_counts.items() if count == 1][0]
            return HandRank.FOUR_OF_A_KIND, [four_kind, kicker]
        
        if count_groups == [3, 2]:
            three_kind = [rank for rank, count in rank_counts.items() if count == 3][0]
            pair = [rank for rank, count in rank_counts.items() if count == 2][0]
            return HandRank.FULL_HOUSE, [three_kind, pair]
        
        if is_flush:
            return HandRank.FLUSH, sorted_ranks
        
        if is_straight:
            return HandRank.STRAIGHT, [max(ranks) if max(ranks) != 14 or min(ranks) != 2 else 5]
        
        if count_groups == [3, 1, 1]:
            three_kind = [rank for rank, count in rank_counts.items() if count == 3][0]
            kickers = sorted([rank for rank, count in rank_counts.items() if count == 1], reverse=True)
            return HandRank.THREE_OF_A_KIND, [three_kind] + kickers
        
        if count_groups == [2, 2, 1]:
            pairs = sorted([rank for rank, count in rank_counts.items() if count == 2], reverse=True)
            kicker = [rank for rank, count in rank_counts.items() if count == 1][0]
            return HandRank.TWO_PAIR, pairs + [kicker]
        
        if count_groups == [2, 1, 1, 1]:
            pair = [rank for rank, count in rank_counts.items() if count == 2][0]
            kickers = sorted([rank for rank, count in rank_counts.items() if count == 1], reverse=True)
            return HandRank.PAIR, [pair] + kickers
        
        return HandRank.HIGH_CARD, sorted_ranks
    
    @staticmethod
    def _is_straight(ranks: List[int]) -> bool:
        sorted_ranks = sorted(set(ranks))
        
        if len(sorted_ranks) != 5:
            return False
        
        if sorted_ranks == [2, 3, 4, 5, 14]:
            return True
        
        for i in range(1, len(sorted_ranks)):
            if sorted_ranks[i] != sorted_ranks[i-1] + 1:
                return False
        
        return True
    
    @staticmethod
    def _is_better_hand(rank1: HandRank, tiebreakers1: List[int], 
                       rank2: HandRank, tiebreakers2: List[int]) -> bool:
        if rank1.value > rank2.value:
            return True
        elif rank1.value < rank2.value:
            return False
        else:
            for t1, t2 in zip(tiebreakers1, tiebreakers2):
                if t1 > t2:
                    return True
                elif t1 < t2:
                    return False
            return False
    
    @staticmethod
    def compare_hands(hand1: Tuple[HandRank, List[int]], 
                     hand2: Tuple[HandRank, List[int]]) -> int:
        rank1, tiebreakers1 = hand1
        rank2, tiebreakers2 = hand2
        
        if HandEvaluator._is_better_hand(rank1, tiebreakers1, rank2, tiebreakers2):
            return 1
        elif HandEvaluator._is_better_hand(rank2, tiebreakers2, rank1, tiebreakers1):
            return -1
        else:
            return 0