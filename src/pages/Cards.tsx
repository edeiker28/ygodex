import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import CardGrid from '../components/cards/CardGrid';
import { useCardSearch } from '../hooks/useCardSearch';
import { useDeckStore } from '../store/deckStore';
import { useDeckBuilder } from '../hooks/useDeckBuilder';
import { BASIC_FILTER_CATEGORIES, ATTRIBUTES, RACES, LEVELS, FORMATS } from '../constants/cardTypes';
import type { CardFilters, YGOCard } from '../types/ygo';

export default function Cards() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { activeDeckId } = useDeckStore();
  const deckBuilder = useDeckBuilder(activeDeckId ?? '');

  const [filters, setFilters] = useState<CardFilters>({
    fname:     searchParams.get('fname')     ?? '',
    type:      searchParams.get('type')      ?? '',
    attribute: searchParams.get('attribute') ?? '',
    race:      searchParams.get('race')      ?? '',
    archetype: searchParams.get('archetype') ?? '',
    level:     searchParams.get('level')     ?? '',
    atkMin:    searchParams.get('atkMin')    ? Number(searchParams.get('atkMin'))  : undefined,
    atkMax:    searchParams.get('atkMax')    ? Number(searchParams.get('atkMax'))  : undefined,
    defMin:    searchParams.get('defMin')    ? Number(searchParams.get('defMin'))  : undefined,
    defMax:    searchParams.get('defMax')    ? Number(searchParams.get('defMax'))  : undefined,
    format:    (searchParams.get('format') as 'tcg' | 'ocg' | 'goat') || undefined,
  });
  const [showAdvanced, setShowAdvanced] = useState(searchParams.get('adv') === '1');
  const [addedId, setAddedId] = useState<number | null>(null);

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } = useCardSearch(filters);
  const cards = data?.pages.flat() ?? [];

  function setFilter(key: keyof CardFilters, value: string | number | undefined) {
    const next = { ...filters, [key]: value };
    setFilters(next);
    syncToUrl(next, showAdvanced);
  }

  function syncToUrl(f: CardFilters, adv: boolean) {
    const p: Record<string, string> = {};
    if (f.fname)     p['fname']     = f.fname;
    if (f.type)      p['type']      = f.type;
    if (f.attribute) p['attribute'] = f.attribute;
    if (f.race)      p['race']      = f.race;
    if (f.archetype) p['archetype'] = f.archetype;
    if (f.level)     p['level']     = f.level;
    if (f.atkMin != null) p['atkMin'] = String(f.atkMin);
    if (f.atkMax != null) p['atkMax'] = String(f.atkMax);
    if (f.defMin != null) p['defMin'] = String(f.defMin);
    if (f.defMax != null) p['defMax'] = String(f.defMax);
    if (f.format)    p['format']    = f.format;
    if (adv)         p['adv']       = '1';
    setSearchParams(p, { replace: true });
  }

  function handleAdd(card: YGOCard) {
    if (!activeDeckId) return;
    const added = deckBuilder.tryAddCard(card);
    if (added) {
      setAddedId(card.id);
      setTimeout(() => setAddedId(null), 1200);
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="font-display text-2xl brand-gradient mb-6">Carta-Dex</h1>

      <div className="mb-4">
        <input
          type="text"
          value={filters.fname ?? ''}
          onChange={(e) => setFilter('fname', e.target.value)}
          placeholder="Buscar por nombre..."
          className="w-full px-4 py-3 rounded-lg bg-surface border border-primary/20 text-text-main font-body text-sm placeholder-muted focus:outline-none focus:border-primary/60 transition-colors duration-200"
        />
      </div>

      <div className="flex flex-wrap gap-2 mb-3">
        <button
          onClick={() => setFilter('type', '')}
          className={`px-3 py-1.5 rounded-lg text-xs font-body transition-colors duration-200 cursor-pointer border ${!filters.type ? 'border-primary bg-primary/20 text-text-main' : 'border-primary/20 text-muted hover:text-text-main'}`}
        >
          Todos
        </button>
        {BASIC_FILTER_CATEGORIES.map(({ label, value }) => (
          <button
            key={value}
            onClick={() => setFilter('type', filters.type === value ? '' : value)}
            className={`px-3 py-1.5 rounded-lg text-xs font-body transition-colors duration-200 cursor-pointer border ${filters.type === value ? 'border-primary bg-primary/20 text-text-main' : 'border-primary/20 text-muted hover:text-text-main'}`}
          >
            {label}
          </button>
        ))}
      </div>

      <button
        onClick={() => { const next = !showAdvanced; setShowAdvanced(next); syncToUrl(filters, next); }}
        className="text-xs font-body text-muted hover:text-primary2 transition-colors duration-200 mb-4 cursor-pointer"
      >
        {showAdvanced ? '▲ Ocultar filtros avanzados' : '▼ + Filtros avanzados'}
      </button>

      {showAdvanced && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6 p-4 rounded-lg bg-surface border border-primary/10">
          <div>
            <label className="text-[10px] font-body text-muted block mb-1">Atributo</label>
            <select value={filters.attribute ?? ''} onChange={(e) => setFilter('attribute', e.target.value)}
              className="w-full bg-surface2 border border-primary/15 rounded px-2 py-1.5 text-xs font-body text-text-main focus:outline-none cursor-pointer">
              <option value="">Todos</option>
              {ATTRIBUTES.map(a => <option key={a} value={a}>{a}</option>)}
            </select>
          </div>
          <div>
            <label className="text-[10px] font-body text-muted block mb-1">Raza</label>
            <select value={filters.race ?? ''} onChange={(e) => setFilter('race', e.target.value)}
              className="w-full bg-surface2 border border-primary/15 rounded px-2 py-1.5 text-xs font-body text-text-main focus:outline-none cursor-pointer">
              <option value="">Todas</option>
              {RACES.map(r => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>
          <div>
            <label className="text-[10px] font-body text-muted block mb-1">Nivel/Rango</label>
            <select value={filters.level ?? ''} onChange={(e) => setFilter('level', e.target.value)}
              className="w-full bg-surface2 border border-primary/15 rounded px-2 py-1.5 text-xs font-body text-text-main focus:outline-none cursor-pointer">
              <option value="">Todos</option>
              {LEVELS.map(l => <option key={l} value={l}>{l}</option>)}
            </select>
          </div>
          <div>
            <label className="text-[10px] font-body text-muted block mb-1">Arquetipo</label>
            <input type="text" value={filters.archetype ?? ''} onChange={(e) => setFilter('archetype', e.target.value)}
              placeholder="ej: Dragon Ruler"
              className="w-full bg-surface2 border border-primary/15 rounded px-2 py-1.5 text-xs font-body text-text-main placeholder-muted focus:outline-none" />
          </div>
          <div>
            <label className="text-[10px] font-body text-muted block mb-1">ATK mín</label>
            <input type="number" value={filters.atkMin ?? ''} onChange={(e) => setFilter('atkMin', e.target.value ? Number(e.target.value) : undefined)}
              placeholder="0"
              className="w-full bg-surface2 border border-primary/15 rounded px-2 py-1.5 text-xs font-body text-text-main placeholder-muted focus:outline-none" />
          </div>
          <div>
            <label className="text-[10px] font-body text-muted block mb-1">ATK máx</label>
            <input type="number" value={filters.atkMax ?? ''} onChange={(e) => setFilter('atkMax', e.target.value ? Number(e.target.value) : undefined)}
              placeholder="5000"
              className="w-full bg-surface2 border border-primary/15 rounded px-2 py-1.5 text-xs font-body text-text-main placeholder-muted focus:outline-none" />
          </div>
          <div>
            <label className="text-[10px] font-body text-muted block mb-1">Formato</label>
            <select value={filters.format ?? ''} onChange={(e) => setFilter('format', e.target.value as 'tcg' | 'ocg' | 'goat' | '' || undefined)}
              className="w-full bg-surface2 border border-primary/15 rounded px-2 py-1.5 text-xs font-body text-text-main focus:outline-none cursor-pointer">
              <option value="">Todos</option>
              {FORMATS.map(f => <option key={f.value} value={f.value}>{f.label}</option>)}
            </select>
          </div>
          <div className="flex items-end">
            <button onClick={() => { const empty: CardFilters = { fname: '' }; setFilters(empty); setSearchParams({}, { replace: true }); }}
              className="w-full px-2 py-1.5 text-xs font-body text-muted border border-primary/15 rounded hover:text-text-main hover:border-primary/30 transition-colors duration-200 cursor-pointer">
              Resetear
            </button>
          </div>
        </div>
      )}

      {addedId && (
        <div className="fixed bottom-6 right-6 bg-primary text-white text-xs font-body px-4 py-2 rounded-full shadow-lg z-50 animate-pulse">
          ✓ Carta agregada al mazo
        </div>
      )}

      <CardGrid cards={cards} loading={isLoading} onAdd={activeDeckId ? handleAdd : undefined} />

      {hasNextPage && (
        <div className="flex justify-center mt-8">
          <button onClick={() => fetchNextPage()} disabled={isFetchingNextPage}
            className="px-8 py-2.5 rounded-lg border border-primary/30 hover:border-primary/60 font-body text-sm text-text-secondary hover:text-text-main transition-colors duration-200 cursor-pointer disabled:opacity-50">
            {isFetchingNextPage ? 'Cargando...' : 'Cargar más'}
          </button>
        </div>
      )}
    </div>
  );
}
