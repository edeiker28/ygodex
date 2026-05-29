import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import BanBadge from './BanBadge';
import { getTypeBg, getTypeColor, getAttributeColor } from '../../constants/typeColors';
import type { YGOCard } from '../../types/ygo';

const TYPE_LABELS: Record<string, string> = {
  'Effect Monster': 'Monstruo',
  'Normal Monster': 'Normal',
  'Ritual Monster': 'Ritual',
  'Ritual Effect Monster': 'Ritual',
  'Fusion Monster': 'Fusión',
  'Synchro Monster': 'Sincronía',
  'Synchro Tuner Monster': 'Sincronía',
  'XYZ Monster': 'XYZ',
  'Link Monster': 'Link',
  'Pendulum Effect Monster': 'Péndulo',
  'Pendulum Normal Monster': 'Pénd. Normal',
  'Flip Effect Monster': 'Flip',
  'Toon Monster': 'Toon',
  'Union Effect Monster': 'Unión',
  'Gemini Monster': 'Gemini',
  'Spirit Monster': 'Spirit',
  'Tuner Monster': 'Tuner',
  'Spell Card': 'Magia',
  'Trap Card': 'Trampa',
};

interface Props {
  card: YGOCard;
  onAdd?: (card: YGOCard) => void;
}

export default function CardMini({ card, onAdd }: Props) {
  const image = card.card_images[0];
  const typeColor = getTypeColor(card.type);
  const typeBg = getTypeBg(card.type);
  const attrColor = getAttributeColor(card.attribute);
  const levelDisplay = card.level ?? card.rank;
  const typeLabel = TYPE_LABELS[card.type] ?? card.type.replace(' Monster', '').replace(' Card', '');
  const isXyz = card.type.includes('XYZ');

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className="group relative flex flex-col rounded-xl overflow-hidden cursor-pointer transition-all duration-300 hover:-translate-y-0.5"
      style={{
        border: `1.5px solid ${typeColor}55`,
        boxShadow: `0 2px 24px ${typeColor}18, 0 0 0 0.5px ${typeColor}20`,
        background: typeBg,
      }}
    >
      {/* Header strip: type label + attribute + ban badge */}
      <div
        className="flex items-center justify-between gap-1 px-2 py-1.5"
        style={{
          background: `linear-gradient(90deg, ${typeColor}35 0%, ${typeColor}08 100%)`,
          borderBottom: `1px solid ${typeColor}35`,
        }}
      >
        <span
          className="text-[9px] font-display uppercase tracking-wide truncate leading-none"
          style={{ color: typeColor, textShadow: `0 0 8px ${typeColor}80` }}
        >
          {typeLabel}
        </span>
        <div className="flex items-center gap-1 shrink-0">
          {card.attribute && (
            <span
              className="text-[7px] font-body px-1 py-0.5 rounded-sm font-bold leading-none"
              style={{ color: attrColor, background: `${attrColor}28` }}
            >
              {card.attribute}
            </span>
          )}
          {card.banlist_info?.ban_tcg && (
            <BanBadge banlistInfo={card.banlist_info} />
          )}
        </div>
      </div>

      {/* Card artwork */}
      <Link to={`/cards/${card.id}`} className="block relative">
        <div className="relative aspect-[421/614] overflow-hidden">
          {image ? (
            <img
              src={image.image_url_cropped || image.image_url_small}
              alt={card.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-muted text-xs">
              Sin imagen
            </div>
          )}

          {/* Level / Rank stars */}
          {levelDisplay != null && levelDisplay > 0 && (
            <div className="absolute bottom-1 left-0 right-0 flex justify-center flex-wrap gap-px px-1">
              {Array.from({ length: Math.min(levelDisplay, 12) }).map((_, i) => (
                <span
                  key={i}
                  className="text-[8px] leading-none select-none"
                  style={{
                    color: isXyz ? '#d4c88a' : '#facc15',
                    textShadow: `0 0 5px ${isXyz ? '#d4c88a' : '#facc15'}cc`,
                  }}
                >
                  {isXyz ? '✦' : '★'}
                </span>
              ))}
            </div>
          )}

          {/* Link rating */}
          {card.linkval != null && (
            <div className="absolute bottom-1 right-1 text-[9px] font-display font-bold leading-none"
                 style={{ color: '#60a5fa', textShadow: '0 0 6px #60a5fa99' }}>
              LINK-{card.linkval}
            </div>
          )}
        </div>
      </Link>

      {/* Footer: name + add button */}
      <div
        className="flex items-center gap-1.5 px-2 py-1.5"
        style={{
          borderTop: `1px solid ${typeColor}28`,
          background: `linear-gradient(90deg, ${typeBg}, ${typeColor}14)`,
        }}
      >
        <p
          className="text-[10px] font-body leading-tight line-clamp-1 flex-1 min-w-0"
          style={{ color: '#d0c8f0' }}
        >
          {card.name}
        </p>
        {onAdd && (
          <button
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); onAdd(card); }}
            aria-label={`Añadir ${card.name} al mazo`}
            className="shrink-0 w-5 h-5 rounded-full text-[11px] font-bold flex items-center justify-center transition-all duration-200 opacity-0 group-hover:opacity-100 cursor-pointer hover:scale-110"
            style={{ background: typeColor, color: '#08040f' }}
          >
            +
          </button>
        )}
      </div>
    </motion.div>
  );
}
