import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import BanBadge from './BanBadge';
import { getTypeColor } from '../../constants/typeColors';
import type { YGOCard } from '../../types/ygo';

interface Props {
  card: YGOCard;
  onAdd?: (card: YGOCard) => void;
}

export default function CardMini({ card, onAdd }: Props) {
  const image = card.card_images[0];
  const typeColor = getTypeColor(card.type);

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className="group relative rounded-xl overflow-hidden cursor-pointer transition-all duration-300 hover:-translate-y-1 hover:scale-[1.02]"
      style={{
        border: `1.5px solid ${typeColor}55`,
        boxShadow: `0 4px 24px ${typeColor}20, 0 1px 0 ${typeColor}30 inset`,
      }}
    >
      {/* Full card scan — the real Konami card with its frame, name, stars, ATK/DEF */}
      <Link to={`/cards/${card.id}`} className="block relative aspect-[421/614]">
        {image ? (
          <img
            src={image.image_url_small}
            alt={card.name}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full bg-surface2 flex items-center justify-center text-muted text-xs">
            Sin imagen
          </div>
        )}

        {/* Banlist badge — overlay since it's useful but small on the card scan */}
        {card.banlist_info?.ban_tcg && (
          <div className="absolute top-1.5 right-1.5">
            <BanBadge banlistInfo={card.banlist_info} />
          </div>
        )}

        {/* Hover name overlay */}
        <div
          className="absolute inset-x-0 bottom-0 px-2 py-2 translate-y-full group-hover:translate-y-0 transition-transform duration-200"
          style={{ background: `linear-gradient(to top, ${typeColor}e0 0%, ${typeColor}40 60%, transparent 100%)` }}
        >
          <p className="text-[10px] font-body text-white font-semibold leading-tight line-clamp-2 drop-shadow">
            {card.name}
          </p>
        </div>
      </Link>

      {/* Add-to-deck button — appears on hover */}
      {onAdd && (
        <button
          onClick={(e) => { e.preventDefault(); e.stopPropagation(); onAdd(card); }}
          aria-label={`Añadir ${card.name} al mazo`}
          className="absolute top-1.5 left-1.5 w-6 h-6 rounded-full text-sm font-bold flex items-center justify-center transition-all duration-200 opacity-0 group-hover:opacity-100 cursor-pointer shadow-md hover:scale-110"
          style={{ background: typeColor, color: '#08040f' }}
        >
          +
        </button>
      )}
    </motion.div>
  );
}
