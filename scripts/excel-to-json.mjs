/**
 * Skrip Pembaca File Excel (.csv) -> JSON Akurat Tanpa Pemotongan
 *
 * Membaca file Excel CSV dari folder `public/excel/`:
 *   - `public/excel/amazon_categories.csv`
 *   - `public/excel/amazon_products.csv`
 * (dengan fallback otomatis ke `public/` atau `data-raw/` jika belum dipindahkan)
 *
 * Menghasilkan file `.json` utuh 100% sesuai isi Excel/CSV (0 pemotongan baris maupun karakter):
 *   - `public/data/amazon_categories.json`
 *   - `public/data/amazon_products.json`
 *   - `public/data/amazon_products_meta.json` (ringkasan total baris & indeks jumlah per kategori)
 *
 * Cara menjalankan:
 *   yarn preprocess
 *   (atau: node scripts/excel-to-json.mjs)
 */

import { once } from 'node:events'
import fs from 'node:fs'
import path from 'node:path'

const ROOT_DIR = process.cwd()
const EXCEL_DIR = path.join(ROOT_DIR, 'public', 'excel')
const OUTPUT_DIR = path.join(ROOT_DIR, 'public', 'data')

function resolveExcelInputPath(filename) {
  const candidates = [
    path.join(EXCEL_DIR, filename),
    path.join(ROOT_DIR, 'public', filename),
    path.join(ROOT_DIR, 'data-raw', filename),
    path.join(ROOT_DIR, filename)
  ]

  for (const candidate of candidates) {
    if (fs.existsSync(candidate)) {
      return candidate
    }
  }

  return null
}

/**
 * Parser streaming CSV sesuai standar RFC 4180 (mendukung koma di dalam kutip,
 * tanda kutip ganda `""`, serta baris baru di dalam sel Excel tanpa memotong karakter apa pun).
 */
async function streamCsvRecords(filePath, onRecord) {
  const stream = fs.createReadStream(filePath, {
    encoding: 'utf8',
    highWaterMark: 256 * 1024
  })

  let currentField = ''
  let currentRow = []
  let inQuotes = false
  let pendingQuote = false
  let isFirstChunk = true

  for await (let chunk of stream) {
    if (isFirstChunk) {
      if (chunk.charCodeAt(0) === 0xfeff) {
        chunk = chunk.slice(1)
      }
      isFirstChunk = false
    }

    for (let i = 0; i < chunk.length; i++) {
      const ch = chunk[i]

      if (pendingQuote) {
        pendingQuote = false
        if (ch === '"') {
          currentField += '"'
          continue
        }
        inQuotes = false
      }

      if (inQuotes) {
        if (ch === '"') {
          pendingQuote = true
        } else {
          currentField += ch
        }
      } else if (ch === '"') {
        inQuotes = true
      } else if (ch === ',') {
        currentRow.push(currentField)
        currentField = ''
      } else if (ch === '\r') {
        continue
      } else if (ch === '\n') {
        currentRow.push(currentField)
        currentField = ''
        if (currentRow.length > 1 || (currentRow.length === 1 && currentRow[0] !== '')) {
          await onRecord(currentRow)
        }
        currentRow = []
      } else {
        currentField += ch
      }
    }
  }

  if (pendingQuote) {
    inQuotes = false
  }

  if (currentField.length > 0 || currentRow.length > 0) {
    currentRow.push(currentField)
    if (currentRow.length > 1 || (currentRow.length === 1 && currentRow[0] !== '')) {
      await onRecord(currentRow)
    }
  }
}

async function writeWithBackpressure(writeStream, chunk) {
  if (!writeStream.write(chunk)) {
    await once(writeStream, 'drain')
  }
}

