import { useMemo } from 'react';
import { analyzeDeck } from '../../utils/deckAnalyzer';
import type { Deck } from '../../types/ygo';
import type { DistBar } from '../../utils/deckAnalyzer';

interface Props { deck: Deck }

function BarRow({ item, max }: { item: DistBar; max: number }) {
  const pct = max > 0 ? Math.round((item.count / max) * 100) : 0;
  return (
    <div className="flex items-center gap-2">
      <span className="text-[10px] font-body w-20 shrink-0 truncate" style={{ color: item.color }}>{item.label}</span>
      <div className="flex-1 h-2 bg-surface2 rounded-full overflow-hidden">
        <div className="h-full rounded-full transition-all duration-500" style={{ width: `${pct}%`, backgroundColor: item.color }} />
      </div>
      <span className="text-[10px] font-body text-muted w-5 text-right shrink-0">{item.count}</span>
    </div>
  );
}

function ScoreRing({ score }: { score: number }) {
  const r = 28;
  const circ = 2 * Math.PI * r;
  const offset = circ - (score / 100) * circ;
  const color = score >= 75 ? '#4ade80' : score >= 50 ? '#f59e0b' : '#f472b6';

  return (
    <svg width="72" height="72" className="shrink-0">
      <circle cx="36" cy="36" r={r} fill="none" stroke="#1a0c30" strokeWidth="6" />
      <circle cx="36" cy="36" r={r} fill="none"
        stroke={color} strokeWidth="6"
        strokeDasharray={circ} strokeDashoffset={offset}
        strokeLinecap="round"
        style={{ transform: 'rotate(-90deg)', transformOrigin: '36px 36px', transition: 'stroke-dashoffset 0.6s ease' }}
      />
      <text x="36" y="40" textAnchor="middle" fontSize="15" fontWeight="700" fill={color}>{score}</text>
    </svg>
  );
}

