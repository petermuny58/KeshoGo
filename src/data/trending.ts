export const TRENDING_SEARCHES = [
  'Ankara dress', 'Samsung phone', 'School shoes', 'Mealie meal', 'Bluetooth speaker', 'Football',
];

export interface EditCollection {
  id: string;
  title: string;
  description: string;
  productIds: string[];
}

export const EDIT_COLLECTIONS: EditCollection[] = [
  {
    id: 'edit-rainy-season',
    title: 'Rainy Season Ready',
    description:
      'The rains catch everyone eventually. A few sturdy pieces mean muddy school runs and last-minute downpours stop being a whole event.',
    productIds: ['prod-16', 'prod-40', 'prod-12'],
  },
  {
    id: 'edit-home-office',
    title: 'Home Office Upgrade',
    description:
      'Small changes compound at a desk. A better keyboard, one more port, a place for the cables — and the workday just runs smoother.',
    productIds: ['prod-32', 'prod-29', 'prod-48', 'prod-31', 'prod-30'],
  },
  {
    id: 'edit-self-care-sunday',
    title: 'Self-Care Sunday',
    description:
      'No plans, no rush — just a slow morning and a shelf of things that make the routine feel like a small occasion.',
    productIds: ['prod-21', 'prod-22', 'prod-24', 'prod-23'],
  },
];
