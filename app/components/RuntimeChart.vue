<script setup lang="ts">
import {
  CategoryScale,
  Chart,
  Legend,
  LinearScale,
  LineController,
  LineElement,
  LogarithmicScale,
  PointElement,
  Tooltip,
} from "chart.js";
import type { ChartConfiguration, Plugin } from "chart.js";
import { computed, onBeforeUnmount, onMounted, ref, watch } from "vue";
import { useTheme } from "~/composables/useTheme";
import type { BenchmarkRow, ChartScaleMode } from "~/types/benchmark";

Chart.register(
  LineController,
  LineElement,
  PointElement,
  CategoryScale,
  LinearScale,
  LogarithmicScale,
  Tooltip,
  Legend,
);

const props = defineProps<{
  results: BenchmarkRow[];
}>();

const canvasRef = ref<HTMLCanvasElement | null>(null);
const scaleMode = ref<ChartScaleMode>("linear");
const { isDark } = useTheme();
let chartInstance: Chart<"line"> | null = null;

// Mengurutkan titik berdasarkan ukuran masukan N agar kurva tren selalu rapi
const sortedResults = computed<BenchmarkRow[]>(() =>
  [...props.results].sort((a, b) => a.inputSize - b.inputSize),
);

const hasChartData = computed(() => sortedResults.value.length > 0);

// Plugin Chart.js untuk menggambar latar solid (#FFFFFF pada Light Mode, #09090B pada Dark Mode)
const solidWhiteBackgroundPlugin: Plugin<"line"> = {
  id: "solidWhiteBackground",
  beforeDraw(chart) {
    const ctx = chart.canvas.getContext("2d");
    if (!ctx) return;
    ctx.save();
    ctx.globalCompositeOperation = "destination-over";
    ctx.fillStyle = isDark.value ? "#09090B" : "#FFFFFF";
    ctx.fillRect(0, 0, chart.width, chart.height);
    ctx.restore();
  },
};

function formatLogSafeValue(value: number | null): number | null {
  if (value === null) return null;
  if (scaleMode.value === "log") {
    return Math.max(value, 0.0001);
  }
  return value;
}

