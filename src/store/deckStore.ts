import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Deck, DeckCard, DeckZoneType, YGOCard } from '../types/ygo';

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2);
}

interface DeckStore {
  decks: Deck[];
  activeDeckId: string | null;
  createDeck: (name: string) => void;
  deleteDeck: (id: string) => void;
  renameDeck: (id: string, name: string) => void;
  setActiveDeck: (id: string | null) => void;
  addCard: (deckId: string, zone: DeckZoneType, card: YGOCard) => void;
  removeCard: (deckId: string, zone: DeckZoneType, cardId: number) => void;
}

export const useDeckStore = create<DeckStore>()(
  persist(
    (set) => ({
      decks: [],
      activeDeckId: null,

      createDeck: (name) =>
        set((s) => {
          const deck: Deck = {
            id: generateId(),
            name,
            main: [],
            extra: [],
            side: [],
            createdAt: Date.now(),
            updatedAt: Date.now(),
          };
          return { decks: [...s.decks, deck], activeDeckId: deck.id };
        }),

      deleteDeck: (id) =>
        set((s) => ({
          decks: s.decks.filter((d) => d.id !== id),
          activeDeckId: s.activeDeckId === id ? null : s.activeDeckId,
        })),

      renameDeck: (id, name) =>
        set((s) => ({
          decks: s.decks.map((d) =>
            d.id === id ? { ...d, name, updatedAt: Date.now() } : d
          ),
        })),

      setActiveDeck: (id) => set({ activeDeckId: id }),

      addCard: (deckId, zone, card) =>
        set((s) => ({
          decks: s.decks.map((d) => {
            if (d.id !== deckId) return d;
            const existing = d[zone].find((dc) => dc.card.id === card.id);
            const updatedZone: DeckCard[] = existing
              ? d[zone].map((dc) =>
                  dc.card.id === card.id ? { ...dc, count: dc.count + 1 } : dc
                )
              : [...d[zone], { card, count: 1 }];
            return { ...d, [zone]: updatedZone, updatedAt: Date.now() };
          }),
        })),

      removeCard: (deckId, zone, cardId) =>
        set((s) => ({
          decks: s.decks.map((d) => {
            if (d.id !== deckId) return d;
            const updatedZone = d[zone]
              .map((dc) =>
                dc.card.id === cardId ? { ...dc, count: dc.count - 1 } : dc
              )
              .filter((dc) => dc.count > 0);
            return { ...d, [zone]: updatedZone, updatedAt: Date.now() };
          }),
        })),
    }),
    {
      name: 'ygodex-decks',
      partialize: (s) => ({ decks: s.decks, activeDeckId: s.activeDeckId }),
    }
  )
);
