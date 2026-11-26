import { computed, ref } from "vue";
import { useDataset } from "~/composables/useDataset";
import type {
  AlgorithmMode,
  BenchmarkRow,
  BenchmarkScenario,
  BenchmarkWorkerRequest,
  BenchmarkWorkerResponse,
  DatasetSource,
  InputSizeMode,
  SampleMatchItem,
  SimulationConfig,
} from "~/types/benchmark";

const PRODUCT_BATCH_STEPS = [
  10, 100, 1000, 10000, 50000, 100000, 150000, 200000, 250000, 500000, 1000000,
];
const CATEGORY_BATCH_STEPS = [10, 25, 50, 100, 150, 200];

/**
 * Membentuk deret Batch N yang selalu diakhiri dengan batas maksimal aktual dataset aktif
 * (misalnya N = 1.426.337 untuk seluruh produk CSV atau N = 248 untuk kategori).
 */
export function buildBatchSizes(maxN: number, source: DatasetSource): number[] {
  if (maxN <= 0) {
    return [];
  }

  const base =
    source === "products" ? PRODUCT_BATCH_STEPS : CATEGORY_BATCH_STEPS;
  const filtered = base.filter((size) => size < maxN);

  if (filtered.length === 0) {
    const steps = [1, Math.ceil(maxN * 0.25), Math.ceil(maxN * 0.5), maxN];
    return Array.from(new Set(steps.filter((n) => n >= 1 && n <= maxN))).sort(
      (a, b) => a - b,
    );
  }

  filtered.push(maxN);
  return Array.from(new Set(filtered)).sort((a, b) => a - b);
}

/**
 * Membentuk tombol preset Satuan (Single N) dengan tombol paling kanan selalu berupa
 * jumlah maksimum data aktual pada dataset/filter yang sedang dipilih.
 */
export function buildSinglePresets(
  maxN: number,
  source: DatasetSource,
): number[] {
  if (maxN <= 0) {
    return [];
  }

  const candidates =
    source === "products"
      ? [
          10, 100, 1000, 10000, 50000, 100000, 150000, 200000, 250000, 500000,
          1000000,
        ]
      : [10, 50, 100, 200];

  const valid = candidates.filter((size) => size < maxN);
  valid.push(maxN);
  return Array.from(new Set(valid)).sort((a, b) => a - b);
}

/**
 * Composable untuk mengelola konfigurasi simulasi, Web Worker persisten (cache chunk),
 * riwayat hasil benchmark, ekspor CSV, dan aksi reset/ulangi.
 */
