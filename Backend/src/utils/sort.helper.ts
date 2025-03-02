// utils/sort-helper.ts
export function parseSortQuery(
  sortQuery?: string
): { field: string; direction: 'asc' | 'desc' } | undefined {
  if (!sortQuery) return undefined;

  const [field, direction] = sortQuery.split(':');
  return {
    field,
    direction: direction === 'desc' ? 'desc' : 'asc',
  };
}
