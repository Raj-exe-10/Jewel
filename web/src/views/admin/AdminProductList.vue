<script setup lang="ts">
import { onMounted, ref } from 'vue'
import AdminLayout from '../../components/admin/AdminLayout.vue'
import ConfirmDeleteDialog from '../../components/admin/ConfirmDeleteDialog.vue'
import ProductForm from '../../components/admin/ProductForm.vue'
import { useCatalogueStore } from '../../stores/catalogue'
import type { Product } from '../../types/catalogue'

const catalogue = useCatalogueStore()

const isFormOpen = ref(false)
const editingProduct = ref<Product | null>(null)
const pendingDelete = ref<Product | null>(null)
const deleteError = ref<string | null>(null)

onMounted(() => {
  catalogue.subscribeToCatalogue()
})

function openCreateForm() {
  editingProduct.value = null
  isFormOpen.value = true
}

function openEditForm(product: Product) {
  editingProduct.value = product
  isFormOpen.value = true
}

function onSaved() {
  isFormOpen.value = false
  editingProduct.value = null
}

function categoryNameFor(categoryId: string): string {
  return catalogue.categories.find((c) => c.id === categoryId)?.name ?? 'Uncategorized'
}

async function confirmDelete() {
  if (!pendingDelete.value) return
  deleteError.value = null
  try {
    await catalogue.deleteProduct(pendingDelete.value.id)
    pendingDelete.value = null
  } catch {
    deleteError.value = 'Could not delete this product. Please check your connection and try again.'
  }
}
</script>

<template>
  <AdminLayout>
    <div class="mb-8 flex items-center justify-between">
      <h1 class="font-display text-2xl">Products</h1>
      <button
        type="button"
        data-testid="add-product-button"
        class="rounded-md bg-neutral-900 px-4 py-2 text-sm font-medium text-white"
        @click="openCreateForm"
      >
        + Add Product
      </button>
    </div>

    <div
      v-if="isFormOpen"
      data-testid="product-form-modal"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      role="dialog"
      aria-modal="true"
      aria-label="Product form"
    >
      <div class="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-lg bg-white p-6 shadow-xl">
        <div class="mb-4 flex items-center justify-between gap-3">
          <h2 class="font-medium">{{ editingProduct ? 'Edit Product' : 'New Product' }}</h2>
          <button
            type="button"
            data-testid="close-product-form"
            class="rounded-md border border-neutral-300 px-3 py-1.5 text-sm"
            @click="onSaved"
          >
            Close
          </button>
        </div>
        <ProductForm :key="editingProduct?.id ?? 'new'" :editing="editingProduct" @saved="onSaved" />
      </div>
    </div>

    <ul data-testid="product-list" class="mb-12 divide-y divide-neutral-200 rounded-lg border border-neutral-200 bg-white">
      <li
        v-for="product in catalogue.products"
        :key="product.id"
        class="flex items-center justify-between gap-4 px-4 py-3"
      >
        <div class="flex items-center gap-3">
          <img :src="product.photoUrls[0]" :alt="product.name" class="h-12 w-12 rounded object-cover" />
          <div>
            <p class="font-medium">{{ product.name }}</p>
            <p class="text-xs text-neutral-500">
              {{ categoryNameFor(product.categoryId) }} &middot; ₹{{ product.priceInr.toLocaleString('en-IN') }}
            </p>
          </div>
        </div>
        <div class="flex gap-2">
          <button
            type="button"
            :data-testid="`edit-product-${product.id}`"
            class="rounded-md border border-neutral-300 px-3 py-1.5 text-sm"
            @click="openEditForm(product)"
          >
            Edit
          </button>
          <button
            type="button"
            :data-testid="`delete-product-${product.id}`"
            class="rounded-md border border-red-300 px-3 py-1.5 text-sm text-red-600"
            @click="pendingDelete = product"
          >
            Delete
          </button>
        </div>
      </li>
      <li v-if="catalogue.products.length === 0" class="px-4 py-8 text-center text-sm text-neutral-500">
        No products yet. Click "Add Product" to create your first one.
      </li>
    </ul>
    <p v-if="deleteError" class="-mt-8 mb-8 text-sm text-red-600">{{ deleteError }}</p>

    <ConfirmDeleteDialog
      :open="pendingDelete !== null"
      :item-label="pendingDelete?.name ?? ''"
      @confirm="confirmDelete"
      @cancel="pendingDelete = null"
    />
  </AdminLayout>
</template>
