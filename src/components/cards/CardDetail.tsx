import { motion } from 'framer-motion';
import { useDeckStore } from '../../store/deckStore';
import { canAddCard, isExtraDeckCard } from '../../utils/deckValidator';
import { getAttributeColor } from '../../constants/typeColors';
import TypeBadge from './TypeBadge';
import BanBadge from './BanBadge';
import type { YGOCard } from '../../types/ygo';

interface Props {
  card: YGOCard;
}

export default function CardDetail({ card }: Props) {
  const { decks, activeDeckId, addCard } = useDeckStore();
  const activeDeck = decks.find((d) => d.id === activeDeckId);
  const attrColor = getAttributeColor(card.attribute);
  const image = card.card_images[0];
  const price = parseFloat(card.card_prices?.[0]?.tcgplayer_price ?? '0') || 0;
  const zone = isExtraDeckCard(card) ? 'extra' : 'main';
  const canAdd = activeDeck ? canAddCard(card, activeDeck[zone]) : false;

  function handleAdd() {
    if (activeDeckId && canAdd) addCard(activeDeckId, zone, card);
  }

  return (
    <div className="min-h-screen bg-bg">
      <div
        className="absolute top-0 left-0 w-80 h-80 opacity-20 pointer-events-none rounded-full blur-3xl"
        style={{ background: `radial-gradient(circle, ${attrColor}, transparent 70%)` }}
      />
      <div className="relative max-w-5xl mx-auto px-4 py-8 grid md:grid-cols-[300px_1fr] gap-8">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4 }}
          className="flex flex-col items-center gap-4"
        >
          {image && (
            <img
              src={image.image_url}
              alt={card.name}
              className="w-full max-w-xs rounded-lg shadow-2xl glow-primary"
              loading="eager"
            />
          )}
          {price > 0 && (
            <p className="font-body text-sm text-muted">
              TCGPlayer: <span className="text-text-main font-semibold">${price.toFixed(2)} USD</span>
            </p>
          )}
          {activeDeckId && (
            <button
              onClick={handleAdd}
              disabled={!canAdd}
              className="w-full py-2.5 rounded-lg font-display text-sm tracking-wider transition-all duration-200 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
              style={{
                backgroundColor: canAdd ? attrColor : undefined,
                border: canAdd ? 'none' : `1px solid ${attrColor}`,
                color: canAdd ? '#fff' : attrColor,
              }}
            >
              {canAdd ? 'Agregar al mazo' : 'Límite alcanzado'}
            </button>
          )}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="space-y-5"
        >
          <div>
            <h1 className="font-display text-2xl md:text-3xl text-text-main mb-2">{card.name}</h1>
            <div className="flex flex-wrap gap-2 items-center">
              <TypeBadge type={card.type} />
              <BanBadge banlistInfo={card.banlist_info} />
              {card.attribute && (
                <span className="text-xs font-body px-2 py-1 rounded" style={{ color: attrColor, border: `1px solid ${attrColor}44` }}>
                  {card.attribute}
                </span>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 max-w-xs">
            {card.atk !== undefined && (
              <div className="p-3 rounded-lg bg-surface border border-primary/10">
                <p className="text-[10px] font-body text-muted mb-1">ATK</p>
                <p className="font-display text-xl" style={{ color: attrColor }}>{card.atk}</p>
              </div>
            )}
            {card.def !== undefined && (
              <div className="p-3 rounded-lg bg-surface border border-primary/10">
                <p className="text-[10px] font-body text-muted mb-1">DEF</p>
                <p className="font-display text-xl" style={{ color: attrColor }}>{card.def}</p>
              </div>
            )}
            {(card.level || card.rank) && (
              <div className="p-3 rounded-lg bg-surface border border-primary/10">
                <p className="text-[10px] font-body text-muted mb-1">{card.rank ? 'RANGO' : 'NIVEL'}</p>
                <p className="font-display text-xl text-primary">{card.level ?? card.rank}</p>
              </div>
            )}
            {card.linkval && (
              <div className="p-3 rounded-lg bg-surface border border-primary/10">
                <p className="text-[10px] font-body text-muted mb-1">LINK</p>
                <p className="font-display text-xl text-primary2">{card.linkval}</p>
              </div>
            )}
          </div>

          {card.race && (
            <p className="text-sm font-body text-text-secondary">
              <span className="text-muted">Subtipo: </span>{card.race}
            </p>
          )}
          {card.archetype && (
            <p className="text-sm font-body text-text-secondary">
              <span className="text-muted">Arquetipo: </span>{card.archetype}
            </p>
          )}

          <div className="p-4 rounded-lg bg-surface border border-primary/10">
            <p className="text-sm font-body text-text-secondary leading-relaxed whitespace-pre-wrap">{card.desc}</p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
