import type { AlgorithmExecutionResult } from '../types/benchmark'

interface OperationCounter {
  operations: number
  totalChars: number
}

/**
 * Fungsi rekursif pembantu untuk mencocokkan karakter pola dari indeks j hingga m - 1.
 * Setiap perbandingan karakter dihitung ke dalam counter operasi dasar.
 */
function matchCharactersRecursive(
  text: string,
  pattern: string,
  shiftIndex: number,
  charIndex: number,
  counter: OperationCounter
): boolean {
  if (charIndex === pattern.length) {
    return true
  }

  counter.operations++
  if (text[shiftIndex + charIndex] !== pattern[charIndex]) {
    return false
  }

  return matchCharactersRecursive(text, pattern, shiftIndex, charIndex + 1, counter)
}

/**
 * Fungsi rekursif level teks tunggal untuk menggeser posisi awal s dari 0 hingga n - m.
 * Kedalaman call stack dibatasi oleh panjang satu teks (sekitar 50–250 karakter).
 */
function scanShiftsRecursive(
  text: string,
  pattern: string,
  shiftIndex: number,
  maxShift: number,
  counter: OperationCounter
): number {
  if (shiftIndex > maxShift) {
    return 0
  }

  const foundHere = matchCharactersRecursive(text, pattern, shiftIndex, 0, counter) ? 1 : 0
  return foundHere + scanShiftsRecursive(text, pattern, shiftIndex + 1, maxShift, counter)
}

/**
 * Fungsi rekursif level koleksi data menggunakan pola Divide and Conquer.
 * Membagi rentang [left, right] menjadi dua di titik tengah (mid) sehingga
 * kedalaman call stack hanya O(log2 N) — bebas Stack Overflow hingga N = 50.000.
 */
function countRangeDivideAndConquer(
  texts: string[],
  pattern: string,
  left: number,
  right: number,
  counter: OperationCounter
): number {
  if (left > right) {
    return 0
  }

  // Kasus dasar: satu entri teks tunggal
  if (left === right) {
    const text = texts[left] ?? ''
    counter.totalChars += text.length
    const maxShift = text.length - pattern.length

    if (maxShift < 0) {
      return 0
    }

    return scanShiftsRecursive(text, pattern, 0, maxShift, counter)
  }

  // Pembagian Divide and Conquer menjadi dua sub-masalah seimbang
  const mid = Math.floor((left + right) / 2)
  const leftCount = countRangeDivideAndConquer(texts, pattern, left, mid, counter)
  const rightCount = countRangeDivideAndConquer(texts, pattern, mid + 1, right, counter)

  return leftCount + rightCount
}

/**
 * Algoritma Naive String Matching (Rekursif — Divide and Conquer + Rekursi Karakter)
 * Kompleksitas waktu tetap O(N * n_avg * m), dengan stack O(log2 N + n_max + m).
 */
export function naiveStringMatchRecursive(
  texts: string[],
  pattern: string
): AlgorithmExecutionResult {
  if (pattern.length === 0 || texts.length === 0) {
    return { frequency: 0, operations: 0, totalChars: 0 }
  }

  const counter: OperationCounter = {
    operations: 0,
    totalChars: 0
  }

  const frequency = countRangeDivideAndConquer(texts, pattern, 0, texts.length - 1, counter)

  return {
    frequency,
    operations: counter.operations,
    totalChars: counter.totalChars
  }
}
