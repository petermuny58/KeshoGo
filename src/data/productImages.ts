/**
 * Real product photography, sourced from Unsplash (unsplash.com/license —
 * free to use, no attribution required, safe for commercial use).
 *
 * KeshoGo's mock catalog has fictional SKUs (e.g. "Infinix Smart 8 Plus"),
 * so there's no exact photo for any single product. Instead, each category
 * gets a curated pool of real, category-appropriate photos, and every
 * product is assigned a deterministic subset of that pool — same product
 * always shows the same images, and neighboring products in a category get
 * visual variety instead of all showing one repeated photo.
 *
 * Each entry is the Unsplash photo id (the part after "photo-" in their
 * CDN urls). buildImageUrl() below turns an id into a sized, optimized URL.
 */

export const CATEGORY_IMAGE_POOLS: Record<string, string[]> = {
  'electronics-phones': [
    '1603184017968-953f59cd2e37', // black android smartphone on white table
    '1480694313141-fce5e697ee25', // silver android smartphone
    '1511707171634-5f897ff02aa9', // white smartphone near laptop
    '1592890288564-76628a30a657', // person holding black android smartphone
    '1598327105666-5b89351aff97', // phone screen with app icons
    '1542483381-41a479b1fb88', // white bluetooth speaker
  ],
  'fashion-women': [
    '1696962678565-bee84e6b9cb6', // woman in dress and hat
    '1628144029346-8a98676311b6', // woman in floral dress
    '1681545290284-679e6291c440', // woman in colorful dress
    '1709809081557-78f803ce93a0', // woman in colorful dress on bench
    '1696962701419-6f510910e838', // woman in dress and hat
    '1611258692399-87e8a1206ecd', // woman in floral dress on bed
    '1601653233006-5c9fd30eab12', // woman in sleeveless dress
    '1650562325232-538b70cccb32', // woman in pink dress by palm tree
  ],
  'fashion-men': [
    '1544441893-675973e31985', // white low-top sneakers
    '1593030761757-71fae45fa0e7', // denim jeans and leather shoes
    '1562157873-818bc0726f68', // assorted folded shirts
    '1523381294911-8d3cead13475', // blue crew-neck tops
    '1552252059-9d77e4059ad1', // white shirt and denim jeans
    '1507680434567-5739c80be1ac', // black dress shirt
  ],
  'fashion-kids-baby': [
    '1622290319146-7b63df48a635', // baby onesie
    '1569974641446-22542de88536', // three baby onesies
    '1546015720-b8b30df5aa27', // baby knit hat
    '1622290291468-a28f7a7dc6a8', // white crew neck t-shirt
    '1560506840-ec148e82a604', // assorted long-sleeved dresses
  ],
  'home-kitchen': [
    '1584990347193-6bebebfeaeee', // stainless steel cooking pots
    '1584990347163-2b86b71390d6', // red and silver cooking pots
    '1556910585-09baa3a3998e', // blue ceramic dinnerware
    '1587377224767-586f2af5375d', // ceramic plate with fruit
    '1518291344630-4857135fb581', // frying pan flat lay
  ],
  'health-beauty': [
    '1585945037805-5fd82c2e60b1', // white cream smear
    '1608571423902-eed4a5ad8108', // clear glass serum bottle
    '1620916297397-a4a5402a3c6c', // black glass oil bottle
    '1598440947619-2c35fc9aa908', // orange plastic bottle
    '1616750819456-5cdee9b85d22', // white tube on glass table
  ],
  'groceries-food': [
    '1447933601403-0c6688de566e', // coffee beans
    '1513530176992-0cf39c4cbed4', // coffee beans
    '1606486544554-164d98da4889', // coffee beans on black surface
    '1474979266404-7eaacbcd87c5', // olive oil bottle
    '1574785289548-b6604d39125d', // oil pouring
  ],
  'computing-accessories': [
    '1551739440-5dd934d3a94a', // keyboard and mouse near monitor
    '1593640408182-31c70c8268f5', // monitor beside keyboard
    '1577375729078-820d5283031c', // assorted device flat lay
    '1636036824578-d0d300a4effb', // keyboard on desk
  ],
  appliances: [
    '1484154218962-a197022b5858', // gray steel refrigerator
    '1596552183299-000ef779e88d', // white microwave oven
    '1611090925566-b1fc31065f63', // white and blue clothes iron
    '1570222094114-d054a817e56b', // black and gray blender
  ],
  'sports-outdoors': [
    '1562771242-a02d9090c90c', // pair of black dumbbells
    '1646504632442-6cacb1858bd6', // basket of colorful balls
    '1567113379515-6e85e7168eb1', // basketball close-up
    '1504280390367-361c6d9f38f4', // orange camping tent
  ],
  'automotive-hardware': [
    '1606676539940-12768ce0e762', // cordless power drill
    '1613206485381-b028e578e791', // wrenches
    '1581783898377-1c85bf937427', // hammer and screwdriver
    '1567361808960-dec9cb578182', // carpentry tools
  ],
  'books-media-stationery': [
    '1611758497398-5224931d155a', // books on a shelf
    '1568205612837-017257d2310a', // assorted colored pencils
    '1567855354833-ac2c4f967b0c', // assorted colored pens
    '1621413268056-ce8911fe1563', // notebook and pen
  ],
  'toys-games': [
    '1575364289437-fb1479d52732', // assorted wooden blocks
    '1636314229901-61b1c1da1675', // pile of building bricks
    '1559454403-b8fb88521f11', // brown teddy bear
    '1541692641319-981cc79ee10a', // stacking blocks
  ],
  'bags-luggage': [
    '1673505705680-36437a06ee27', // luggage with wheels, white background
    '1573878930082-8f0fe89a2393', // duffle bags
    '1541336318489-083c7d277b8e', // brown leather handbag
    '1760648311436-d18d39f499bd', // black rolling suitcase
  ],
  'jewelry-watches': [
    '1599643478518-a784e5dc4c8f', // silver necklace with blue gemstone pendant
    '1589391943533-d6856910b7a8', // black and silver chronograph watch
    '1602173574767-37ac01994b2a', // gold chain bracelet
    '1535632066927-ab7c9ab60908', // silver earrings with blue gemstone
  ],
};

/** Simple deterministic string hash so the same seed always maps to the same index. */
function hashSeed(seed: string): number {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash << 5) - hash + seed.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

/**
 * Returns the Unsplash photo id assigned to a given product's gallery slot.
 * Deterministic: same productId + imageIndex always resolves to the same photo.
 * Returns null if the category has no photo pool (caller should fall back
 * to the tinted placeholder tile).
 */
export function getProductPhotoId(categorySlug: string, productId: string, imageIndex: number): string | null {
  const pool = CATEGORY_IMAGE_POOLS[categorySlug];
  if (!pool || pool.length === 0) return null;
  const index = hashSeed(`${productId}-${imageIndex}`) % pool.length;
  return pool[index];
}

/** Builds a sized, optimized Unsplash CDN url from a photo id. */
export function buildImageUrl(photoId: string, width = 800): string {
  return `https://images.unsplash.com/photo-${photoId}?auto=format&fit=crop&w=${width}&q=80`;
}
