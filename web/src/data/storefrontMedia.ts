/**
 * Curated free stock media for Amore storefront placeholders.
 * Swap these for real brand photography/video when available.
 */

const u = (id: string, w = 800, h = 1000) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${w}&h=${h}&q=80`

/** Hero / lifestyle banners */
export const HERO_IMAGES = {
  bridal: u('photo-1599643478518-a384e7de4b6b', 1600, 900),
  newArrivals: u('photo-1515562141207-7a88fb7ce338', 1600, 900),
  signature: u('photo-1535632066927-ab7c9ab60908', 1600, 900),
} as const

export const BRIDAL_BANNER = u('photo-1606800052052-a08af7148866', 900, 1000)
export const FOUNDER_IMAGE = u('photo-1617038260897-41a1f14a8ca0', 700, 800)
export const STUDIO_IMAGE = u('photo-1573408301185-51446e1f1da3', 900, 700)

/** Category / craft / style tile imagery keyed by lowercase name fragment */
const JEWELRY_BY_KEYWORD: Array<{ match: RegExp; image: string }> = [
  { match: /necklace|choker|haram/i, image: u('photo-1515562141207-7a88fb7ce338') },
  { match: /earring|eartops|earchain/i, image: u('photo-1535632066927-ab7c9ab60908') },
  { match: /ring/i, image: u('photo-1605100804763-247f67b3557e') },
  { match: /bangle/i, image: u('photo-1611591437281-460bfbe1220a', 800, 800) },
  { match: /bracelet/i, image: u('photo-1573408301185-51446e1f1da3') },
  { match: /maang|tikka/i, image: u('photo-1599643478518-a384e7de4b6b') },
  { match: /hathphool|sheekh|hand/i, image: u('photo-1617038260897-41a1f14a8ca0') },
  { match: /bridal|wedding/i, image: u('photo-1606800052052-a08af7148866') },
  { match: /festive/i, image: u('photo-1515562141207-7a88fb7ce338') },
  { match: /antique/i, image: u('photo-1599643478518-a384e7de4b6b') },
  { match: /minimal/i, image: u('photo-1605100804763-247f67b3557e') },
  { match: /kundan|jadau/i, image: u('photo-1606800052052-a08af7148866') },
  { match: /polki|moissanite|diamond/i, image: u('photo-1515562141207-7a88fb7ce338') },
  { match: /long.?set/i, image: u('photo-1535632066927-ab7c9ab60908') },
]

const FALLBACK_JEWELRY = [
  u('photo-1515562141207-7a88fb7ce338'),
  u('photo-1535632066927-ab7c9ab60908'),
  u('photo-1605100804763-247f67b3557e'),
  u('photo-1611591437281-460bfbe1220a'),
  u('photo-1599643478518-a384e7de4b6b'),
  u('photo-1606800052052-a08af7148866'),
]

export function jewelryImageFor(name: string, seed = 0): string {
  const hit = JEWELRY_BY_KEYWORD.find((entry) => entry.match.test(name))
  if (hit) return hit.image
  return FALLBACK_JEWELRY[Math.abs(seed) % FALLBACK_JEWELRY.length]!
}

/** Short muted loop videos for "Shop the Visuals" — Mixkit jewellery clips. */
export const VISUAL_VIDEOS: Array<{ label: string; poster: string; src: string }> = [
  {
    label: 'Bridal Adornment',
    poster: HERO_IMAGES.bridal,
    src: 'https://assets.mixkit.co/videos/50782/50782-720.mp4',
  },
  {
    label: 'Necklace Glow',
    poster: HERO_IMAGES.newArrivals,
    src: 'https://assets.mixkit.co/videos/15743/15743-720.mp4',
  },
  {
    label: 'Statement Jewels',
    poster: HERO_IMAGES.signature,
    src: 'https://assets.mixkit.co/videos/50782/50782-720.mp4',
  },
  {
    label: 'Gold & Gems',
    poster: jewelryImageFor('kundan'),
    src: 'https://assets.mixkit.co/videos/15743/15743-720.mp4',
  },
  {
    label: 'Festive Sparkle',
    poster: jewelryImageFor('festive'),
    src: 'https://assets.mixkit.co/videos/50782/50782-720.mp4',
  },
  {
    label: 'Heirloom Edit',
    poster: jewelryImageFor('polki'),
    src: 'https://assets.mixkit.co/videos/15743/15743-720.mp4',
  },
]

export const INSTAGRAM_TILES = FALLBACK_JEWELRY.map((image, index) => ({
  id: index,
  image,
}))
