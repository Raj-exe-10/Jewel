<script setup lang="ts">
import { computed, reactive, watch } from 'vue'
import { useCatalogueStore } from '../../stores/catalogue'
import {
  PRODUCT_FLAG_LABELS,
  type CtaTarget,
  type HeroBannerContent,
  type HomepageSection,
  type ProductCarouselContent,
  type SectionVideo,
  type StudioLocationContent,
  type TaxonomyTilesContent,
  type VideoCarouselContent,
} from '../../types/homepage'
import PhotoUploader from './PhotoUploader.vue'
import ProductPicker from './ProductPicker.vue'
import VideoUploader from './VideoUploader.vue'

const props = defineProps<{ section: HomepageSection }>()
const emit = defineEmits<{ save: [section: HomepageSection]; cancel: [] }>()

const catalogue = useCatalogueStore()
const draft = reactive<HomepageSection>(cloneSection(props.section))

watch(
  () => props.section.id,
  () => Object.assign(draft, cloneSection(props.section)),
)

watch(
  () => draft.productSelectionMode,
  (mode) => {
    if (mode === 'manual' && !draft.productIds) draft.productIds = []
  },
)

function cloneSection(section: HomepageSection): HomepageSection {
  const copy = JSON.parse(JSON.stringify(section)) as HomepageSection
  if (copy.type === 'video_carousel') {
    const content = copy.content as VideoCarouselContent
    content.videos ??= []
  }
  if (copy.type === 'product_carousel') {
    copy.productIds ??= []
  }
  if (copy.type === 'hero_banner') {
    const content = copy.content as HeroBannerContent
    content.slides ??= []
    for (const slide of content.slides) {
      slide.ctaTarget ??= { kind: 'catalogue' }
    }
  }
  if (copy.type === 'instagram_gallery') {
    const content = copy.content as { tiles?: Array<{ id: string; imageUrl: string }> }
    content.tiles ??= []
  }
  if (copy.type === 'about' || copy.type === 'contact' || copy.type === 'studio_location') {
    const content = copy.content as { bodyParagraphs?: string[] }
    content.bodyParagraphs ??= []
  }
  return copy
}

const heroContent = computed(() => draft.content as HeroBannerContent)
const productContent = computed(() => draft.content as ProductCarouselContent)
const taxonomyContent = computed(() => draft.content as TaxonomyTilesContent)
const studioContent = computed(() => draft.content as StudioLocationContent)

const taxonomyItems = computed(() => {
  if (draft.type === 'style_tiles') return catalogue.styleTags
  if (draft.type === 'category_grid') return catalogue.categories
  if (draft.type === 'collection_tiles') return catalogue.collections
  return []
})

function setCta(slideIndex: number, value: string) {
  const slide = heroContent.value.slides[slideIndex]
  if (!slide) return
  if (value === 'bridal') slide.ctaTarget = { kind: 'bridal' }
  else if (value === 'catalogue') slide.ctaTarget = { kind: 'catalogue' }
  else slide.ctaTarget = { kind: 'scroll', anchorId: value }
}

function ctaValue(target: CtaTarget | undefined): string {
  if (!target) return 'catalogue'
  if (target.kind === 'scroll') return target.anchorId
  return target.kind
}

function setVideos(videos: SectionVideo[]) {
  ;(draft.content as VideoCarouselContent).videos = videos
}

function aboutParagraphs() {
  return (draft.content as { bodyParagraphs: string[] }).bodyParagraphs ?? []
}

function contactParagraphs() {
  return (draft.content as { bodyParagraphs: string[] }).bodyParagraphs ?? []
}

function instagramTileUrls() {
  return ((draft.content as { tiles?: Array<{ imageUrl: string }> }).tiles ?? []).map((t) => t.imageUrl)
}

function setInstagramTiles(urls: string[]) {
  ;(draft.content as { tiles: Array<{ id: string; imageUrl: string }> }).tiles = urls.map((imageUrl, index) => ({
    id: String(index),
    imageUrl,
  }))
}

function addHeroSlide() {
  heroContent.value.slides.push({
    id: `slide-${Date.now()}`,
    imageUrl: '',
    eyebrow: '',
    heading: 'New slide',
    subheading: '',
    ctaLabel: 'Shop',
    ctaTarget: { kind: 'catalogue' },
  })
}

function removeHeroSlide(index: number) {
  heroContent.value.slides.splice(index, 1)
}

function setTileImage(id: string, urls: string[]) {
  const overrides = { ...(taxonomyContent.value.tileImageOverrides ?? {}) }
  const url = urls[urls.length - 1]
  if (url) overrides[id] = url
  else delete overrides[id]
  taxonomyContent.value.tileImageOverrides = overrides
}

