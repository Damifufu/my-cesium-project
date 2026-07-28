const { defineConfig } = require('@vue/cli-service')

module.exports = defineConfig({
  transpileDependencies: true,
  pages: {
    index: 'src/main.js',
    cesiumDemo: 'src/App.js',
    test: 'src/zdy.js'
  }
})
