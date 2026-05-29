import { useQuery } from '@tanstack/react-query';
import { getCardById } from '../api/cards';

export function useCardDetail(id: string | undefined) {
  return useQuery({
    queryKey: ['card', id],
    queryFn: () => getCardById(Number(id)),
    staleTime: Infinity,
    enabled: !!id && !isNaN(Number(id)),
  });
}
