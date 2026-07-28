const { defineConfig } = require('@vue/cli-service')
const path = require('path');
const webpack = require('webpack');

module.exports = defineConfig({
  transpileDependencies: true,
  configureWebpack: {
    resolve: {
      alias: {
        'cesium': path.resolve(__dirname, 'node_modules/cesium')
      }
    },
    plugins: [
      new webpack.DefinePlugin({
        CESIUM_BASE_URL: JSON.stringify('/')
      })
    ]
  }
})
