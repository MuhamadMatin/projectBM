<script setup lang="ts">
import { computed } from "vue";
import BenchmarkTable from "~/components/BenchmarkTable.vue";
import RuntimeChart from "~/components/RuntimeChart.vue";
import type { BenchmarkRow } from "~/types/benchmark";

const props = defineProps<{
  results: BenchmarkRow[];
  latestRow: BenchmarkRow | null;
}>();

const emit = defineEmits<{
  repeatSimulation: [];
  exportCsv: [];
}>();

const latestFrequencyDisplay = computed(() => {
  if (!props.latestRow) return "—";
  const freq =
    props.latestRow.frequencyIterative ?? props.latestRow.frequencyRecursive;
  return freq !== null ? freq.toLocaleString("id-ID") : "—";
});

const latestIterativeDisplay = computed(() => {
  if (!props.latestRow || props.latestRow.iterativeMs === null) return "—";
  return `${props.latestRow.iterativeMs.toFixed(3)} ms`;
});

const latestRecursiveDisplay = computed(() => {
  if (!props.latestRow || props.latestRow.recursiveMs === null) return "—";
  return `${props.latestRow.recursiveMs.toFixed(3)} ms`;
});

const latestRatioDisplay = computed(() => {
  if (!props.latestRow || props.latestRow.speedupRatio === null) return "—";
  return `${props.latestRow.speedupRatio.toFixed(2)}x`;
});

const averageRatio = computed<number | null>(() => {
  const valid = props.results
    .map((row) => row.speedupRatio)
    .filter(
      (ratio): ratio is number => ratio !== null && Number.isFinite(ratio),
    );

  if (valid.length === 0) return null;
  return valid.reduce((acc, value) => acc + value, 0) / valid.length;
});

const ratioFootnote = computed(() => {
  if (!props.latestRow || props.latestRow.speedupRatio === null) {
    return "Pilih metode Keduanya untuk rasio";
  }
  return props.latestRow.speedupRatio >= 1
    ? "Iteratif lebih cepat & hemat memori"
    : "Rekursif lebih cepat pada titik ini";
});
function scrollToSimulation(): void {
  if (typeof document !== "undefined") {
    document.getElementById("simulasi")?.scrollIntoView({ behavior: "smooth" });
  }
}
</script>

