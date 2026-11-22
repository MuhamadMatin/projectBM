import { collectSampleMatches, naiveStringMatchIterative } from '../algorithms/naiveIterative'
import { naiveStringMatchRecursive } from '../algorithms/naiveRecursive'
import type {
  AlgorithmExecutionResult,
  BenchmarkRow,
  BenchmarkScenario,
  BenchmarkWorkerRequest,
  BenchmarkWorkerResponse,
  CategoryRecord,
  SampleMatchItem,
  WorkerInputItem
} from '../types/benchmark'

const WORST_CASE_TEXT_LENGTH = 60

// Cache data chunk langsung di memori Web Worker agar tidak membebani main thread
// dan tidak perlu mengunduh ulang pada simulasi berikutnya.
let loadedChunkCount = 0
const cachedProductTitles: string[] = []
const cachedProductCategoryIds: number[] = []

function postWorkerMessage(payload: BenchmarkWorkerResponse): void {
  self.postMessage(payload)
}

/**
 * Mengunduh chunk TSV produk secara bertahap hanya sampai kebutuhan ukuran N terpenuhi.
 */
async function ensureProductChunksLoaded(
  chunkUrls: string[],
  neededCount: number,
  selectedCategoryId: number | null
): Promise<void> {
  const totalChunks = chunkUrls.length

  const countMatchingLoaded = (): number => {
    if (selectedCategoryId === null) {
      return cachedProductTitles.length
    }
    let count = 0
    for (let i = 0; i < cachedProductCategoryIds.length; i++) {
      if (cachedProductCategoryIds[i] === selectedCategoryId) {
        count++
      }
    }
    return count
  }

  while (loadedChunkCount < totalChunks && countMatchingLoaded() < neededCount) {
    const chunkUrl = chunkUrls[loadedChunkCount]
    if (!chunkUrl) break

    postWorkerMessage({
      type: 'progress',
      completedSteps: loadedChunkCount,
      totalSteps: totalChunks,
      currentN: 0,
      statusText: `Memuat chunk data ${loadedChunkCount + 1}/${totalChunks}...`
    })

    const response = await fetch(chunkUrl)
    if (!response.ok) {
      throw new Error(`Gagal mengunduh chunk dataset: ${chunkUrl}`)
    }

    const rawText = await response.text()
    const lines = rawText.split('\n')

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i]
      if (!line) continue
      const tabPos = line.indexOf('\t')
      if (tabPos === -1) continue

      const catId = Number.parseInt(line.slice(0, tabPos), 10)
      const title = line.slice(tabPos + 1)
      if (!Number.isNaN(catId) && title.length > 0) {
        cachedProductCategoryIds.push(catId)
        cachedProductTitles.push(title)
      }
    }

    loadedChunkCount++
  }
}

/**
 * Menentukan jumlah pengulangan eksekusi (R) agar pengukuran pada ukuran N kecil
 * tetap presisi dan tidak terbaca 0 ms, sembari menjaga perbandingan iteratif vs rekursif adil.
 */
function getRepeatCount(size: number, scenario: BenchmarkScenario): number {
  if (scenario === 'worst') {
    if (size <= 50) return 10
    if (size <= 200) return 3
    return 1
  }

  if (size <= 50) return 100
  if (size <= 200) return 50
  if (size <= 1000) return 10
  return 1
}

function buildCategoryMap(categories: CategoryRecord[]): Map<number, string> {
  const map = new Map<number, string>()
  for (let i = 0; i < categories.length; i++) {
    const cat = categories[i]
    if (cat) {
      map.set(cat.id, cat.category_name)
    }
  }
  return map
}

/**
 * Menyiapkan potongan array teks uji sebelum timer dimulai agar pengukuran waktu
 * benar-benar terisolasi hanya pada algoritma Naive String Matching.
 */
