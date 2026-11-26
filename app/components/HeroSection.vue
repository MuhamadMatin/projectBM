<script setup lang="ts">
const props = defineProps<{
  isLoadingDataset: boolean;
  isDatasetReady: boolean;
  datasetError: string | null;
}>();

const emit = defineEmits<{
  reloadDataset: [];
}>();

function scrollToSection(id: string): void {
  if (typeof document !== "undefined") {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  }
}
</script>

<template>
  <section
    id="home"
    class="relative border-b border-zinc-200 dark:border-zinc-800 px-6 py-16 md:px-8 lg:px-14 lg:py-24 overflow-hidden bg-white dark:bg-zinc-950 transition-colors"
  >
    <!-- Latar Grid Arsitektural Halus (Pure SVG Vector dengan Radial Fade) -->
    <div
      class="absolute inset-0 pointer-events-none opacity-40 text-zinc-200 dark:text-zinc-800"
    >
      <svg class="w-full h-full" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern
            id="arch-grid"
            width="32"
            height="32"
            patternUnits="userSpaceOnUse"
          >
            <path
              d="M 32 0 L 0 0 0 32"
              fill="none"
              stroke="currentColor"
              stroke-width="1"
            />
          </pattern>
          <radialGradient id="arch-grid-fade" cx="75%" cy="40%" r="65%">
            <stop offset="15%" stop-color="#FFFFFF" stop-opacity="1" />
            <stop offset="85%" stop-color="#FFFFFF" stop-opacity="0" />
          </radialGradient>
          <mask id="arch-grid-mask">
            <rect width="100%" height="100%" fill="url(#arch-grid-fade)" />
          </mask>
        </defs>
        <rect
          width="100%"
          height="100%"
          fill="url(#arch-grid)"
          mask="url(#arch-grid-mask)"
        />
      </svg>
    </div>

    <div
      class="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center relative z-10"
    >
      <div class="flex flex-col items-start text-left lg:col-span-12">
        <h1
          class="text-3xl md:text-4xl lg:text-5xl font-light tracking-tight leading-tight text-zinc-900 dark:text-zinc-50 max-w-4xl"
        >
          Benchmark Naive String Matching yang bersih dan terukur.
        </h1>

        <p
          class="text-base text-zinc-600 dark:text-zinc-400 mt-5 max-w-2xl leading-relaxed"
        >
          Membandingkan efisiensi algoritma iteratif dan rekursif secara
          langsung di browser hanya Web Worker.
        </p>

        <p
          class="text-zinc-500 dark:text-zinc-400 mt-3 max-w-2xl leading-relaxed"
        >
          Studi kasus ini mengevaluasi pencocokan pola teks substring (naive
          exact matching) dengan dataset e-commerce nyata dari Amazon. Pengujian
          mengisolasi runtime JavaScript ke Web Worker untuk meniadakan latensi
          thread UI, memvalidasi kecocokan eksak frekuensi, dan memetakan
          degradasi call stack pada paradigma rekursif.
        </p>

        <!-- Peringatan Dataset JSON Belum Tersedia -->
        <div
          v-if="
            !props.isLoadingDataset &&
            !props.isDatasetReady &&
            props.datasetError
          "
          class="mt-5 w-full max-w-2xl p-4 bg-red-50 dark:bg-red-950 border border-red-300 dark:border-red-800 rounded text-sm text-red-700 dark:text-red-400 space-y-2"
        >
          <p class="font-medium">Dataset JSON belum tersedia di public/data/</p>
          <p class="text-xs leading-relaxed">{{ props.datasetError }}</p>
          <div class="flex flex-wrap items-center gap-3 pt-1">
            <button
              type="button"
              class="font-mono text-xs px-3 py-1.5 rounded bg-white dark:bg-zinc-950 border border-red-300 dark:border-red-800 text-red-700 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950 transition-colors"
              @click="emit('reloadDataset')"
            >
              Muat Ulang Dataset
            </button>
            <span class="font-mono text-xs text-zinc-600 dark:text-zinc-400">
              Skenario Worst Case sintetik tetap dapat dijalankan langsung.
            </span>
          </div>
        </div>

        <!-- Dua Tombol CTA Sejajar -->
        <div class="flex flex-wrap items-center gap-3.5 mt-8">
          <NuxtLink
            to="#simulasi"
            class="bg-zinc-900 hover:bg-zinc-800 text-white dark:bg-zinc-50 dark:hover:bg-zinc-200 dark:text-zinc-950 px-5 py-2.5 rounded text-sm inline-flex items-center gap-2 transition-colors"
            @click="scrollToSection('simulasi')"
          >
            <span>Mulai Simulasi</span>
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
                d="M5 12h14m-6-6 6 6-6 6"
              />
            </svg>
          </NuxtLink>
          <NuxtLink
            to="#algoritma"
            class="bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-900 hover:border-zinc-300 dark:hover:border-zinc-700 px-5 py-2.5 rounded text-sm transition-colors"
            @click="scrollToSection('algoritma')"
          >
            Pelajari Algoritma
          </NuxtLink>
        </div>
      </div>
    </div>
  </section>
</template>
