import type {
  AlgorithmExecutionResult,
  SampleMatchItem,
  WorkerInputItem,
} from "../types/benchmark";

/**
 * Algoritma Naive String Matching (Iteratif) — O(N * n_avg * m)
 * Pencocokan dilakukan manual karakter demi karakter tanpa fungsi pencarian bawaan JS.
 */
export function naiveStringMatchIterative(
  texts: string[],
  pattern: string,
): AlgorithmExecutionResult {
  const patternLength = pattern.length;
  if (patternLength === 0 || texts.length === 0) {
    return { frequency: 0, operations: 0, totalChars: 0 };
  }

  let frequency = 0;
  let operations = 0;
  let totalChars = 0;

  for (let i = 0; i < texts.length; i++) {
    const text = texts[i] ?? "";
    const textLength = text.length;
    totalChars += textLength;

    const maxShift = textLength - patternLength;
    if (maxShift < 0) {
      continue;
    }

    // Geser posisi awal pencocokan s dari 0 hingga n - m
    for (let s = 0; s <= maxShift; s++) {
      let j = 0;

      // Bandingkan karakter secara manual satu per satu
      while (j < patternLength) {
        operations++;
        if (text[s + j] !== pattern[j]) {
          break;
        }
        j++;
      }

      if (j === patternLength) {
        frequency++;
      }
    }
  }

  return {
    frequency,
    operations,
    totalChars,
  };
}

/**
 * Mengambil hingga `limit` contoh teks yang cocok beserta posisi indeks awal & akhir
 * untuk keperluan verifikasi visual (highlight substring).
 * Dipanggil di luar pengukuran timer agar tidak mempengaruhi running time.
 */
export function collectSampleMatches(
  rawItems: WorkerInputItem[],
  normalizedTexts: string[],
  normalizedPattern: string,
  limit = 10,
): SampleMatchItem[] {
  const samples: SampleMatchItem[] = [];
  const patternLength = normalizedPattern.length;

  if (patternLength === 0 || rawItems.length === 0) {
    return samples;
  }

  for (let i = 0; i < normalizedTexts.length && samples.length < limit; i++) {
    const text = normalizedTexts[i] ?? "";
    const rawItem = rawItems[i];
    if (!rawItem) {
      continue;
    }

    const maxShift = text.length - patternLength;
    if (maxShift < 0) {
      continue;
    }

    for (let s = 0; s <= maxShift; s++) {
      let j = 0;
      while (j < patternLength && text[s + j] === normalizedPattern[j]) {
        j++;
      }

      if (j === patternLength) {
        samples.push({
          rank: samples.length + 1,
          text: rawItem.text,
          matchStart: s,
          matchEnd: s + patternLength - 1,
          categoryLabel: rawItem.categoryLabel,
        });
        break;
      }
    }
  }

  return samples;
}
