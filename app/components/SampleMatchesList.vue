<script setup lang="ts">
import type { SampleMatchItem } from "~/types/benchmark";

const props = defineProps<{
  samples: SampleMatchItem[];
  totalMatchesLastRun: number;
}>();

interface HighlightSegments {
  before: string;
  matched: string;
  after: string;
}

function getSegments(item: SampleMatchItem): HighlightSegments {
  return {
    before: item.text.slice(0, item.matchStart),
    matched: item.text.slice(item.matchStart, item.matchEnd + 1),
    after: item.text.slice(item.matchEnd + 1),
  };
}

function formatRank(rank: number): string {
  return `#${String(rank).padStart(3, "0")}`;
}
</script>

<template>
  <div class="flex flex-col gap-4">
    <div
      class="flex flex-col md:flex-row md:items-center justify-between gap-2"
    >
      <div>
        <span
          class="font-mono text-xs uppercase text-zinc-500 dark:text-zinc-400 tracking-wider"
        >
          VERIFIKASI HASIL
        </span>
        <h3
          class="text-xl font-normal text-zinc-900 dark:text-zinc-50 tracking-tight mt-1"
        >
          Sampel Data Cocok (Highlight Substring)
        </h3>
      </div>
      <span
        class="font-mono text-xs text-zinc-500 dark:text-zinc-400 tabular-nums"
      >
        MENAMPILKAN {{ props.samples.length }} DARI
        {{ props.totalMatchesLastRun.toLocaleString("id-ID") }} HASIL
      </span>
    </div>

    <div v-if="props.samples.length > 0" class="grid grid-cols-1 gap-2.5">
      <div
        v-for="item in props.samples"
        :key="`${item.rank}-${item.matchStart}`"
        class="p-4 border border-zinc-200 dark:border-zinc-800 rounded bg-white dark:bg-zinc-950 flex flex-col md:flex-row md:items-center justify-between gap-3 hover:border-zinc-300 dark:hover:border-zinc-700 transition-colors"
      >
        <div class="flex items-start gap-3 cursor-pointer">
          <span
            class="font-mono text-xs text-zinc-500 dark:text-zinc-400 w-9 shrink-0 pt-0.5 tabular-nums"
          >
            {{ formatRank(item.rank) }}
          </span>
          <p class="text-sm text-zinc-900 dark:text-zinc-100 leading-relaxed">
            <span>{{ getSegments(item).before }}</span>
            <span
              class="bg-zinc-900 dark:bg-zinc-100 text-zinc-100 dark:text-zinc-900 font-medium px-1 py-0.5"
            >
              {{ getSegments(item).matched }}
            </span>
            <span>{{ getSegments(item).after }}</span>
          </p>
        </div>
        <span
          class="font-mono text-xs text-zinc-500 dark:text-zinc-400 shrink-0 tabular-nums"
        >
          Index: [{{ item.matchStart }}..{{ item.matchEnd }}] ·
          {{ item.categoryLabel }}
        </span>
      </div>
    </div>

    <div
      v-else
      class="p-6 border border-dashed border-zinc-200 dark:border-zinc-800 rounded bg-zinc-50 dark:bg-zinc-900 text-center font-mono text-xs text-zinc-500 dark:text-zinc-400"
    >
      Belum ada sampel hasil cocok. Jalankan simulasi untuk memverifikasi indeks
      kemunculan substring.
    </div>
  </div>
</template>
