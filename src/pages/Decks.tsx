import { useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useDeckStore } from '../store/deckStore';
import { parseYdk } from '../utils/ydkImporter';
import { getCardsByIds } from '../api/cards';
import type { DeckZoneType } from '../types/ygo';

export default function Decks() {
  const { decks, createDeck, deleteDeck, setActiveDeck, activeDeckId, addCard } = useDeckStore();
  const [newName, setNewName] = useState('');
  const [importing, setImporting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    const name = newName.trim() || `Mazo ${decks.length + 1}`;
    createDeck(name);
    setNewName('');
    setTimeout(() => {
      const { decks: updated } = useDeckStore.getState();
      if (updated.length > 0) {
        navigate(`/decks/${updated[updated.length - 1].id}`);
      }
    }, 50);
  }

  async function handleImportFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setImporting(true);
    try {
      const text = await file.text();
      const parsed = parseYdk(text);
      const allIds = [...parsed.main, ...parsed.extra, ...parsed.side];
      if (allIds.length === 0) return;

      const deckName = file.name.replace(/\.ydk$/i, '') || `Mazo importado`;
      createDeck(deckName);

      await new Promise(r => setTimeout(r, 60));
      const { decks: updated } = useDeckStore.getState();
      const newDeck = updated[updated.length - 1];
      if (!newDeck) return;

      const fetched = await getCardsByIds(allIds);
      const byId = new Map(fetched.map(c => [c.id, c]));

      const addSection = (ids: number[], zone: DeckZoneType) => {
        const counts = new Map<number, number>();
        for (const id of ids) counts.set(id, (counts.get(id) ?? 0) + 1);
        counts.forEach((count, cardId) => {
          const card = byId.get(cardId);
          if (!card) return;
          for (let i = 0; i < count; i++) addCard(newDeck.id, zone, card);
        });
      };

      addSection(parsed.main, 'main');
      addSection(parsed.extra, 'extra');
      addSection(parsed.side, 'side');

      navigate(`/decks/${newDeck.id}`);
    } finally {
      setImporting(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="font-display text-2xl brand-gradient">Mis Mazos</h1>
      </div>

      <div className="flex gap-3 mb-8 flex-wrap">
        <form onSubmit={handleCreate} className="flex gap-3 flex-1 min-w-0">
          <input
            type="text"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="Nombre del nuevo mazo..."
            className="flex-1 px-4 py-2.5 rounded-lg bg-surface border border-primary/20 text-text-main font-body text-sm placeholder-muted focus:outline-none focus:border-primary/60 transition-colors duration-200 min-w-0"
          />
          <button type="submit"
            className="px-6 py-2.5 rounded-lg bg-primary hover:bg-primary2 text-white font-display text-sm tracking-wider transition-colors duration-200 cursor-pointer whitespace-nowrap">
            Crear
          </button>
        </form>
        <input ref={fileInputRef} type="file" accept=".ydk" onChange={handleImportFile} className="hidden" />
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={importing}
          className="px-5 py-2.5 rounded-lg border border-primary/30 hover:border-primary text-text-secondary hover:text-text-main font-body text-sm transition-colors duration-200 cursor-pointer disabled:opacity-50 whitespace-nowrap"
        >
          {importing ? 'Importando...' : '↑ Importar .ydk'}
        </button>
      </div>

      {decks.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4 text-muted">
          <svg xmlns="http://www.w3.org/2000/svg" className="w-16 h-16 opacity-30" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
          <p className="font-body text-sm">No tienes mazos. ¡Crea uno arriba!</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
          {decks.map((deck, i) => {
            const mainCount = deck.main.reduce((s, dc) => s + dc.count, 0);
            const isActive = deck.id === activeDeckId;
            return (
              <motion.div key={deck.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className={`rounded-lg border bg-surface p-4 flex flex-col gap-3 transition-colors duration-200 ${isActive ? 'border-primary/60' : 'border-primary/15 hover:border-primary/30'}`}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-display text-base text-text-main">{deck.name}</h3>
                    <p className="font-body text-xs text-muted mt-0.5">
                      {mainCount} cartas · {new Date(deck.updatedAt).toLocaleDateString('es')}
                    </p>
                  </div>
                  {isActive && <span className="text-[10px] font-body text-primary border border-primary/30 px-1.5 py-0.5 rounded">Activo</span>}
                </div>

                {deck.main.length > 0 && (
                  <div className="flex gap-1 overflow-hidden h-10">
                    {deck.main.slice(0, 8).map(({ card }) => (
                      <img key={card.id} src={card.card_images[0]?.image_url_small} alt={card.name}
                        className="h-full w-auto rounded object-cover" />
                    ))}
                  </div>
                )}

                <div className="flex gap-2 mt-auto">
                  <Link to={`/decks/${deck.id}`}
                    className="flex-1 text-center py-1.5 text-xs font-body rounded border border-primary/30 hover:border-primary text-text-secondary hover:text-text-main transition-colors duration-200">
                    Editar
                  </Link>
                  <button onClick={() => setActiveDeck(isActive ? null : deck.id)}
                    className={`flex-1 py-1.5 text-xs font-body rounded transition-colors duration-200 cursor-pointer ${isActive ? 'bg-primary/20 text-primary border border-primary/30' : 'border border-primary/15 text-muted hover:text-text-main hover:border-primary/30'}`}>
                    {isActive ? 'Activo' : 'Activar'}
                  </button>
                  <button
                    onClick={() => { if (confirm(`¿Eliminar "${deck.name}"?`)) deleteDeck(deck.id); }}
                    className="px-2 py-1.5 text-xs font-body rounded border border-red-500/20 text-red-400 hover:border-red-500/50 transition-colors duration-200 cursor-pointer"
                    aria-label="Eliminar mazo">×</button>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
