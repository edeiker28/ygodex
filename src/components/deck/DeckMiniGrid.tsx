import type { DeckCard, DeckZoneType } from '../../types/ygo';

interface Props {
  cards: DeckCard[];
  zone: DeckZoneType;
  onRemove?: (cardId: number, zone: DeckZoneType) => void;
}

export default function DeckMiniGrid({ cards, zone, onRemove }: Props) {
  if (cards.length === 0) {
    return <p className="text-xs font-body text-muted py-4 text-center">Sin cartas</p>;
  }

  return (
    <div className="flex flex-wrap gap-1.5 p-2">
      {cards.map(({ card, count }) =>
        Array.from({ length: count }).map((_, i) => (
          <button
            key={`${card.id}-${i}`}
            onClick={() => onRemove?.(card.id, zone)}
            title={card.name}
            aria-label={`Eliminar ${card.name} del mazo`}
            className="relative group w-10 h-14 rounded overflow-hidden border border-primary/20 hover:border-red-400/60 transition-colors duration-200 cursor-pointer flex-shrink-0"
          >
            {card.card_images[0] ? (
              <img
                src={card.card_images[0].image_url_small}
                alt={card.name}
                className="w-full h-full object-cover"
                loading="lazy"
              />
            ) : (
              <div className="w-full h-full bg-surface2 flex items-center justify-center text-[8px] text-muted text-center px-0.5">
                {card.name.slice(0, 8)}
              </div>
            )}
            <div className="absolute inset-0 bg-red-500/0 group-hover:bg-red-500/30 flex items-center justify-center transition-colors duration-200">
              <span className="opacity-0 group-hover:opacity-100 text-white text-base">×</span>
            </div>
          </button>
        ))
      )}
    </div>
  );
}
