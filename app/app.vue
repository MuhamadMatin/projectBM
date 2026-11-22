<script setup lang="ts">
import { onMounted } from 'vue'
import AlgorithmDocsSection from '~/components/AlgorithmDocsSection.vue'
import AppHeader from '~/components/AppHeader.vue'
import BrandFooter from '~/components/BrandFooter.vue'
import HeroSection from '~/components/HeroSection.vue'
import ResultsSection from '~/components/ResultsSection.vue'
import SampleMatchesList from '~/components/SampleMatchesList.vue'
import SimulationPanel from '~/components/SimulationPanel.vue'
import SpecStripSection from '~/components/SpecStripSection.vue'
import { useDataset } from '~/composables/useDataset'
import { useSimulation } from '~/composables/useSimulation'
import { useTheme } from '~/composables/useTheme'

const { initTheme } = useTheme()

const {
  categoryOptions,
  totalProducts,
  totalCategories,
  isLoadingDataset,
  isDatasetReady,
  datasetError,
  loadDatasets
} = useDataset()

const {
  config,
  results,
  sampleMatches,
  totalMatchesLastRun,
  latestRow,
  isRunning,
  progressPercent,
  currentRunningN,
  statusText,
  validationError,
  workerError,
  activeMaxN,
  activeSinglePresets,
  activeBatchSizes,
  selectSource,
  selectCategory,
  setScenario,
  setMethod,
  setSizeMode,
  runSimulation,
  cancelSimulation,
  resetAll,
  exportCsv
} = useSimulation()

function scrollToResults(): void {
  const target = document.getElementById('hasil')
  if (target) {
    target.scrollIntoView({ behavior: 'smooth' })
  }
}

function handleStartSimulation(): void {
  runSimulation(() => {
    scrollToResults()
  })
}

function handleUpdateKeyword(value: string): void {
  config.value.keyword = value
}

function handleUpdateCaseInsensitive(value: boolean): void {
  config.value.caseInsensitive = value
}

function handleUpdateSingleN(value: number): void {
  config.value.singleN = value
}

onMounted(() => {
  initTheme()
  loadDatasets()
})
</script>

<template>
  <div class="min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-50 antialiased selection:bg-blue-600 selection:text-white dark:selection:bg-blue-400 dark:selection:text-zinc-950 transition-colors">
    <NuxtRouteAnnouncer />

    <div class="max-w-6xl mx-auto lg:border-x lg:border-zinc-200 dark:lg:border-zinc-800 bg-white dark:bg-zinc-950 min-h-screen relative flex flex-col transition-colors">
      <AppHeader
        :is-loading-dataset="isLoadingDataset"
        :is-dataset-ready="isDatasetReady"
      />

      <main class="flex-1 w-full bg-white dark:bg-zinc-950 flex flex-col transition-colors">
        <HeroSection
          :is-loading-dataset="isLoadingDataset"
          :is-dataset-ready="isDatasetReady"
          :dataset-error="datasetError"
          @reload-dataset="loadDatasets(true)"
        />

        <SpecStripSection
          :total-products="totalProducts"
          :total-categories="totalCategories"
        />

        <SimulationPanel
          :config="config"
          :category-options="categoryOptions"
          :total-products="totalProducts"
          :total-categories="totalCategories"
          :active-max-n="activeMaxN"
          :active-single-presets="activeSinglePresets"
          :active-batch-sizes="activeBatchSizes"
          :is-running="isRunning"
          :progress-percent="progressPercent"
          :current-running-n="currentRunningN"
          :status-text="statusText"
          :validation-error="validationError"
          :worker-error="workerError"
          @select-source="selectSource"
          @select-category="selectCategory"
          @update-keyword="handleUpdateKeyword"
          @update-case-insensitive="handleUpdateCaseInsensitive"
          @select-method="setMethod"
          @select-scenario="setScenario"
          @select-size-mode="setSizeMode"
          @update-single-n="handleUpdateSingleN"
          @run-simulation="handleStartSimulation"
          @cancel-simulation="cancelSimulation"
        />

        <ResultsSection
          :results="results"
          :latest-row="latestRow"
          @repeat-simulation="handleStartSimulation"
          @reset-all="resetAll"
          @export-csv="exportCsv"
        />

        <section
          id="algoritma"
          class="relative px-6 py-16 md:px-8 lg:px-14 bg-white dark:bg-zinc-950 transition-colors"
        >
          <div class="flex flex-col gap-12">
            <SampleMatchesList
              :samples="sampleMatches"
              :total-matches-last-run="totalMatchesLastRun"
            />
            <AlgorithmDocsSection />
          </div>
        </section>
      </main>

      <BrandFooter />
    </div>
  </div>
</template>
