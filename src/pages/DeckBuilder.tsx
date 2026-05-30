import { useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from '@dnd-kit/core';
import { useDraggable } from '@dnd-kit/core';
import { useDeckStore } from '../store/deckStore';
import { useDeckBuilder } from '../hooks/useDeckBuilder';
import { useCardSearch } from '../hooks/useCardSearch';
import { exportToYdk, getYdkFilename } from '../utils/ydkExporter';
import { validateDeck } from '../utils/deckValidator';
import { parseYdk } from '../utils/ydkImporter';
import { printDeckPdf } from '../utils/deckPdf';
import { getCardsByIds } from '../api/cards';
import DeckZone from '../components/deck/DeckZone';
import DeckStats from '../components/deck/DeckStats';
import DeckAnalysis from '../components/deck/DeckAnalysis';
import { MAX_MAIN, MAX_EXTRA, MAX_SIDE } from '../constants/deckRules';
import { getTypeColor } from '../constants/typeColors';
import type { CardFilters, DeckZoneType, YGOCard } from '../types/ygo';

// Draggable wrapper for cards in the search panel
function DraggableCard({ card, onAdd }: { card: YGOCard; onAdd: (c: YGOCard) => void }) {
  const typeColor = getTypeColor(card.type);
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `search-${card.id}`,
    data: { type: 'search', card },
  });

  return (
    <div
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      style={{ opacity: isDragging ? 0.3 : 1 }}
    >
      {/* Mini card thumbnail used as drag handle in search panel */}
      <div
        className="group relative rounded-xl overflow-hidden cursor-grab active:cursor-grabbing transition-all duration-200 hover:-translate-y-0.5"
        style={{ border: `1.5px solid ${typeColor}55`, boxShadow: `0 3px 18px ${typeColor}18` }}
      >
        <div className="aspect-[421/614] relative">
          {card.card_images[0] ? (
            <img
              src={card.card_images[0].image_url_small}
              alt={card.name}
              className="w-full h-full object-cover"
              loading="lazy"
              draggable={false}
            />
          ) : (
            <div className="w-full h-full bg-surface2 flex items-center justify-center text-muted text-xs">Sin imagen</div>
          )}
          {/* Add button */}
          <button
            onPointerUp={(e) => { e.stopPropagation(); onAdd(card); }}
            aria-label={`Añadir ${card.name}`}
            className="absolute top-1.5 left-1.5 w-6 h-6 rounded-full text-sm font-bold flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-md cursor-pointer"
            style={{ background: typeColor, color: '#08040f' }}
          >
            +
          </button>
          {/* Hover name overlay */}
          <div
            className="absolute inset-x-0 bottom-0 px-2 py-2 translate-y-full group-hover:translate-y-0 transition-transform duration-200"
            style={{ background: `linear-gradient(to top, ${typeColor}e0, ${typeColor}40 60%, transparent)` }}
          >
            <p className="text-[10px] font-body text-white font-semibold leading-tight line-clamp-2 drop-shadow">{card.name}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

// Small ghost card shown while dragging
function DragGhost({ card }: { card: YGOCard }) {
  const typeColor = getTypeColor(card.type);
  return (
    <div
      className="w-16 rounded-lg overflow-hidden shadow-2xl rotate-3 pointer-events-none"
      style={{ border: `2px solid ${typeColor}`, boxShadow: `0 8px 32px ${typeColor}60` }}
    >
      <div className="aspect-[421/614]">
        {card.card_images[0] && (
          <img src={card.card_images[0].image_url_small} alt={card.name} className="w-full h-full object-cover" draggable={false} />
        )}
      </div>
    </div>
  );
}

export default function DeckBuilder() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { renameDeck, addCard, removeCard } = useDeckStore();
  const { deck, tryAddCard, tryRemoveCard } = useDeckBuilder(id ?? '');

  const [filters, setFilters] = useState<CardFilters>({ fname: '' });
  const [activeTab, setActiveTab] = useState<'search' | 'deck'>('search');
  const [rightTab, setRightTab] = useState<'mazo' | 'analisis'>('mazo');
  const [editingName, setEditingName] = useState(false);
  const [nameInput, setNameInput] = useState('');
  const [importing, setImporting] = useState(false);
  const [importError, setImportError] = useState('');
  const [dragCard, setDragCard] = useState<YGOCard | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } = useCardSearch(filters);
  const cards = data?.pages.flat() ?? [];

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
  );

  if (!deck) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 text-muted">
        <p className="font-body text-sm">Mazo no encontrado</p>
        <button onClick={() => navigate('/decks')} className="text-xs text-primary hover:underline cursor-pointer">← Ver mazos</button>
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

  function handlePdf() {
    if (!deck) return;
    printDeckPdf(deck);
  }

  async function handleImport(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setImporting(true);
    setImportError('');
    try {
      const text = await file.text();
      const parsed = parseYdk(text);
      const allIds = [...parsed.main, ...parsed.extra, ...parsed.side];
      if (allIds.length === 0) { setImportError('El archivo .ydk está vacío o no tiene el formato correcto.'); return; }
      const fetched = await getCardsByIds(allIds);
      const byId = new Map(fetched.map(c => [c.id, c]));

      const addSection = (ids: number[], zone: DeckZoneType) => {
        const counts = new Map<number, number>();
        for (const id of ids) counts.set(id, (counts.get(id) ?? 0) + 1);
        counts.forEach((count, cardId) => {
          const card = byId.get(cardId);
          if (!card || !id) return;
          for (let i = 0; i < count; i++) addCard(id, zone, card);
        });
      };

      addSection(parsed.main, 'main');
      addSection(parsed.extra, 'extra');
      addSection(parsed.side, 'side');
    } catch {
      setImportError('Error al leer el archivo. Asegúrate de que es un .ydk válido.');
    } finally {
      setImporting(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  }

  function handleRename() {
    if (nameInput.trim() && id) {
      renameDeck(id, nameInput.trim());
      setEditingName(false);
    }
  }

  function handleDragStart(event: DragStartEvent) {
    const data = event.active.data.current as { card: YGOCard } | undefined;
    if (data?.card) setDragCard(data.card);
  }

  function handleDragEnd(event: DragEndEvent) {
    setDragCard(null);
    const { active, over } = event;
    if (!over || !id) return;

    const item = active.data.current as
      | { type: 'search'; card: YGOCard }
      | { type: 'zone'; card: YGOCard; sourceZone: DeckZoneType };
    const targetZone = over.id.toString().replace('droppable-', '') as DeckZoneType;

    if (item.type === 'search') {
      tryAddCard(item.card, targetZone);
    } else if (item.type === 'zone') {
      if (item.sourceZone !== targetZone) {
        removeCard(id, item.sourceZone, item.card.id);
        addCard(id, targetZone, item.card);
      }
    }
  }

  return (
    <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Header */}
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
          <div className="flex items-center gap-2 flex-wrap">
            {!validation.valid && <span className="text-xs font-body text-red-400">{validation.errors[0]}</span>}
            {importError && <span className="text-xs font-body text-red-400">{importError}</span>}

            {/* Import .ydk */}
            <input
              ref={fileInputRef}
              type="file"
              accept=".ydk"
              onChange={handleImport}
              className="hidden"
              id="ydk-import"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={importing}
              className="px-4 py-2 text-xs font-body rounded border border-primary/20 hover:border-primary/50 text-muted hover:text-text-main transition-colors duration-200 cursor-pointer disabled:opacity-50"
            >
              {importing ? 'Importando...' : 'Importar .ydk'}
            </button>
            <button onClick={handleExport}
              className="px-4 py-2 text-xs font-body rounded border border-primary/30 hover:border-primary text-text-secondary hover:text-text-main transition-colors duration-200 cursor-pointer">
              ↓ .ydk
            </button>
            <button onClick={handlePdf}
              className="px-4 py-2 text-xs font-body rounded border border-primary2/30 hover:border-primary2 text-text-secondary hover:text-text-main transition-colors duration-200 cursor-pointer">
              ↓ PDF
            </button>
          </div>
        </div>

        {/* Mobile tabs */}
        <div className="flex md:hidden mb-4 rounded-lg overflow-hidden border border-primary/20">
          {(['search', 'deck'] as const).map((tab) => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className={`flex-1 py-2 text-xs font-body transition-colors cursor-pointer ${activeTab === tab ? 'bg-primary/20 text-primary' : 'text-muted hover:text-text-main'}`}>
              {tab === 'search' ? 'Buscar cartas' : `Mi Mazo (${mainCount}/40)`}
            </button>
          ))}
        </div>

        <div className="grid md:grid-cols-[1.4fr_1fr] gap-6">
          {/* Search panel */}
          <div className={activeTab !== 'search' ? 'hidden md:block' : ''}>
            <input
              type="text"
              value={filters.fname ?? ''}
              onChange={(e) => setFilters(prev => ({ ...prev, fname: e.target.value }))}
              placeholder="Buscar carta para agregar... (arrastra al mazo)"
              className="w-full px-4 py-2.5 mb-4 rounded-lg bg-surface border border-primary/20 text-text-main font-body text-sm placeholder-muted focus:outline-none focus:border-primary/60 transition-colors duration-200"
            />

            {isLoading ? (
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-3 lg:grid-cols-4 gap-2">
                {Array.from({ length: 12 }).map((_, i) => (
                  <div key={i} className="rounded-xl overflow-hidden border border-primary/10 bg-surface animate-pulse aspect-[421/614]" />
                ))}
              </div>
            ) : cards.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-muted gap-2">
                <p className="font-body text-sm">No se encontraron cartas</p>
              </div>
            ) : (
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-3 lg:grid-cols-4 gap-2">
                {cards.map((card) => (
                  <DraggableCard key={card.id} card={card} onAdd={handleAdd} />
                ))}
              </div>
            )}

            {hasNextPage && (
              <button onClick={() => fetchNextPage()} disabled={isFetchingNextPage}
                className="w-full mt-4 py-2 text-xs font-body text-muted border border-primary/15 rounded hover:text-text-main hover:border-primary/30 transition-colors cursor-pointer disabled:opacity-50">
                {isFetchingNextPage ? 'Cargando...' : 'Cargar más'}
              </button>
            )}
          </div>

          {/* Right panel: Mazo / Análisis tabs */}
          <div className={activeTab !== 'deck' ? 'hidden md:block' : ''}>
            {/* Tab switcher */}
            <div className="flex rounded-lg overflow-hidden border border-primary/20 mb-4">
              {(['mazo', 'analisis'] as const).map(t => (
                <button key={t} onClick={() => setRightTab(t)}
                  className={`flex-1 py-1.5 text-xs font-body transition-colors cursor-pointer capitalize ${rightTab === t ? 'bg-primary/20 text-primary' : 'text-muted hover:text-text-main'}`}>
                  {t === 'mazo' ? 'Mazo' : '📊 Análisis'}
                </button>
              ))}
            </div>

            {rightTab === 'mazo' ? (
              <div className="space-y-4">
                <DeckZone zone="main" cards={deck.main} max={MAX_MAIN} onRemove={tryRemoveCard} />
                <DeckZone zone="extra" cards={deck.extra} max={MAX_EXTRA} onRemove={tryRemoveCard} />
                <DeckZone zone="side" cards={deck.side} max={MAX_SIDE} onRemove={tryRemoveCard} />
                <DeckStats main={deck.main} extra={deck.extra} side={deck.side} />
              </div>
            ) : (
              <DeckAnalysis deck={deck} />
            )}
          </div>
        </div>
      </div>

      {/* Drag overlay — ghost card shown while dragging */}
      <DragOverlay dropAnimation={null}>
        {dragCard && <DragGhost card={dragCard} />}
      </DragOverlay>
    </DndContext>
  );
}
