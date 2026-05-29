import { useState } from 'react';
import LevelCurve from './LevelCurve';
import { calcTotalDeckPrice } from '../../utils/priceCalc';
import type { DeckCard } from '../../types/ygo';

interface Props {
  main: DeckCard[];
  extra: DeckCard[];
  side: DeckCard[];
}

export default function DeckStats({ main, extra, side }: Props) {
  const [open, setOpen] = useState(false);
  const totalPrice = calcTotalDeckPrice(main, extra, side);
  const mainTotal = main.reduce((s, dc) => s + dc.count, 0);
  const monsters = main.filter(dc => dc.card.type.includes('Monster')).reduce((s, dc) => s + dc.count, 0);
  const spells = main.filter(dc => dc.card.type === 'Spell Card').reduce((s, dc) => s + dc.count, 0);
  const traps = main.filter(dc => dc.card.type === 'Trap Card').reduce((s, dc) => s + dc.count, 0);

  return (
    <div className="rounded-lg border border-primary/15 bg-surface overflow-hidden">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-4 py-3 text-left cursor-pointer hover:bg-surface2 transition-colors duration-200"
      >
        <span className="font-display text-sm text-primary2">Análisis</span>
        <span className="text-muted text-xs">{open ? '▲' : '▼'}</span>
      </button>

      {open && (
        <div className="px-4 pb-4 space-y-4">
          {mainTotal > 0 && (
            <div>
              <p className="text-xs font-body text-muted mb-2">Distribución</p>
              <div className="h-3 rounded-full overflow-hidden flex">
                <div className="bg-orange-500 transition-all" style={{ width: `${(monsters / mainTotal) * 100}%` }} title={`Monstruos: ${monsters}`} />
                <div className="bg-green-500 transition-all" style={{ width: `${(spells / mainTotal) * 100}%` }} title={`Magias: ${spells}`} />
                <div className="bg-pink-500 transition-all" style={{ width: `${(traps / mainTotal) * 100}%` }} title={`Trampas: ${traps}`} />
              </div>
              <div className="flex gap-4 mt-1.5">
                <span className="text-[10px] font-body text-orange-400">Monstruos {monsters}</span>
                <span className="text-[10px] font-body text-green-400">Magias {spells}</span>
                <span className="text-[10px] font-body text-pink-400">Trampas {traps}</span>
              </div>
            </div>
          )}
          <LevelCurve mainDeck={main} />
          <div>
            <p className="text-xs font-body text-muted mb-1">Precio Total</p>
            <p className="font-display text-lg text-primary">${totalPrice.toFixed(2)} <span className="text-xs text-muted">USD</span></p>
          </div>
        </div>
      )}
    </div>
  );
}
