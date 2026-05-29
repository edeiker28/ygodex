import type { Deck } from '../types/ygo';

export function exportToYdk(deck: Deck): string {
  const expand = (zone: typeof deck.main) =>
    zone.flatMap(dc => Array(dc.count).fill(String(dc.card.id)));

  return [
    '#created by YGODEX',
    '#main',
    ...expand(deck.main),
    '#extra',
    ...expand(deck.extra),
    '!side',
    ...expand(deck.side),
  ].join('\n');
}

export function getYdkFilename(deckName: string): string {
  return `${deckName.replace(/[^a-zA-Z0-9]/g, '_')}.ydk`;
}
