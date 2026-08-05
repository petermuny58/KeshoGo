import type { Product, ProductBadge, Review } from '../types';
import { calcDiscountPercent } from '../utils/currency';

interface ProductSeed {
  title: string;
  price: number;
  originalPrice?: number;
  categorySlug: string;
  storeId: string;
  rating: number;
  reviewCount: number;
  stock: number;
  badge?: ProductBadge;
  colors?: string[];
  sizes?: string[];
  tags: string[];
  description: string;
}

const REVIEW_NAMES = [
  'Chanda M.', 'Mwansa B.', 'Bwalya K.', 'Natasha C.', 'Kunda P.',
  'Mutale S.', 'Chomba L.', 'Temwani J.', 'Lweendo H.', 'Sepiso N.',
  'Kabaso R.', 'Malaika T.', 'Given W.', 'Chisenga F.', 'Namwene D.',
];

const REVIEW_TEMPLATES = [
  (t: string) => `Exactly as described — ${t} looks and feels great for the price.`,
  (t: string) => `Delivery to Lusaka was quick and the ${t} was well packaged.`,
  (t: string) => `Good quality overall, would order this ${t} again.`,
  (t: string) => `Better than I expected. The ${t} held up after weeks of use.`,
  (t: string) => `Solid buy. Only wish there were more color options for the ${t}.`,
  (t: string) => `Seller was responsive and the ${t} arrived earlier than the estimate.`,
];

function buildReviews(seedIndex: number, rating: number, shortTitle: string, count: number): Review[] {
  const reviews: Review[] = [];
  const n = Math.min(count, 3);
  for (let i = 0; i < n; i++) {
    const nameIdx = (seedIndex * 3 + i) % REVIEW_NAMES.length;
    const templateIdx = (seedIndex * 5 + i * 2) % REVIEW_TEMPLATES.length;
    const wobble = ((seedIndex + i) % 3) - 1; // -1, 0, 1
    const reviewRating = Math.max(3, Math.min(5, Math.round(rating) + (wobble === 1 ? 0 : wobble)));
    reviews.push({
      id: `rev-${seedIndex}-${i}`,
      author: REVIEW_NAMES[nameIdx],
      rating: reviewRating,
      comment: REVIEW_TEMPLATES[templateIdx](shortTitle.toLowerCase()),
      date: `2026-0${((seedIndex + i) % 6) + 1}-${String(((seedIndex * 7 + i * 3) % 27) + 1).padStart(2, '0')}`,
    });
  }
  return reviews;
}

