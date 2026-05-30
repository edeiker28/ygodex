import type { CardFilters, YGOCard } from '../types/ygo';

const BASE_URL = 'https://db.ygoprodeck.com/api/v7/cardinfo.php';

async function fetchYGO(params: Record<string, string | number>): Promise<YGOCard[]> {
  try {
    const url = new URL(BASE_URL);
    Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, String(v)));
    const res = await fetch(url.toString());
    const json = (await res.json()) as { data?: YGOCard[]; error?: string };
    return json.data ?? [];
  } catch {
    return [];
  }
}

export async function getCards(filters: CardFilters & { num?: number; offset?: number }): Promise<YGOCard[]> {
  const params: Record<string, string | number> = {};

  if (filters.fname) params['fname'] = filters.fname;
  // 'Monster' is our broad category — don't send to API, filter client-side after
  if (filters.type && filters.type !== 'Monster') params['type'] = filters.type;
  if (filters.attribute) params['attribute'] = filters.attribute;
  if (filters.race) params['race'] = filters.race;
  if (filters.archetype) params['archetype'] = filters.archetype;
  if (filters.level) params['level'] = filters.level;
  if (filters.num !== undefined) params['num'] = filters.num;
  if (filters.offset !== undefined) params['offset'] = filters.offset;

  let cards = await fetchYGO(params);

  if (filters.type === 'Monster') {
    cards = cards.filter(c => c.type !== 'Spell Card' && c.type !== 'Trap Card');
  }

  if (filters.atkMin !== undefined) cards = cards.filter(c => (c.atk ?? 0) >= filters.atkMin!);
  if (filters.atkMax !== undefined) cards = cards.filter(c => (c.atk ?? 9999) <= filters.atkMax!);
  if (filters.defMin !== undefined) cards = cards.filter(c => (c.def ?? 0) >= filters.defMin!);
  if (filters.defMax !== undefined) cards = cards.filter(c => (c.def ?? 9999) <= filters.defMax!);

  return cards;
}

export async function getCardById(id: number): Promise<YGOCard | null> {
  const cards = await fetchYGO({ id });
  return cards[0] ?? null;
}

export async function getAllCards(num = 20, offset = 0): Promise<YGOCard[]> {
  return fetchYGO({ num, offset });
}

export async function getCardsByIds(ids: number[]): Promise<YGOCard[]> {
  const uniqueIds = [...new Set(ids)];
  if (uniqueIds.length === 0) return [];
  const results: (YGOCard | null)[] = [];
  // Batch 10 at a time to stay well within rate limit
  for (let i = 0; i < uniqueIds.length; i += 10) {
    const batch = uniqueIds.slice(i, i + 10);
    const batchResults = await Promise.all(batch.map(id => getCardById(id)));
    results.push(...batchResults);
  }
  return results.filter((c): c is YGOCard => c !== null);
}
