import { useParams, useNavigate } from 'react-router-dom';
import { useCardDetail } from '../hooks/useCardDetail';
import CardDetailComponent from '../components/cards/CardDetail';

export default function CardDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: card, isLoading, isError } = useCardDetail(id);

  if (isLoading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-8 grid md:grid-cols-[300px_1fr] gap-8 animate-pulse">
        <div className="aspect-[421/614] rounded-lg bg-surface max-w-xs" />
        <div className="space-y-4">
          <div className="h-8 bg-surface rounded w-2/3" />
          <div className="h-4 bg-surface rounded w-1/3" />
          <div className="h-32 bg-surface rounded" />
        </div>
      </div>
    );
  }

  if (isError || !card) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 text-muted">
        <p className="font-body text-sm">Carta no encontrada</p>
        <button onClick={() => navigate(-1)} className="text-xs font-body text-primary hover:underline cursor-pointer">
          ← Volver
        </button>
      </div>
    );
  }

  return (
    <>
      <div className="max-w-5xl mx-auto px-4 pt-4">
        <button onClick={() => navigate(-1)} className="text-xs font-body text-muted hover:text-primary transition-colors duration-200 cursor-pointer">
          ← Volver
        </button>
      </div>
      <CardDetailComponent card={card} />
    </>
  );
}
