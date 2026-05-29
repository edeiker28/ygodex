import { useInfiniteQuery } from '@tanstack/react-query';
import { getCards } from '../api/cards';
import type { CardFilters } from '../types/ygo';

const PAGE_SIZE = 20;

export function useCardSearch(filters: CardFilters) {
  return useInfiniteQuery({
    queryKey: ['cards', filters],
    queryFn: ({ pageParam = 0 }) =>
      getCards({ ...filters, num: PAGE_SIZE, offset: pageParam as number }),
    getNextPageParam: (lastPage, allPages) =>
      lastPage.length === PAGE_SIZE ? allPages.length * PAGE_SIZE : undefined,
    initialPageParam: 0,
    staleTime: Infinity,
  });
}
