<p align="center">
  <a href="https://nuxt.com" target="_blank">
    <img src="https://nuxt.com/assets/design-kit/icon-green.svg" width="120" alt="Nuxt Logo">
  </a>
</p>

<h1 align="center">Amazon Brand Matcher</h1>
<p align="center">Website analisis &amp; perbandingan efisiensi algoritma <strong>Naive String Matching</strong> (Iteratif vs Rekursif — <code>O(n · m)</code>) berbasis Nuxt 4 SPA, Web Worker, Chart.js, dan <em>Amazon Products Dataset 2023</em> — 100% Frontend-Only.</p>

<p align="center">
  <img src="https://img.shields.io/badge/Nuxt-4-00DC82?logo=nuxt.js&logoColor=white" alt="Nuxt 4">
  <img src="https://img.shields.io/badge/Vue-3-4FC08D?logo=vue.js&logoColor=white" alt="Vue 3">
  <img src="https://img.shields.io/badge/TypeScript-Strict-3178C6?logo=typescript&logoColor=white" alt="TypeScript">
  <img src="https://img.shields.io/badge/Tailwind%20CSS-Utility--First-38B2AC?logo=tailwind-css&logoColor=white" alt="Tailwind CSS">
  <img src="https://img.shields.io/badge/Chart.js-4.6-FF6384?logo=chartdotjs&logoColor=white" alt="Chart.js">
  <img src="https://img.shields.io/badge/Web%20Worker-Client--Side-18181B?logoColor=white" alt="Web Worker">
  <img src="https://img.shields.io/badge/Dataset-Amazon%202023-2563EB?logo=kaggle&logoColor=white" alt="Amazon Dataset 2023">
</p>

---

## Tentang Projek

**Amazon Brand Matcher (`projectBrandMatch`)** adalah aplikasi web interaktif Tugas Besar Mata Kuliah **Analisis Kompleksitas Algoritma (Semester Ganjil 2026/2027)** untuk memvalidasi kesesuaian teori kompleksitas waktu asimtotik $O(N \cdot \bar{n} \cdot m)$ dengan performa eksekusi aktual di browser.

Aplikasi ini dirancang **100% Frontend-Only** (tanpa backend, server API, maupun database) dan memanfaatkan kedua berkas *Amazon Products Dataset 2023* dari Kaggle (`amazon_products.csv` dan `amazon_categories.csv`):

- **Algoritma Naive String Matching Murni** — implementasi pencocokan karakter manual satu per satu (`text[s + j] === pattern[j]`) tanpa fungsi pencarian bawaan JavaScript (`.includes()`, `.indexOf()`, atau `RegExp`).
- **Rekursif Aman dari Stack Overflow** — menerapkan *Divide and Conquer* pada level koleksi data ($O(\log_2 N)$ kedalaman *call stack*) dipadukan dengan rekursi karakter murni per teks.
- **Eksekusi Terisolasi di Web Worker** — menjaga antarmuka tetap responsif ($60\text{ FPS}$) tanpa *browser freeze* serta mendukung pembatalan (*cancel*) kapan saja.
- **Dukungan 2 Sumber Dataset Kaggle** — dapat menguji pencarian nama merek pada judul produk (**Dataset Produk** beserta filter kategori opsional) maupun pencarian kata kunci pada **Dataset Kategori**.
- **Grafik, Analisis Otomatis & Ekspor Laporan** — menyajikan grafik garis interaktif (*Linear/Log*), ringkasan analisis otomatis tepat di bawah grafik, tabel perbandingan *running time*, serta ekspor **PNG** dan **CSV** siap lapor.
- **Minimalist UI (Light & Dark Mode)** — antarmuka bersih berbasis 100% kelas utilitas bawaan Tailwind CSS dengan desain *Mobile-First* dan pergantian tema Light/Dark yang sinkron dengan kanvas grafik.

## Fitur