export default function DeckAnalysis({ deck }: Props) {
  const r = useMemo(() => analyzeDeck(deck), [deck]);

  if (r.deckSize === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-muted gap-2">
        <p className="font-body text-sm">Agrega cartas al mazo para ver el análisis</p>
      </div>
    );
  }

  const typeMax = Math.max(...r.typeDistribution.map(d => d.count), 1);
  const attrMax = Math.max(...r.attributeDistribution.map(d => d.count), 1);

  return (
    <div className="space-y-4 text-sm">
      {/* Score + speed */}
      <div className="flex gap-3 items-center p-3 rounded-xl bg-surface border border-primary/15">
        <ScoreRing score={r.score} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-display text-xs" style={{ color: r.speedColor }}>{r.speedLabel}</span>
            <span className="text-[9px] font-body text-muted border rounded px-1.5 py-0.5"
                  style={{ borderColor: r.speedColor + '40', color: r.speedColor }}>
              {r.deckSize} cartas
            </span>
          </div>
          <p className="text-[10px] font-body text-muted leading-relaxed">{r.speedReason}</p>
        </div>
      </div>

      {/* Arquetipos */}
      {r.archetypes.length > 0 && (
        <div>
          <h3 className="font-display text-[11px] text-muted uppercase tracking-widest mb-2">Arquetipos</h3>
          <div className="flex flex-wrap gap-1.5">
            {r.archetypes.map((a, i) => (
              <span key={a.name}
                className="font-body text-[10px] px-2 py-0.5 rounded-full border"
                style={{
                  borderColor: `rgba(128,96,255,${0.5 - i * 0.08})`,
                  color: `rgba(192,160,255,${1 - i * 0.12})`,
                  background: `rgba(128,96,255,${0.12 - i * 0.02})`,
                }}>
                {a.name} ×{a.count}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Distribución tipos */}
      <div>
        <h3 className="font-display text-[11px] text-muted uppercase tracking-widest mb-2">Tipos</h3>
        <div className="space-y-1.5">
          {r.typeDistribution.map(d => <BarRow key={d.label} item={d} max={typeMax} />)}
        </div>
      </div>

      {/* Atributos */}
      {r.attributeDistribution.length > 0 && (
        <div>
          <h3 className="font-display text-[11px] text-muted uppercase tracking-widest mb-2">Atributos</h3>
          <div className="space-y-1.5">
            {r.attributeDistribution.map(d => <BarRow key={d.label} item={d} max={attrMax} />)}
          </div>
        </div>
      )}

      {/* Razas */}
      {r.raceTop.length > 0 && (
        <div>
          <h3 className="font-display text-[11px] text-muted uppercase tracking-widest mb-2">Razas</h3>
          <div className="flex flex-wrap gap-1.5">
            {r.raceTop.map(rc => (
              <span key={rc.name} className="font-body text-[10px] px-2 py-0.5 rounded-full bg-surface2 border border-primary/15 text-text-secondary">
                {rc.name} {rc.count}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Banlist */}
      <div>
        <h3 className="font-display text-[11px] text-muted uppercase tracking-widest mb-2">Banlist TCG</h3>
        <div className="flex gap-3">
          <span className={`text-[10px] font-body px-2 py-0.5 rounded ${r.banlist.banned > 0 ? 'bg-red-500/15 text-red-400 border border-red-500/30' : 'text-muted border border-primary/10'}`}>
            🚫 {r.banlist.banned} Prohibidas
          </span>
          <span className={`text-[10px] font-body px-2 py-0.5 rounded ${r.banlist.limited > 0 ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30' : 'text-muted border border-primary/10'}`}>
            ⚠ {r.banlist.limited} Limitadas
          </span>
          <span className={`text-[10px] font-body px-2 py-0.5 rounded ${r.banlist.semiLimited > 0 ? 'bg-blue-500/15 text-blue-400 border border-blue-500/30' : 'text-muted border border-primary/10'}`}>
            ½ {r.banlist.semiLimited} Semi
          </span>
        </div>
      </div>

      {/* Hand traps */}
      {r.handtraps.length > 0 && (
        <div>
          <h3 className="font-display text-[11px] text-muted uppercase tracking-widest mb-2">Hand Traps detectadas</h3>
          <div className="flex flex-wrap gap-1.5">
            {[...new Set(r.handtraps)].map(ht => (
              <span key={ht} className="font-body text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">✓ {ht}</span>
            ))}
          </div>
        </div>
      )}

      {/* Motor de robo */}
      {r.drawEngine.length > 0 && (
        <div>
          <h3 className="font-display text-[11px] text-muted uppercase tracking-widest mb-2">Motor de robo</h3>
          <div className="flex flex-wrap gap-1.5">
            {[...new Set(r.drawEngine)].map(d => (
              <span key={d} className="font-body text-[10px] px-2 py-0.5 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400">📖 {d}</span>
            ))}
          </div>
        </div>
      )}

      {/* Consistencia */}
      {r.consistency.length > 0 && (
        <div>
          <h3 className="font-display text-[11px] text-muted uppercase tracking-widest mb-1">Consistencia (P en apertura)</h3>
          <p className="text-[9px] font-body text-muted mb-2">Probabilidad de ver al menos 1 copia en la mano inicial de 5 cartas</p>
          <div className="space-y-1">
            {r.consistency.map(c => (
              <div key={c.name} className="flex items-center gap-2">
                <span className="text-[10px] font-body text-text-secondary truncate flex-1">{c.name}</span>
                <span className="text-[9px] font-body text-muted shrink-0">×{c.copies}</span>
                <span className="text-[10px] font-body font-bold shrink-0"
                      style={{ color: c.prob >= 70 ? '#4ade80' : c.prob >= 50 ? '#f59e0b' : '#f472b6' }}>
                  {c.prob}%
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Fortalezas */}
      {r.strengths.length > 0 && (
        <div className="rounded-xl bg-emerald-500/5 border border-emerald-500/20 p-3 space-y-1.5">
          <h3 className="font-display text-[11px] text-emerald-400 uppercase tracking-widest">Fortalezas</h3>
          {r.strengths.map((s, i) => (
            <p key={i} className="text-[10px] font-body text-emerald-300/80 leading-relaxed">✓ {s}</p>
          ))}
        </div>
      )}

      {/* Advertencias */}
      {r.warnings.length > 0 && (
        <div className="rounded-xl bg-amber-500/5 border border-amber-500/20 p-3 space-y-1.5">
          <h3 className="font-display text-[11px] text-amber-400 uppercase tracking-widest">Advertencias</h3>
          {r.warnings.map((w, i) => (
            <p key={i} className="text-[10px] font-body text-amber-300/80 leading-relaxed">⚠ {w}</p>
          ))}
        </div>
      )}
    </div>
  );
}
