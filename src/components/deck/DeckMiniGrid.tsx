import { useDraggable } from '@dnd-kit/core';
import type { DeckCard, DeckZoneType } from '../../types/ygo';

interface CardThumbProps {
  deckCard: DeckCard;
  zone: DeckZoneType;
  index: number;
  onRemove?: (cardId: number, zone: DeckZoneType) => void;
}

function DraggableCardThumb({ deckCard, zone, index, onRemove }: CardThumbProps) {
  const { card } = deckCard;
  const dragId = `zone-${zone}-${card.id}-${index}`;
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: dragId,
    data: { type: 'zone', card, sourceZone: zone },
  });

  return (
    <div
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      className="relative group w-10 h-14 rounded overflow-hidden flex-shrink-0"
      style={{ opacity: isDragging ? 0.3 : 1, cursor: isDragging ? 'grabbing' : 'grab' }}
    >
      {card.card_images[0] ? (
        <img
          src={card.card_images[0].image_url_small}
          alt={card.name}
          className="w-full h-full object-cover pointer-events-none"
          loading="lazy"
          draggable={false}
        />
      ) : (
        <div className="w-full h-full bg-surface2 flex items-center justify-center text-[8px] text-muted text-center px-0.5 pointer-events-none">
          {card.name.slice(0, 8)}
        </div>
      )}
      {/* Remove on click (not on drag start) */}
      <button
        onPointerUp={(e) => {
          e.stopPropagation();
          if (!isDragging) onRemove?.(card.id, zone);
        }}
        title={`Eliminar ${card.name}`}
        aria-label={`Eliminar ${card.name} del mazo`}
        className="absolute inset-0 bg-red-500/0 hover:bg-red-500/40 flex items-center justify-center transition-colors duration-150 cursor-pointer"
      >
        <span className="opacity-0 group-hover:opacity-100 text-white text-base font-bold select-none">×</span>
      </button>
    </div>
  );
}

interface Props {
  cards: DeckCard[];
  zone: DeckZoneType;
  onRemove?: (cardId: number, zone: DeckZoneType) => void;
}

export default function DeckMiniGrid({ cards, zone, onRemove }: Props) {
  if (cards.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-1.5 p-2">
      {cards.map(({ card, count }) =>
        Array.from({ length: count }).map((_, i) => (
          <DraggableCardThumb
            key={`${card.id}-${i}`}
            deckCard={{ card, count }}
            zone={zone}
            index={i}
            onRemove={onRemove}
          />
        ))
      )}
    </div>
  );
}
