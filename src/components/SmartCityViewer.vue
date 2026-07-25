<template>
  <div id="cesiumContainer"></div>
</template>

<script>
import * as Cesium from 'cesium'
import 'cesium/Build/Cesium/Widgets/widgets.css'
// 引入你的 smartCity.js（假设它导出了一些函数）
// 如果 smartCity.js 是直接执行的代码，直接 import 即可
import './smartCity.js'

export default {
  name: 'SmartCityViewer',
  mounted() {
    // 设置 Cesium Ion Token（需要你去 https://cesium.com/ion/signup 免费申请）
    Cesium.Ion.defaultAccessToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiI5MGZkMDZmNy1kMzk0LTQ2NWQtYWMyZS1jMjMwZGRhZGZmOTAiLCJpZCI6Mzg2NDg3LCJpYXQiOjE3NzAxMDk2MTV9.emeJaBvfkIwtNQYjevCnWFcGDfvru-LUjtEFVWetoYU'
    
    // 初始化 Viewer
    const viewer = new Cesium.Viewer('cesiumContainer', {
      terrainProvider: Cesium.createWorldTerrain()
    })
    
    // 如果 smartCity.js 里已经写了初始化逻辑，这里就不需要重复写
    // 否则可以参考下面添加智慧城市的代码
    
    // 示例：添加一个 3D Tiles 模型（替换成你的模型URL）
    // const tileset = viewer.scene.primitives.add(new Cesium.Cesium3DTileset({
    //   url: '你的3D Tiles URL'
    // }))
  }
}
</script>

<style scoped>
#cesiumContainer {
  width: 100vw;
  height: 100vh;
  margin: 0;
  padding: 0;
  overflow: hidden;
}
</style>