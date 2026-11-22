// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  ssr: false,
  modules: ['@nuxtjs/tailwindcss', '@nuxt/icon/module'],
  tailwindcss: {
    config: {
      darkMode: 'class'
    }
  },
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  app: {
    head: {
      htmlAttrs: {
        lang: 'id'
      },
      title: 'Amazon Brand Matcher — AKA Algorithm Benchmark',
      meta: [
        {
          name: 'description',
          content:
            'Website analisis dan perbandingan efisiensi algoritma Naive String Matching (Iteratif vs Rekursif) berbasis Amazon Products Dataset 2023.'
        }
      ],
      link: [
        { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
        { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' },
        {
          rel: 'stylesheet',
          href: 'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600&family=JetBrains+Mono:wght@400;500&display=swap'
        }
      ]
    }
  }
})
