// One-off dev utility: regenerate PWA icons from icon-source/master.png.
// The source lives outside public/ so it isn't needlessly copied into dist/.
// Run with: node scripts/generate-icons.mjs
import sharp from 'sharp'

const SRC = 'icon-source/master.png'

async function run() {
  await sharp(SRC).resize(192, 192).png().toFile('public/icons/icon-192.png')
  await sharp(SRC).resize(512, 512).png().toFile('public/icons/icon-512.png')
  await sharp(SRC).resize(180, 180).png().toFile('public/icons/apple-touch-icon.png')

  // Maskable icons need ~20% safe-zone padding since OS masks crop a circle/
  // squircle out of the full square; pad the source onto a larger charcoal
  // canvas before downscaling to 512x512.
  await sharp(SRC)
    .resize(410, 410)
    .extend({ top: 51, bottom: 51, left: 51, right: 51, background: '#1a1a1a' })
    .png()
    .toFile('public/icons/icon-maskable-512.png')

  console.log('Generated PWA icons in public/icons/')
}

run().catch((error) => {
  console.error(error)
  process.exit(1)
})
