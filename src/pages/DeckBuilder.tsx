import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDeckStore } from '../store/deckStore';
import { useDeckBuilder } from '../hooks/useDeckBuilder';
import { useCardSearch } from '../hooks/useCardSearch';
import { exportToYdk, getYdkFilename } from '../utils/ydkExporter';
import { validateDeck } from '../utils/deckValidator';
import CardGrid from '../components/cards/CardGrid';
import DeckZone from '../components/deck/DeckZone';
import DeckStats from '../components/deck/DeckStats';
import { MAX_MAIN, MAX_EXTRA, MAX_SIDE } from '../constants/deckRules';
import type { CardFilters, YGOCard } from '../types/ygo';

export default function DeckBuilder() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { decks, renameDeck } = useDeckStore();
  const { deck, tryAddCard, tryRemoveCard } = useDeckBuilder(id ?? '');

  const [filters, setFilters] = useState<CardFilters>({ fname: '' });
  const [activeTab, setActiveTab] = useState<'search' | 'deck'>('search');
  const [editingName, setEditingName] = useState(false);
  const [nameInput, setNameInput] = useState('');

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } = useCardSearch(filters);
  const cards = data?.pages.flat() ?? [];

  // suppress unused variable warning
  void decks;

  if (!deck) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 text-muted">
        <p className="font-body text-sm">Mazo no encontrado</p>
        <button onClick={() => navigate('/decks')} className="text-xs text-primary hover:underline cursor-pointer">
          ← Ver mazos
        </button>
      </div>
    );
  }

  const validation = validateDeck(deck.main, deck.extra, deck.side);
  const mainCount = deck.main.reduce((s, dc) => s + dc.count, 0);

  function handleAdd(card: YGOCard) { tryAddCard(card); }

  function handleExport() {
    if (!deck) return;
    const ydk = exportToYdk(deck);
    const blob = new Blob([ydk], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = getYdkFilename(deck.name);
    a.click();
    URL.revokeObjectURL(url);
  }

  function handleRename() {
    if (nameInput.trim() && id) {
      renameDeck(id, nameInput.trim());
      setEditingName(false);
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/decks')} className="text-muted hover:text-primary text-sm font-body cursor-pointer transition-colors">← Mazos</button>
          {editingName ? (
            <form onSubmit={(e) => { e.preventDefault(); handleRename(); }} className="flex gap-2">
              <input autoFocus value={nameInput} onChange={(e) => setNameInput(e.target.value)}
                className="font-display text-lg bg-surface border border-primary/30 rounded px-2 py-0.5 text-text-main focus:outline-none" />
              <button type="submit" className="text-xs text-primary cursor-pointer">✓</button>
              <button type="button" onClick={() => setEditingName(false)} className="text-xs text-muted cursor-pointer">✕</button>
            </form>
          ) : (
            <button onClick={() => { setNameInput(deck.name); setEditingName(true); }}
              className="font-display text-lg text-text-main hover:text-primary transition-colors cursor-pointer">
              {deck.name} ✎
            </button>
          )}
        </div>
        <div className="flex items-center gap-3">
          {!validation.valid && <span className="text-xs font-body text-red-400">{validation.errors[0]}</span>}
          <button onClick={handleExport}
            className="px-4 py-2 text-xs font-body rounded border border-primary/30 hover:border-primary text-text-secondary hover:text-text-main transition-colors duration-200 cursor-pointer">
            Exportar .ydk
          </button>
        </div>
      </div>

      <div className="flex md:hidden mb-4 rounded-lg overflow-hidden border border-primary/20">
        {(['search', 'deck'] as const).map((tab) => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            className={`flex-1 py-2 text-xs font-body transition-colors cursor-pointer ${activeTab === tab ? 'bg-primary/20 text-primary' : 'text-muted hover:text-text-main'}`}>
            {tab === 'search' ? 'Buscar cartas' : `Mi Mazo (${mainCount}/40)`}
          </button>
        ))}
      </div>

      <div className="grid md:grid-cols-[1.4fr_1fr] gap-6">
        <div className={`${activeTab !== 'search' ? 'hidden md:block' : ''}`}>
          <input type="text" value={filters.fname ?? ''} onChange={(e) => setFilters(prev => ({ ...prev, fname: e.target.value }))}
            placeholder="Buscar carta para agregar..."
            className="w-full px-4 py-2.5 mb-4 rounded-lg bg-surface border border-primary/20 text-text-main font-body text-sm placeholder-muted focus:outline-none focus:border-primary/60 transition-colors duration-200" />
          <CardGrid cards={cards} loading={isLoading} onAdd={handleAdd} />
          {hasNextPage && (
            <button onClick={() => fetchNextPage()} disabled={isFetchingNextPage}
              className="w-full mt-4 py-2 text-xs font-body text-muted border border-primary/15 rounded hover:text-text-main hover:border-primary/30 transition-colors cursor-pointer disabled:opacity-50">
              {isFetchingNextPage ? 'Cargando...' : 'Cargar más'}
            </button>
          )}
        </div>

        <div className={`space-y-4 ${activeTab !== 'deck' ? 'hidden md:block' : ''}`}>
          <DeckZone zone="main" cards={deck.main} max={MAX_MAIN} onRemove={tryRemoveCard} />
          <DeckZone zone="extra" cards={deck.extra} max={MAX_EXTRA} onRemove={tryRemoveCard} />
          <DeckZone zone="side" cards={deck.side} max={MAX_SIDE} onRemove={tryRemoveCard} />
          <DeckStats main={deck.main} extra={deck.extra} side={deck.side} />
        </div>
      </div>
    </div>
  );
}
