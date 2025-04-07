const { defineConfig } = require('@vue/cli-service')

module.exports = defineConfig({
  transpileDependencies: true,
  devServer: {
    port: 3000
  },
  css: {
    loaderOptions: {
      scss: {
        additionalData: '@import "@/assets/variables.scss";'
      }
    }
  }
})
