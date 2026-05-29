import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { getCards, getCardById } from '../cards';
import type { YGOCard } from '../../types/ygo';

const mockCard: YGOCard = {
  id: 89631139,
  name: 'Blue-Eyes White Dragon',
  type: 'Normal Monster',
  frameType: 'normal',
  desc: 'This legendary dragon...',
  atk: 3000,
  def: 2500,
  level: 8,
  race: 'Dragon',
  attribute: 'LIGHT',
  card_images: [{ id: 89631139, image_url: '', image_url_small: '', image_url_cropped: '' }],
  card_prices: [{ tcgplayer_price: '5.00', cardmarket_price: '', ebay_price: '', amazon_price: '', coolstuffinc_price: '' }],
};

beforeEach(() => {
  vi.spyOn(global, 'fetch');
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe('getCards', () => {
  it('returns cards from API', async () => {
    vi.mocked(fetch).mockResolvedValueOnce(new Response(
      JSON.stringify({ data: [mockCard] }),
      { status: 200 }
    ));
    const cards = await getCards({ fname: 'blue-eyes' });
    expect(cards).toHaveLength(1);
    expect(cards[0].name).toBe('Blue-Eyes White Dragon');
  });

  it('returns empty array when API returns error object', async () => {
    vi.mocked(fetch).mockResolvedValueOnce(new Response(
      JSON.stringify({ error: 'No card matching your query was found.' }),
      { status: 200 }
    ));
    const cards = await getCards({ fname: 'zzznomatch' });
    expect(cards).toEqual([]);
  });

  it('returns empty array on network failure', async () => {
    vi.mocked(fetch).mockRejectedValueOnce(new Error('Network error'));
    const cards = await getCards({ fname: 'test' });
    expect(cards).toEqual([]);
  });

  it('applies ATK min filter client-side', async () => {
    const lowCard = { ...mockCard, id: 1, atk: 500 };
    vi.mocked(fetch).mockResolvedValueOnce(new Response(
      JSON.stringify({ data: [mockCard, lowCard] }),
      { status: 200 }
    ));
    const cards = await getCards({ atkMin: 1000 });
    expect(cards).toHaveLength(1);
    expect(cards[0].atk).toBe(3000);
  });
});

describe('getCardById', () => {
  it('returns single card', async () => {
    vi.mocked(fetch).mockResolvedValueOnce(new Response(
      JSON.stringify({ data: [mockCard] }),
      { status: 200 }
    ));
    const card = await getCardById(89631139);
    expect(card?.id).toBe(89631139);
  });

  it('returns null when not found', async () => {
    vi.mocked(fetch).mockResolvedValueOnce(new Response(
      JSON.stringify({ error: 'No card found' }),
      { status: 200 }
    ));
    const card = await getCardById(99999999);
    expect(card).toBeNull();
  });
});
