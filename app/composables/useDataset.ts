import { computed, ref } from 'vue'
import type { CategoryOption, CategoryRecord, ProductsMetaManifest } from '~/types/benchmark'

const categories = ref<CategoryRecord[]>([])
const productsMeta = ref<ProductsMetaManifest | null>(null)
const isLoadingDataset = ref(false)
const isDatasetReady = ref(false)
const datasetError = ref<string | null>(null)
const hasAttemptedLoad = ref(false)

/**
 * Composable untuk memuat manifest ringan (amazon_products_meta.json + amazon_categories.json)
 * di main thread (~13 KB), sementara 1,42 juta baris produk dimuat secara lazy di Web Worker.
 */
export function useDataset() {
  const categoryNameMap = computed<Map<number, string>>(() => {
    const map = new Map<number, string>()
    for (const cat of categories.value) {
      map.set(cat.id, cat.category_name)
    }
    return map
  })

  const categoryOptions = computed<CategoryOption[]>(() => {
    const counts = productsMeta.value?.categoryCounts ?? {}

    return categories.value
      .map((cat) => ({
        id: cat.id,
        name: cat.category_name,
        productCount: counts[String(cat.id)] ?? 0
      }))
      .filter((option) => option.productCount > 0)
      .sort((a, b) => b.productCount - a.productCount)
  })

  const totalProducts = computed(() => productsMeta.value?.totalProducts ?? 0)
  const totalCategories = computed(() => categories.value.length)
  const chunkUrls = computed<string[]>(() => productsMeta.value?.chunks ?? [])
  const chunkCount = computed(() => productsMeta.value?.chunkCount ?? 0)

  async function loadDatasets(forceReload = false): Promise<void> {
    if (isLoadingDataset.value) {
      return
    }
    if (hasAttemptedLoad.value && isDatasetReady.value && !forceReload) {
      return
    }

    isLoadingDataset.value = true
    datasetError.value = null
    hasAttemptedLoad.value = true

    try {
      const [metaResponse, categoriesResponse] = await Promise.all([
        fetch('/data/amazon_products_meta.json'),
        fetch('/data/amazon_categories.json')
      ])

      if (!metaResponse.ok || !categoriesResponse.ok) {
        throw new Error(
          'File manifest dataset belum tersedia di public/data/. Letakkan amazon_products.csv dan amazon_categories.csv lalu jalankan `yarn preprocess`.'
        )
      }

      const [metaJson, categoriesJson]: [unknown, unknown] = await Promise.all([
        metaResponse.json(),
        categoriesResponse.json()
      ])

      const parsedMeta = metaJson as ProductsMetaManifest
      if (
        !parsedMeta ||
        typeof parsedMeta.totalProducts !== 'number' ||
        !Array.isArray(parsedMeta.chunks) ||
        !Array.isArray(categoriesJson)
      ) {
        throw new Error('Format manifest dataset di public/data/ tidak valid.')
      }

      productsMeta.value = parsedMeta
      categories.value = categoriesJson as CategoryRecord[]
      isDatasetReady.value = parsedMeta.totalProducts > 0 && categories.value.length > 0

      if (!isDatasetReady.value) {
        datasetError.value = 'Dataset berhasil dibaca namun kosong.'
      }
    } catch (error: unknown) {
      isDatasetReady.value = false
      datasetError.value =
        error instanceof Error
          ? error.message
          : 'Gagal memuat manifest dataset statis dari public/data/.'
    } finally {
      isLoadingDataset.value = false
    }
  }

  function getProductCountByCategory(categoryId: number | null): number {
    if (categoryId === null) {
      return totalProducts.value
    }
    return productsMeta.value?.categoryCounts[String(categoryId)] ?? 0
  }

  function getCategoryName(categoryId: number): string {
    return categoryNameMap.value.get(categoryId) ?? `Kategori #${categoryId}`
  }

  return {
    categories,
    categoryOptions,
    totalProducts,
    totalCategories,
    chunkUrls,
    chunkCount,
    isLoadingDataset,
    isDatasetReady,
    datasetError,
    loadDatasets,
    getProductCountByCategory,
    getCategoryName
  }
}
