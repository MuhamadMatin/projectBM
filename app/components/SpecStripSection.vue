re<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  totalProducts: number
  totalCategories: number
}>()

const productsDisplay = computed(() =>
  props.totalProducts > 0 ? props.totalProducts.toLocaleString('id-ID') : '—'
)

const categoriesDisplay = computed(() =>
  props.totalCategories > 0 ? props.totalCategories.toLocaleString('id-ID') : '—'
)
</script>

<template>
  <section id="spec" class="relative border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 transition-colors">
    <div class="grid grid-cols-2 md:grid-cols-4 divide-y md:divide-y-0 md:divide-x divide-zinc-200 dark:divide-zinc-800">
      <!-- Sel 1 -->
      <div class="p-4 md:p-5 flex flex-col justify-center border-r md:border-r-0 border-zinc-200 dark:border-zinc-800">
        <span class="font-mono text-xs uppercase text-zinc-500 dark:text-zinc-400 tracking-wider">
          STUDI KASUS &amp; PARAMETER
        </span>
        <span class="text-sm font-medium text-zinc-900 dark:text-zinc-50 mt-1">
          Amazon Dataset 2023
        </span>
      </div>

      <!-- Sel 2 -->
      <div class="p-4 md:p-5 flex flex-col justify-center">
        <span class="font-mono text-lg md:text-xl font-light tabular-nums text-zinc-900 dark:text-zinc-50">
          {{ productsDisplay }}
        </span>
        <span class="font-mono text-xs text-zinc-600 dark:text-zinc-400 mt-0.5">
          Judul Produk (CSV 1)
        </span>
      </div>

      <!-- Sel 3 -->
      <div class="p-4 md:p-5 flex flex-col justify-center border-r md:border-r-0 border-zinc-200 dark:border-zinc-800">
        <span class="font-mono text-lg md:text-xl font-light tabular-nums text-zinc-900 dark:text-zinc-50">
          {{ categoriesDisplay }}
        </span>
        <span class="font-mono text-xs text-zinc-600 dark:text-zinc-400 mt-0.5">
          Nama Kategori (CSV 2)
        </span>
      </div>

      <!-- Sel 4 -->
      <div class="p-4 md:p-5 flex flex-col justify-center">
        <span class="font-mono text-lg md:text-xl font-light tabular-nums text-zinc-900 dark:text-zinc-50">
          O(n · m)
        </span>
        <span class="font-mono text-xs text-zinc-600 dark:text-zinc-400 mt-0.5">
          Kompleksitas Asimtotik
        </span>
      </div>
    </div>
  </section>
</template>