### Pengelolaan 2 Dataset Kaggle (Produk & Kategori)
- **Dataset Produk (`amazon_products`)** — pencarian frekuensi nama merek/kata kunci pada judul produk Amazon (hingga seluruh `1.426.337` baris CSV melalui *chunk* TSV ringan) lengkap dengan *dropdown* **Filter Kategori Produk (Opsional)**.
- **Dataset Kategori (`amazon_categories`)** — pencarian kata kunci pada `248` daftar taksonomi kategori produk Amazon dengan batas input $N$ otomatis menyesuaikan.
- **Indikator Kesiapan Dataset** — kotak indikator status pada header (biru saat dataset siap, merah bila dataset belum tersedia/tidak terdeteksi).

### Algoritma Naive String Matching (Iteratif vs Rekursif)
- **Versi Iteratif** — penelusuran linier bersarang murni dengan ruang tambahan $O(1)$.
- **Versi Rekursif (*Divide & Conquer*)** — membagi rentang koleksi $[left, right]$ di titik tengah $mid$ (kedalaman *stack* $O(\log_2 N)$) lalu melakukan pencocokan karakter secara rekursif murni pada tiap teks.
- **Validasi Identitas Hasil** — memastikan frekuensi kemunculan dan jumlah operasi perbandingan karakter (*basic operations*) antara iteratif dan rekursif **100% identik** ($f_{\text{iter}} = f_{\text{rek}}$).

### Konfigurasi Simulasi & Skenario Uji
- **Input Kata Kunci Adaptif** — dilengkapi chip *quick-pick* sesuai dataset aktif (`Samsung`, `Apple`, `Sony`, `Nike`, `Logitech` untuk Produk; `Electronics`, `Shoes`, `Toys`, `Home`, `Books` untuk Kategori) serta opsi *Case-Insensitive*.
- **Pilihan Metode Algoritma** — pilih **Iteratif**, **Rekursif**, atau **Keduanya** (perbandingan langsung).
- **Variasi Skenario Uji** — mendukung **Average Case** (data nyata Amazon), **Best Case** (pola yang gagal di karakter pertama, $O(N \cdot \bar{n})$), dan **Worst Case** (mode uji sintetik `"AAA...A"` vs `"AAA...B"`, $O(N \cdot n \cdot m)$).
- **Mode Ukuran Masukan ($N$)** — pilih **Satuan (Single N)** untuk menguji satu ukuran $N$ secara langsung (manual atau preset hingga jumlah maksimal data) atau **Otomatis Bertahap (Batch)** untuk membentuk kurva pertumbuhan dalam sekali klik.

### Visualisasi Grafik, Analisis & Ekspor Laporan
- **Grafik *Running Time* (Chart.js)** — membedakan kurva **Iteratif** (garis solid) dan **Rekursif** (garis putus-putus) ramah buta warna, dilengkapi *toggle* skala `Linear / Log` dan *hover tooltip* presisi.
- **Penjelasan Analisis di Bawah Grafik** — ringkasan performa aktual dinamis, rasio kecepatan rata-rata, dan analisis teoritis kompleksitas $O(n \cdot m)$ serta *overhead call stack*.
- **Tabel Perbandingan *Running Time*** — menampilkan sumber, $N$, total karakter, frekuensi, status validasi, waktu Iteratif ($\text{ms}$), waktu Rekursif ($\text{ms}$), rasio kecepatan, dan total operasi karakter.
- **Verifikasi Sampel & Pseudocode** — menampilkan hingga `10` contoh judul/kategori yang cocok dengan *highlight* substring beserta indeks `[start..end]`, dan dokumentasi *pseudocode* 2 kolom.
- **Ekspor & Kontrol Ulang** — tombol **Export PNG** (latar solid siap laporan), **Export CSV**, **Ulangi Simulasi**, dan **Reset Semua Data**.

### UI & Developer Experience
- **Nuxt 4 SPA (`ssr: false`)** dengan navigasi `<NuxtLink>` dan *scroll-spy* aktif otomatis.
- **100% Pure Tailwind CSS** tanpa CSS kustom maupun *inline style*.
- **Light & Dark Mode** tersimpan di `localStorage` dengan warna kanvas Chart.js yang beradaptasi otomatis.
- **TypeScript Strict** penuh tanpa tipe `any`.

## Tech Stack