export function useSimulation() {
  const {
    categories,
    totalProducts,
    totalCategories,
    productsJsonUrl,
    isDatasetReady,
    getProductCountByCategory,
    getCategoryName,
  } = useDataset();

  const config = ref<SimulationConfig>({
    source: "products",
    selectedCategoryId: null,
    keyword: "Samsung",
    method: "both",
    scenario: "average",
    caseInsensitive: true,
    sizeMode: "batch",
    singleN: 1000,
    batchSizes: [...PRODUCT_BATCH_STEPS],
  });

  const results = ref<BenchmarkRow[]>([]);
  const sampleMatches = ref<SampleMatchItem[]>([]);
  const totalMatchesLastRun = ref(0);
  const isRunning = ref(false);
  const progressPercent = ref(0);
  const currentRunningN = ref(0);
  const statusText = ref("");
  const validationError = ref<string | null>(null);
  const workerError = ref<string | null>(null);

  let persistentWorker: Worker | null = null;

  const activeMaxN = computed<number>(() => {
    if (config.value.scenario === "worst") {
      return config.value.source === "products"
        ? Math.max(totalProducts.value, 50000)
        : Math.max(totalCategories.value, 248);
    }

    if (config.value.source === "categories") {
      return totalCategories.value;
    }

    return getProductCountByCategory(config.value.selectedCategoryId);
  });

  const activeSinglePresets = computed<number[]>(() =>
    buildSinglePresets(activeMaxN.value, config.value.source),
  );

  const activeBatchSizes = computed<number[]>(() =>
    buildBatchSizes(activeMaxN.value, config.value.source),
  );

  const latestRow = computed<BenchmarkRow | null>(() => {
    if (results.value.length === 0) {
      return null;
    }
    return results.value[results.value.length - 1] ?? null;
  });

  function clearResults(): void {
    results.value = [];
    sampleMatches.value = [];
    totalMatchesLastRun.value = 0;
  }

  function selectSource(source: DatasetSource): void {
    if (isRunning.value) {
      cancelSimulation();
    }
    if (config.value.source !== source) {
      clearResults();
    }

    config.value.source = source;
    config.value.selectedCategoryId = null;
    validationError.value = null;
    workerError.value = null;

    if (config.value.scenario === "average") {
      config.value.keyword = source === "products" ? "Samsung" : "Electronics";
    }

    const maxN = activeMaxN.value;
    if (maxN > 0) {
      config.value.singleN = Math.min(source === "products" ? 1000 : 100, maxN);
    }
    config.value.batchSizes = buildBatchSizes(maxN, source);
  }

  function selectCategory(categoryId: number | null): void {
    if (isRunning.value) {
      cancelSimulation();
    }
    if (config.value.selectedCategoryId !== categoryId) {
      clearResults();
    }

    config.value.selectedCategoryId = categoryId;
    validationError.value = null;
    workerError.value = null;

    const maxN = activeMaxN.value;
    if (maxN > 0 && config.value.singleN > maxN) {
      config.value.singleN = maxN;
    }
    config.value.batchSizes = buildBatchSizes(maxN, config.value.source);
  }

  function setScenario(scenario: BenchmarkScenario): void {
    if (isRunning.value) {
      cancelSimulation();
    }
    if (config.value.scenario !== scenario) {
      clearResults();
    }

    config.value.scenario = scenario;
    validationError.value = null;
    workerError.value = null;

    if (scenario === "best") {
      config.value.keyword = "ZZZXYZ";
    } else if (scenario === "worst") {
      config.value.keyword = "AAAAAAAB";
    } else {
      config.value.keyword =
        config.value.source === "products" ? "Samsung" : "Electronics";
    }
  }

  function setMethod(method: AlgorithmMode): void {
    config.value.method = method;
  }

  function setSizeMode(mode: InputSizeMode): void {
    if (isRunning.value) {
      cancelSimulation();
    }
    if (config.value.sizeMode !== mode) {
      clearResults();
    }
    config.value.sizeMode = mode;
    validationError.value = null;
    workerError.value = null;
  }

  function validateBeforeRun(): number[] | null {
    validationError.value = null;
    workerError.value = null;

    if (config.value.scenario !== "worst" && !isDatasetReady.value) {
      validationError.value =
        "Dataset belum siap. Pastikan manifest & chunk tersedia di public/data/ (atau pilih skenario Worst Case sintetik).";
      return null;
    }

    const trimmedKeyword = config.value.keyword.trim();
    if (trimmedKeyword.length === 0) {
      validationError.value = "Kata kunci / nama merek tidak boleh kosong.";
      return null;
    }

    const maxN = activeMaxN.value;
    if (maxN < 1) {
      validationError.value =
        "Jumlah data tersedia adalah 0. Ubah sumber data atau filter kategori.";
      return null;
    }

    if (config.value.sizeMode === "single") {
      const n = Math.floor(Number(config.value.singleN));
      if (!Number.isFinite(n) || n < 1 || n > maxN) {
        validationError.value = `Ukuran masukan N harus berada di antara 1 hingga ${maxN.toLocaleString("id-ID")}.`;
        return null;
      }
      return [n];
    }

    const sizes = activeBatchSizes.value.filter((n) => n >= 1 && n <= maxN);
    if (sizes.length === 0) {
      validationError.value =
        "Tidak ada ukuran batch valid untuk dataset aktif.";
      return null;
    }

    return sizes;
  }

  function terminateWorker(): void {
    if (persistentWorker) {
      persistentWorker.terminate();
      persistentWorker = null;
    }
  }

  function getOrCreateWorker(): Worker {
    if (!persistentWorker) {
      persistentWorker = new Worker(
        new URL("../workers/benchmark.worker.ts", import.meta.url),
        {
          type: "module",
        },
      );
    }
    return persistentWorker;
  }

  function cancelSimulation(): void {
    terminateWorker();
    isRunning.value = false;
    progressPercent.value = 0;
    currentRunningN.value = 0;
    statusText.value = "";
  }

  function runSimulation(onComplete?: () => void): void {
    if (isRunning.value) {
      return;
    }

    const sizes = validateBeforeRun();
    if (!sizes) {
      return;
    }

    let sourceLabel = "Produk";
    let categoryLabel = "Semua Kategori";

    if (config.value.scenario === "worst") {
      sourceLabel =
        config.value.source === "products"
          ? "Produk (Worst Case)"
          : "Kategori (Worst Case)";
      categoryLabel = "Sintetik AAA...B";
    } else if (config.value.source === "products") {
      sourceLabel = "Produk";
      categoryLabel =
        config.value.selectedCategoryId === null
          ? "Semua Kategori"
          : getCategoryName(config.value.selectedCategoryId);
    } else {
      sourceLabel = "Kategori";
      categoryLabel = "Daftar Kategori";
    }

    // Bersihkan hasil sebelumnya agar Single N hanya menampilkan 1 titik hasil eksekusi langsung
    // dan Batch selalu menampilkan kurva bertahap yang baru
    clearResults();

    isRunning.value = true;
    progressPercent.value = 5;
    currentRunningN.value = sizes[0] ?? 0;
    statusText.value = "Menyiapkan Web Worker...";

    const worker = getOrCreateWorker();

    worker.onmessage = (event: MessageEvent<BenchmarkWorkerResponse>) => {
      const message = event.data;

      if (message.type === "progress") {
        currentRunningN.value = message.currentN;
        statusText.value = message.statusText;
        const ratio =
          message.totalSteps > 0
            ? Math.round((message.completedSteps / message.totalSteps) * 100)
            : 100;
        progressPercent.value = Math.max(8, Math.min(100, ratio));
      } else if (message.type === "row") {
        // Ganti baris dengan N yang sama agar tidak terjadi duplikasi titik N pada grafik
        const filtered = results.value.filter(
          (item) => item.inputSize !== message.row.inputSize,
        );
        results.value = [...filtered, message.row].sort(
          (a, b) => a.inputSize - b.inputSize,
        );
      } else if (message.type === "complete") {
        sampleMatches.value = message.samples;
        totalMatchesLastRun.value = message.totalMatchesLastRun;
        progressPercent.value = 100;
        statusText.value = "";
        isRunning.value = false;

        setTimeout(() => {
          progressPercent.value = 0;
        }, 350);

        if (onComplete) {
          onComplete();
        }
      } else if (message.type === "error") {
        workerError.value = message.message;
        isRunning.value = false;
        progressPercent.value = 0;
        statusText.value = "";
      }
    };

    worker.onerror = (err: ErrorEvent) => {
      workerError.value =
        err.message || "Gagal menjalankan Web Worker benchmark.";
      isRunning.value = false;
      progressPercent.value = 0;
      statusText.value = "";
      terminateWorker();
    };

    const requestPayload: BenchmarkWorkerRequest = {
      source: config.value.source,
      sourceLabel,
      categoryLabel,
      selectedCategoryId: config.value.selectedCategoryId,
      productsJsonUrl: productsJsonUrl.value,
      totalProducts: totalProducts.value,
      categories: categories.value.map((cat) => ({
        id: cat.id,
        category_name: cat.category_name,
      })),
      keyword: config.value.keyword.trim(),
      method: config.value.method,
      scenario: config.value.scenario,
      caseInsensitive: config.value.caseInsensitive,
      sizes,
    };

    worker.postMessage(requestPayload);
  }

  function resetAll(): void {
    cancelSimulation();
    results.value = [];
    sampleMatches.value = [];
    totalMatchesLastRun.value = 0;
    validationError.value = null;
    workerError.value = null;
    config.value = {
      source: "products",
      selectedCategoryId: null,
      keyword: "Samsung",
      method: "both",
      scenario: "average",
      caseInsensitive: true,
      sizeMode: "batch",
      singleN: Math.min(1000, Math.max(totalProducts.value, 1)),
      batchSizes: buildBatchSizes(totalProducts.value, "products"),
    };
  }

  function exportCsv(): void {
    if (results.value.length === 0) {
      return;
    }

    const headers = [
      "Sumber",
      "Filter Kategori",
      "Kata Kunci",
      "Skenario",
      "Metode",
      "N",
      "Total Karakter",
      "Frekuensi Iteratif",
      "Frekuensi Rekursif",
      "Valid",
      "Iteratif (ms)",
      "Rekursif (ms)",
      "Rasio (Rek/Iter)",
      "Operasi Karakter Iteratif",
      "Operasi Karakter Rekursif",
    ];

    const escapeCell = (val: string | number | boolean | null): string => {
      if (val === null) return "";
      const str = String(val);
      if (str.includes(",") || str.includes('"') || str.includes("\n")) {
        return `"${str.replace(/"/g, '""')}"`;
      }
      return str;
    };

    const lines = [headers.join(",")];
    for (const row of results.value) {
      lines.push(
        [
          row.sourceLabel,
          row.categoryLabel,
          row.keyword,
          row.scenario,
          row.method,
          row.inputSize,
          row.totalChars,
          row.frequencyIterative,
          row.frequencyRecursive,
          row.isMatchValid ? "VALID" : "MISMATCH",
          row.iterativeMs !== null ? row.iterativeMs.toFixed(4) : "",
          row.recursiveMs !== null ? row.recursiveMs.toFixed(4) : "",
          row.speedupRatio !== null ? `${row.speedupRatio.toFixed(2)}x` : "",
          row.operationsIterative,
          row.operationsRecursive,
        ]
          .map(escapeCell)
          .join(","),
      );
    }

    const blob = new Blob([lines.join("\n")], {
      type: "text/csv;charset=utf-8;",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `amazon-brand-matcher-benchmark-${Date.now()}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  return {
    config,
    results,
    sampleMatches,
    totalMatchesLastRun,
    latestRow,
    isRunning,
    progressPercent,
    currentRunningN,
    statusText,
    validationError,
    workerError,
    activeMaxN,
    activeSinglePresets,
    activeBatchSizes,
    selectSource,
    selectCategory,
    setScenario,
    setMethod,
    setSizeMode,
    runSimulation,
    cancelSimulation,
    resetAll,
    exportCsv,
  };
}
