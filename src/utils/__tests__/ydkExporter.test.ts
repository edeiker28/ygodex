import { describe, it, expect } from 'vitest';
import { exportToYdk, getYdkFilename } from '../ydkExporter';
import type { Deck, YGOCard } from '../../types/ygo';

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

const deck: Deck = {
  id: '1',
  name: 'Test Deck',
  main: [{ card: makeCard(1), count: 3 }, { card: makeCard(2), count: 1 }],
  extra: [{ card: makeCard(3), count: 2 }],
  side: [{ card: makeCard(4), count: 1 }],
  createdAt: 0,
  updatedAt: 0,
};

describe('exportToYdk', () => {
  it('starts with #main header', () => {
    expect(exportToYdk(deck)).toContain('#main');
  });
  it('expands count correctly — 3 copies of card 1', () => {
    const ydk = exportToYdk(deck);
    const lines = ydk.split('\n');
    const mainStart = lines.indexOf('#main') + 1;
    const extraStart = lines.indexOf('#extra');
    const mainLines = lines.slice(mainStart, extraStart);
    expect(mainLines.filter(l => l === '1')).toHaveLength(3);
  });
  it('includes !side section', () => {
    expect(exportToYdk(deck)).toContain('!side');
  });
  it('puts extra deck cards between #extra and !side', () => {
    const ydk = exportToYdk(deck);
    const lines = ydk.split('\n');
    const extraStart = lines.indexOf('#extra') + 1;
    const sideStart = lines.indexOf('!side');
    const extraLines = lines.slice(extraStart, sideStart);
    expect(extraLines.filter(l => l === '3')).toHaveLength(2);
  });
});

describe('getYdkFilename', () => {
  it('replaces spaces with underscores', () =>
    expect(getYdkFilename('My Deck')).toBe('My_Deck.ydk'));
  it('removes special characters', () =>
    expect(getYdkFilename('Deck!')).toBe('Deck_.ydk'));
});