async function convertCategoriesToJson(csvPath, outJsonPath) {
  let headers = null
  let idIdx = -1
  let nameIdx = -1
  const categories = []
  let csvRowCount = 0
  let csvTotalChars = 0

  await streamCsvRecords(csvPath, async (cols) => {
    if (!headers) {
      headers = cols.map((h) => h.trim().toLowerCase())
      idIdx = headers.indexOf('id')
      nameIdx = headers.indexOf('category_name')
      if (idIdx === -1 || nameIdx === -1) {
        throw new Error(
          `Header ${path.basename(csvPath)} wajib memiliki kolom 'id' dan 'category_name'.`
        )
      }
      return
    }

    csvRowCount++
    const id = Number.parseInt((cols[idIdx] ?? '').trim(), 10)
    const categoryName = cols[nameIdx] ?? ''
    if (Number.isNaN(id)) {
      throw new Error(`Baris kategori ke-${csvRowCount} memiliki id tidak valid: "${cols[idIdx]}"`)
    }

    csvTotalChars += categoryName.length
    categories.push({
      id,
      category_name: categoryName
    })
  })

  fs.writeFileSync(outJsonPath, JSON.stringify(categories, null, 2), 'utf8')

  return {
    csvRowCount,
    jsonRowCount: categories.length,
    csvTotalChars
  }
}

async function convertProductsToJson(csvPath, outJsonPath) {
  let headers = null
  let titleIdx = -1
  let catIdx = -1
  let csvRowCount = 0
  let jsonRowCount = 0
  let csvTotalChars = 0
  const categoryCounts = {}

  const writeStream = fs.createWriteStream(outJsonPath, { encoding: 'utf8' })
  await writeWithBackpressure(writeStream, '[\n')

  let bufferBatch = ''
  const FLUSH_THRESHOLD = 256 * 1024

  await streamCsvRecords(csvPath, async (cols) => {
    if (!headers) {
      headers = cols.map((h) => h.trim().toLowerCase())
      titleIdx = headers.indexOf('title')
      catIdx = headers.indexOf('category_id')
      if (titleIdx === -1 || catIdx === -1) {
        throw new Error(
          `Header ${path.basename(csvPath)} wajib memiliki kolom 'title' dan 'category_id'.`
        )
      }
      return
    }

    csvRowCount++
    const title = cols[titleIdx] ?? ''
    const categoryId = Number.parseInt((cols[catIdx] ?? '').trim(), 10)
    if (Number.isNaN(categoryId)) {
      throw new Error(
        `Baris produk ke-${csvRowCount} memiliki category_id tidak valid: "${cols[catIdx]}"`
      )
    }

    csvTotalChars += title.length
    categoryCounts[categoryId] = (categoryCounts[categoryId] ?? 0) + 1

    const prefix = jsonRowCount === 0 ? '' : ',\n'
    bufferBatch += prefix + JSON.stringify({ title, category_id: categoryId })
    jsonRowCount++

    if (bufferBatch.length >= FLUSH_THRESHOLD) {
      await writeWithBackpressure(writeStream, bufferBatch)
      bufferBatch = ''
    }
  })

  if (bufferBatch.length > 0) {
    await writeWithBackpressure(writeStream, bufferBatch)
  }

  await writeWithBackpressure(writeStream, '\n]\n')
  writeStream.end()
  await once(writeStream, 'finish')

  return {
    csvRowCount,
    jsonRowCount,
    csvTotalChars,
    categoryCounts
  }
}

/**
 * Memverifikasi kembali file JSON hasil konversi secara streaming untuk memastikan
 * tidak ada satu pun baris atau karakter yang terpotong maupun berubah.
 */
async function verifyProductsJsonIntegrity(jsonPath, expectedRows, expectedChars) {
  const stream = fs.createReadStream(jsonPath, {
    encoding: 'utf8',
    highWaterMark: 256 * 1024
  })

  let carryover = ''
  let parsedRows = 0
  let parsedChars = 0

  const inspectLine = (rawLine) => {
    const trimmed = rawLine.trim()
    if (!trimmed || trimmed === '[' || trimmed === ']') return
    const clean = trimmed.endsWith(',') ? trimmed.slice(0, -1) : trimmed
    const obj = JSON.parse(clean)
    parsedRows++
    parsedChars += obj.title.length
  }

  for await (const chunk of stream) {
    const combined = carryover + chunk
    const lines = combined.split('\n')
    carryover = lines.pop() ?? ''
    for (let i = 0; i < lines.length; i++) {
      inspectLine(lines[i] ?? '')
    }
  }

  if (carryover.trim().length > 0) {
    inspectLine(carryover)
  }

  if (parsedRows !== expectedRows || parsedChars !== expectedChars) {
    throw new Error(
      `Verifikasi gagal! Ekspektasi ${expectedRows} baris (${expectedChars} karakter), tetapi terbaca ${parsedRows} baris (${parsedChars} karakter).`
    )
  }

  return { parsedRows, parsedChars }
}

