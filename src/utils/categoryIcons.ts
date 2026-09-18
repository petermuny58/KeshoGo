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
  Package,
  type LucideIcon,
} from 'lucide-react';

const ICON_MAP: Record<string, LucideIcon> = {
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
  Package,
};

export function resolveCategoryIcon(name: string | null | undefined): LucideIcon {
  if (!name) return Package;
  return ICON_MAP[name] ?? Package;
}
