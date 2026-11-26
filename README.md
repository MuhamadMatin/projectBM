<p align="center">
  <a href="https://nuxt.com" target="_blank">
    <img src="https://nuxt.com/assets/design-kit/icon-green.svg" width="120" alt="Nuxt Logo">
  </a>
</p>

<h1 align="center">projectBM</h1>
<p align="center">Website analisis &amp; perbandingan efisiensi algoritma <strong>Naive String Matching</strong> (Iteratif vs Rekursif — <code>O(n · m)</code>) berbasis Nuxt 4 SPA, Web Worker, Chart.js, dan <em>Amazon Products Dataset 2023</em> — 100% Frontend-Only.</p>

<p align="center">
  <img src="https://img.shields.io/badge/Nuxt-4-00DC82?logo=nuxt.js&logoColor=white" alt="Nuxt 4">
  <img src="https://img.shields.io/badge/Vue-3-4FC08D?logo=vue.js&logoColor=white" alt="Vue 3">
  <img src="https://img.shields.io/badge/TypeScript-Strict-3178C6?logo=typescript&logoColor=white" alt="TypeScript">
  <img src="https://img.shields.io/badge/Tailwind%20CSS-Utility--First-38B2AC?logo=tailwind-css&logoColor=white" alt="Tailwind CSS">
  <img src="https://img.shields.io/badge/Chart.js-4.6-FF6384?logo=chartdotjs&logoColor=white" alt="Chart.js">
  <img src="https://img.shields.io/badge/Web%20Worker-Streaming%20JSON-18181B?logoColor=white" alt="Web Worker">
  <img src="https://img.shields.io/badge/Dataset-Amazon%202023-2563EB?logo=kaggle&logoColor=white" alt="Amazon Dataset 2023">
</p>

---

## Tentang Projek

**projectBM** adalah aplikasi web interaktif Tugas Besar Mata Kuliah **Analisis Kompleksitas Algoritma (Semester Ganjil 2026/2027)** untuk memvalidasi kesesuaian teori kompleksitas waktu asimtotik $O(N \cdot \bar{n} \cdot m)$ dengan performa eksekusi aktual di browser.

Aplikasi ini dirancang **100% Frontend-Only** (tanpa backend, server API, maupun database) dan memanfaatkan kedua berkas _Amazon Products Dataset 2023_ dari Kaggle (`amazon_products.csv` dan `amazon_categories.csv`) yang dikonversi utuh ke format `.json` tanpa pemotongan data:

- **Algoritma Naive String Matching Murni** — implementasi pencocokan karakter manual satu per satu (`text[s + j] === pattern[j]`) tanpa fungsi pencarian bawaan JavaScript (`.includes()`, `.indexOf()`, atau `RegExp`).
- **Rekursif Aman dari Stack Overflow** — menerapkan _Divide and Conquer_ pada level koleksi data ($O(\log_2 N)$ kedalaman _call stack_) dipadukan dengan rekursi karakter murni per teks.
- **Streaming JSON di Web Worker** — file `amazon_products.json` (`1.426.337` baris utuh, ~`208 MB`) dibaca secara _streaming_ (`ReadableStream`) langsung di Web Worker agar antarmuka tetap responsif ($60\text{ FPS}$) tanpa _browser freeze_ serta mendukung pembatalan (_cancel_) kapan saja.
- **Dukungan 2 Sumber Dataset Kaggle** — dapat menguji pencarian nama merek pada judul produk (**Dataset Produk** beserta filter kategori opsional) maupun pencarian kata kunci pada **Dataset Kategori**.
- **Grafik, Analisis Otomatis & Ekspor Laporan** — menyajikan grafik garis interaktif (_Linear/Log_), ringkasan analisis otomatis tepat di bawah grafik, tabel perbandingan _running time_, serta ekspor **PNG** dan **CSV** siap lapor.
- **Minimalist UI (Light & Dark Mode)** — antarmuka bersih berbasis kelas utilitas bawaan Tailwind CSS dengan desain _Mobile-First_ dan pergantian tema Light/Dark yang sinkron dengan kanvas grafik.

## Fitur

### Pengelolaan 2 Dataset Kaggle (Excel `.csv` $\rightarrow$ `.json` Utuh)

