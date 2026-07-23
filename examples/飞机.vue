<template>
    <div id="cesiumContainer" ref="cesiumContainer"></div> 
</template>

<script setup>
import * as Cesium from 'cesium';
import 'cesium/Build/Cesium/Widgets/widgets.css';
import { onMounted } from "vue";
import planeData from "@/assets/json/plane.json";

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
  const viewer = new Cesium.Viewer("cesiumContainer",{
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
  animation: true,
// 是否显示时间轴
  timeline: true,
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

  // 设置天空盒
  // skyBox: new Cesium.SkyBox({
  //   sources: {
  //     positiveX:
  //       "./tkh/dx.jpeg",
  //     negativeX:
  //       "./tkh/dy.jpeg",
  //     positiveY:
  //       "./tkh/px.jpeg",
  //     negativeY:
  //       "./tkh/py.jpeg",
  //     positiveZ:
  //       "./tkh/zx.jpeg",
  //     negativeZ:
  //       "./tkh/zy.jpeg",
  //     }
  //   }),
      })
      // 隐藏logo
  viewer.cesiumWidget.creditContainer.style.display = "none";
 // 添加3D建筑（异步方式）
try {
    const osmBuildings = await Cesium.createOsmBuildingsAsync();
    viewer.scene.primitives.add(osmBuildings);
} catch (error) {
    console.error('添加3D建筑失败:', error);
}  


const positionProperty = new Cesium. SampledPositionProperty();

// 时间间隔 30秒
const timeStepInSeconds = 30;
// 整个飞行花费的时间
const totalSeconds = (planeData. length - 1) * timeStepInSeconds;

// 设置起点时间
const time = new Date("2022-03-09T23:10:00Z");

// cesium,默认使用的是儒略日的时间
// 所以需要转换成儒略日的时间
const startJulianDate = Cesium. JulianDate. fromDate(time);
const stopJulianDate = Cesium. JulianDate. addSeconds(
startJulianDate,
totalSeconds,
new Cesium. JulianDate()
);
// 将查看器的时间调整到起点和结束点的范围
viewer.clock.startTime = startJulianDate.clone();
viewer.clock.stopTime = stopJulianDate.clone();
viewer. clock.currentTime = startJulianDate.clone();
// console.log(planeData);
viewer.timeline.zoomTo(startJulianDate,stopJulianDate);
 
planeData. forEach((dataPoint,i)=>{
const time = Cesium. JulianDate. addSeconds(
startJulianDate,
i * timeStepInSeconds,
new Cesium.JulianDate()
);
//设置当前点的位置
const position = Cesium. Cartesian3. fromDegrees(
dataPoint.longitude,
dataPoint.latitude,
dataPoint.height
);
// 添加轨迹采样点
positionProperty.addSample(time, position);

// 添加点
viewer.entities.add({
position: position,
point: {
pixelSize: 10,
color: Cesium.Color.RED,
outlineColor: Cesium.Color.WHITE,
outlineWidth: 2,
},
});
});
// // 创建飞机
// const planeEntity = viewer.entities.add({
// availability: new Cesium. TimeIntervalCollection([
// new Cesium. TimeInterval({
// start: startJulianDate,
// stop: stopJulianDate,
// }),
// ]),
// name:"飞机”,
// // 设置飞机的可用
// position: positionProperty,
// //VelocityOrientationProperty会自动根据采样点,计算出飞机的速度和方向
// orientation: new Cesium. VelocityOrientationProperty(positionProperty),
// model: {
// uri: "./model/Air.glb",
// // minimumPixelSize: 128,
// // maximumScale: 20000,
// },
// // 绘制轨迹线
// path: new Cesium.PathGraphics({
// width: 5,
// }),
// });
// // 相机追踪运动的问题
// viewer. trackedEntity = planeEntity;
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
