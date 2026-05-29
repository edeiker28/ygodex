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
  if (filters.type) params['type'] = filters.type;
  if (filters.attribute) params['attribute'] = filters.attribute;
  if (filters.race) params['race'] = filters.race;
  if (filters.archetype) params['archetype'] = filters.archetype;
  if (filters.level) params['level'] = filters.level;
  if (filters.num !== undefined) params['num'] = filters.num;
  if (filters.offset !== undefined) params['offset'] = filters.offset;

  let cards = await fetchYGO(params);

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