- **Dataset Produk (`amazon_products.json`)** — pencarian frekuensi nama merek/kata kunci pada seluruh `1.426.337` judul produk Amazon (`173.148.866` karakter utuh, 0 pemotongan) lengkap dengan _dropdown_ **Filter Kategori Produk (Opsional)**.
- **Dataset Kategori (`amazon_categories.json`)** — pencarian kata kunci pada `248` daftar taksonomi kategori produk Amazon (`5.617` karakter utuh) dengan batas input $N$ otomatis menyesuaikan.
- **Indikator Kesiapan Dataset** — kotak indikator status tepat di sebelah logo `projectBM` pada header (biru saat dataset siap, merah bila dataset belum tersedia/tidak terdeteksi, abu-abu berdenyut saat memuat).

### Algoritma Naive String Matching (Iteratif vs Rekursif)

- **Versi Iteratif** — penelusuran linier bersarang murni dengan ruang tambahan $O(1)$.
- **Versi Rekursif (_Divide & Conquer_)** — membagi rentang koleksi $[left, right]$ di titik tengah $mid$ (kedalaman _stack_ $O(\log_2 N)$) lalu melakukan pencocokan karakter secara rekursif murni pada tiap teks.
- **Validasi Identitas Hasil** — memastikan frekuensi kemunculan dan jumlah operasi perbandingan karakter (_basic operations_) antara iteratif dan rekursif **100% identik** ($f_{\text{iter}} = f_{\text{rek}}$).

### Konfigurasi Simulasi & Skenario Uji

- **Input Kata Kunci Adaptif** — dilengkapi chip _quick-pick_ sesuai dataset aktif (`Samsung`, `Apple`, `Sony`, `Nike`, `Logitech` untuk Produk; `Electronics`, `Shoes`, `Toys`, `Home`, `Books` untuk Kategori) serta opsi _Case-Insensitive_.
- **Pilihan Metode Algoritma** — pilih **Iteratif**, **Rekursif**, atau **Keduanya** (perbandingan langsung).
- **Variasi Skenario Uji** — mendukung **Average Case** (data nyata Amazon), **Best Case** (pola yang gagal di karakter pertama, $O(N \cdot \bar{n})$), dan **Worst Case** (mode uji sintetik `"AAA...A"` vs `"AAA...B"`, $O(N \cdot n \cdot m)$).
- **Mode Ukuran Masukan ($N$)** — pilih **Satuan (Single N)** untuk menguji satu ukuran $N$ secara langsung sekaligus (manual atau preset hingga jumlah maksimal aktual dataset, misal `1.426.337` atau `248`), atau **Otomatis Bertahap (Batch)** untuk membentuk kurva pertumbuhan dalam sekali klik.
- **Aksi Panel Simulasi** — tombol **Mulai Simulasi**, **Reset Semua Data** (sejajar dengan ukuran & ikon seragam), serta tombol **Batalkan** saat Web Worker sedang berjalan.

### Visualisasi Grafik, Analisis & Ekspor Laporan

- **Grafik _Running Time_ (Chart.js)** — membedakan kurva **Iteratif** (garis solid) dan **Rekursif** (garis putus-putus) ramah buta warna, mendukung tampilan 1 titik terpusat untuk mode _Single N_, _toggle_ skala `Linear / Log`, dan _hover tooltip_ presisi.
- **Penjelasan Analisis di Bawah Grafik** — ringkasan performa aktual dinamis, rasio kecepatan rata-rata, dan analisis teoritis kompleksitas $O(n \cdot m)$ serta _overhead call stack_.
- **Tabel Perbandingan _Running Time_** — menampilkan sumber, $N$, total karakter, frekuensi, status validasi, waktu Iteratif ($\text{ms}$), waktu Rekursif ($\text{ms}$), rasio kecepatan, dan total operasi karakter.
- **Verifikasi Sampel & Pseudocode** — menampilkan hingga `10` contoh judul/kategori yang cocok dengan _highlight_ substring beserta indeks `[start..end]`, dan dokumentasi _pseudocode_ 2 kolom.
- **Ekspor & Kontrol Ulang** — tombol **Export PNG** (latar solid adaptif tema siap laporan), **Export CSV**, **Ulangi Simulasi**, dan **Ulangi / Tambah Uji N**.

