export type DatasetSource = "products" | "categories";

export type AlgorithmMode = "iterative" | "recursive" | "both";

export type BenchmarkScenario = "average" | "best" | "worst";

export type InputSizeMode = "single" | "batch";

export type ChartScaleMode = "linear" | "log";

export interface ProductRecord {
  title: string;
  category_id: number;
}

export interface CategoryRecord {
  id: number;
  category_name: string;
}

export interface ProductsMetaManifest {
  totalProducts: number;
  productsJsonUrl: string;
  categoryCounts: Record<string, number>;
}

export interface CategoryOption {
  id: number;
  name: string;
  productCount: number;
}

export interface AlgorithmExecutionResult {
  frequency: number;
  operations: number;
  totalChars: number;
}

export interface SampleMatchItem {
  rank: number;
  text: string;
  matchStart: number;
  matchEnd: number;
  categoryLabel: string;
}

export interface BenchmarkRow {
  id: string;
  timestamp: number;
  source: DatasetSource;
  sourceLabel: string;
  categoryLabel: string;
  keyword: string;
  scenario: BenchmarkScenario;
  method: AlgorithmMode;
  caseInsensitive: boolean;
  inputSize: number;
  totalChars: number;
  frequencyIterative: number | null;
  frequencyRecursive: number | null;
  isMatchValid: boolean;
  iterativeMs: number | null;
  recursiveMs: number | null;
  speedupRatio: number | null;
  operationsIterative: number | null;
  operationsRecursive: number | null;
  repeats: number;
}

export interface SimulationConfig {
  source: DatasetSource;
  selectedCategoryId: number | null;
  keyword: string;
  method: AlgorithmMode;
  scenario: BenchmarkScenario;
  caseInsensitive: boolean;
  sizeMode: InputSizeMode;
  singleN: number;
  batchSizes: number[];
}

export interface WorkerInputItem {
  text: string;
  categoryLabel: string;
}

export interface BenchmarkWorkerRequest {
  source: DatasetSource;
  sourceLabel: string;
  categoryLabel: string;
  selectedCategoryId: number | null;
  productsJsonUrl: string;
  totalProducts: number;
  categories: CategoryRecord[];
  keyword: string;
  method: AlgorithmMode;
  scenario: BenchmarkScenario;
  caseInsensitive: boolean;
  sizes: number[];
}

export interface BenchmarkWorkerProgressMessage {
  type: "progress";
  completedSteps: number;
  totalSteps: number;
  currentN: number;
  statusText: string;
}

export interface BenchmarkWorkerRowMessage {
  type: "row";
  row: BenchmarkRow;
}

export interface BenchmarkWorkerCompleteMessage {
  type: "complete";
  samples: SampleMatchItem[];
  totalMatchesLastRun: number;
}

export interface BenchmarkWorkerErrorMessage {
  type: "error";
  message: string;
}

export type BenchmarkWorkerResponse =
  | BenchmarkWorkerProgressMessage
  | BenchmarkWorkerRowMessage
  | BenchmarkWorkerCompleteMessage
  | BenchmarkWorkerErrorMessage;
