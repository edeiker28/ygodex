import CardMini from './CardMini';
import type { YGOCard } from '../../types/ygo';

interface Props {
  cards: YGOCard[];
  onAdd?: (card: YGOCard) => void;
  loading?: boolean;
}

function CardSkeleton() {
  return (
    <div className="rounded-lg overflow-hidden border border-primary/10 bg-surface animate-pulse">
      <div className="aspect-[421/614] bg-surface2" />
      <div className="p-2 space-y-1">
        <div className="h-3 bg-surface2 rounded w-3/4" />
        <div className="h-4 bg-surface2 rounded w-1/2" />
      </div>
    </div>
  );
}

export default function CardGrid({ cards, onAdd, loading = false }: Props) {
  if (loading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
        {Array.from({ length: 20 }).map((_, i) => <CardSkeleton key={i} />)}
      </div>
    );
  }

  if (cards.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-muted gap-3">
        <svg xmlns="http://www.w3.org/2000/svg" className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <p className="font-body text-sm">No se encontraron cartas</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
      {cards.map((card) => (
        <CardMini key={card.id} card={card} onAdd={onAdd} />
      ))}
    </div>
  );
}
