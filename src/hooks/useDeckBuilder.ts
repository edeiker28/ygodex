import { useDeckStore } from '../store/deckStore';
import { canAddCard, isExtraDeckCard } from '../utils/deckValidator';
import type { YGOCard, DeckZoneType, BanFormat } from '../types/ygo';

export function useDeckBuilder(deckId: string) {
  const { decks, addCard, removeCard } = useDeckStore();
  const deck = decks.find((d) => d.id === deckId);

  function getTargetZone(card: YGOCard): DeckZoneType {
    return isExtraDeckCard(card) ? 'extra' : 'main';
  }

  function tryAddCard(card: YGOCard, zone?: DeckZoneType, format: BanFormat = 'tcg'): boolean {
    if (!deck) return false;
    const targetZone = zone ?? getTargetZone(card);
    const zoneCards = deck[targetZone];
    if (!canAddCard(card, zoneCards, format)) return false;
    addCard(deckId, targetZone, card);
    return true;
  }

  function tryRemoveCard(cardId: number, zone: DeckZoneType): void {
    removeCard(deckId, zone, cardId);
  }

  return { deck, tryAddCard, tryRemoveCard, getTargetZone };
}