### UI & Developer Experience

- **Nuxt 4 SPA (`ssr: false`)** dengan navigasi `<NuxtLink>` dan _scroll-spy_ aktif otomatis (`text-zinc-900 dark:text-zinc-50` saat aktif, `text-zinc-600` saat tidak aktif).
- **Pure Tailwind CSS** tanpa CSS kustom maupun _inline style_.
- **Light & Dark Mode** tersimpan di `localStorage` dengan warna kanvas Chart.js yang beradaptasi otomatis.
- **TypeScript Strict** penuh tanpa tipe `any`.

## Tech Stack

| Layer                             | Teknologi                                          | Package / Implementasi            |
| --------------------------------- | -------------------------------------------------- | --------------------------------- |
| Framework                         | Nuxt 4 (Vue 3 SPA)                                 | `nuxt`, `vue`, `vue-router`       |
| Styling                           | Tailwind CSS (Utility-First + `darkMode: 'class'`) | `@nuxtjs/tailwindcss`             |
| Visualisasi Grafik                | Chart.js v4                                        | `chart.js`                        |
| Ikon                              | Nuxt Icon & Inline SVG                             | `@nuxt/icon`                      |
| Eksekusi Paralel                  | Web Worker API + `ReadableStream`                  | `app/workers/benchmark.worker.ts` |
| Pengukuran Waktu                  | High-Resolution Time API                           | `performance.now()`               |
| Konversi Excel $\rightarrow$ JSON | Node.js RFC 4180 Streaming Parser                  | `scripts/excel-to-json.mjs`       |
| Bahasa                            | TypeScript (Strict)                                | `tsconfig.json`                   |

## Struktur Direktori

```text
projectAka/
├── app/
│   ├── app.vue                              # Shell SPA utama & komposisi seksi
│   ├── algorithms/
│   │   ├── naiveIterative.ts                # Naive String Matching Iteratif + ekstraktor sampel
│   │   └── naiveRecursive.ts                # Naive String Matching Rekursif (Divide & Conquer)
│   ├── components/
│   │   ├── AppHeader.vue                    # Sticky navbar (<NuxtLink>), indikator dataset & toggle Light/Dark
│   │   ├── HeroSection.vue                  # Hero editorial + paragraf studi kasus & SVG grid arsitektural
│   │   ├── SpecStripSection.vue             # Strip 4 metrik spesifikasi dataset & O(n·m)
│   │   ├── SimulationPanel.vue              # Workbench 3 langkah, tombol Mulai/Reset/Batalkan & progress bar
│   │   ├── ResultsSection.vue               # Strip 4 metrik, grafik, penjelasan analisis & bar aksi ulang
│   │   ├── RuntimeChart.vue                 # Grafik garis Chart.js (Linear/Log, Single/Batch & Export PNG)
│   │   ├── BenchmarkTable.vue               # Tabel perbandingan 9 kolom + Export CSV
│   │   ├── SampleMatchesList.vue            # Daftar verifikasi sampel cocok (highlight substring)
│   │   ├── AlgorithmDocsSection.vue         # Dokumentasi pseudocode 2 kolom (Iteratif vs Rekursif)
│   │   └── BrandFooter.vue                  # Penutup wordmark projectBM + easter egg bubble chat
│   ├── composables/
│   │   ├── useDataset.ts                    # Pemuatan metadata kategori & ringkasan jumlah produk
│   │   ├── useSimulation.ts                 # State simulasi, komunikasi Web Worker, reset & Export CSV
│   │   └── useTheme.ts                      # Manajemen tema Light/Dark + localStorage
│   ├── types/
│   │   └── benchmark.ts                     # Shared TypeScript interfaces & types
│   └── workers/
│       └── benchmark.worker.ts              # Streaming reader amazon_products.json & eksekusi benchmark terisolasi
├── public/
│   ├── excel/
│   │   ├── amazon_categories.csv            # Dataset mentah kategori (248 baris)
│   │   └── amazon_products.csv              # Dataset mentah produk (1.426.337 baris)
│   ├── data/
│   │   ├── amazon_categories.json           # Hasil konversi utuh 248 kategori (0 terpotong)
│   │   ├── amazon_products.json             # Hasil konversi utuh 1.426.337 produk (0 terpotong)
│   │   └── amazon_products_meta.json        # Manifest total produk & distribusi jumlah per kategori
│   └── video/
│       └── chip-unscreen.gif                # Aset animasi footer
├── scripts/
│   └── excel-to-json.mjs                    # Skrip konversi Excel (.csv) -> JSON utuh + verifikasi otomatis
├── nuxt.config.ts                           # Konfigurasi Nuxt 4 SPA (ssr: false, darkMode: class)
└── package.json
```