function preparePool(
  request: BenchmarkWorkerRequest,
  maxNeededN: number
): {
  rawTitles: string[]
  rawCategories: string[]
} {
  if (request.scenario === 'worst') {
    return { rawTitles: [], rawCategories: [] }
  }

  if (request.source === 'categories') {
    const slice = request.categories.slice(0, maxNeededN)
    const rawTitles: string[] = []
    const rawCategories: string[] = []
    for (let i = 0; i < slice.length; i++) {
      const cat = slice[i]
      if (cat) {
        rawTitles.push(cat.category_name)
        rawCategories.push('Taksonomi Kategori')
      }
    }
    return { rawTitles, rawCategories }
  }

  const categoryMap = buildCategoryMap(request.categories)
  const rawTitles: string[] = []
  const rawCategories: string[] = []

  if (request.selectedCategoryId === null) {
    const limit = Math.min(maxNeededN, cachedProductTitles.length)
    for (let i = 0; i < limit; i++) {
      const title = cachedProductTitles[i] ?? ''
      const catId = cachedProductCategoryIds[i] ?? 0
      rawTitles.push(title)
      rawCategories.push(categoryMap.get(catId) ?? `Kategori #${catId}`)
    }
  } else {
    const targetId = request.selectedCategoryId
    const targetName = categoryMap.get(targetId) ?? `Kategori #${targetId}`
    for (let i = 0; i < cachedProductTitles.length && rawTitles.length < maxNeededN; i++) {
      if (cachedProductCategoryIds[i] === targetId) {
        rawTitles.push(cachedProductTitles[i] ?? '')
        rawCategories.push(targetName)
      }
    }
  }

  return { rawTitles, rawCategories }
}

function prepareStepInputs(
  rawTitles: string[],
  size: number,
  keyword: string,
  scenario: BenchmarkScenario,
  caseInsensitive: boolean
): {
  texts: string[]
  pattern: string
} {
  if (scenario === 'worst') {
    const patternLen = Math.min(Math.max(keyword.length, 6), 10)
    const syntheticText = 'A'.repeat(WORST_CASE_TEXT_LENGTH)
    const syntheticPattern = 'A'.repeat(patternLen - 1) + 'B'
    const normalizedText = caseInsensitive ? syntheticText.toLowerCase() : syntheticText
    const normalizedPattern = caseInsensitive ? syntheticPattern.toLowerCase() : syntheticPattern

    const texts = new Array<string>(size).fill(normalizedText)
    return { texts, pattern: normalizedPattern }
  }

  const pattern = caseInsensitive ? keyword.toLowerCase() : keyword
  const slice = rawTitles.slice(0, size)
  const texts = caseInsensitive ? slice.map((item) => item.toLowerCase()) : slice

  return { texts, pattern }
}

function measureAlgorithm(
  runner: (texts: string[], pattern: string) => AlgorithmExecutionResult,
  texts: string[],
  pattern: string,
  repeats: number
): { result: AlgorithmExecutionResult; avgMs: number } {
  let lastResult: AlgorithmExecutionResult = { frequency: 0, operations: 0, totalChars: 0 }

  // Isolasi pengukuran waktu murni hanya pada eksekusi fungsi algoritma
  const start = performance.now()
  for (let r = 0; r < repeats; r++) {
    lastResult = runner(texts, pattern)
  }
  const elapsed = performance.now() - start

  return {
    result: lastResult,
    avgMs: elapsed / repeats
  }
}