function slugify(title: string): string {
  return title
    .toLowerCase()
    .replace(/["'’]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

const seeds: ProductSeed[] = [
  // Electronics & Phones — store-tekhaus
  { title: 'Samsung Galaxy A15 128GB', price: 4200, originalPrice: 4900, categorySlug: 'electronics-phones', storeId: 'store-tekhaus', rating: 4.6, reviewCount: 312, stock: 24, badge: 'sale', colors: ['#1F2937', '#34584C', '#FF8313'], tags: ['phone', 'android', 'samsung'], description: 'A dependable everyday smartphone with a 6.5" display, 128GB storage and dual-day battery life. Local 1-year warranty included.' },
  { title: 'iPhone 12 Refurbished 64GB', price: 6800, originalPrice: 7500, categorySlug: 'electronics-phones', storeId: 'store-tekhaus', rating: 4.5, reviewCount: 158, stock: 9, badge: 'sale', colors: ['#111827', '#E5E7EB'], tags: ['phone', 'iphone', 'apple', 'refurbished'], description: 'Grade-A refurbished iPhone 12, battery health 85%+, fully tested and unlocked for any network in Zambia.' },
  { title: 'JBL Go 3 Bluetooth Speaker', price: 650, categorySlug: 'electronics-phones', storeId: 'store-tekhaus', rating: 4.7, reviewCount: 204, stock: 40, colors: ['#111827', '#FF8313', '#34584C'], tags: ['audio', 'speaker', 'bluetooth'], description: 'Pocket-sized, splash-proof speaker with punchy sound for up to 5 hours on a single charge.' },
  { title: 'Infinix Smart 8 Plus', price: 2100, categorySlug: 'electronics-phones', storeId: 'store-tekhaus', rating: 4.3, reviewCount: 96, stock: 33, badge: 'new', colors: ['#1F2937', '#6B7280'], tags: ['phone', 'infinix', 'budget'], description: 'Reliable budget Android with a big battery and clean display — built for everyday calls, chats and browsing.' },

  // Fashion – Women — store-mwenya
  { title: 'Ankara Wrap Dress', price: 320, originalPrice: 420, categorySlug: 'fashion-women', storeId: 'store-mwenya', rating: 4.8, reviewCount: 88, stock: 18, badge: 'sale', colors: ['#C1443A', '#34584C', '#E0A030'], sizes: ['S', 'M', 'L', 'XL'], tags: ['dress', 'ankara', 'occasion'], description: 'A flattering wrap silhouette in bold Ankara print, tailored locally for both office and weekend wear.' },
  { title: 'Chitenge Print Blouse', price: 210, categorySlug: 'fashion-women', storeId: 'store-mwenya', rating: 4.6, reviewCount: 54, stock: 26, badge: 'new', colors: ['#FF8313', '#34584C'], sizes: ['S', 'M', 'L'], tags: ['blouse', 'chitenge', 'top'], description: 'Breathable cotton-blend blouse in vibrant chitenge print, cut for an easy, everyday fit.' },
  { title: 'Denim Straight-Leg Jeans', price: 380, categorySlug: 'fashion-women', storeId: 'store-mwenya', rating: 4.4, reviewCount: 71, stock: 22, sizes: ['28', '30', '32', '34'], tags: ['jeans', 'denim'], description: 'Mid-rise straight-leg jeans in durable stretch denim that keeps its shape wash after wash.' },
  { title: 'Kitenge Maxi Skirt', price: 260, categorySlug: 'fashion-women', storeId: 'store-mwenya', rating: 4.7, reviewCount: 39, stock: 15, colors: ['#34584C', '#C1443A', '#111827'], sizes: ['S', 'M', 'L', 'XL'], tags: ['skirt', 'kitenge'], description: 'Flowing floor-length skirt with an elastic waist, in a print that moves as easily as it looks.' },

  // Fashion – Men — store-urbanfit
  { title: 'Slim Fit Chino Trousers', price: 340, categorySlug: 'fashion-men', storeId: 'store-urbanfit', rating: 4.5, reviewCount: 63, stock: 30, colors: ['#1F2937', '#8A6D4F', '#34584C'], sizes: ['30', '32', '34', '36'], tags: ['trousers', 'chino'], description: 'A tailored taper through the leg with just enough stretch for a full day at the desk or on your feet.' },
  { title: 'Graphic Print Tee', price: 150, originalPrice: 190, categorySlug: 'fashion-men', storeId: 'store-urbanfit', rating: 4.3, reviewCount: 112, stock: 55, badge: 'sale', colors: ['#111827', '#FAFAF8', '#FF8313'], sizes: ['S', 'M', 'L', 'XL'], tags: ['tshirt', 'streetwear'], description: 'Heavyweight cotton tee with a screen-printed graphic that holds up to regular washing.' },
  { title: 'Bomber Jacket', price: 590, categorySlug: 'fashion-men', storeId: 'store-urbanfit', rating: 4.6, reviewCount: 41, stock: 12, badge: 'new', colors: ['#111827', '#34584C'], sizes: ['M', 'L', 'XL'], tags: ['jacket', 'outerwear'], description: 'Lightly padded bomber with ribbed cuffs — enough warmth for Lusaka evenings without the bulk.' },
  { title: 'Canvas Sneakers', price: 420, categorySlug: 'fashion-men', storeId: 'store-urbanfit', rating: 4.4, reviewCount: 97, stock: 28, colors: ['#FAFAF8', '#1F2937'], sizes: ['40', '41', '42', '43', '44'], tags: ['shoes', 'sneakers'], description: 'Low-top canvas sneakers with a cushioned insole, built for all-day wear on any surface.' },

  // Fashion – Kids & Baby — store-littleexplorers
  { title: 'Baby Onesie 3-Pack', price: 180, categorySlug: 'fashion-kids-baby', storeId: 'store-littleexplorers', rating: 4.9, reviewCount: 66, stock: 40, sizes: ['0-3m', '3-6m', '6-12m'], tags: ['baby', 'onesie'], description: 'Soft, breathable cotton onesies in a set of three — easy snaps for quick changes.' },
  { title: 'Toddler Sun Hat', price: 85, categorySlug: 'fashion-kids-baby', storeId: 'store-littleexplorers', rating: 4.7, reviewCount: 24, stock: 35, badge: 'new', colors: ['#FF8313', '#FAFAF8'], tags: ['toddler', 'hat'], description: 'Wide-brim cotton hat with a chin strap that stays put during play, rated for sun protection.' },
  { title: 'School Uniform Set', price: 260, categorySlug: 'fashion-kids-baby', storeId: 'store-littleexplorers', rating: 4.8, reviewCount: 52, stock: 30, sizes: ['4-5y', '6-7y', '8-9y', '10-11y'], tags: ['school', 'uniform'], description: 'Durable shirt-and-shorts uniform set that survives the playground and the wash cycle alike.' },
  { title: 'Kids Rain Boots', price: 140, categorySlug: 'fashion-kids-baby', storeId: 'store-littleexplorers', rating: 4.6, reviewCount: 33, stock: 24, colors: ['#FF8313', '#34584C', '#C1443A'], sizes: ['24', '26', '28', '30'], tags: ['boots', 'rain'], description: 'Waterproof rubber boots with a grippy sole, ready for the rainy season.' },

  // Home & Kitchen — store-homehearth
  { title: 'Non-Stick Cookware Set (5pc)', price: 480, originalPrice: 620, categorySlug: 'home-kitchen', storeId: 'store-homehearth', rating: 4.6, reviewCount: 140, stock: 20, badge: 'sale', tags: ['cookware', 'kitchen'], description: 'A five-piece non-stick set covering everything from a quick fry-up to a slow-simmered stew.' },
  { title: 'Electric Kettle 1.7L', price: 210, categorySlug: 'home-kitchen', storeId: 'store-homehearth', rating: 4.7, reviewCount: 188, stock: 45, tags: ['kettle', 'appliance'], description: 'Fast-boil kettle with auto shut-off and a concealed element that is easy to keep clean.' },
  { title: 'Ceramic Dinner Set (16pc)', price: 390, categorySlug: 'home-kitchen', storeId: 'store-homehearth', rating: 4.5, reviewCount: 47, stock: 16, badge: 'new', colors: ['#FAFAF8', '#34584C'], tags: ['dinnerware', 'ceramic'], description: 'Sixteen-piece set for four — plates, bowls and mugs in a chip-resistant glazed ceramic.' },
  { title: 'Bamboo Cutting Board Set', price: 130, categorySlug: 'home-kitchen', storeId: 'store-homehearth', rating: 4.8, reviewCount: 61, stock: 38, tags: ['kitchen', 'bamboo'], description: 'Three sizes of sustainably sourced bamboo boards, gentle on knife edges and easy to sanitize.' },

  // Health & Beauty — store-glownaturals
  { title: 'Shea Butter Body Cream', price: 95, categorySlug: 'health-beauty', storeId: 'store-glownaturals', rating: 4.8, reviewCount: 226, stock: 60, badge: 'bestseller', tags: ['skincare', 'shea butter'], description: 'Whipped, unrefined shea butter cream that locks in moisture through Zambia' + "'" + 's dry season.' },
  { title: 'Vitamin C Face Serum', price: 165, categorySlug: 'health-beauty', storeId: 'store-glownaturals', rating: 4.6, reviewCount: 84, stock: 32, badge: 'new', tags: ['skincare', 'serum'], description: 'Brightening serum with stabilized Vitamin C, formulated for daily use under sunscreen.' },
  { title: 'Cocoa Butter Soap Bar 3-Pack', price: 60, categorySlug: 'health-beauty', storeId: 'store-glownaturals', rating: 4.7, reviewCount: 133, stock: 80, tags: ['soap', 'cocoa butter'], description: 'Cold-processed soap bars made with cocoa butter — gentle enough for daily use.' },
  { title: 'Argan Hair Oil', price: 110, originalPrice: 140, categorySlug: 'health-beauty', storeId: 'store-glownaturals', rating: 4.5, reviewCount: 58, stock: 27, badge: 'sale', tags: ['hair care', 'oil'], description: 'Lightweight argan oil that tames frizz and adds shine without weighing hair down.' },

  // Groceries & Food — store-freshbasket
  { title: 'Mealie Meal 25kg (Breakfast)', price: 210, categorySlug: 'groceries-food', storeId: 'store-freshbasket', rating: 4.7, reviewCount: 302, stock: 50, badge: 'bestseller', tags: ['mealie meal', 'staple'], description: 'Finely milled breakfast mealie meal, the staple every Zambian kitchen restocks first.' },
  { title: 'Extra Virgin Olive Oil 1L', price: 145, categorySlug: 'groceries-food', storeId: 'store-freshbasket', rating: 4.6, reviewCount: 71, stock: 34, tags: ['oil', 'pantry'], description: 'Cold-pressed extra virgin olive oil, imported and bottled for everyday cooking and dressings.' },
  { title: 'Roasted Coffee Beans 500g', price: 95, categorySlug: 'groceries-food', storeId: 'store-freshbasket', rating: 4.8, reviewCount: 46, stock: 40, badge: 'new', tags: ['coffee', 'beans'], description: 'Medium-roast Zambian coffee beans with a smooth, low-acid finish. Whole bean, freshly roasted.' },
  { title: 'Mixed Nuts & Dried Fruit Pack', price: 120, categorySlug: 'groceries-food', storeId: 'store-freshbasket', rating: 4.5, reviewCount: 29, stock: 44, tags: ['snacks', 'nuts'], description: 'A resealable pack of roasted nuts and dried fruit for a snack that actually keeps you full.' },

  // Computing & Accessories — store-tekhaus
  { title: 'Wireless Mouse & Keyboard Combo', price: 240, categorySlug: 'computing-accessories', storeId: 'store-tekhaus', rating: 4.4, reviewCount: 98, stock: 36, colors: ['#111827', '#FAFAF8'], tags: ['keyboard', 'mouse', 'wireless'], description: 'Reliable 2.4GHz wireless combo with a spill-resistant keyboard and silent-click mouse.' },
  { title: '1TB Portable SSD', price: 890, categorySlug: 'computing-accessories', storeId: 'store-tekhaus', rating: 4.7, reviewCount: 52, stock: 18, badge: 'new', tags: ['storage', 'ssd'], description: 'Pocket-sized 1TB SSD with fast USB-C transfer speeds, built to survive daily commutes.' },
  { title: 'USB-C Hub 7-in-1', price: 310, originalPrice: 380, categorySlug: 'computing-accessories', storeId: 'store-tekhaus', rating: 4.5, reviewCount: 67, stock: 29, badge: 'sale', tags: ['hub', 'usb-c'], description: 'HDMI, USB-A, SD and power delivery in one small hub — turns any laptop into a desktop setup.' },
  { title: 'Laptop Backpack 15.6"', price: 260, categorySlug: 'computing-accessories', storeId: 'store-tekhaus', rating: 4.6, reviewCount: 84, stock: 25, colors: ['#111827', '#34584C'], tags: ['bag', 'laptop'], description: 'Padded compartment fits most 15.6" laptops, with a rain-resistant shell for the commute.' },

  // Appliances — store-homehearth
  { title: 'Double Door Fridge 260L', price: 8400, originalPrice: 9200, categorySlug: 'appliances', storeId: 'store-homehearth', rating: 4.6, reviewCount: 39, stock: 8, badge: 'sale', tags: ['fridge', 'appliance'], description: 'Frost-free double-door fridge with a dedicated freezer section, sized for a family kitchen.' },
  { title: 'Microwave Oven 23L', price: 1250, categorySlug: 'appliances', storeId: 'store-homehearth', rating: 4.5, reviewCount: 58, stock: 22, tags: ['microwave', 'appliance'], description: '23-litre microwave with grill function and 8 auto-cook presets for quick reheats.' },
  { title: 'Standing Fan 18"', price: 480, categorySlug: 'appliances', storeId: 'store-homehearth', rating: 4.4, reviewCount: 72, stock: 31, badge: 'bestseller', tags: ['fan', 'cooling'], description: 'Oscillating 18" fan with 3 speeds and a timer, built to move air through a full room.' },
  { title: 'Electric Iron', price: 220, categorySlug: 'appliances', storeId: 'store-homehearth', rating: 4.6, reviewCount: 91, stock: 40, tags: ['iron', 'appliance'], description: 'Steam iron with a non-stick soleplate that glides through cotton, denim and school uniforms alike.' },

  // Sports & Outdoors — store-urbanfit
  { title: 'Football (FIFA-size 5)', price: 190, categorySlug: 'sports-outdoors', storeId: 'store-urbanfit', rating: 4.7, reviewCount: 143, stock: 50, badge: 'bestseller', tags: ['football', 'sports'], description: 'Match-standard size 5 football with a durable synthetic panel that holds its shape on any pitch.' },
  { title: 'Yoga Mat 6mm', price: 150, categorySlug: 'sports-outdoors', storeId: 'store-urbanfit', rating: 4.6, reviewCount: 55, stock: 42, badge: 'new', colors: ['#34584C', '#C1443A', '#111827'], tags: ['yoga', 'fitness'], description: 'Non-slip 6mm mat with enough cushioning for floor work, yoga or home workouts.' },
  { title: 'Adjustable Dumbbell Set 20kg', price: 780, categorySlug: 'sports-outdoors', storeId: 'store-urbanfit', rating: 4.5, reviewCount: 34, stock: 14, tags: ['fitness', 'dumbbell'], description: 'Space-saving adjustable set from 2.5kg to 20kg per side, for a full home strength routine.' },
  { title: 'Camping Tent 4-Person', price: 650, originalPrice: 820, categorySlug: 'sports-outdoors', storeId: 'store-urbanfit', rating: 4.4, reviewCount: 26, stock: 11, badge: 'sale', tags: ['camping', 'outdoors'], description: 'Weatherproof 4-person tent that pitches in minutes, packed down small for the boot of a car.' },

  // Automotive & Hardware — store-copperbelt-motors
  { title: 'Car Battery 12V 65Ah', price: 1450, categorySlug: 'automotive-hardware', storeId: 'store-copperbelt-motors', rating: 4.6, reviewCount: 48, stock: 16, tags: ['car', 'battery'], description: 'Maintenance-free 65Ah battery with strong cold-cranking power, fitted or self-install.' },
  { title: 'Cordless Drill Driver Kit', price: 620, categorySlug: 'automotive-hardware', storeId: 'store-copperbelt-motors', rating: 4.7, reviewCount: 63, stock: 20, badge: 'new', tags: ['tools', 'drill'], description: 'Cordless drill with two batteries and a full bit set, ready for most home repair jobs.' },
  { title: 'Tool Set 128-Piece', price: 890, originalPrice: 1050, categorySlug: 'automotive-hardware', storeId: 'store-copperbelt-motors', rating: 4.5, reviewCount: 37, stock: 12, badge: 'sale', tags: ['tools', 'toolkit'], description: 'A 128-piece set in a hard case covering sockets, wrenches, screwdrivers and more.' },
  { title: 'Car Phone Mount & Charger', price: 145, categorySlug: 'automotive-hardware', storeId: 'store-copperbelt-motors', rating: 4.4, reviewCount: 55, stock: 46, tags: ['car', 'accessory'], description: 'Vent-mounted phone holder with a built-in fast charger cable for the drive.' },

  // Books, Media & Stationery — store-kalemba-books
  { title: 'Roots of Resilience (Novel)', price: 145, categorySlug: 'books-media-stationery', storeId: 'store-kalemba-books', rating: 4.8, reviewCount: 22, stock: 25, badge: 'new', tags: ['book', 'novel'], description: 'A generational novel following one Copperbelt family across three decades of change.' },
  { title: 'A4 Exercise Books 10-Pack', price: 65, categorySlug: 'books-media-stationery', storeId: 'store-kalemba-books', rating: 4.6, reviewCount: 88, stock: 90, badge: 'bestseller', tags: ['stationery', 'school'], description: 'Ten 96-page exercise books with sturdy covers, ready for the new school term.' },
  { title: 'Fountain Pen Set', price: 120, categorySlug: 'books-media-stationery', storeId: 'store-kalemba-books', rating: 4.5, reviewCount: 19, stock: 30, tags: ['pen', 'stationery'], description: 'A smooth-writing fountain pen set with extra cartridges, boxed for gifting.' },
  { title: 'Desk Organizer Set', price: 95, categorySlug: 'books-media-stationery', storeId: 'store-kalemba-books', rating: 4.4, reviewCount: 27, stock: 35, tags: ['desk', 'organizer'], description: 'A modular tray-and-pot set that keeps pens, notes and cables off the desktop.' },

  // Toys & Games — store-playzone
  { title: 'Building Blocks Set 250pc', price: 210, categorySlug: 'toys-games', storeId: 'store-playzone', rating: 4.8, reviewCount: 74, stock: 28, badge: 'bestseller', tags: ['toys', 'building blocks'], description: 'A 250-piece compatible block set that grows with a child' + "'" + 's imagination.' },
  { title: 'Remote Control Car', price: 340, categorySlug: 'toys-games', storeId: 'store-playzone', rating: 4.6, reviewCount: 51, stock: 19, badge: 'new', colors: ['#FF8313', '#111827'], tags: ['toys', 'rc car'], description: 'Rechargeable RC car with off-road tires, built for both indoor floors and the yard.' },
  { title: 'Board Game: Family Trivia', price: 165, categorySlug: 'toys-games', storeId: 'store-playzone', rating: 4.5, reviewCount: 33, stock: 24, tags: ['games', 'board game'], description: 'A trivia night in a box, with question cards spanning music, history and everyday life.' },
  { title: 'Plush Teddy Bear 40cm', price: 130, originalPrice: 165, categorySlug: 'toys-games', storeId: 'store-playzone', rating: 4.9, reviewCount: 62, stock: 33, badge: 'sale', tags: ['toys', 'plush'], description: 'A soft, huggable 40cm teddy bear, machine-washable for the inevitable spills.' },

  // Bags & Luggage — store-zambia-trunk
  { title: 'Hardshell Suitcase 24"', price: 890, categorySlug: 'bags-luggage', storeId: 'store-zambia-trunk', rating: 4.6, reviewCount: 41, stock: 15, badge: 'new', colors: ['#34584C', '#111827', '#FF8313'], tags: ['luggage', 'suitcase'], description: 'A lightweight 24" hardshell case with spinner wheels and a TSA-friendly lock.' },
  { title: 'Canvas Weekender Duffel', price: 320, categorySlug: 'bags-luggage', storeId: 'store-zambia-trunk', rating: 4.5, reviewCount: 28, stock: 22, tags: ['bag', 'duffel'], description: 'A rugged canvas duffel sized for a weekend away, with a detachable shoulder strap.' },
  { title: 'Leather Laptop Bag', price: 480, originalPrice: 600, categorySlug: 'bags-luggage', storeId: 'store-zambia-trunk', rating: 4.7, reviewCount: 36, stock: 17, badge: 'sale', colors: ['#8A6D4F', '#111827'], tags: ['bag', 'laptop', 'leather'], description: 'Genuine leather laptop bag with a padded sleeve, built to age well with daily use.' },
  { title: 'School Backpack', price: 210, categorySlug: 'bags-luggage', storeId: 'store-zambia-trunk', rating: 4.6, reviewCount: 59, stock: 38, badge: 'bestseller', colors: ['#34584C', '#111827', '#C1443A'], tags: ['bag', 'school'], description: 'A durable, water-resistant backpack with a dedicated laptop sleeve and reinforced straps.' },

  // Jewelry & Watches — store-ngwena-gems
  { title: 'Sterling Silver Pendant Necklace', price: 480, categorySlug: 'jewelry-watches', storeId: 'store-ngwena-gems', rating: 4.8, reviewCount: 31, stock: 14, badge: 'new', tags: ['jewelry', 'necklace'], description: 'A hand-finished sterling silver pendant on an 18" chain, boxed for gifting.' },
  { title: "Men's Chronograph Watch", price: 890, originalPrice: 1100, categorySlug: 'jewelry-watches', storeId: 'store-ngwena-gems', rating: 4.7, reviewCount: 44, stock: 10, badge: 'sale', colors: ['#111827', '#8A6D4F'], tags: ['watch', 'chronograph'], description: 'A stainless steel chronograph with a scratch-resistant face and genuine leather strap.' },
  { title: 'Beaded Statement Bracelet', price: 165, categorySlug: 'jewelry-watches', storeId: 'store-ngwena-gems', rating: 4.6, reviewCount: 27, stock: 26, badge: 'bestseller', tags: ['jewelry', 'bracelet'], description: 'Hand-strung beadwork in earth tones, adjustable to fit most wrist sizes.' },
  { title: 'Gold-Plated Hoop Earrings', price: 220, categorySlug: 'jewelry-watches', storeId: 'store-ngwena-gems', rating: 4.5, reviewCount: 18, stock: 32, tags: ['jewelry', 'earrings'], description: 'Lightweight gold-plated hoops finished to resist everyday tarnish.' },
];

export const products: Product[] = seeds.map((seed, index) => {
  const id = `prod-${index + 1}`;
  const slug = slugify(seed.title);
  const discountPercent = calcDiscountPercent(seed.price, seed.originalPrice ?? null);
  const shortTitle = seed.title.split(' ').slice(0, 2).join(' ');

  return {
    id,
    slug,
    title: seed.title,
    shortTitle,
    price: seed.price,
    originalPrice: seed.originalPrice ?? null,
    currency: 'ZMW',
    rating: seed.rating,
    reviewCount: seed.reviewCount,
    categorySlug: seed.categorySlug,
    storeId: seed.storeId,
    description: seed.description,
    imageCount: 3 + (index % 3),
    colors: seed.colors ?? [],
    sizes: seed.sizes ?? [],
    badge: seed.badge ?? null,
    discountPercent,
    stock: seed.stock,
    tags: seed.tags,
    reviews: buildReviews(index, seed.rating, shortTitle, 3),
  };
});

export function getProductBySlug(slug: string): Product | undefined {
  return products.find((p) => p.slug === slug);
}

export function getProductsByCategory(categorySlug: string): Product[] {
  return products.filter((p) => p.categorySlug === categorySlug);
}

export function getProductsByStore(storeId: string): Product[] {
  return products.filter((p) => p.storeId === storeId);
}

export function getRelatedProducts(product: Product, limit = 6): Product[] {
  return products
    .filter((p) => p.id !== product.id && p.categorySlug === product.categorySlug)
    .slice(0, limit);
}

export function searchProducts(query: string): Product[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  return products.filter(
    (p) =>
      p.title.toLowerCase().includes(q) ||
      p.tags.some((t) => t.toLowerCase().includes(q)) ||
      p.categorySlug.includes(q.replace(/\s+/g, '-')),
  );
}
