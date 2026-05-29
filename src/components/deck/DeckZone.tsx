import DeckMiniGrid from './DeckMiniGrid';
import type { DeckCard, DeckZoneType } from '../../types/ygo';

interface Props {
  zone: DeckZoneType;
  cards: DeckCard[];
  max: number;
  onRemove?: (cardId: number, zone: DeckZoneType) => void;
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

export default function DeckZone({ zone, cards, max, onRemove }: Props) {
  const total = cards.reduce((s, dc) => s + dc.count, 0);
  const percent = Math.min((total / max) * 100, 100);
  const color = ZONE_COLORS[zone];

  return (
    <div className="rounded-lg border border-primary/15 bg-surface overflow-hidden">
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
    </div>
  );
}
