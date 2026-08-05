import type { Promotion } from '../types';

export const promotions: Promotion[] = [
  {
    id: 'promo-flash-friday',
    eyebrow: 'This week only',
    title: 'Flash Deals Friday',
    subtitle: 'Up to 40% off electronics and appliances, while stock lasts.',
    ctaLabel: 'Shop the deals',
    ctaHref: '/category/electronics-phones',
  },
  {
    id: 'promo-fashion-drop',
    eyebrow: 'New season',
    title: 'Fresh Ankara & Chitenge',
    subtitle: 'New prints from Mwenya' + "'" + 's Boutique and more, just landed.',
    ctaLabel: 'Explore fashion',
    ctaHref: '/category/fashion-women',
  },
  {
    id: 'promo-momo-cashback',
    eyebrow: 'Pay your way',
    title: 'MoMo Cashback Week',
    subtitle: 'Pay with Airtel Money or MTN MoMo at checkout for cashback.',
    ctaLabel: 'See how it works',
    ctaHref: '/checkout',
  },
  {
    id: 'promo-back-to-school',
    eyebrow: 'Term starts soon',
    title: 'Back to School Essentials',
    subtitle: 'Uniforms, stationery and bags, sorted in one trip.',
    ctaLabel: 'Shop the list',
    ctaHref: '/category/books-media-stationery',
  },
  {
    id: 'promo-open-store',
    eyebrow: 'Start selling',
    title: 'Open Your Own Store',
    subtitle: 'List your products and reach shoppers across Zambia, free to start.',
    ctaLabel: 'Open your store',
    ctaHref: '/create-store',
  },
];
