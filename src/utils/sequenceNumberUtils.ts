export interface SequenceRecord {
  id: string;
  createdAt?: string | null;
}

const toTimestamp = (value?: string | null): number => {
  if (!value) return 0;
  const ts = new Date(value).getTime();
  return Number.isNaN(ts) ? 0 : ts;
};

export const buildSequenceMap = (records: SequenceRecord[]): Record<string, number> => {
  const sorted = [...records].sort((a, b) => {
    const timeDiff = toTimestamp(a.createdAt) - toTimestamp(b.createdAt);
    if (timeDiff !== 0) return timeDiff;
    return a.id.localeCompare(b.id);
  });

  const sequenceMap: Record<string, number> = {};
  sorted.forEach((record, index) => {
    sequenceMap[record.id] = index + 1;
  });
  return sequenceMap;
};

export const formatSequenceNumber = (
  prefix: 'ORD' | 'RET',
  sequence?: number,
  padLength: number = 6
): string => {
  const safe = Math.max(1, Number(sequence || 1));
  return `${prefix}${String(safe).padStart(padLength, '0')}`;
};

/**
 * Formats an order number in the YYYYMM + 4-digit sequence format.
 * e.g. order 1 placed in June 2026 → "2026060001"
 */
export const formatOrderNumber = (
  createdAt: string | null | undefined,
  sequence: number
): string => {
  const date = createdAt ? new Date(createdAt) : new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const seq = String(Math.max(1, sequence)).padStart(4, '0');
  return `${year}${month}${seq}`;
};




