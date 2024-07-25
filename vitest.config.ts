import { fileURLToPath } from 'node:url'
import { mergeConfig, defineConfig, configDefaults } from 'vitest/config'
import viteConfig from './vite.config'

export default mergeConfig(
  viteConfig,
  defineConfig({
    test: {
      environment: 'jsdom',
      exclude: [...configDefaults.exclude, 'e2e/**'],
      root: fileURLToPath(new URL('./', import.meta.url))
    },
    css: {
      preprocessorOptions: {
        scss: {
          additionalData: `
            @import "./src/styles/_constants.scss";
            @import "./src/styles/_main.css";
          `
          // @import "./src/styles/_animations.scss"
          // @import "./src/styles/_mixins.scss";
          // @import "./src/styles/_helpers.scss";
        }
      }
    }
  })
)
