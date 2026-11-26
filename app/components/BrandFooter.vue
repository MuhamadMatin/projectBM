<script setup lang="ts">
// Komponen footer wordmark statis dari pages/code.html (v-once agar nol re-render)
</script>

<template>
  <footer
    class="relative w-full overflow-hidden border-t border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 select-none pt-6 md:pt-10 flex items-center justify-center transition-colors"
  >
    <div class="w-full overflow-hidden flex justify-center items-center pointer-events-none px-4">
      <h2 class="text-center font-semibold tracking-tight leading-none whitespace-nowrap text-7xl md:text-9xl lg:text-12xl select-none text-zinc-900 dark:text-zinc-50 pt-4 mb-3 md:mb-5">
        projectBM
      </h2>
    </div>
  </footer>
  <!-- chip around -->
  <NuxtLink to="https://muhamadmatin.my.id" target="_blank" class="group">
    <span
      aria-hidden="true"
      class="pointer-events-none absolute bottom-7 right-6 md:right-8 z-20 opacity-0 translate-y-1 scale-95 group-hover:opacity-100 group-hover:translate-y-0 group-hover:scale-100 transition-all duration-200 origin-bottom-right"
    >
      <span
        class="relative inline-block px-3.5 py-1.5 rounded-2xl rounded-br-none bg-zinc-900 dark:bg-zinc-50 text-white dark:text-zinc-950 text-xs font-medium whitespace-nowrap shadow-sm"
      >
        yah ketauan
        <svg
          class="absolute -right-2 bottom-0 w-3 h-3 text-zinc-900 dark:text-zinc-50"
          viewBox="0 0 12 12"
          fill="currentColor"
        >
          <path d="M0 0 C0 6 4 10 12 12 L0 12 Z" />
        </svg>
      </span>
    </span>
    <img class="w-[4%] h-[0.4%] md:w-[3%] md:h-[0.75%] lg:w-[2%] lg:h-[0.75%] absolute bottom-0 right-0" src="/video/chip-unscreen.gif" alt="cip" />
  </NuxtLink>
</template>
