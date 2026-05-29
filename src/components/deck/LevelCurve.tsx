import type { DeckCard } from '../../types/ygo';

interface Props {
  mainDeck: DeckCard[];
}

export default function LevelCurve({ mainDeck }: Props) {
  const counts: Record<number, number> = {};
  mainDeck.forEach(({ card, count }) => {
    const lv = card.level ?? card.rank;
    if (lv) counts[lv] = (counts[lv] ?? 0) + count;
  });

  const levels = Object.keys(counts).map(Number).sort((a, b) => a - b);
  if (levels.length === 0) return null;
  const maxCount = Math.max(...Object.values(counts));

  return (
    <div>
      <p className="text-xs font-body text-muted mb-2">Curva de Niveles</p>
      <div className="flex items-end gap-1 h-16">
        {levels.map((lv) => {
          const h = Math.round(((counts[lv] ?? 0) / maxCount) * 100);
          return (
            <div key={lv} className="flex flex-col items-center gap-0.5 flex-1">
              <span className="text-[9px] font-body text-muted">{counts[lv]}</span>
              <div
                className="w-full rounded-t-sm bg-primary transition-all duration-300"
                style={{ height: `${h}%` }}
              />
              <span className="text-[9px] font-body text-muted">{lv}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