## Memulai

### Prasyarat

- **Node.js 20** atau lebih baru
- Dataset **[Amazon Products Dataset 2023 (Kaggle)](https://www.kaggle.com/datasets/asaniczka/amazon-products-dataset-2023-1-4m-products)** terdiri dari:
  - `amazon_products.csv`
  - `amazon_categories.csv`
- **Tidak memerlukan backend, database, ataupun file `.env`** karena seluruh aplikasi berjalan di sisi klien.

### Instalasi

Clone repository dan masuk ke foldernya:

```bash
git clone https://github.com/username/projectAka.git
cd projectAka
```

Install dependensi — pilih package manager yang kamu pakai:

```bash
# npm
npm install

# yarn
yarn install

# pnpm
pnpm install

# bun
bun install
```

### Konversi Excel (`.csv`) ke `.json`

Letakkan file `amazon_products.csv` dan `amazon_categories.csv` di dalam folder **`public/excel/`**, lalu jalankan skrip konversi (`scripts/excel-to-json.mjs`):

```bash
# npm
npm run preprocess
# atau: npm run excel:json

# yarn
yarn preprocess
# atau: yarn excel:json

# pnpm
pnpm preprocess

# bun
bun run preprocess
```

Skrip ini akan men-generate dan langsung memverifikasi keutuhan baris serta jumlah karakter terhadap file Excel sumber (0 pemotongan):

- `public/data/amazon_categories.json` (`248` baris · `5.617` karakter)
- `public/data/amazon_products.json` (`1.426.337` baris · `173.148.866` karakter)
- `public/data/amazon_products_meta.json` (manifest total produk & jumlah per kategori)

### Menjalankan Aplikasi

**Development**

```bash
# npm
npm run dev

# yarn
yarn dev

# pnpm
pnpm dev

# bun
bun run dev
```

**Build production**

```bash
# npm
npm run build

# yarn
yarn build

# pnpm
pnpm build

# bun
bun run build
```

**Generate situs statis (Vercel / Netlify)**

```bash
# npm
npm run generate

# yarn
yarn generate

# pnpm
pnpm generate

# bun
bun run generate
```

**Preview hasil build**

```bash
# npm
npm run preview

# yarn
yarn preview

# pnpm
pnpm preview

# bun
bun run preview
```

Buka `http://localhost:3000` di browser.

## Alur Aplikasi

**Alur Pengguna (User Flow)**

```text
Buka Halaman Utama (#home)
    └── Muat metadata kategori & manifest produk (~21 KB)
            └── Pilih Sumber Dataset (#simulasi)
                    ├── Data Produk (+ opsi Filter Kategori)
                    └── Data Kategori (248 taksonomi)
                            └── Input Kata Kunci, Metode (Iteratif/Rekursif/Keduanya) & Skenario
                                    └── Pilih Ukuran N (Single N atau Otomatis Batch)
                                            ├── Klik "Reset Semua Data" -> Kembalikan form & hapus hasil
                                            └── Klik "Mulai Simulasi"
                                                    └── Auto-scroll ke Area Hasil (#hasil)
                                                            ├── Ringkasan 4 Metrik & Status Validasi
                                                            ├── Grafik Running Time (Linear/Log + Export PNG)
                                                            ├── Penjelasan Analisis Otomatis di Bawah Grafik
                                                            ├── Tabel Perbandingan Running Time (+ Export CSV)
                                                            └── Sampel Highlight Substring & Pseudocode (#algoritma)
```

**Eksekusi Web Worker & Streaming JSON**

```text
Main Thread (useSimulation.ts)
    └── postMessage(parameter simulasi + URL /data/amazon_products.json)
            └── Web Worker (benchmark.worker.ts)
                    ├── Streaming fetch + ReadableStream.getReader() hingga N terpenuhi (di-cache di Worker)
                    ├── Praproses teks (filter kategori & normalisasi case-insensitive)
                    ├── Start Timer: performance.now()
                    │       ├── naiveStringMatchIterative(texts, pattern)
                    │       └── naiveStringMatchRecursive(texts, pattern)
                    ├── Stop Timer & hitung rata-rata durasi (pengulangan R kali untuk N kecil)
                    ├── Validasi kesamaan frekuensi (f_iter === f_rek) & hitung operasi karakter
                    └── Kirim hasil bertahap ke Main Thread -> Render Grafik & Tabel
```

**Algoritma Rekursif Bebas Stack Overflow**

```text
countRangeDivideAndConquer(texts, pattern, left, right)  --> Kedalaman stack O(log2 N)
    ├── left == right (Basis: 1 teks)
    │       └── scanShiftsRecursive(text, pattern, s = 0 .. n - m)
    │               └── matchCharactersRecursive(text, pattern, s, j = 0 .. m - 1)
    └── left < right (Divide & Conquer)
            ├── sub-masalah kiri:  [left .. mid]
            └── sub-masalah kanan: [mid + 1 .. right]
```

## Metodologi Pengukuran

| Aspek                      | Implementasi                                                                                                                                                   |
| :------------------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Isolasi Timer**          | `performance.now()` hanya membungkus fungsi algoritma inti; waktu _streaming_ JSON, filter kategori, normalisasi huruf, dan _render_ Vue tidak ikut terhitung. |
| **Presisi pada $N$ Kecil** | Pengulangan otomatis $R$ kali (`10x`–`100x` untuk $N \le 1.000$) lalu dibagi $R$ agar waktu mikro tidak terbaca `0 ms`.                                        |
| **Operasi Dasar**          | Kedua algoritma mencatat total perbandingan karakter (_basic operations_) secara identik sebagai bukti kompleksitas yang independen terhadap CPU.              |
| **Kompleksitas Waktu**     | **Best Case:** $O(N \cdot \bar{n})$ · **Average & Worst Case:** $O(N \cdot \bar{n} \cdot m)$.                                                                  |
| **Kompleksitas Ruang**     | **Iteratif:** $O(1)$ · **Rekursif:** $O(\log_2 N + n_{\max} + m)$ pada _call stack_.                                                                           |

## Catatan Konfigurasi

- **Nuxt 4 SPA (`ssr: false`)** digunakan tanpa endpoint backend maupun `app/pages/`, sehingga seluruh logika berada di dalam `app/`.
- **100% Frontend-Only & Tanpa Backend** — tidak ada pemanggilan API eksternal, database, atau _environment variable_ rahasia.
- **Konversi Excel $\rightarrow$ JSON Utuh (`scripts/excel-to-json.mjs`)** — menggunakan _RFC 4180 streaming parser_ sehingga seluruh baris dan karakter (termasuk koma di dalam kutip dan karakter khusus) dipertahankan 100% identik tanpa pemotongan.
- **Dark Mode Berbasis Kelas** — diaktifkan melalui `tailwindcss.config.darkMode = 'class'` di `nuxt.config.ts` dan dikelola oleh `useTheme.ts` sehingga kanvas Chart.js ikut berganti palet secara real-time.
- **Isolasi Grafik Antar Mode** — berpindah antara mode **Single N** dan **Batch**, mengganti sumber dataset (**Produk** $\leftrightarrow$ **Kategori**), atau mengubah filter/skenario otomatis membersihkan riwayat grafik sebelumnya agar skala sumbu $X$ dan $Y$ tetap akurat.
- **Catatan Ukuran Aset Sebelum Deploy Statis** — berkas mentah `public/excel/amazon_products.csv` (~`358 MB`) sebaiknya tidak disertakan pada _static deploy_ (Vercel/Netlify) maupun GitHub, karena batas ukuran file GitHub adalah `100 MB` dan aplikasi hanya membutuhkan berkas hasil konversi di `public/data/`.
