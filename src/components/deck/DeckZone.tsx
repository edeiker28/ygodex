import { useDroppable } from '@dnd-kit/core';
import DeckMiniGrid from './DeckMiniGrid';
import type { DeckCard, DeckZoneType, YGOCard } from '../../types/ygo';

interface Props {
  zone: DeckZoneType;
  cards: DeckCard[];
  max: number;
  onRemove?: (cardId: number, zone: DeckZoneType) => void;
  onDragToZone?: (card: YGOCard, zone: DeckZoneType) => void;
}

const ZONE_LABELS: Record<DeckZoneType, string> = {
  main: 'Main Deck',
  extra: 'Extra Deck',
  side: 'Side Deck',
};

const ZONE_COLORS: Record<DeckZoneType, string> = {
  main: '#8060ff',
  extra: '#c084fc',
  side: '#60a0ff',
};

export default function DeckZone({ zone, cards, max, onRemove, onDragToZone }: Props) {
  const { setNodeRef, isOver } = useDroppable({ id: `droppable-${zone}` });
  const total = cards.reduce((s, dc) => s + dc.count, 0);
  const percent = Math.min((total / max) * 100, 100);
  const color = ZONE_COLORS[zone];

  // suppress unused warning
  void onDragToZone;

  return (
    <div
      ref={setNodeRef}
      className="rounded-lg border bg-surface overflow-hidden transition-colors duration-150"
      style={{
        borderColor: isOver ? color : 'rgba(128,96,255,0.15)',
        boxShadow: isOver ? `0 0 20px ${color}40` : undefined,
        background: isOver ? `color-mix(in srgb, ${color} 6%, #100820)` : undefined,
      }}
    >
      <div className="px-3 pt-3 pb-2">
        <div className="flex items-center justify-between mb-2">
          <span className="font-display text-sm" style={{ color }}>{ZONE_LABELS[zone]}</span>
          <span className="font-body text-xs text-muted">{total} / {max}</span>
        </div>
        <div className="h-1.5 bg-surface2 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-300"
            style={{ width: `${percent}%`, backgroundColor: color }}
          />
        </div>
      </div>
      <DeckMiniGrid cards={cards} zone={zone} onRemove={onRemove} />

      {/* Drop hint when zone is empty */}
      {cards.length === 0 && (
        <p className="text-[10px] font-body text-muted text-center py-2 select-none">
          Arrastra cartas aquí
        </p>
      )}
    </div>
  );
}