<template>
  <section
    id="hasil"
    class="relative border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 transition-colors"
  >
    <!-- Strip 4 Metrik Ringkas -->
    <div
      class="grid grid-cols-2 md:grid-cols-4 divide-y md:divide-y-0 md:divide-x divide-zinc-200 dark:divide-zinc-800 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900"
    >
      <!-- Metrik 1 -->
      <div
        class="p-5 md:p-6 flex flex-col border-r md:border-r-0 border-zinc-200 dark:border-zinc-800"
      >
        <span
          class="font-mono text-xs uppercase text-zinc-500 dark:text-zinc-400 tracking-wider"
        >
          FREKUENSI DITEMUKAN
        </span>
        <div class="flex items-baseline gap-2 mt-2">
          <span
            class="font-mono text-2xl font-light tabular-nums text-zinc-900 dark:text-zinc-50"
          >
            {{ latestFrequencyDisplay }}
          </span>
          <span
            v-if="props.latestRow"
            class="font-mono text-xs px-1.5 py-0.5 rounded border"
            :class="
              props.latestRow.isMatchValid
                ? 'text-green-700 dark:text-green-400 bg-white dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800'
                : 'text-red-700 dark:text-red-400 bg-red-50 dark:bg-red-950 border-red-300 dark:border-red-800'
            "
          >
            {{ props.latestRow.isMatchValid ? "" : "✕ Beda" }}
          </span>
        </div>
        <span class="font-mono text-xs text-zinc-500 dark:text-zinc-400 mt-1">
          {{
            props.latestRow
              ? props.latestRow.method === "both"
                ? "Iteratif == Rekursif"
                : `Mode ${props.latestRow.method}`
              : "Menunggu eksekusi simulasi"
          }}
        </span>
      </div>

      <!-- Metrik 2 -->
      <div class="p-5 md:p-6 flex flex-col">
        <span
          class="font-mono text-xs uppercase text-zinc-500 dark:text-zinc-400 tracking-wider"
        >
          ITERATIF (N TERAKHIR)
        </span>
        <div class="flex items-center gap-2 mt-2">
          <span class="w-2 h-2 bg-zinc-900 dark:bg-zinc-100"></span>
          <span
            class="font-mono text-2xl font-light tabular-nums text-zinc-900 dark:text-zinc-50"
          >
            {{ latestIterativeDisplay }}
          </span>
        </div>
        <span class="font-mono text-xs text-zinc-500 dark:text-zinc-400 mt-1"
          >O(1) Auxiliary Space</span
        >
      </div>

      <!-- Metrik 3 -->
      <div
        class="p-5 md:p-6 flex flex-col border-r md:border-r-0 border-zinc-200 dark:border-zinc-800"
      >
        <span
          class="font-mono text-xs uppercase text-zinc-500 dark:text-zinc-400 tracking-wider"
        >
          REKURSIF (N TERAKHIR)
        </span>
        <div class="flex items-center gap-2 mt-2">
          <span class="w-2 h-2 bg-blue-600 dark:bg-blue-400"></span>
          <span
            class="font-mono text-2xl font-light tabular-nums text-blue-600 dark:text-blue-400"
          >
            {{ latestRecursiveDisplay }}
          </span>
        </div>
        <span class="font-mono text-xs text-zinc-500 dark:text-zinc-400 mt-1"
          >Divide &amp; Conquer Call Stack</span
        >
      </div>

      <!-- Metrik 4 -->
      <div class="p-5 md:p-6 flex flex-col">
        <span
          class="font-mono text-xs uppercase text-zinc-500 dark:text-zinc-400 tracking-wider"
        >
          RASIO EFISIENSI
        </span>
        <div class="mt-2">
          <span
            class="font-mono text-2xl font-light tabular-nums text-zinc-900 dark:text-zinc-50"
          >
            {{ latestRatioDisplay }}
          </span>
        </div>
        <span
          class="font-mono text-xs mt-1"
          :class="
            props.latestRow?.speedupRatio
              ? 'text-green-700 dark:text-green-400'
              : 'text-zinc-500 dark:text-zinc-400'
          "
        >
          {{ ratioFootnote }}
        </span>
      </div>
    </div>

    <!-- Visualisasi Grafik, Penjelasan Analisis, Tabel & Aksi Bawah -->
    <div class="px-6 py-12 md:px-8 lg:px-14 flex flex-col gap-10">
      <RuntimeChart :results="props.results" />

      <!-- Blok Penjelasan Analisis Tepat di Bawah Grafik -->
      <div
        class="bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg p-6"
      >
        <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div class="flex flex-col">
            <div class="flex items-center gap-2 mb-2">
              <span class="w-1.5 h-1.5 bg-zinc-900 dark:bg-zinc-100"></span>
              <h4 class="text-sm font-medium text-zinc-900 dark:text-zinc-50">
                Interpretasi Hasil Aktual
              </h4>
            </div>
            <p
              v-if="props.latestRow"
              class="text-sm text-zinc-600 dark:text-zinc-300 leading-relaxed"
            >
              Pada ukuran masukan
              <span
                class="font-mono text-zinc-900 dark:text-zinc-50 font-medium"
              >
                N = {{ props.latestRow.inputSize.toLocaleString("id-ID") }}
              </span>
              ({{ props.latestRow.sourceLabel }} ·
              {{ props.latestRow.categoryLabel }}) dengan kata kunci
              <span
                class="font-mono text-zinc-900 dark:text-zinc-50 font-medium"
              >
                '{{ props.latestRow.keyword }}' </span
              >, ditemukan
              <span
                class="font-mono text-zinc-900 dark:text-zinc-50 font-medium"
                >{{ latestFrequencyDisplay }}</span
              >
              kemunculan yang identik pada kedua metode.
              <template
                v-if="
                  props.latestRow.iterativeMs !== null &&
                  props.latestRow.recursiveMs !== null
                "
              >
                Algoritma iteratif menyelesaikan pencarian dalam
                <span
                  class="font-mono text-zinc-900 dark:text-zinc-50 font-medium"
                  >{{ latestIterativeDisplay }}</span
                >, dibanding algoritma rekursif (<span
                  class="font-mono text-blue-600 dark:text-blue-400 font-medium"
                  >{{ latestRecursiveDisplay }}</span
                >)
                <template v-if="averageRatio !== null">
                  dengan rasio rata-rata
                  <span
                    class="font-mono text-zinc-900 dark:text-zinc-50 font-medium"
                  >
                    {{ averageRatio.toFixed(2) }}×
                  </span>
                  lebih cepat.
                </template>
              </template>
            </p>
            <p
              v-else
              class="text-sm text-zinc-600 dark:text-zinc-300 leading-relaxed"
            >
              Jalankan simulasi untuk melihat interpretasi otomatis atas
              frekuensi kemunculan, running time iteratif vs rekursif, dan rasio
              percepatan pada dataset aktif.
            </p>
          </div>

          <div class="flex flex-col">
            <div class="flex items-center gap-2 mb-2">
              <span class="w-1.5 h-1.5 bg-blue-600 dark:bg-blue-400"></span>
              <h4 class="text-sm font-medium text-zinc-900 dark:text-zinc-50">
                Analisis Kompleksitas O(n · m)
              </h4>
            </div>
            <p class="text-sm text-zinc-600 dark:text-zinc-300 leading-relaxed">
              Kedua kurva menunjukkan laju pertumbuhan linier proporsional
              terhadap ukuran masukan N karena panjang pola (m) konstan. Namun,
              algoritma rekursif menanggung
              <span class="text-zinc-900 dark:text-zinc-50"
                >overhead call stack frame</span
              >, pemanggilan fungsi bertingkat pada Divide &amp; Conquer serta
              pemindaian karakter, dibanding loop iteratif murni dengan ruang
              tambahan O(1).
            </p>
          </div>
        </div>
      </div>

      <!-- Komponen Tabel Terpisah -->
      <BenchmarkTable
        :results="props.results"
        @export-csv="emit('exportCsv')"
      />

      <!-- Bar Aksi Bawah: Ulangi & Reset -->
      <div class="flex flex-wrap items-center justify-between gap-4">
        <p class="text-sm text-zinc-600 dark:text-zinc-400">
          Ingin menambah titik data N lain ke grafik ini? Klik tombol di samping
          untuk mengatur parameter.
        </p>

        <div class="flex flex-wrap items-center gap-3">
          <button
            type="button"
            class="text-sm bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-900 hover:border-zinc-300 dark:hover:border-zinc-700 text-zinc-900 dark:text-zinc-100 px-4 py-2 rounded transition-colors"
            @click="emit('repeatSimulation')"
          >
            Ulangi Simulasi
          </button>
          <NuxtLink
            to="#simulasi"
            class="text-sm bg-zinc-900 hover:bg-zinc-800 text-white dark:bg-zinc-50 dark:hover:bg-zinc-200 dark:text-zinc-950 px-4 py-2 rounded transition-colors"
            @click="scrollToSimulation"
          >
            Ulangi / Tambah Uji N
          </NuxtLink>
        </div>
      </div>
    </div>
  </section>
</template>
