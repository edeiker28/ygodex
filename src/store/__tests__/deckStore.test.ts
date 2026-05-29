import { describe, it, expect, beforeEach } from 'vitest';
import { useDeckStore } from '../deckStore';
import type { YGOCard } from '../../types/ygo';

const makeCard = (id: number): YGOCard => ({
  id,
  name: `Card ${id}`,
  type: 'Effect Monster',
  frameType: 'effect',
  desc: '',
  race: 'Dragon',
  card_images: [],
  card_prices: [],
});

beforeEach(() => {
  useDeckStore.setState({ decks: [], activeDeckId: null });
});

describe('deckStore', () => {
  it('creates a deck', () => {
    useDeckStore.getState().createDeck('My Deck');
    const { decks } = useDeckStore.getState();
    expect(decks).toHaveLength(1);
    expect(decks[0].name).toBe('My Deck');
    expect(decks[0].main).toEqual([]);
  });

  it('sets active deck', () => {
    useDeckStore.getState().createDeck('Deck A');
    const { decks } = useDeckStore.getState();
    useDeckStore.getState().setActiveDeck(decks[0].id);
    expect(useDeckStore.getState().activeDeckId).toBe(decks[0].id);
  });

  it('adds card to main zone', () => {
    useDeckStore.getState().createDeck('Test');
    const deck = useDeckStore.getState().decks[0];
    useDeckStore.getState().addCard(deck.id, 'main', makeCard(1));
    const updated = useDeckStore.getState().decks[0];
    expect(updated.main).toHaveLength(1);
    expect(updated.main[0].count).toBe(1);
  });

  it('increments count when same card added again', () => {
    useDeckStore.getState().createDeck('Test');
    const deck = useDeckStore.getState().decks[0];
    useDeckStore.getState().addCard(deck.id, 'main', makeCard(1));
    useDeckStore.getState().addCard(deck.id, 'main', makeCard(1));
    const updated = useDeckStore.getState().decks[0];
    expect(updated.main[0].count).toBe(2);
  });

  it('removes card from zone', () => {
    useDeckStore.getState().createDeck('Test');
    const deck = useDeckStore.getState().decks[0];
    useDeckStore.getState().addCard(deck.id, 'main', makeCard(1));
    useDeckStore.getState().addCard(deck.id, 'main', makeCard(1));
    useDeckStore.getState().removeCard(deck.id, 'main', 1);
    const updated = useDeckStore.getState().decks[0];
    expect(updated.main[0].count).toBe(1);
  });

  it('removes card entry when count reaches 0', () => {
    useDeckStore.getState().createDeck('Test');
    const deck = useDeckStore.getState().decks[0];
    useDeckStore.getState().addCard(deck.id, 'main', makeCard(1));
    useDeckStore.getState().removeCard(deck.id, 'main', 1);
    const updated = useDeckStore.getState().decks[0];
    expect(updated.main).toHaveLength(0);
  });

  it('deletes a deck', () => {
    useDeckStore.getState().createDeck('Delete me');
    const { decks } = useDeckStore.getState();
    useDeckStore.getState().deleteDeck(decks[0].id);
    expect(useDeckStore.getState().decks).toHaveLength(0);
  });

  it('renames a deck', () => {
    useDeckStore.getState().createDeck('Old Name');
    const { decks } = useDeckStore.getState();
    useDeckStore.getState().renameDeck(decks[0].id, 'New Name');
    expect(useDeckStore.getState().decks[0].name).toBe('New Name');
  });
});