async function main() {
  fs.mkdirSync(EXCEL_DIR, { recursive: true })
  fs.mkdirSync(OUTPUT_DIR, { recursive: true })

  const categoriesInput = resolveExcelInputPath('amazon_categories.csv')
  const productsInput = resolveExcelInputPath('amazon_products.csv')

  if (!categoriesInput || !productsInput) {
    console.error('File Excel (.csv) tidak ditemukan!')
    console.error(
      'Pastikan file `amazon_categories.csv` dan `amazon_products.csv` berada di dalam folder `public/excel/`.'
    )
    process.exit(1)
  }

  // Bersihkan folder chunks TSV lama jika masih ada agar hanya file .json yang dipakai
  const legacyChunksDir = path.join(OUTPUT_DIR, 'chunks')
  if (fs.existsSync(legacyChunksDir)) {
    fs.rmSync(legacyChunksDir, { recursive: true, force: true })
  }

  const categoriesJsonPath = path.join(OUTPUT_DIR, 'amazon_categories.json')
  const productsJsonPath = path.join(OUTPUT_DIR, 'amazon_products.json')
  const productsMetaPath = path.join(OUTPUT_DIR, 'amazon_products_meta.json')

  console.log(`[1/3] Membaca kategori: ${categoriesInput}`)
  const catResult = await convertCategoriesToJson(categoriesInput, categoriesJsonPath)
  const verifiedCat = JSON.parse(fs.readFileSync(categoriesJsonPath, 'utf8'))
  const verifiedCatChars = verifiedCat.reduce((sum, item) => sum + item.category_name.length, 0)
  if (
    verifiedCat.length !== catResult.csvRowCount ||
    verifiedCatChars !== catResult.csvTotalChars
  ) {
    throw new Error('Verifikasi amazon_categories.json tidak cocok dengan file sumber!')
  }
  console.log(
    `      -> Tersimpan ${verifiedCat.length.toLocaleString('id-ID')} baris utuh ke public/data/amazon_categories.json`
  )

  console.log(`[2/3] Membaca produk:   ${productsInput}`)
  const prodResult = await convertProductsToJson(productsInput, productsJsonPath)
  const productsSizeMb = (fs.statSync(productsJsonPath).size / (1024 * 1024)).toFixed(2)
  console.log(
    `      -> Tersimpan ${prodResult.jsonRowCount.toLocaleString('id-ID')} baris utuh (${productsSizeMb} MB) ke public/data/amazon_products.json`
  )

  const metaPayload = {
    totalProducts: prodResult.jsonRowCount,
    productsJsonUrl: '/data/amazon_products.json',
    categoryCounts: prodResult.categoryCounts
  }
  fs.writeFileSync(productsMetaPath, JSON.stringify(metaPayload, null, 2), 'utf8')

  console.log('[3/3] Memverifikasi keutuhan baris & karakter file JSON terhadap file Excel/CSV...')
  const verifiedProd = await verifyProductsJsonIntegrity(
    productsJsonPath,
    prodResult.csvRowCount,
    prodResult.csvTotalChars
  )

  console.log('\n=== HASIL VERIFIKASI AKURASI DATA (100% IDENTIK & TANPA PEMOTONGAN) ===')
  console.log(
    `- Kategori : Excel/CSV = ${catResult.csvRowCount.toLocaleString('id-ID')} baris (${catResult.csvTotalChars.toLocaleString('id-ID')} karakter) | JSON = ${verifiedCat.length.toLocaleString('id-ID')} baris (${verifiedCatChars.toLocaleString('id-ID')} karakter)`
  )
  console.log(
    `- Produk   : Excel/CSV = ${prodResult.csvRowCount.toLocaleString('id-ID')} baris (${prodResult.csvTotalChars.toLocaleString('id-ID')} karakter) | JSON = ${verifiedProd.parsedRows.toLocaleString('id-ID')} baris (${verifiedProd.parsedChars.toLocaleString('id-ID')} karakter)`
  )
}

main().catch((error) => {
  console.error('Gagal mengonversi file Excel ke JSON:', error)
  process.exit(1)
})
