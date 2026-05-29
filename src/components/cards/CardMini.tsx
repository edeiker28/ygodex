import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import TypeBadge from './TypeBadge';
import BanBadge from './BanBadge';
import type { YGOCard } from '../../types/ygo';

interface Props {
  card: YGOCard;
  onAdd?: (card: YGOCard) => void;
}

export default function CardMini({ card, onAdd }: Props) {
  const image = card.card_images[0];

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className="group relative flex flex-col rounded-lg overflow-hidden border border-primary/15 bg-surface hover:border-primary/40 transition-colors duration-200 cursor-pointer"
    >
      <Link to={`/cards/${card.id}`} className="block">
        <div className="relative aspect-[421/614] overflow-hidden bg-surface2">
          {image ? (
            <img
              src={image.image_url_cropped || image.image_url_small}
              alt={card.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-muted text-xs">Sin imagen</div>
          )}
          {card.banlist_info?.ban_tcg && (
            <div className="absolute top-1 right-1">
              <BanBadge banlistInfo={card.banlist_info} />
            </div>
          )}
        </div>
        <div className="p-2 space-y-1">
          <p className="text-[11px] font-body text-text-main leading-tight line-clamp-2">{card.name}</p>
          <TypeBadge type={card.type} small />
        </div>
      </Link>
      {onAdd && (
        <button
          onClick={(e) => { e.preventDefault(); onAdd(card); }}
          aria-label={`Añadir ${card.name} al mazo`}
          className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 w-6 h-6 rounded-full bg-primary text-white text-sm flex items-center justify-center transition-opacity duration-200 cursor-pointer hover:bg-primary2"
        >
          +
        </button>
      )}
    </motion.div>
  );
}
