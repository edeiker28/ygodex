import { Link } from 'react-router-dom';
import { useDeckStore } from '../../store/deckStore';

export default function ChipDeck() {
  const { decks, activeDeckId } = useDeckStore();
  const activeDeck = decks.find((d) => d.id === activeDeckId);

  if (!activeDeck) return null;

  const mainCount = activeDeck.main.reduce((s, dc) => s + dc.count, 0);

  return (
    <Link
      to={`/decks/${activeDeckId}`}
      className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-primary/30 bg-surface hover:bg-surface2 transition-colors duration-200 cursor-pointer"
    >
      <span className="text-xs font-body text-muted">Mazo</span>
      <span className="font-display text-sm text-primary">
        {mainCount}
        <span className="text-muted">/40</span>
      </span>
    </Link>
  );
}
