<script setup lang="ts">
import { computed } from "vue";
import type {
  AlgorithmMode,
  BenchmarkScenario,
  CategoryOption,
  DatasetSource,
  InputSizeMode,
  SimulationConfig,
} from "~/types/benchmark";

const props = defineProps<{
  config: SimulationConfig;
  categoryOptions: CategoryOption[];
  totalProducts: number;
  totalCategories: number;
  activeMaxN: number;
  activeSinglePresets: number[];
  activeBatchSizes: number[];
  isRunning: boolean;
  progressPercent: number;
  currentRunningN: number;
  statusText: string;
  validationError: string | null;
  workerError: string | null;
}>();

const emit = defineEmits<{
  selectSource: [source: DatasetSource];
  selectCategory: [categoryId: number | null];
  updateKeyword: [keyword: string];
  updateCaseInsensitive: [value: boolean];
  selectMethod: [method: AlgorithmMode];
  selectScenario: [scenario: BenchmarkScenario];
  selectSizeMode: [mode: InputSizeMode];
  updateSingleN: [value: number];
  runSimulation: [];
  cancelSimulation: [];
  resetAll: [];
}>();

const PRODUCT_QUICK_CHIPS = ["Samsung", "Apple", "Sony", "Nike", "Logitech"];
const CATEGORY_QUICK_CHIPS = ["Electronics", "Shoes", "Toys", "Home", "Books"];

const quickChips = computed(() =>
  props.config.source === "products"
    ? PRODUCT_QUICK_CHIPS
    : CATEGORY_QUICK_CHIPS,
);

const keywordLabel = computed(() =>
  props.config.source === "products"
    ? "Nama Merek / Brand Substring"
    : "Kata Kunci Nama Kategori",
);

const scenarioNote = computed(() => {
  if (props.config.scenario === "best") {
    return "Best Case: Karakter pertama pola langsung tidak cocok di setiap awal perbandingan (O(n) runtime).";
  }
  if (props.config.scenario === "worst") {
    return "Worst Case: Karakter identik berulang (AAAA...AAB) memaksa perbandingan penuh m karakter tiap iterasi (O(n · m)).";
  }
  return "Average Case: Pola string produk e-commerce nyata dengan distribusi karakter acak alami.";
});

// Pemetaan persentase progres ke kelas lebar bawaan Tailwind CSS tanpa inline style
const progressWidthClass = computed(() => {
  const pct = props.progressPercent;
  if (pct <= 0) return "w-0";
  if (pct < 12) return "w-1/12";
  if (pct < 20) return "w-2/12";
  if (pct < 28) return "w-3/12";
  if (pct < 38) return "w-4/12";
  if (pct < 46) return "w-5/12";
  if (pct < 55) return "w-6/12";
  if (pct < 63) return "w-7/12";
  if (pct < 72) return "w-8/12";
  if (pct < 80) return "w-9/12";
  if (pct < 88) return "w-10/12";
  if (pct < 96) return "w-11/12";
  return "w-full";
});

function handleCategoryChange(event: Event): void {
  const target = event.target as HTMLSelectElement;
  if (target.value === "all") {
    emit("selectCategory", null);
    return;
  }
  const parsed = Number.parseInt(target.value, 10);
  emit("selectCategory", Number.isNaN(parsed) ? null : parsed);
}

function handleKeywordInput(event: Event): void {
  const target = event.target as HTMLInputElement;
  emit("updateKeyword", target.value);
}

function handleCaseToggle(event: Event): void {
  const target = event.target as HTMLInputElement;
  emit("updateCaseInsensitive", target.checked);
}

function handleSingleNInput(event: Event): void {
  const target = event.target as HTMLInputElement;
  const parsed = Number.parseInt(target.value, 10);
  emit("updateSingleN", Number.isNaN(parsed) ? 0 : parsed);
}
</script>

