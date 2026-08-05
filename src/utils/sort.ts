import type { Product, SortOption } from '../types';

export function sortProducts(products: Product[], sortBy: SortOption): Product[] {
  const list = [...products];
  switch (sortBy) {
    case 'price-asc':
      return list.sort((a, b) => a.price - b.price);
    case 'price-desc':
      return list.sort((a, b) => b.price - a.price);
    case 'rating':
      return list.sort((a, b) => b.rating - a.rating);
    case 'newest':
      return list.sort((a, b) => (a.badge === 'new' ? -1 : 0) - (b.badge === 'new' ? -1 : 0));
    default:
      return list;
  }
}