function buildChartConfig(): ChartConfiguration<"line"> {
  const isSinglePoint = sortedResults.value.length === 1;
  const dark = isDark.value;
  const iterativeColor = dark ? "#F4F4F5" : "#18181B";
  const recursiveColor = dark ? "#60A5FA" : "#2563EB";
  const pointCenterBg = dark ? "#09090B" : "#FFFFFF";
  const gridColor = dark ? "#27272A" : "#F4F4F5";
  const borderColor = dark ? "#27272A" : "#E4E4E7";
  const tickColor = dark ? "#A1A1AA" : "#71717A";
  const axisTitleColor = dark ? "#A1A1AA" : "#52525B";

  const labels = sortedResults.value.map(
    (row) => `N=${row.inputSize.toLocaleString("id-ID")}`,
  );
  const iterativePoints = sortedResults.value.map((row) =>
    formatLogSafeValue(row.iterativeMs),
  );
  const recursivePoints = sortedResults.value.map((row) =>
    formatLogSafeValue(row.recursiveMs),
  );

  return {
    type: "line",
    data: {
      labels,
      datasets: [
        {
          label: "Iteratif (ms)",
          data: iterativePoints,
          borderColor: iterativeColor,
          backgroundColor: iterativeColor,
          borderWidth: 2,
          pointRadius: isSinglePoint ? 6 : 4,
          pointHoverRadius: isSinglePoint ? 8 : 6,
          pointBackgroundColor: iterativeColor,
          pointBorderColor: pointCenterBg,
          pointBorderWidth: 1.5,
          tension: 0.15,
          spanGaps: true,
        },
        {
          label: "Rekursif (ms)",
          data: recursivePoints,
          borderColor: recursiveColor,
          backgroundColor: recursiveColor,
          borderWidth: 2,
          borderDash: [6, 4],
          pointRadius: isSinglePoint ? 6 : 4,
          pointHoverRadius: isSinglePoint ? 8 : 6,
          pointBackgroundColor: pointCenterBg,
          pointBorderColor: recursiveColor,
          pointBorderWidth: 2,
          tension: 0.15,
          spanGaps: true,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      animation: {
        duration: 250,
      },
      interaction: {
        mode: "index",
        intersect: false,
      },
      plugins: {
        legend: {
          display: false,
        },
        tooltip: {
          backgroundColor: dark ? "#18181B" : "#FFFFFF",
          titleColor: dark ? "#FAFAFA" : "#18181B",
          bodyColor: dark ? "#F4F4F5" : "#52525B",
          borderColor: dark ? "#27272A" : "#E4E4E7",
          borderWidth: 1,
          padding: 10,
          displayColors: true,
          callbacks: {
            label(context) {
              const rawVal = context.parsed.y;
              if (rawVal === null || rawVal === undefined) {
                return `${context.dataset.label}: -`;
              }
              return `${context.dataset.label}: ${rawVal.toFixed(4)} ms`;
            },
          },
        },
      },
      scales: {
        x: {
          offset: isSinglePoint,
          grid: {
            color: gridColor,
          },
          border: {
            color: borderColor,
          },
          ticks: {
            color: tickColor,
            font: {
              family: "JetBrains Mono, monospace",
              size: 11,
            },
          },
          title: {
            display: true,
            text: "Ukuran Masukan (N)",
            color: axisTitleColor,
            font: {
              family: "JetBrains Mono, monospace",
              size: 11,
            },
          },
        },
        y: {
          type: scaleMode.value === "log" ? "logarithmic" : "linear",
          beginAtZero: scaleMode.value === "linear",
          grid: {
            color: gridColor,
          },
          border: {
            color: borderColor,
          },
          ticks: {
            color: tickColor,
            font: {
              family: "JetBrains Mono, monospace",
              size: 11,
            },
            callback(value) {
              const numeric = Number(value);
              if (Number.isNaN(numeric)) return String(value);
              if (numeric === 0) return "0 ms";
              if (numeric < 0.01) return `${numeric.toFixed(4)} ms`;
              if (numeric < 1) return `${numeric.toFixed(3)} ms`;
              return `${numeric.toFixed(1)} ms`;
            },
          },
          title: {
            display: true,
            text:
              scaleMode.value === "log"
                ? "Waktu Eksekusi (ms · Log)"
                : "Waktu Eksekusi (ms)",
            color: axisTitleColor,
            font: {
              family: "JetBrains Mono, monospace",
              size: 11,
            },
          },
        },
      },
    },
    plugins: [solidWhiteBackgroundPlugin],
  };
}

function renderChart(): void {
  if (!canvasRef.value) return;

  if (chartInstance) {
    chartInstance.destroy();
    chartInstance = null;
  }

  if (!hasChartData.value) {
    return;
  }

  chartInstance = new Chart(canvasRef.value, buildChartConfig());
}

function setScale(mode: ChartScaleMode): void {
  scaleMode.value = mode;
}

function exportPng(): void {
  if (!chartInstance) return;
  const dataUrl = chartInstance.toBase64Image("image/png", 1);
  const link = document.createElement("a");
  link.href = dataUrl;
  link.download = `grafik-running-time-naive-${scaleMode.value}-${Date.now()}.png`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

watch(
  [sortedResults, scaleMode, isDark],
  () => {
    renderChart();
  },
  { flush: "post" },
);

onMounted(() => {
  renderChart();
});

onBeforeUnmount(() => {
  if (chartInstance) {
    chartInstance.destroy();
    chartInstance = null;
  }
});
</script>

<template>
  <div
    class="border border-zinc-200 dark:border-zinc-800 rounded-lg p-4 md:p-6 bg-white dark:bg-zinc-950 space-y-5 transition-colors"
  >
    <div
      class="flex flex-col md:flex-row md:items-center justify-between pb-4 border-b border-zinc-200 dark:border-zinc-800 gap-4"
    >
      <div>
        <h3
          class="text-base md:text-lg font-medium text-zinc-900 dark:text-zinc-50"
        >
          Grafik Perbandingan Running Time
        </h3>
        <p class="text-sm text-zinc-600 dark:text-zinc-400 mt-0.5">
          Waktu eksekusi (milidetik) terhadap kenaikan ukuran masukan N
        </p>
      </div>

      <div class="flex flex-wrap items-center gap-3">
        <!-- Legenda Ramah Buta Warna (Solid vs Putus-Putus) -->
        <div class="flex items-center gap-4 font-mono text-xs">
          <span
            class="inline-flex items-center gap-1.5 text-zinc-900 dark:text-zinc-100"
          >
            <span
              class="w-4 border-t-2 border-zinc-900 dark:border-zinc-100"
            ></span>
            Iteratif
          </span>
          <span
            class="inline-flex items-center gap-1.5 text-blue-600 dark:text-blue-400"
          >
            <span
              class="w-4 border-t-2 border-dashed border-blue-600 dark:border-blue-400"
            ></span>
            Rekursif
          </span>
        </div>

        <!-- Toggle Skala Linear / Log -->
        <div class="inline-flex bg-zinc-100 dark:bg-zinc-900 p-0.5 rounded">
          <button
            type="button"
            class="px-2.5 py-1 font-mono text-xs rounded transition-colors"
            :class="
              scaleMode === 'linear'
                ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-50 border border-zinc-200 dark:border-zinc-700'
                : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100'
            "
            @click="setScale('linear')"
          >
            Linear
          </button>
          <button
            type="button"
            class="px-2.5 py-1 font-mono text-xs rounded transition-colors"
            :class="
              scaleMode === 'log'
                ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-50 border border-zinc-200 dark:border-zinc-700'
                : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100'
            "
            @click="setScale('log')"
          >
            Log
          </button>
        </div>

        <!-- Tombol Export PNG -->
        <button
          type="button"
          class="h-8 px-3 rounded border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 hover:bg-zinc-50 dark:hover:bg-zinc-900 disabled:opacity-50 font-mono text-xs text-zinc-900 dark:text-zinc-100 inline-flex items-center gap-1.5 transition-colors"
          :disabled="!hasChartData"
          @click="exportPng"
        >
          <svg
            class="w-3.5 h-3.5"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M4 16v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2M7 10l5 5 5-5M12 15V3"
            />
          </svg>
          <span>Export PNG</span>
        </button>
      </div>
    </div>

    <!-- Kanvas Grafik Chart.js -->
    <div v-if="hasChartData" class="relative w-full h-72 md:h-96">
      <canvas ref="canvasRef"></canvas>
    </div>

    <!-- State Kosong Sebelum Simulasi Dijalankan -->
    <div
      v-else
      class="h-64 flex flex-col items-center justify-center text-center bg-zinc-50 dark:bg-zinc-900 border border-dashed border-zinc-200 dark:border-zinc-800 rounded p-6 space-y-2"
    >
      <p class="text-sm font-medium text-zinc-900 dark:text-zinc-50">
        Belum ada data simulasi
      </p>
      <p class="text-xs text-zinc-500 dark:text-zinc-400 max-w-md">
        Pilih sumber dataset, kata kunci, metode algoritma, lalu tekan
        <span class="font-mono text-zinc-900 dark:text-zinc-100"
          >Mulai Simulasi</span
        >
        untuk melihat kurva perbandingan running time secara langsung.
      </p>
    </div>
  </div>
</template>