| Layer | Teknologi | Package / Implementasi |
|---|---|---|
| Framework | Nuxt 4 (Vue 3 SPA) | `nuxt`, `vue`, `vue-router` |
| Styling | Tailwind CSS (Utility-First + Dark Mode) | `@nuxtjs/tailwindcss` |
| Visualisasi Grafik | Chart.js v4 | `chart.js` |
| Ikon | Nuxt Icon & Inline SVG | `@nuxt/icon` |
| Eksekusi Paralel | Web Worker API (ES Module Worker) | `app/workers/benchmark.worker.ts` |
| Pengukuran Waktu | High-Resolution Time API | `performance.now()` |
| Preprocessing Data | Node.js Stream & Readline | `scripts/preprocess-kaggle.mjs` |
| Bahasa | TypeScript (Strict) | `tsconfig.json` |

## Struktur Direktori

```text
projectAka/
├── app/
│   ├── app.vue                              # Shell SPA utama & komposisi seksi
│   ├── algorithms/
│   │   ├── naiveIterative.ts                # Naive String Matching Iteratif + ekstraktor sampel
│   │   └── naiveRecursive.ts                # Naive String Matching Rekursif (Divide & Conquer)
│   ├── components/
│   │   ├── AppHeader.vue                    # Sticky navbar, indikator dataset & toggle Light/Dark
│   │   ├── HeroSection.vue                  # Hero editorial + SVG grid arsitektural
│   │   ├── SpecStripSection.vue             # Strip 4 metrik spesifikasi dataset & O(n·m)
│   │   ├── SimulationPanel.vue              # Workbench konfigurasi 3 langkah + progress bar
│   │   ├── ResultsSection.vue               # Strip metrik, grafik, penjelasan analisis & aksi
│   │   ├── RuntimeChart.vue                 # Grafik garis Chart.js (Linear/Log & Export PNG)
│   │   ├── BenchmarkTable.vue               # Tabel perbandingan 9 kolom + Export CSV
│   │   ├── SampleMatchesList.vue            # Daftar verifikasi sampel cocok (highlight substring)
│   │   ├── AlgorithmDocsSection.vue         # Dokumentasi pseudocode 2 kolom (Iteratif vs Rekursif)
│   │   └── BrandFooter.vue                  # Penutup wordmark projectBrandMatch
│   ├── composables/
│   │   ├── useDataset.ts                    # Pemuatan manifest & metadata kategori
│   │   ├── useSimulation.ts                 # State simulasi, komunikasi Web Worker & Export CSV
│   │   └── useTheme.ts                      # Manajemen tema Light/Dark + localStorage
│   ├── types/
│   │   └── benchmark.ts                     # Shared TypeScript interfaces & types
│   └── workers/
│       └── benchmark.worker.ts              # Lazy chunk loader & eksekusi benchmark terisolasi
├── public/
│   └── data/
│       ├── amazon_categories.json           # Hasil preprocessing 248 kategori
│       ├── amazon_products_meta.json        # Manifest jumlah produk, kategori & daftar chunk
│       └── chunks/
│           └── products_0..7.tsv            # Chunk TSV ringan (category_id + title)
├── scripts/
│   └── preprocess-kaggle.mjs                # Skrip konversi CSV Kaggle -> JSON & TSV chunks
├── nuxt.config.ts                           # Konfigurasi Nuxt 4 SPA (ssr: false, darkMode: class)
└── package.json
```

## Memulai

### Prasyarat

