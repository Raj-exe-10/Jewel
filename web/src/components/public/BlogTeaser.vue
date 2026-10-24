<script setup lang="ts">
import { FOUNDER_IMAGE, HERO_IMAGES, STUDIO_IMAGE, jewelryImageFor } from '../../data/storefrontMedia'

/** Static editorial teasers — visual match for the reference blog grid (no CMS yet). */
const posts = [
  {
    id: 'bridal-edit',
    category: 'Bridal',
    title: 'How to choose your bridal set',
    excerpt: 'A short guide to balancing heirloom weight with modern comfort on your wedding day.',
    image: HERO_IMAGES.bridal,
    date: '12 Mar',
  },
  {
    id: 'everyday-glow',
    category: 'Styling',
    title: 'Everyday jewels that travel well',
    excerpt: 'Light polki and gold-tone pieces that move from desk to dinner without fuss.',
    image: HERO_IMAGES.newArrivals,
    date: '28 Feb',
  },
  {
    id: 'craft-story',
    category: 'Craft',
    title: 'Inside the atelier: kundan & polki',
    excerpt: 'Why no two handmade settings are ever quite the same — and why that matters.',
    image: FOUNDER_IMAGE,
    date: '14 Feb',
  },
  {
    id: 'studio-visit',
    category: 'Studio',
    title: 'Planning a private studio visit',
    excerpt: 'What to expect when you book an appointment to try on statement ensembles.',
    image: STUDIO_IMAGE || jewelryImageFor('bridal'),
    date: '02 Feb',
  },
]
</script>

<template>
  <section id="from-our-blog" data-testid="blog-teaser" class="bg-amore-cream py-12 sm:py-16">
    <div class="mx-auto max-w-screen-2xl px-4">
      <div class="mb-10 text-center">
        <p class="mb-2 text-xs uppercase tracking-[0.35em] text-amore-gold">Journal</p>
        <h2 class="font-display text-3xl text-amore-charcoal sm:text-4xl">From our blog</h2>
        <p class="mt-2 text-sm text-neutral-600">Stories on craft, styling, and the Amore atelier</p>
      </div>

      <div class="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <article
          v-for="post in posts"
          :key="post.id"
          data-testid="blog-teaser-card"
          class="flex flex-col border border-amore-burgundy/15 bg-white"
        >
          <div class="aspect-[4/3] overflow-hidden bg-amore-blush">
            <img :src="post.image" :alt="post.title" class="h-full w-full object-cover" />
          </div>
          <div class="flex flex-1 flex-col gap-2 p-4">
            <p class="text-[10px] font-semibold uppercase tracking-[0.2em] text-amore-gold">
              {{ post.category }}
            </p>
            <h3 class="font-display text-xl leading-snug text-amore-charcoal">{{ post.title }}</h3>
            <p class="line-clamp-3 flex-1 text-sm leading-relaxed text-neutral-600">{{ post.excerpt }}</p>
            <div class="mt-3 flex items-center justify-between gap-3">
              <a
                href="#contact"
                class="inline-flex items-center bg-amore-maroon px-4 py-2 text-xs font-medium tracking-wide text-amore-cream transition hover:bg-amore-burgundy"
              >
                Read More
              </a>
              <span class="text-xs text-neutral-400">{{ post.date }}</span>
            </div>
          </div>
        </article>
      </div>
    </div>
  </section>
</template>