function addParagraph() {
  const content = draft.content as { bodyParagraphs: string[] }
  content.bodyParagraphs = [...(content.bodyParagraphs ?? []), '']
}

function onSave() {
  emit('save', JSON.parse(JSON.stringify(draft)) as HomepageSection)
}
</script>

<template>
  <form class="space-y-4" data-testid="section-editor" @submit.prevent="onSave">
    <label class="block text-sm">
      <span class="mb-1 block text-neutral-700">Title</span>
      <input v-model="draft.title" data-testid="section-title" class="w-full rounded-md border border-neutral-300 px-3 py-2" />
    </label>
    <label class="block text-sm">
      <span class="mb-1 block text-neutral-700">Subtitle</span>
      <input v-model="draft.subtitle" class="w-full rounded-md border border-neutral-300 px-3 py-2" />
    </label>
    <div class="grid gap-3 sm:grid-cols-2">
      <label class="block text-sm">
        <span class="mb-1 block text-neutral-700">Anchor id</span>
        <input v-model="draft.anchorId" class="w-full rounded-md border border-neutral-300 px-3 py-2" />
      </label>
      <label class="block text-sm">
        <span class="mb-1 block text-neutral-700">Icon</span>
        <input v-model="draft.icon" class="w-full rounded-md border border-neutral-300 px-3 py-2" />
      </label>
    </div>

    <template v-if="draft.type === 'hero_banner'">
      <div v-for="(slide, index) in heroContent.slides" :key="slide.id" class="rounded-lg border border-neutral-200 p-4">
        <p class="mb-2 text-sm font-medium">Slide {{ index + 1 }}</p>
        <PhotoUploader
          :model-value="slide.imageUrl ? [slide.imageUrl] : []"
          :folder="`section-media/${draft.id}/hero`"
          @update:model-value="(urls) => (slide.imageUrl = urls[urls.length - 1] ?? '')"
        />
        <input v-model="slide.eyebrow" class="mt-2 w-full rounded-md border px-3 py-2 text-sm" placeholder="Eyebrow" />
        <input v-model="slide.heading" class="mt-2 w-full rounded-md border px-3 py-2 text-sm" placeholder="Heading" />
        <input v-model="slide.subheading" class="mt-2 w-full rounded-md border px-3 py-2 text-sm" placeholder="Subheading" />
        <input v-model="slide.ctaLabel" class="mt-2 w-full rounded-md border px-3 py-2 text-sm" placeholder="CTA label" />
        <select :value="ctaValue(slide.ctaTarget)" class="mt-2 w-full rounded-md border px-3 py-2 text-sm" @change="setCta(index, ($event.target as HTMLSelectElement).value)">
          <option value="bridal">Filter bridal</option>
          <option value="catalogue">Scroll to catalogue</option>
          <option value="shop-the-visuals">Scroll to visuals</option>
          <option value="founders-favourites">Scroll to founder favourites</option>
        </select>
        <button type="button" class="mt-2 text-xs text-red-600" @click="removeHeroSlide(index)">Remove slide</button>
      </div>
      <button type="button" class="rounded-md border px-3 py-1.5 text-sm" @click="addHeroSlide">+ Add slide</button>
    </template>

    <template v-if="draft.type === 'video_carousel'">
      <VideoUploader
        :model-value="(draft.content as VideoCarouselContent).videos ?? []"
        :section-id="draft.id"
        @update:model-value="setVideos"
      />
    </template>

    <template v-if="draft.type === 'product_carousel'">
      <label class="block text-sm">
        <span class="mb-1 block">Layout</span>
        <select v-model="productContent.variant" class="w-full rounded-md border px-3 py-2">
          <option value="carousel">Product carousel</option>
          <option value="bridal">Bridal spotlight</option>
        </select>
      </label>
      <label class="block text-sm">
        <span class="mb-1 block">How products are chosen</span>
        <select v-model="draft.productSelectionMode" class="w-full rounded-md border px-3 py-2" data-testid="product-selection-mode">
          <option value="flag">By product flag</option>
          <option value="manual">Hand-picked products</option>
        </select>
      </label>
      <label v-if="draft.productSelectionMode === 'flag'" class="block text-sm">
        <span class="mb-1 block">Flag</span>
        <select v-model="draft.productFlag" class="w-full rounded-md border px-3 py-2" data-testid="product-flag">
          <option v-for="(label, flag) in PRODUCT_FLAG_LABELS" :key="flag" :value="flag">{{ label }}</option>
        </select>
      </label>
      <ProductPicker v-else v-model="draft.productIds!" />
      <template v-if="productContent.variant === 'bridal'">
        <input v-model="productContent.bannerEyebrow" class="w-full rounded-md border px-3 py-2 text-sm" placeholder="Banner eyebrow" />
        <input v-model="productContent.bannerHeading" class="w-full rounded-md border px-3 py-2 text-sm" placeholder="Banner heading" />
        <textarea v-model="productContent.bannerBody" class="w-full rounded-md border px-3 py-2 text-sm" placeholder="Banner body" />
        <input v-model="productContent.bannerCtaLabel" class="w-full rounded-md border px-3 py-2 text-sm" placeholder="Banner CTA" />
        <PhotoUploader
          :model-value="productContent.bannerImageUrl ? [productContent.bannerImageUrl] : []"
          :folder="`section-media/${draft.id}/banner`"
          @update:model-value="(urls) => (productContent.bannerImageUrl = urls[urls.length - 1] ?? '')"
        />
      </template>
    </template>

    <template v-if="draft.type === 'style_tiles' || draft.type === 'category_grid' || draft.type === 'collection_tiles'">
      <p class="text-sm text-neutral-600">Optional tile images. Leave blank to use the default jewelry photo.</p>
      <div v-for="item in taxonomyItems" :key="item.id" class="rounded-md border border-neutral-200 p-3">
        <p class="mb-2 text-sm font-medium">{{ item.name }}</p>
        <PhotoUploader
          :model-value="taxonomyContent.tileImageOverrides?.[item.id] ? [taxonomyContent.tileImageOverrides[item.id]!] : []"
          :folder="`section-media/${draft.id}/tiles`"
          @update:model-value="(urls) => setTileImage(item.id, urls)"
        />
      </div>
    </template>

    <template v-if="draft.type === 'about'">
      <input v-model="(draft.content as { eyebrow?: string }).eyebrow" class="w-full rounded-md border px-3 py-2 text-sm" placeholder="Eyebrow" />
      <textarea
        v-for="(_, index) in aboutParagraphs()"
        :key="index"
        v-model="(draft.content as { bodyParagraphs: string[] }).bodyParagraphs[index]"
        class="w-full rounded-md border px-3 py-2 text-sm"
      />
      <button type="button" class="text-sm text-amore-gold" @click="addParagraph">+ Add paragraph</button>
      <PhotoUploader
        :model-value="(draft.content as { imageUrl?: string }).imageUrl ? [(draft.content as { imageUrl?: string }).imageUrl!] : []"
        :folder="`section-media/${draft.id}/about`"
        @update:model-value="(urls) => ((draft.content as { imageUrl?: string }).imageUrl = urls[urls.length - 1] ?? '')"
      />
    </template>

    <template v-if="draft.type === 'studio_location'">
      <input v-model="studioContent.eyebrow" class="w-full rounded-md border px-3 py-2 text-sm" placeholder="Eyebrow" />
      <input v-model="studioContent.address" class="w-full rounded-md border px-3 py-2 text-sm" placeholder="Address" />
      <input v-model="studioContent.mapUrl" class="w-full rounded-md border px-3 py-2 text-sm" placeholder="Map URL" />
      <textarea
        v-for="(_, index) in studioContent.bodyParagraphs ?? []"
        :key="index"
        v-model="studioContent.bodyParagraphs![index]"
        class="w-full rounded-md border px-3 py-2 text-sm"
      />
      <PhotoUploader
        :model-value="studioContent.imageUrl ? [studioContent.imageUrl] : []"
        :folder="`section-media/${draft.id}/studio`"
        @update:model-value="(urls) => (studioContent.imageUrl = urls[urls.length - 1] ?? '')"
      />
    </template>

    <template v-if="draft.type === 'contact'">
      <textarea
        v-for="(_, index) in contactParagraphs()"
        :key="index"
        v-model="(draft.content as { bodyParagraphs: string[] }).bodyParagraphs[index]"
        class="w-full rounded-md border px-3 py-2 text-sm"
      />
    </template>

    <template v-if="draft.type === 'instagram_gallery'">
      <p class="text-sm text-neutral-600">Upload gallery tiles. Each image becomes a tile that links to Instagram.</p>
      <PhotoUploader
        :model-value="instagramTileUrls()"
        :folder="`section-media/${draft.id}/instagram`"
        @update:model-value="setInstagramTiles"
      />
    </template>

    <div class="flex gap-3 pt-2">
      <button type="submit" data-testid="save-section" class="rounded-md bg-neutral-900 px-4 py-2 text-sm text-white">Save section</button>
      <button type="button" class="rounded-md border px-4 py-2 text-sm" @click="emit('cancel')">Cancel</button>
    </div>
  </form>
</template>
