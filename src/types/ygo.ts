export interface CardImage {
  id: number;
  image_url: string;
  image_url_small: string;
  image_url_cropped: string;
}

export interface CardPrice {
  cardmarket_price: string;
  tcgplayer_price: string;
  ebay_price: string;
  amazon_price: string;
  coolstuffinc_price: string;
}

export interface BanlistInfo {
  ban_tcg?: 'Banned' | 'Limited' | 'Semi-Limited';
  ban_ocg?: 'Banned' | 'Limited' | 'Semi-Limited';
  ban_goat?: 'Banned' | 'Limited' | 'Semi-Limited';
}

export interface YGOCard {
  id: number;
  name: string;
  type: string;
  frameType: string;
  desc: string;
  atk?: number;
  def?: number;
  level?: number;
  rank?: number;
  linkval?: number;
  race: string;
  attribute?: string;
  archetype?: string;
  card_images: CardImage[];
  card_prices: CardPrice[];
  banlist_info?: BanlistInfo;
}

export type DeckZoneType = 'main' | 'extra' | 'side';
export type BanlistStatus = 'Banned' | 'Limited' | 'Semi-Limited' | 'Unlimited';
export type CardAttribute = 'LIGHT' | 'DARK' | 'FIRE' | 'WATER' | 'EARTH' | 'WIND' | 'DIVINE';
export type BanFormat = 'tcg' | 'ocg' | 'goat';

export interface DeckCard {
  card: YGOCard;
  count: number;
}

export interface Deck {
  id: string;
  name: string;
  main: DeckCard[];
  extra: DeckCard[];
  side: DeckCard[];
  createdAt: number;
  updatedAt: number;
}

export interface CardFilters {
  fname?: string;
  type?: string;
  attribute?: string;
  race?: string;
  archetype?: string;
  level?: string;
  atkMin?: number;
  atkMax?: number;
  defMin?: number;
  defMax?: number;
  format?: BanFormat;
}