self.onmessage = async (event: MessageEvent<BenchmarkWorkerRequest>) => {
  try {
    const request = event.data
    const {
      source,
      sourceLabel,
      categoryLabel,
      selectedCategoryId,
      chunkUrls,
      keyword,
      method,
      scenario,
      caseInsensitive,
      sizes
    } = request

    const maxNeededN = Math.max(...sizes, 0)

    if (scenario !== 'worst' && source === 'products') {
      await ensureProductChunksLoaded(chunkUrls, maxNeededN, selectedCategoryId)
    }

    const { rawTitles, rawCategories } = preparePool(request, maxNeededN)
    const totalSteps = sizes.length
    let finalSamples: SampleMatchItem[] = []
    let totalMatchesLastRun = 0

    for (let stepIndex = 0; stepIndex < totalSteps; stepIndex++) {
      const currentN = sizes[stepIndex] ?? 0
      if (currentN < 1) {
        continue
      }

      postWorkerMessage({
        type: 'progress',
        completedSteps: stepIndex,
        totalSteps,
        currentN,
        statusText: `Menjalankan N = ${currentN.toLocaleString('id-ID')}...`
      })

      const { texts, pattern } = prepareStepInputs(
        rawTitles,
        currentN,
        keyword,
        scenario,
        caseInsensitive
      )
      const repeats = getRepeatCount(currentN, scenario)

      let iterativeResult: AlgorithmExecutionResult | null = null
      let iterativeMs: number | null = null
      let recursiveResult: AlgorithmExecutionResult | null = null
      let recursiveMs: number | null = null

      if (method === 'iterative' || method === 'both') {
        const measured = measureAlgorithm(naiveStringMatchIterative, texts, pattern, repeats)
        iterativeResult = measured.result
        iterativeMs = measured.avgMs
      }

      if (method === 'recursive' || method === 'both') {
        const measured = measureAlgorithm(naiveStringMatchRecursive, texts, pattern, repeats)
        recursiveResult = measured.result
        recursiveMs = measured.avgMs
      }

      const frequencyIterative = iterativeResult ? iterativeResult.frequency : null
      const frequencyRecursive = recursiveResult ? recursiveResult.frequency : null
      const totalChars = iterativeResult
        ? iterativeResult.totalChars
        : recursiveResult
          ? recursiveResult.totalChars
          : 0

      // Validasi kecocokan hasil frekuensi iteratif vs rekursif (wajib 100% identik)
      const isMatchValid =
        method === 'both' ? frequencyIterative === frequencyRecursive : true

      const speedupRatio =
        iterativeMs !== null && recursiveMs !== null && iterativeMs > 0
          ? recursiveMs / iterativeMs
          : null

      const row: BenchmarkRow = {
        id: `${Date.now()}-${stepIndex}-${currentN}`,
        timestamp: Date.now(),
        source,
        sourceLabel,
        categoryLabel,
        keyword: scenario === 'worst' ? pattern : keyword,
        scenario,
        method,
        caseInsensitive,
        inputSize: currentN,
        totalChars,
        frequencyIterative,
        frequencyRecursive,
        isMatchValid,
        iterativeMs,
        recursiveMs,
        speedupRatio,
        operationsIterative: iterativeResult ? iterativeResult.operations : null,
        operationsRecursive: recursiveResult ? recursiveResult.operations : null,
        repeats
      }

      postWorkerMessage({ type: 'row', row })

      // Kumpulkan hingga 10 sampel hasil cocok pada titik N terakhir (di luar timer)
      if (stepIndex === totalSteps - 1) {
        totalMatchesLastRun = frequencyIterative ?? frequencyRecursive ?? 0
        if (scenario !== 'worst' && totalMatchesLastRun > 0) {
          const sampleRawItems: WorkerInputItem[] = []
          const sampleLimit = Math.min(currentN, rawTitles.length)
          for (let i = 0; i < sampleLimit; i++) {
            sampleRawItems.push({
              text: rawTitles[i] ?? '',
              categoryLabel: rawCategories[i] ?? ''
            })
          }
          finalSamples = collectSampleMatches(sampleRawItems, texts, pattern, 10)
        } else {
          finalSamples = []
        }
      }
    }

    postWorkerMessage({
      type: 'progress',
      completedSteps: totalSteps,
      totalSteps,
      currentN: sizes[totalSteps - 1] ?? 0,
      statusText: 'Simulasi selesai'
    })

    postWorkerMessage({
      type: 'complete',
      samples: finalSamples,
      totalMatchesLastRun
    })
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : 'Terjadi kesalahan saat menjalankan Web Worker.'
    postWorkerMessage({
      type: 'error',
      message
    })
  }
}