<template>
  <section
    id="simulasi"
    class="relative border-b border-zinc-200 dark:border-zinc-800 px-6 py-16 md:px-8 lg:px-14 bg-white dark:bg-zinc-950 transition-colors"
  >
    <!-- Indikator Progres Tipis (2px) -->
    <div
      class="absolute top-0 left-0 right-0 h-0.5 bg-zinc-100 dark:bg-zinc-800 overflow-hidden"
    >
      <div
        class="h-full bg-zinc-900 dark:bg-zinc-100 transition-all duration-300"
        :class="progressWidthClass"
      ></div>
    </div>

    <div class="max-w-4xl mx-auto flex flex-col gap-10">
      <!-- Header Seksi -->
      <div class="flex items-center justify-between pb-4">
        <div>
          <span
            class="font-mono text-xs uppercase text-zinc-500 dark:text-zinc-400 tracking-wider"
          >
            PANEL KONTROL SIMULASI
          </span>
          <h2
            class="text-2xl md:text-3xl font-light text-zinc-900 dark:text-zinc-50 tracking-tight mt-1"
          >
            Konfigurasi Pengujian Naive Matching
          </h2>
        </div>
      </div>

      <!-- LANGKAH 01: SUMBER DATASET KAGGLE -->
      <div class="flex flex-col gap-4">
        <div class="flex items-center gap-2">
          <span
            class="font-mono text-xs bg-zinc-100 dark:bg-zinc-900 px-2 py-0.5 rounded text-zinc-900 dark:text-zinc-50"
            >01</span
          >
          <span
            class="font-mono text-xs uppercase text-zinc-600 dark:text-zinc-400 tracking-wider"
          >
            SUMBER DATASET KAGGLE
          </span>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <!-- Kartu A: Data Produk -->
          <button
            type="button"
            class="text-left p-4 rounded-md relative flex flex-col justify-between transition-colors"
            :class="
              props.config.source === 'products'
                ? 'border-2 border-zinc-900 dark:border-zinc-100 bg-zinc-50 dark:bg-zinc-900'
                : 'border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 hover:border-zinc-300 dark:hover:border-zinc-700'
            "
            @click="emit('selectSource', 'products')"
          >
            <div class="flex items-start justify-between gap-3">
              <div>
                <h3 class="text-sm font-medium text-zinc-900 dark:text-zinc-50">
                  Data Produk (Judul)
                </h3>
                <p class="text-sm text-zinc-600 dark:text-zinc-400 mt-1">
                  {{
                    props.totalProducts > 0
                      ? `Tersedia ${props.totalProducts.toLocaleString("id-ID")} baris`
                      : "Seluruh baris judul produk CSV"
                  }}
                  · Cocok untuk uji skala besar dan beban komputasi tinggi
                </p>
              </div>
              <span
                class="w-2.5 h-2.5 rounded-full shrink-0 mt-1"
                :class="
                  props.config.source === 'products'
                    ? 'bg-zinc-900 dark:bg-zinc-100'
                    : 'bg-white dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-700'
                "
              ></span>
            </div>
            <span
              class="mt-4 font-mono text-xs text-zinc-500 dark:text-zinc-400"
            >
              amazon_products.json (titles)
            </span>
          </button>

          <!-- Kartu B: Data Kategori -->
          <button
            type="button"
            class="text-left p-4 rounded-md relative flex flex-col justify-between transition-colors"
            :class="
              props.config.source === 'categories'
                ? 'border-2 border-zinc-900 dark:border-zinc-100 bg-zinc-50 dark:bg-zinc-900'
                : 'border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 hover:border-zinc-300 dark:hover:border-zinc-700'
            "
            @click="emit('selectSource', 'categories')"
          >
            <div class="flex items-start justify-between gap-3">
              <div>
                <h3 class="text-sm font-medium text-zinc-900 dark:text-zinc-50">
                  Data Kategori
                </h3>
                <p class="text-sm text-zinc-600 dark:text-zinc-400 mt-1">
                  {{
                    props.totalCategories > 0
                      ? `Tersedia ${props.totalCategories.toLocaleString("id-ID")} baris`
                      : "Maksimal 248 baris"
                  }}
                  · Daftar taksonomi kategori e-commerce Amazon
                </p>
              </div>
              <span
                class="w-2.5 h-2.5 rounded-full shrink-0 mt-1"
                :class="
                  props.config.source === 'categories'
                    ? 'bg-zinc-900 dark:bg-zinc-100'
                    : 'bg-white dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-700'
                "
              ></span>
            </div>
            <span
              class="mt-4 font-mono text-xs text-zinc-500 dark:text-zinc-400"
            >
              amazon_categories.json (category_name)
            </span>
          </button>
        </div>

        <!-- Dropdown Filter Kategori Produk -->
        <div v-if="props.config.source === 'products'" class="pt-2">
          <label
            for="category-select"
            class="block font-mono text-xs uppercase text-zinc-500 dark:text-zinc-400 mb-1.5"
          >
            Filter Kategori Produk (Opsional)
          </label>
          <div class="relative">
            <select
              id="category-select"
              class="w-full h-11 px-3.5 pr-10 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded font-mono text-sm text-zinc-900 dark:text-zinc-100 focus:border-zinc-900 dark:focus:border-zinc-100 focus:outline-none appearance-none cursor-pointer"
              :value="
                props.config.selectedCategoryId === null
                  ? 'all'
                  : String(props.config.selectedCategoryId)
              "
              :disabled="props.config.scenario === 'worst'"
              @change="handleCategoryChange"
            >
              <option value="all">
                Semua Kategori ({{
                  props.totalProducts > 0
                    ? props.totalProducts.toLocaleString("id-ID")
                    : "0"
                }}
                produk)
              </option>
              <option
                v-for="option in props.categoryOptions"
                :key="option.id"
                :value="String(option.id)"
              >
                {{ option.name }} ({{
                  option.productCount.toLocaleString("id-ID")
                }}
                produk)
              </option>
            </select>
            <svg
              class="w-4 h-4 absolute right-3 top-3.5 pointer-events-none text-zinc-500 dark:text-zinc-400"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="m6 9 6 6 6-6"
              />
            </svg>
          </div>
        </div>
      </div>

      <!-- LANGKAH 02: KATA KUNCI, METODE & SKENARIO -->
      <div class="pt-8 border-t border-zinc-200 dark:border-zinc-800">
        <div class="flex items-center gap-2 mb-4">
          <span
            class="font-mono text-xs bg-zinc-100 dark:bg-zinc-900 px-2 py-0.5 rounded text-zinc-900 dark:text-zinc-50"
            >02</span
          >
          <span
            class="font-mono text-xs uppercase text-zinc-600 dark:text-zinc-400 tracking-wider"
          >
            KATA KUNCI, METODE &amp; SKENARIO
          </span>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
          <!-- Kiri: Input Kata Kunci -->
          <div class="flex flex-col gap-3">
            <label
              for="keyword-input"
              class="text-sm font-medium text-zinc-900 dark:text-zinc-50"
            >
              {{ keywordLabel }}
            </label>
            <input
              id="keyword-input"
              type="text"
              placeholder="Masukkan kata kunci..."
              :value="props.config.keyword"
              class="h-11 px-3.5 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded font-mono text-sm text-zinc-900 dark:text-zinc-50 placeholder:text-zinc-400 dark:placeholder:text-zinc-500 focus:border-zinc-900 dark:focus:border-zinc-100 focus:outline-none"
              @input="handleKeywordInput"
            />

            <!-- Quick Pick Chips -->
            <div class="flex flex-wrap gap-2 pt-1">
              <button
                v-for="chip in quickChips"
                :key="chip"
                type="button"
                class="font-mono text-xs px-2.5 py-1 rounded-full border transition-colors"
                :class="
                  props.config.keyword.toLowerCase() === chip.toLowerCase()
                    ? 'border-zinc-900 bg-zinc-900 text-white dark:border-zinc-100 dark:bg-zinc-100 dark:text-zinc-950'
                    : 'border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 hover:bg-zinc-100 dark:hover:border-zinc-700 text-zinc-600 dark:text-zinc-400 dark:hover:text-zinc-100'
                "
                @click="emit('updateKeyword', chip)"
              >
                {{ chip }}
              </button>
            </div>

            <label
              class="flex items-center gap-2 mt-2 cursor-pointer select-none"
            >
              <input
                type="checkbox"
                class="w-4 h-4 rounded border-zinc-300 dark:border-zinc-700 accent-zinc-900 dark:accent-zinc-100"
                :checked="props.config.caseInsensitive"
                @change="handleCaseToggle"
              />
              <span class="text-sm text-zinc-600 dark:text-zinc-400">
                Abaikan huruf besar/kecil (Case-Insensitive)
              </span>
            </label>
          </div>

          <!-- Kanan: Metode & Skenario -->
          <div class="flex flex-col gap-4">
            <div>
              <span
                class="text-sm font-medium text-zinc-900 dark:text-zinc-50 block mb-1.5"
                >Metode Algoritma</span
              >
              <div
                class="bg-zinc-100 dark:bg-zinc-900 p-1 rounded-lg grid grid-cols-3 gap-1"
              >
                <button
                  type="button"
                  class="py-2 text-center rounded font-mono text-xs transition-all"
                  :class="
                    props.config.method === 'iterative'
                      ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-50 border border-zinc-200 dark:border-zinc-700 font-medium'
                      : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100'
                  "
                  @click="emit('selectMethod', 'iterative')"
                >
                  Iteratif
                </button>
                <button
                  type="button"
                  class="py-2 text-center rounded font-mono text-xs transition-all"
                  :class="
                    props.config.method === 'recursive'
                      ? 'bg-white dark:bg-zinc-800 text-blue-600 dark:text-blue-400 border border-blue-600 dark:border-blue-400 font-medium'
                      : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100'
                  "
                  @click="emit('selectMethod', 'recursive')"
                >
                  Rekursif
                </button>
                <button
                  type="button"
                  class="py-2 text-center rounded font-mono text-xs transition-all"
                  :class="
                    props.config.method === 'both'
                      ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-50 border border-zinc-200 dark:border-zinc-700 font-medium'
                      : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100'
                  "
                  @click="emit('selectMethod', 'both')"
                >
                  Keduanya
                </button>
              </div>
            </div>

            <div>
              <span
                class="text-sm font-medium text-zinc-900 dark:text-zinc-50 block mb-1.5"
                >Skenario Masukan</span
              >
              <div class="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  class="py-1.5 px-2 rounded font-mono text-xs text-center border transition-colors"
                  :class="
                    props.config.scenario === 'average'
                      ? 'border-zinc-900 bg-zinc-900 text-white dark:border-zinc-100 dark:bg-zinc-100 dark:text-zinc-950'
                      : 'border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-zinc-600 dark:text-zinc-400 hover:border-zinc-300 dark:hover:border-zinc-700'
                  "
                  @click="emit('selectScenario', 'average')"
                >
                  Average (Real)
                </button>
                <button
                  type="button"
                  class="py-1.5 px-2 rounded font-mono text-xs text-center border transition-colors"
                  :class="
                    props.config.scenario === 'best'
                      ? 'border-zinc-900 bg-zinc-900 text-white dark:border-zinc-100 dark:bg-zinc-100 dark:text-zinc-950'
                      : 'border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-zinc-600 dark:text-zinc-400 hover:border-zinc-300 dark:hover:border-zinc-700'
                  "
                  @click="emit('selectScenario', 'best')"
                >
                  Best Case
                </button>
                <button
                  type="button"
                  class="py-1.5 px-2 rounded font-mono text-xs text-center border transition-colors"
                  :class="
                    props.config.scenario === 'worst'
                      ? 'border-zinc-900 bg-zinc-900 text-white dark:border-zinc-100 dark:bg-zinc-100 dark:text-zinc-950'
                      : 'border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-zinc-600 dark:text-zinc-400 hover:border-zinc-300 dark:hover:border-zinc-700'
                  "
                  @click="emit('selectScenario', 'worst')"
                >
                  Worst Case
                </button>
              </div>
              <p
                class="font-mono text-xs text-zinc-500 dark:text-zinc-400 mt-2 leading-relaxed"
              >
                {{ scenarioNote }}
              </p>
            </div>
          </div>
        </div>
      </div>

      <!-- LANGKAH 03: UKURAN MASUKAN (N) & EKSEKUSI -->
      <div
        class="pt-8 border-t border-zinc-200 dark:border-zinc-800 flex flex-col gap-6"
      >
        <div class="flex items-center justify-between flex-wrap gap-2">
          <div class="flex items-center gap-2">
            <span
              class="font-mono text-xs bg-zinc-100 dark:bg-zinc-900 px-2 py-0.5 rounded text-zinc-900 dark:text-zinc-50"
              >03</span
            >
            <span
              class="font-mono text-xs uppercase text-zinc-600 dark:text-zinc-400 tracking-wider"
            >
              UKURAN MASUKAN (N) &amp; EKSEKUSI
            </span>
          </div>

          <div class="inline-flex bg-zinc-100 dark:bg-zinc-900 p-1 rounded-md">
            <button
              type="button"
              class="px-3 py-1 font-mono text-xs rounded transition-colors"
              :class="
                props.config.sizeMode === 'single'
                  ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-50 border border-zinc-200 dark:border-zinc-700 font-medium'
                  : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100'
              "
              @click="emit('selectSizeMode', 'single')"
            >
              Satuan (Single N)
            </button>
            <button
              type="button"
              class="px-3 py-1 font-mono text-xs rounded transition-colors"
              :class="
                props.config.sizeMode === 'batch'
                  ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-50 border border-zinc-200 dark:border-zinc-700 font-medium'
                  : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100'
              "
              @click="emit('selectSizeMode', 'batch')"
            >
              Otomatis Bertahap (Batch)
            </button>
          </div>
        </div>

        <!-- Single N Panel -->
        <div
          v-if="props.config.sizeMode === 'single'"
          class="flex flex-col gap-2"
        >
          <div class="flex flex-wrap items-center gap-4">
            <div class="w-48">
              <label for="single-n-input" class="sr-only"
                >Ukuran Masukan N</label
              >
              <input
                id="single-n-input"
                type="number"
                min="1"
                :max="props.activeMaxN"
                :value="props.config.singleN"
                class="h-11 w-full px-3 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded font-mono text-sm tabular-nums text-zinc-900 dark:text-zinc-50 focus:border-zinc-900 dark:focus:border-zinc-100 focus:outline-none"
                @input="handleSingleNInput"
              />
            </div>

            <div class="flex flex-wrap gap-2">
              <button
                v-for="preset in props.activeSinglePresets"
                :key="preset"
                type="button"
                class="font-mono text-xs px-2.5 py-1 border rounded tabular-nums transition-colors"
                :class="
                  props.config.singleN === preset
                    ? 'border-zinc-900 bg-zinc-900 text-white dark:border-zinc-100 dark:bg-zinc-100 dark:text-zinc-950'
                    : 'border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:border-zinc-100'
                "
                @click="emit('updateSingleN', preset)"
              >
                {{ preset.toLocaleString("id-ID") }}
              </button>
            </div>
          </div>
          <span class="font-mono text-xs text-zinc-500 dark:text-zinc-400">
            Rentang valid dataset aktif: 1 &le; N &le;
            {{ props.activeMaxN.toLocaleString("id-ID") }}
          </span>
        </div>

        <!-- Batch N Panel -->
        <div v-else class="flex flex-col gap-2">
          <span class="font-mono text-xs text-zinc-500 dark:text-zinc-400">
            Rangkaian titik data N yang akan diuji bertahap:
          </span>
          <div class="flex flex-wrap gap-2">
            <span
              v-for="size in props.activeBatchSizes"
              :key="size"
              class="font-mono text-xs px-3 py-1 rounded bg-white dark:bg-zinc-950 border border-zinc-900 dark:border-zinc-100 text-zinc-900 dark:text-zinc-50 font-medium tabular-nums"
            >
              N = {{ size.toLocaleString("id-ID") }}
            </span>
            <span
              v-if="props.activeBatchSizes.length === 0"
              class="font-mono text-xs text-zinc-500 dark:text-zinc-400"
            >
              Belum ada titik batch valid (muat dataset JSON atau pilih Worst
              Case).
            </span>
          </div>
        </div>

        <!-- Pesan Validasi / Error -->
        <div
          v-if="props.validationError || props.workerError"
          class="p-3 bg-red-50 dark:bg-red-950 border border-red-300 dark:border-red-800 rounded font-mono text-xs text-red-700 dark:text-red-400"
        >
          {{ props.validationError || props.workerError }}
        </div>

        <!-- Baris Aksi Eksekusi -->
        <div class="flex flex-wrap items-center justify-between gap-4 pt-4">
          <div class="flex flex-wrap items-center gap-3">
            <button
              type="button"
              :class="props.isRunning ? 'cursor-not-allowed' : ''"
              class="bg-zinc-900 hover:bg-zinc-800 disabled:bg-zinc-400 text-white dark:bg-zinc-50 dark:hover:bg-zinc-200 dark:disabled:bg-zinc-800 dark:disabled:text-zinc-500 dark:text-zinc-950 h-11 px-7 rounded text-sm font-normal flex items-center gap-2 transition-colors"
              :disabled="props.isRunning"
              @click="emit('runSimulation')"
            >
              <svg
                v-if="!props.isRunning"
                class="w-4 h-4"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M8 5v14l11-7z" />
              </svg>
              <span>
                {{
                  props.isRunning
                    ? props.statusText ||
                      `Menjalankan N = ${props.currentRunningN.toLocaleString("id-ID")}...`
                    : "Mulai Simulasi"
                }}
              </span>
            </button>

            <button
              type="button"
              :class="props.isRunning ? 'hidden' : ''"
              class="text-red-700 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950 border border-red-300 dark:border-zinc-800 dark:hover:border-red-800 bg-white dark:bg-zinc-950 h-11 px-7 rounded text-sm font-normal flex items-center gap-2 transition-colors"
              @click="emit('resetAll')"
            >
              <svg
                class="w-4 h-4"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="M3 12a9 9 0 1 0 3-6.7L3 8m0-5v5h5"
                />
              </svg>
              <span>Reset</span>
            </button>

            <button
              v-if="props.isRunning"
              type="button"
              class="text-red-700 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950 border border-red-300 dark:border-red-800 rounded h-11 px-4 text-sm transition-colors"
              @click="emit('cancelSimulation')"
            >
              Batalkan
            </button>
          </div>

          <span
            v-if="props.isRunning"
            class="font-mono text-xs text-zinc-500 dark:text-zinc-400 tabular-nums"
          >
            Progres Worker: {{ props.progressPercent }}%
          </span>
        </div>
      </div>
    </div>
  </section>
</template>
