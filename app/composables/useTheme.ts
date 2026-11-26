import { ref } from "vue";

const isDark = ref(false);
const isInitialized = ref(false);

/**
 * Composable untuk mengelola tema Light / Dark Mode.
 * Menyimpan preferensi di localStorage dan menyinkronkan kelas `.dark` pada elemen `<html>`.
 */
export function useTheme() {
  function applyHtmlClass(dark: boolean): void {
    if (typeof document === "undefined") return;
    document.documentElement.classList.toggle("dark", dark);
  }

  function initTheme(): void {
    if (typeof window === "undefined" || isInitialized.value) return;

    const saved = window.localStorage.getItem("theme");
    if (saved === "dark" || saved === "light") {
      isDark.value = saved === "dark";
    } else {
      isDark.value = window.matchMedia("(prefers-color-scheme: dark)").matches;
    }

    applyHtmlClass(isDark.value);
    isInitialized.value = true;
  }

  function toggleTheme(): void {
    isDark.value = !isDark.value;
    applyHtmlClass(isDark.value);
    if (typeof window !== "undefined") {
      window.localStorage.setItem("theme", isDark.value ? "dark" : "light");
    }
  }

  return {
    isDark,
    initTheme,
    toggleTheme,
  };
}
