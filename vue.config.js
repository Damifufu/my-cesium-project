const { defineConfig } = require('@vue/cli-service')
const webpack = require('webpack')
const path = require('path')

module.exports = defineConfig({
  transpileDependencies: true,
  
  // 多页配置
  pages: {
    index: 'src/main.js',
    cesiumDemo: 'src/App.js',
    test: 'src/zdy.js'
  },
  
  // 生产环境关闭源码映射（减小打包体积）
  productionSourceMap: false,
  
  // 配置 Cesium
  chainWebpack: (config) => {
    // Cesium 别名
    config.resolve.alias.set('cesium', path.resolve(__dirname, 'node_modules/cesium'))
    
    // 定义 CESIUM_BASE_URL
    config.plugin('define').tap((args) => {
      args[0]['CESIUM_BASE_URL'] = JSON.stringify('/')
      return args
    })
    
    // 优化分块（减小单个文件大小）
    config.optimization.splitChunks({
      chunks: 'all',
      cacheGroups: {
        // 把 Cesium 单独打包
        cesium: {
          test: /[\\/]node_modules[\\/]cesium[\\/]/,
          name: 'cesium-chunk',
          priority: 20,
          chunks: 'all'
        },
        // 把 Vue 相关单独打包
        vue: {
          test: /[\\/]node_modules[\\/]vue[\\/]/,
          name: 'vue-chunk',
          priority: 15,
          chunks: 'all'
        },
        // 其他依赖
        vendors: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendors-chunk',
          priority: 10,
          chunks: 'all'
        }
      }
    })
    
    // 限制最大 chunk 数量，防止过度分割
    config.optimization.maxChunks(20)
  },
  
  configureWebpack: {
    plugins: [
      new webpack.optimize.LimitChunkCountPlugin({
        maxChunks: 20
      })
    ],
    // 增加性能提示阈值
    performance: {
      hints: false,
      maxEntrypointSize: 1024000,
      maxAssetSize: 1024000
    }
  }
})
