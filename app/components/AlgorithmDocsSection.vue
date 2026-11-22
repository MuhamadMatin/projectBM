<script setup lang="ts">
// Komponen dokumentasi pseudocode murni statis (dibungkus v-once agar nol re-render)
</script>

<template>
  <div class="flex flex-col gap-4 pt-4 border-t border-zinc-200 dark:border-zinc-800">
    <div>
      <span class="font-mono text-xs uppercase text-zinc-500 dark:text-zinc-400 tracking-wider">
        ARSITEKTUR KODE PROGRAM
      </span>
      <h3 class="text-xl font-normal text-zinc-900 dark:text-zinc-50 tracking-tight mt-1">
        Perbandingan Implementasi Algoritma
      </h3>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- Kolom 1: Iteratif -->
      <div class="border border-zinc-200 dark:border-zinc-800 rounded-lg p-5 bg-zinc-50 dark:bg-zinc-900">
        <div class="flex flex-wrap items-center justify-between gap-2 mb-4">
          <div class="flex items-center gap-2">
            <span class="w-2 h-2 bg-zinc-900 dark:bg-zinc-100"></span>
            <span class="text-sm font-medium text-zinc-900 dark:text-zinc-50">Iteratif</span>
          </div>
          <span class="font-mono text-xs px-2 py-0.5 rounded bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400">
            Time: O(n·m) · Space: O(1)
          </span>
        </div>

        <div class="font-mono text-xs text-zinc-900 dark:text-zinc-100 bg-zinc-100 dark:bg-zinc-950 p-4 rounded border border-zinc-200 dark:border-zinc-800 leading-relaxed overflow-x-auto">
          <pre><code><span class="text-zinc-500 dark:text-zinc-400">01</span>  <span class="font-semibold">function</span> naiveIterative(texts, pattern):
<span class="text-zinc-500 dark:text-zinc-400">02</span>    freq = 0, ops = 0
<span class="text-zinc-500 dark:text-zinc-400">03</span>    <span class="font-semibold">for</span> i = 0 <span class="font-semibold">to</span> N - 1:
<span class="text-zinc-500 dark:text-zinc-400">04</span>      n = length(texts[i]), m = length(pattern)
<span class="text-zinc-500 dark:text-zinc-400">05</span>      <span class="font-semibold">for</span> s = 0 <span class="font-semibold">to</span> n - m:
<span class="text-zinc-500 dark:text-zinc-400">06</span>        j = 0
<span class="text-zinc-500 dark:text-zinc-400">07</span>        <span class="font-semibold">while</span> j &lt; m:
<span class="text-zinc-500 dark:text-zinc-400">08</span>          ops = ops + 1
<span class="text-zinc-500 dark:text-zinc-400">09</span>          <span class="font-semibold">if</span> texts[i][s + j] != pattern[j]: <span class="font-semibold">break</span>
<span class="text-zinc-500 dark:text-zinc-400">10</span>          j = j + 1
<span class="text-zinc-500 dark:text-zinc-400">11</span>        <span class="font-semibold">if</span> j == m: freq = freq + 1
<span class="text-zinc-500 dark:text-zinc-400">12</span>    <span class="font-semibold">return</span> { freq, ops }</code></pre>
        </div>

        <p class="text-sm text-zinc-600 dark:text-zinc-400 mt-3 leading-relaxed">
          Eksekusi linier berurutan murni dengan dua pointer indeks flat register. Tidak memicu
          alokasi frame stack baru di luar variabel primitif ringkas.
        </p>
      </div>

      <!-- Kolom 2: Rekursif -->
      <div class="border border-zinc-200 dark:border-zinc-800 rounded-lg p-5 bg-zinc-50 dark:bg-zinc-900">
        <div class="flex flex-wrap items-center justify-between gap-2 mb-4">
          <div class="flex items-center gap-2">
            <span class="w-2 h-2 bg-blue-600 dark:bg-blue-400"></span>
            <span class="text-sm font-medium text-zinc-900 dark:text-zinc-50">Rekursif</span>
          </div>
          <span class="font-mono text-xs px-2 py-0.5 rounded bg-white dark:bg-zinc-950 border border-blue-600 dark:border-blue-400 text-blue-600 dark:text-blue-400">
            Time: O(n·m) · Stack: O(log N + n)
          </span>
        </div>

        <div class="font-mono text-xs text-zinc-900 dark:text-zinc-100 bg-zinc-100 dark:bg-zinc-950 p-4 rounded border border-zinc-200 dark:border-zinc-800 leading-relaxed overflow-x-auto">
          <pre><code><span class="text-zinc-500 dark:text-zinc-400">01</span>  <span class="font-semibold">function</span> <span class="text-blue-600 dark:text-blue-400">countRange</span>(texts, pattern, left, right):
<span class="text-zinc-500 dark:text-zinc-400">02</span>    <span class="font-semibold">if</span> left == right:
<span class="text-zinc-500 dark:text-zinc-400">03</span>      <span class="font-semibold">return</span> <span class="text-blue-600 dark:text-blue-400">scanShiftsRec</span>(texts[left], pattern, 0)
<span class="text-zinc-500 dark:text-zinc-400">04</span>    mid = floor((left + right) / 2)
<span class="text-zinc-500 dark:text-zinc-400">05</span>    <span class="font-semibold">return</span> <span class="text-blue-600 dark:text-blue-400">countRange</span>(texts, pattern, left, mid)
<span class="text-zinc-500 dark:text-zinc-400">06</span>         + <span class="text-blue-600 dark:text-blue-400">countRange</span>(texts, pattern, mid + 1, right)
<span class="text-zinc-500 dark:text-zinc-400">07</span>
<span class="text-zinc-500 dark:text-zinc-400">08</span>  <span class="font-semibold">function</span> <span class="text-blue-600 dark:text-blue-400">matchCharRec</span>(text, pattern, s, j):
<span class="text-zinc-500 dark:text-zinc-400">09</span>    <span class="font-semibold">if</span> j == length(pattern): <span class="font-semibold">return</span> true
<span class="text-zinc-500 dark:text-zinc-400">10</span>    ops = ops + 1
<span class="text-zinc-500 dark:text-zinc-400">11</span>    <span class="font-semibold">if</span> text[s + j] != pattern[j]: <span class="font-semibold">return</span> false
<span class="text-zinc-500 dark:text-zinc-400">12</span>    <span class="font-semibold">return</span> <span class="text-blue-600 dark:text-blue-400">matchCharRec</span>(text, pattern, s, j + 1)</code></pre>
        </div>

        <p class="text-sm text-zinc-600 dark:text-zinc-400 mt-3 leading-relaxed">
          Menerapkan Divide &amp; Conquer level koleksi (kedalaman O(log₂ N)) dan pencocokan
          karakter rekursif murni. Alokasi stack frame tambahan menjelaskan delta waktu ekstra pada
          pengujian N berskala besar.
        </p>
      </div>
    </div>
  </div>
</template>
