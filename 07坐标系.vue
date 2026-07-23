<template>
    <div id="cesiumContainer" ref="cesiumContainer"></div> 
</template>

<script setup>
import * as Cesium from 'cesium';
import 'cesium/Build/Cesium/Widgets/widgets.css';
import { onMounted } from "vue";

Cesium. Ion. defaultAccessToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiI3YWZiZWZlNS00ZGJkLTRjMTEtOGUxZC02NDk1MDk0OGQ4MDYiLCJpZCI6Mzg2NDg3LCJpYXQiOjE3NzAxOTcxMDF9._zIVRYkKX0_wXhD3UZv63uoqBXvW2zmKvkk-dyIQeYo'

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
  var viwer = new Cesium.Viewer("cesiumContainer",{
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

 
  });

 // 隐藏logo
  viwer.cesiumWidget.creditContainer.style.display = "none";

// 将经纬度转为笛卡尔坐标
var cartesian3 = Cesium. Cartesian3. fromDegrees
// 经度
89.5,
// 纬度
20.4,
// 高度
100

console.log(cartesian3);

// 将笛卡尔坐标转为经纬度
var cartographic = Cesium. Cartographic.fromCartesian(cartesian3);
console.log(cartographic);
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
