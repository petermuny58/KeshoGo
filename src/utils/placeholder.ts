/**
 * KeshoGo is frontend-only for this pass, so product photography is mocked.
 * Instead of pulling in random stock photos (which would look like a
 * broken CDN and imply real, sourced product images), every product renders
 * as a soft brand-tinted tile with its category icon centered on it.
 * The tint is deterministic per id, so the same product always looks the same.
 */

export interface PlaceholderTone {
  bg: string;
  fg: string;
}

const PALETTE: PlaceholderTone[] = [
  { bg: '#E4EDE7', fg: '#34584C' }, // sage / hunter green
  { bg: '#FCEFE0', fg: '#E8720D' }, // peach / burnt orange
  { bg: '#EFEAE2', fg: '#8A6D4F' }, // sand / warm brown
  { bg: '#E7EDF0', fg: '#4A6B7A' }, // mist / steel blue
  { bg: '#F1E8EC', fg: '#9C6B7A' }, // mauve / dusty rose
  { bg: '#EAF0E3', fg: '#5C7A46' }, // moss / olive
  { bg: '#F3E9E9', fg: '#B5716B' }, // blush / terracotta
  { bg: '#E9E4EF', fg: '#6B5C8A' }, // lavender / muted violet
];

function hashSeed(seed: string): number {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash << 5) - hash + seed.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

export function getPlaceholderTone(seed: string): PlaceholderTone {
  const index = hashSeed(seed) % PALETTE.length;
  return PALETTE[index];
}
