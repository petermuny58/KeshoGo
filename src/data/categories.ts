import {
  Smartphone,
  Shirt,
  PersonStanding,
  Baby,
  UtensilsCrossed,
  Sparkles,
  Apple,
  Laptop,
  Refrigerator,
  Dumbbell,
  Wrench,
  BookOpen,
  Gamepad2,
  Luggage,
  Gem,
} from 'lucide-react';
import type { Category } from '../types';

export const categories: Category[] = [
  { id: 'cat-electronics', name: 'Electronics & Phones', slug: 'electronics-phones', icon: Smartphone },
  { id: 'cat-fashion-women', name: 'Fashion – Women', slug: 'fashion-women', icon: Shirt },
  { id: 'cat-fashion-men', name: 'Fashion – Men', slug: 'fashion-men', icon: PersonStanding },
  { id: 'cat-fashion-kids', name: 'Fashion – Kids & Baby', slug: 'fashion-kids-baby', icon: Baby },
  { id: 'cat-home-kitchen', name: 'Home & Kitchen', slug: 'home-kitchen', icon: UtensilsCrossed },
  { id: 'cat-health-beauty', name: 'Health & Beauty', slug: 'health-beauty', icon: Sparkles },
  { id: 'cat-groceries', name: 'Groceries & Food', slug: 'groceries-food', icon: Apple },
  { id: 'cat-computing', name: 'Computing & Accessories', slug: 'computing-accessories', icon: Laptop },
  { id: 'cat-appliances', name: 'Appliances', slug: 'appliances', icon: Refrigerator },
  { id: 'cat-sports', name: 'Sports & Outdoors', slug: 'sports-outdoors', icon: Dumbbell },
  { id: 'cat-automotive', name: 'Automotive & Hardware', slug: 'automotive-hardware', icon: Wrench },
  { id: 'cat-books', name: 'Books, Media & Stationery', slug: 'books-media-stationery', icon: BookOpen },
  { id: 'cat-toys', name: 'Toys & Games', slug: 'toys-games', icon: Gamepad2 },
  { id: 'cat-bags', name: 'Bags & Luggage', slug: 'bags-luggage', icon: Luggage },
  { id: 'cat-jewelry', name: 'Jewelry & Watches', slug: 'jewelry-watches', icon: Gem },
];

export function getCategoryBySlug(slug: string): Category | undefined {
  return categories.find((c) => c.slug === slug);
}
