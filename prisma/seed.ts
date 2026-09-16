import { PrismaClient } from './../src/generated/prisma/index.js';
import { PrismaPg } from '@prisma/adapter-pg';

// Seeding runs as a one-off script via `prisma db seed`, against DIRECT_URL
// (set in prisma.config.ts) — a plain pg adapter is fine here, no need for
// the Neon-specific WebSocket driver that the running app uses in src/db.ts.
const adapter = new PrismaPg({ connectionString: process.env.DIRECT_URL });
const prisma = new PrismaClient({ adapter });

const CATEGORIES = [
  { slug: 'electronics-phones', name: 'Electronics & Phones', icon: 'Smartphone' },
  { slug: 'fashion-women', name: 'Fashion – Women', icon: 'Shirt' },
  { slug: 'fashion-men', name: 'Fashion – Men', icon: 'PersonStanding' },
  { slug: 'kids-baby', name: 'Kids & Baby', icon: 'Baby' },
  { slug: 'home-kitchen', name: 'Home & Kitchen', icon: 'UtensilsCrossed' },
  { slug: 'beauty', name: 'Beauty & Personal Care', icon: 'Sparkles' },
  { slug: 'groceries', name: 'Groceries', icon: 'Apple' },
  { slug: 'computing', name: 'Computing', icon: 'Laptop' },
  { slug: 'appliances', name: 'Appliances', icon: 'Refrigerator' },
  { slug: 'sports-fitness', name: 'Sports & Fitness', icon: 'Dumbbell' },
  { slug: 'automotive-tools', name: 'Automotive & Tools', icon: 'Wrench' },
  { slug: 'books-stationery', name: 'Books & Stationery', icon: 'BookOpen' },
  { slug: 'toys-games', name: 'Toys & Games', icon: 'Gamepad2' },
  { slug: 'bags-luggage', name: 'Bags & Luggage', icon: 'Luggage' },
  { slug: 'jewelry-watches', name: 'Jewelry & Watches', icon: 'Gem' },
];

async function main() {
  console.log('Seeding categories…');
  for (const [i, cat] of CATEGORIES.entries()) {
    await prisma.category.upsert({
      where: { slug: cat.slug },
      update: {},
      create: { ...cat, sortOrder: i },
    });
  }

  console.log('Seeding a sample user + store…');
  const user = await prisma.user.upsert({
    where: { clerkId: 'seed_dev_user' },
    update: {},
    create: {
      clerkId: 'seed_dev_user',
      phone: '+260970000000',
      fullName: 'Dev Seller',
    },
  });

  const store = await prisma.store.upsert({
    where: { ownerId: user.id },
    update: {},
    create: {
      ownerId: user.id,
      slug: 'tekhaus-zambia',
      name: 'TekHaus Zambia',
      tagline: 'Electronics you can trust, delivered fast.',
      status: 'ACTIVE',
      verified: true,
    },
  });

  const electronics = await prisma.category.findUniqueOrThrow({ where: { slug: 'electronics-phones' } });

  console.log('Seeding a sample product with variants…');
  await prisma.product.upsert({
    where: { slug: 'samsung-galaxy-a15-128gb' },
    update: {},
    create: {
      storeId: store.id,
      categoryId: electronics.id,
      slug: 'samsung-galaxy-a15-128gb',
      title: 'Samsung Galaxy A15 128GB',
      description:
        'A dependable everyday smartphone with a 6.5" display, 128GB storage, and dual-day battery life.',
      priceNgwee: 420000, // K4,200.00
      originalPriceNgwee: 490000,
      status: 'ACTIVE',
      badge: 'SALE',
      images: {
        create: [{ url: 'https://placeholder.example/galaxy-a15.jpg', sortOrder: 0 }],
      },
      variants: {
        create: [
          { sku: 'SGA15-128-BLK', color: '#1F2937', stock: 14 },
          { sku: 'SGA15-128-GRN', color: '#34584C', stock: 6 },
        ],
      },
    },
  });

  console.log('Seed complete.');
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
