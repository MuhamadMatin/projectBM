<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from "vue";
import { useTheme } from "~/composables/useTheme";

type NavSectionId = "home" | "simulasi" | "hasil" | "algoritma";

interface NavItem {
  id: NavSectionId;
  label: string;
  to: string;
}

const NAV_ITEMS: NavItem[] = [
  { id: "home", label: "Beranda", to: "#home" },
  { id: "simulasi", label: "Simulasi", to: "#simulasi" },
  { id: "hasil", label: "Hasil & Grafik", to: "#hasil" },
  { id: "algoritma", label: "Algoritma", to: "#algoritma" },
];

const props = defineProps<{
  isLoadingDataset: boolean;
  isDatasetReady: boolean;
}>();

const { isDark, toggleTheme } = useTheme();
const activeSection = ref<NavSectionId>("home");

const statusTitle = computed(() => {
  if (props.isLoadingDataset) return "Memuat Dataset...";
  if (props.isDatasetReady) return "Dataset Siap";
  return "Dataset Tidak Siap / Tidak Terdeteksi";
});

function navigateToSection(id: NavSectionId): void {
  activeSection.value = id;
  if (typeof document !== "undefined") {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  }
}

function updateActiveSectionOnScroll(): void {
  if (typeof window === "undefined" || typeof document === "undefined") return;

  // Jika sudah di dasar halaman, aktifkan seksi terakhir
  const reachedBottom =
    window.innerHeight + window.scrollY >=
    document.documentElement.scrollHeight - 24;
  if (reachedBottom) {
    activeSection.value = "algoritma";
    return;
  }

  const scrollOffset = window.scrollY + 120;
  let current: NavSectionId = "home";

  for (const item of NAV_ITEMS) {
    const el = document.getElementById(item.id);
    if (el && el.offsetTop <= scrollOffset) {
      current = item.id;
    }
  }

  activeSection.value = current;
}

onMounted(() => {
  updateActiveSectionOnScroll();
  window.addEventListener("scroll", updateActiveSectionOnScroll, {
    passive: true,
  });
});

onBeforeUnmount(() => {
  window.removeEventListener("scroll", updateActiveSectionOnScroll);
});
</script>

<template>
  <header
    class="sticky top-0 h-16 bg-white/90 dark:bg-zinc-950/90 backdrop-blur-md border-b border-zinc-200 dark:border-zinc-800 z-50 px-4 md:px-8 flex items-center justify-between transition-colors"
  >
    <div class="flex items-center gap-6 md:gap-8">
      <NuxtLink
        to="#home"
        class="flex items-center gap-2"
        :title="statusTitle"
        @click="navigateToSection('home')"
      >
        <span
          class="w-2 h-2 transition-colors"
          :class="
            props.isDatasetReady
              ? 'bg-blue-600 dark:bg-blue-400'
              : props.isLoadingDataset
                ? 'bg-zinc-400 dark:bg-zinc-500 animate-pulse'
                : 'bg-red-700 dark:bg-red-500'
          "
        ></span>
        <h1
          class="text-sm font-medium tracking-tight text-zinc-900 dark:text-zinc-50"
        >
          projectBM
        </h1>
      </NuxtLink>

      <nav class="hidden md:flex items-center gap-6 text-sm">
        <NuxtLink
          v-for="item in NAV_ITEMS"
          :key="item.id"
          :to="item.to"
          :aria-current="activeSection === item.id ? 'page' : undefined"
          class="transition-colors"
          :class="
            activeSection === item.id
              ? 'text-zinc-900 dark:text-zinc-50 font-medium'
              : 'text-zinc-600 hover:text-zinc-900 dark:hover:text-zinc-50'
          "
          @click="navigateToSection(item.id)"
        >
          {{ item.label }}
        </NuxtLink>
      </nav>
    </div>

    <div class="flex items-center">
      <button
        type="button"
        :aria-label="isDark ? 'Aktifkan Light Mode' : 'Aktifkan Dark Mode'"
        class="inline-flex items-center justify-center w-8 h-8 md:w-9 md:h-9 rounded-md border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-50 hover:border-zinc-300 dark:hover:border-zinc-700 transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-zinc-900 dark:focus-visible:ring-zinc-100"
        @click="toggleTheme"
      >
        <!-- Sun Icon (muncul saat Dark Mode aktif) -->
        <svg
          v-if="isDark"
          class="w-4 h-4"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="1.5"
        >
          <circle cx="12" cy="12" r="4" />
          <path
            stroke-linecap="round"
            d="M12 2v2m0 16v2M4.93 4.93l1.41 1.41m11.32 11.32 1.41 1.41M2 12h2m16 0h2M4.93 19.07l1.41-1.41m11.32-11.32 1.41-1.41"
          />
        </svg>
        <!-- Moon Icon (muncul saat Light Mode aktif) -->
        <svg
          v-else
          class="w-4 h-4"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="1.5"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"
          />
        </svg>
      </button>
    </div>
  </header>
</template>
