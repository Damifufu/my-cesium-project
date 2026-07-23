<template>
    <div id="cesiumContainer" ref="cesiumContainer"></div> 
</template>

<script setup>
import * as Cesium from 'cesium';
import 'cesium/Build/Cesium/Widgets/widgets.css';
import { onMounted } from "vue";

Cesium. Ion. defaultAccessToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiI5MGZkMDZmNy1kMzk0LTQ2NWQtYWMyZS1jMjMwZGRhZGZmOTAiLCJpZCI6Mzg2NDg3LCJpYXQiOjE3NzAxMDk2MTV9.emeJaBvfkIwtNQYjevCnWFcGDfvru-LUjtEFVWetoYU'

window.CESIUM_BASE_URL = "/";

// 设置cesium默认视角
Cesium.Camera.DEFAULT_VIEW_RECTANGLE = Cesium.Rectangle.fromDegrees(
// 西边的经度
 89.5,
// 南边维度
 20.4,
// 东边经度
 110.4,
// 北边维度
 61.2
);

onMounted(async () => {
  var viwer = new Cesium.Viewer("cesiumContainer", {
    // 是否显示信息窗口
  infoBox: false,
// 是否显示查询按钮
  geocoder: false,
// 不显示home按钮
  homeButton: false,
// 控制查看器的显示模式
  sceneModePicker: false,
// 是否显示图层选择
  baseLayerPicker: false,
// 是否显示帮助按钮
  navigationHelpButton: false,
// 是否播放动画
  animation: false,
// 是否显示时间轴
  timeline: false,
  // 是否显示全屏按钮
  fullscreenButton: false,

       // 设置地形
      terrainProvider: await Cesium.createWorldTerrainAsync({ // ✅ 新版 API
        requestVertexNormals: true,
        requestWaterMask: true,
      }),
    //导入自定义地形    
   //terrainProvider: new Cesium. CesiumTerrainProvider({
  //url: "./terrains文件名",
 //}),
  // 高德矢量地图,
    imageryProvider: new Cesium.UrlTemplateImageryProvider({
     url: "https://zhfw.tianditu.gov.cn/",
     layer: "tdtVecBasicLayer",
     style: "default",
     format: "image/png",
     tileMatrixSetID: "GoogleMapsCompatible",
   }),
  });
   
  // 地图叠加
  var imageryLayers = viewer. imageryLayers;
  var layer = imageryLayers. addImageryProvider(
    new Cesium. UrlTemplateImageryProvider({
      url: "http://webrd02.is.autonavi.com/appmaptile?lang=zh_cn&size=1&scale=1&style=8&x={x}&y={y}&z={z}",
      layer: "tdtVecBasicLayer",
      style: "default",
      format: "image/png",
      tileMatrixSetID: "GoogleMapsCompatible",
    })
  );
// 设置图层的透明度
layer. alpha = 0.5;


 // 隐藏1ogo
  viwer.cesiumWidget.creditContainer.style.display = "none";
});
</script>

<style>
* {
  margin: 0;
  padding: 0;
}
#cesiumContainer{
width: 100vw;
height: 100vh;
}
</style>
