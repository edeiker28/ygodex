import { describe, it, expect } from 'vitest';
import { getCardPrice, calcDeckPrice, calcTotalDeckPrice } from '../priceCalc';
import type { YGOCard, DeckCard } from '../../types/ygo';

const makeCard = (tcgPrice: string): YGOCard => ({
  id: 1,
  name: 'Card',
  type: 'Effect Monster',
  frameType: 'effect',
  desc: '',
  race: 'Dragon',
  card_images: [],
  card_prices: [{
    tcgplayer_price: tcgPrice,
    cardmarket_price: '0',
    ebay_price: '0',
    amazon_price: '0',
    coolstuffinc_price: '0',
  }],
});

describe('getCardPrice', () => {
  it('returns parsed tcgplayer price', () =>
    expect(getCardPrice(makeCard('3.50'))).toBe(3.5));
  it('returns 0 for invalid price', () =>
    expect(getCardPrice(makeCard('N/A'))).toBe(0));
  it('returns 0 when card_prices is empty', () => {
    const card = makeCard('5.00');
    card.card_prices = [];
    expect(getCardPrice(card)).toBe(0);
  });
});

describe('calcDeckPrice', () => {
  it('multiplies price by count and sums', () => {
    const zone: DeckCard[] = [
      { card: makeCard('2.00'), count: 3 },
      { card: makeCard('5.00'), count: 1 },
    ];
    expect(calcDeckPrice(zone)).toBe(11);
  });
});

describe('calcTotalDeckPrice', () => {
  it('sums all zones', () => {
    const z = (price: string, count: number): DeckCard[] =>
      [{ card: makeCard(price), count }];
    expect(calcTotalDeckPrice(z('10.00', 1), z('5.00', 2), z('1.00', 3))).toBe(23);
  });
});
