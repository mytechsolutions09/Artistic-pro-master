import type { Product } from '../types';
import { generateCategorySlug } from './slugUtils';

/**
 * True if the product is tagged with the given category label (exact, case-insensitive, or slug match).
 * Supports `categories[]` and legacy `category` string.
 */
export function productBelongsToCategoryLabel(product: Product, categoryLabel: string): boolean {
  const target = categoryLabel.trim();
  if (!target) return true;

  const targetSlug = generateCategorySlug(target);

  const matches = (raw: string | undefined | null) => {
    if (raw == null || raw === '') return false;
    const s = String(raw).trim();
    if (s === target) return true;
    if (s.toLowerCase() === target.toLowerCase()) return true;
    return generateCategorySlug(s) === targetSlug;
  };

  if (product.categories && Array.isArray(product.categories) && product.categories.length > 0) {
    return product.categories.some((c) => matches(c));
  }

  const single = (product as { category?: string }).category;
  return matches(single);
}
