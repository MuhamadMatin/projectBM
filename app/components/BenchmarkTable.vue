<script setup lang="ts">
import type { BenchmarkRow } from '~/types/benchmark'

const props = defineProps<{
  results: BenchmarkRow[]
}>()

const emit = defineEmits<{
  exportCsv: []
}>()

function formatMs(val: number | null): string {
  if (val === null) return '—'
  return val.toFixed(3)
}

function formatFrequency(row: BenchmarkRow): string {
  const freq = row.frequencyIterative ?? row.frequencyRecursive
  return freq !== null ? freq.toLocaleString('id-ID') : '—'
}

function formatOperations(row: BenchmarkRow): string {
  const ops = row.operationsIterative ?? row.operationsRecursive
  return ops !== null ? ops.toLocaleString('id-ID') : '—'
}
</script>

<template>
  <div class="border border-zinc-200 dark:border-zinc-800 rounded-lg overflow-hidden bg-white dark:bg-zinc-950 transition-colors">
    <div class="p-4 md:p-5 border-b border-zinc-200 dark:border-zinc-800 flex flex-wrap items-center justify-between gap-3">
      <div>
        <h3 class="text-sm md:text-base font-medium text-zinc-900 dark:text-zinc-50">
          Tabel Perbandingan Running Time
        </h3>
        <p class="font-mono text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
          Telemetri Benchmark Presisi Tinggi (performance.now)
        </p>
      </div>

      <button
        type="button"
        class="h-8 px-3 rounded border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 hover:bg-zinc-50 dark:hover:bg-zinc-900 disabled:opacity-50 font-mono text-xs text-zinc-900 dark:text-zinc-100 inline-flex items-center gap-1.5 transition-colors"
        :disabled="props.results.length === 0"
        @click="emit('exportCsv')"
      >
        <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M4 16v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2M7 10l5 5 5-5M12 15V3" />
        </svg>
        <span>Export CSV</span>
      </button>
    </div>

    <div class="overflow-x-auto">
      <table class="w-full text-left border-collapse font-mono text-xs md:text-sm">
        <thead>
          <tr class="border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 text-xs text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
            <th class="py-3 px-4 font-medium">Sumber</th>
            <th class="py-3 px-4 font-medium">N</th>
            <th class="py-3 px-4 font-medium text-right">Total Karakter</th>
            <th class="py-3 px-4 font-medium text-right">Frekuensi</th>
            <th class="py-3 px-4 font-medium text-center">Valid</th>
            <th class="py-3 px-4 font-medium text-right">Iteratif (ms)</th>
            <th class="py-3 px-4 font-medium text-right">Rekursif (ms)</th>
            <th class="py-3 px-4 font-medium text-right">Rasio</th>
            <th class="py-3 px-4 font-medium text-right">Operasi Karakter</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-zinc-200 dark:divide-zinc-800 text-zinc-900 dark:text-zinc-100">
          <tr
            v-for="(row, index) in props.results"
            :key="row.id"
            class="transition-colors"
            :class="index === props.results.length - 1 ? 'bg-zinc-50 dark:bg-zinc-900 font-medium' : 'hover:bg-zinc-50 dark:hover:bg-zinc-900'"
          >
            <td class="py-3.5 px-4 text-zinc-600 dark:text-zinc-400">
              <div class="text-zinc-900 dark:text-zinc-50">{{ row.sourceLabel }}</div>
              <div class="text-xs text-zinc-500 dark:text-zinc-400">
                {{ row.categoryLabel }} · '{{ row.keyword }}'
              </div>
            </td>
            <td class="py-3.5 px-4 font-medium tabular-nums">
              {{ row.inputSize.toLocaleString('id-ID') }}
            </td>
            <td class="py-3.5 px-4 text-right tabular-nums">
              {{ row.totalChars.toLocaleString('id-ID') }}
            </td>
            <td class="py-3.5 px-4 text-right tabular-nums">
              {{ formatFrequency(row) }}
            </td>
            <td class="py-3.5 px-4 text-center">
              <span :class="row.isMatchValid ? 'text-green-700 dark:text-green-400' : 'text-red-700 dark:text-red-400'">
                {{ row.isMatchValid ? '✓' : '✕' }}
              </span>
            </td>
            <td class="py-3.5 px-4 text-right tabular-nums">
              {{ formatMs(row.iterativeMs) }}
            </td>
            <td class="py-3.5 px-4 text-right tabular-nums text-blue-600 dark:text-blue-400">
              {{ formatMs(row.recursiveMs) }}
            </td>
            <td class="py-3.5 px-4 text-right tabular-nums">
              {{ row.speedupRatio !== null ? `${row.speedupRatio.toFixed(2)}x` : '—' }}
            </td>
            <td class="py-3.5 px-4 text-right tabular-nums text-zinc-600 dark:text-zinc-400">
              {{ formatOperations(row) }}
            </td>
          </tr>

          <tr v-if="props.results.length === 0">
            <td colspan="9" class="py-8 px-4 text-center text-zinc-500 dark:text-zinc-400 text-xs">
              Riwayat benchmark masih kosong. Jalankan simulasi untuk mengisi tabel perbandingan.
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
