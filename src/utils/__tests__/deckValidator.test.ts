import { describe, it, expect } from 'vitest';
import {
  isExtraDeckCard,
  getCardBanLimit,
  canAddCard,
  validateDeck,
} from '../deckValidator';
import type { YGOCard, DeckCard } from '../../types/ygo';

const makeCard = (overrides: Partial<YGOCard> = {}): YGOCard => ({
  id: 1,
  name: 'Test Card',
  type: 'Effect Monster',
  frameType: 'effect',
  desc: 'Test',
  race: 'Dragon',
  card_images: [],
  card_prices: [],
  ...overrides,
});

const dc = (card: YGOCard, count: number): DeckCard => ({ card, count });

describe('isExtraDeckCard', () => {
  it('returns true for Fusion Monster', () =>
    expect(isExtraDeckCard(makeCard({ type: 'Fusion Monster' }))).toBe(true));
  it('returns false for Effect Monster', () =>
    expect(isExtraDeckCard(makeCard())).toBe(false));
  it('returns true for Link Monster', () =>
    expect(isExtraDeckCard(makeCard({ type: 'Link Monster' }))).toBe(true));
});

describe('getCardBanLimit', () => {
  it('returns 3 for unlimited card', () =>
    expect(getCardBanLimit(makeCard())).toBe(3));
  it('returns 0 for banned card', () =>
    expect(getCardBanLimit(makeCard({ banlist_info: { ban_tcg: 'Banned' } }))).toBe(0));
  it('returns 1 for limited card', () =>
    expect(getCardBanLimit(makeCard({ banlist_info: { ban_tcg: 'Limited' } }))).toBe(1));
  it('returns 2 for semi-limited card', () =>
    expect(getCardBanLimit(makeCard({ banlist_info: { ban_tcg: 'Semi-Limited' } }))).toBe(2));
  it('respects ocg format', () =>
    expect(getCardBanLimit(makeCard({ banlist_info: { ban_ocg: 'Banned' } }), 'ocg')).toBe(0));
});

describe('canAddCard', () => {
  it('allows adding when zone is empty', () =>
    expect(canAddCard(makeCard(), [])).toBe(true));
  it('denies when count already at 3', () =>
    expect(canAddCard(makeCard(), [dc(makeCard(), 3)])).toBe(false));
  it('denies adding banned card', () =>
    expect(canAddCard(makeCard({ banlist_info: { ban_tcg: 'Banned' } }), [])).toBe(false));
  it('allows limited card once', () => {
    const card = makeCard({ banlist_info: { ban_tcg: 'Limited' } });
    expect(canAddCard(card, [])).toBe(true);
    expect(canAddCard(card, [dc(card, 1)])).toBe(false);
  });
});

describe('validateDeck', () => {
  const zone40 = [dc(makeCard(), 40)];
  it('valid for 40-card main deck', () => {
    const r = validateDeck(zone40, [], []);
    expect(r.valid).toBe(true);
    expect(r.errors).toHaveLength(0);
  });
  it('error for less than 40 main cards', () => {
    const r = validateDeck([dc(makeCard(), 39)], [], []);
    expect(r.valid).toBe(false);
    expect(r.errors[0]).toContain('40');
  });
  it('error for more than 60 main cards', () => {
    const r = validateDeck([dc(makeCard(), 61)], [], []);
    expect(r.valid).toBe(false);
  });
  it('error for more than 15 extra cards', () => {
    const r = validateDeck(zone40, [dc(makeCard(), 16)], []);
    expect(r.valid).toBe(false);
  });
  it('error for more than 15 side cards', () => {
    const r = validateDeck(zone40, [], [dc(makeCard(), 16)]);
    expect(r.valid).toBe(false);
  });
});