- **Node.js 20** atau lebih baru
- Dataset **[Amazon Products Dataset 2023 (Kaggle)](https://www.kaggle.com/datasets/asaniczka/amazon-products-dataset-2023-1-4m-products)** terdiri dari:
  - `amazon_products.csv`
  - `amazon_categories.csv`
- **Tidak memerlukan backend, database, ataupun file `.env`** karena seluruh aplikasi berjalan 100% di sisi klien (*browser*).

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

### Preprocessing Dataset Kaggle

Letakkan file `amazon_products.csv` dan `amazon_categories.csv` di folder `data-raw/` (atau `public/` / root proyek), lalu jalankan skrip preprocessing untuk mengubah CSV mentah menjadi berkas statis ringan di `public/data/`:

```bash
# npm
npm run preprocess

# yarn
yarn preprocess

# pnpm
pnpm preprocess

# bun
bun run preprocess
```

Skrip ini akan men-generate:
- `public/data/amazon_categories.json` (`248` kategori)
- `public/data/amazon_products_meta.json` (manifest & distribusi jumlah per kategori)
- `public/data/chunks/products_*.tsv` (seluruh `1.426.337` judul produk terpecah menjadi chunk TSV ringan)

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
    └── Muat manifest kategori & metadata produk (~13 KB)
            └── Pilih Sumber Dataset (#simulasi)
                    ├── Data Produk (+ opsi Filter Kategori)
                    └── Data Kategori (248 taksonomi)
                            └── Input Kata Kunci, Metode (Iteratif/Rekursif/Keduanya) & Skenario
                                    └── Pilih Ukuran N (Single N atau Otomatis Batch)
                                            └── Klik "Mulai Simulasi"
                                                    └── Auto-scroll ke Area Hasil (#hasil)
                                                            ├── Ringkasan 4 Metrik & Status Validasi
                                                            ├── Grafik Running Time (Linear/Log + Export PNG)
                                                            ├── Penjelasan Analisis Otomatis di Bawah Grafik
                                                            ├── Tabel Perbandingan Running Time (+ Export CSV)
                                                            └── Sampel Highlight Substring & Pseudocode (#algoritma)
```

**Eksekusi Web Worker & Isolasi Pengukuran**

```text
Main Thread (useSimulation.ts)
    └── postMessage(parameter simulasi + daftar chunk URL)
            └── Web Worker (benchmark.worker.ts)
                    ├── Lazy-fetch chunk TSV sesuai kebutuhan N (di-cache di memori Worker)
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

| Aspek | Implementasi |
| :--- | :--- |
| **Isolasi Timer** | `performance.now()` hanya membungkus fungsi algoritma inti; waktu *fetch* data, filter kategori, normalisasi huruf, dan *render* Vue tidak ikut terhitung. |
| **Presisi pada $N$ Kecil** | Pengulangan otomatis $R$ kali (`10x`–`100x` untuk $N \le 1.000$) lalu dibagi $R$ agar waktu mikro tidak terbaca `0 ms`. |
| **Operasi Dasar** | Kedua algoritma mencatat total perbandingan karakter (*basic operations*) secara identik sebagai bukti kompleksitas yang independen terhadap CPU. |
| **Kompleksitas Waktu** | **Best Case:** $O(N \cdot \bar{n})$ · **Average & Worst Case:** $O(N \cdot \bar{n} \cdot m)$. |
| **Kompleksitas Ruang** | **Iteratif:** $O(1)$ · **Rekursif:** $O(\log_2 N + n_{\max} + m)$ pada *call stack*. |

## Catatan Konfigurasi

- **Nuxt 4 SPA (`ssr: false`)** digunakan tanpa folder `server/` maupun `app/pages/`, sehingga seluruh logika berada di `app/` dan dapat langsung di-*deploy* ke static hosting.
- **100% Frontend-Only & Tanpa Backend** — tidak ada pemanggilan API eksternal, database, atau *environment variable* rahasia.
- **Dark Mode Berbasis Kelas** — diaktifkan melalui `tailwindcss.config.darkMode = 'class'` di `nuxt.config.ts` dan dikelola oleh `useTheme.ts` sehingga kanvas Chart.js ikut berganti palet secara real-time.
- **Single N vs Batch Mode** — berpindah antara mode **Single N** dan **Batch**, mengganti sumber dataset (**Produk** ↔ **Kategori**), atau mengubah filter/skenario otomatis membersihkan riwayat grafik sebelumnya agar skala sumbu $X$ dan $Y$ tetap akurat.
- **Sebelum Deploy ke Vercel / Netlify** — pastikan file mentah `amazon_products.csv` (~358 MB) tidak berada di dalam folder `public/` saat melakukan `nuxt generate` / *deploy* agar tidak ikut tersalin ke hasil build publik.
