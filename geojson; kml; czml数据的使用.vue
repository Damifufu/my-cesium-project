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
  animation: false,
// 是否显示时间轴
  timeline: false,
  // 是否显示全屏按钮
  fullscreenButton: false,

//  // 设置地形
//       terrainProvider: await Cesium.createWorldTerrainAsync({ // ✅ 新版 API
//         requestVertexNormals: true,
//         requestWaterMask: true,
//       }),
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

   });

 // 隐藏logo
  viewer.cesiumWidget.creditContainer.style.display = "none";


// https://geo.datav.aliyun.com/areas_v3/bound/100000_full.json

// //加载geojson数据
// const dataGeo = Cesium.GeoJsonDataSource.load(
// "https://geo.datav.aliyun.com/areas_v3/bound/100000_full.json",
// {
//   stroke: Cesium. Color.RED,
//   fill: Cesium.Color.SKYBLUE.withAlpha(0.5),
//   strokeWidth: 2, 
//  } );
//  //console.log(dataGeo);
// // viewer.dataSources.add(dataGeo);

//  dataGeo.then ((dataSources) => {
//  console.log(dataSources);
//  viewer.dataSources.add(dataSources);

// let entities = dataSources.entities.values;
// entities.forEach((entity, i) =>{
// entity.polygon.material = new Cesium.ColorMaterialProperty(
// Cesium.Color.fromRandom({
// alpha: 1,
// })
// );
// entity.polygon.outline = false;
// let randomNum = parseInt(Math.random() * 10);
// entity.polygon.extrudedHeight = 100000 * randomNum;
// });
// });


// //加载kml数据
// let kmlUrl = "./Assets/facilities1.kml";
// let kmlDataPromise = Cesium. KmlDataSource.load(kmlUrl, {
// camera: viewer.scene.camera,
// canvas: viewer.scene.canvas,
// screenOverlayContainer: viewer.container,
// });
// console.log(kmlDataPromise);
// kmlDataPromise.then(function (dataSource) {
// console.log(dataSource);
// viewer.dataSources.add(dataSource);
// });

// // 加载kmz数据
// let kmlUrl = "./Assets/gdpPerCapita2008.kmz";
// let kmlDataPromise = Cesium. KmlDataSource.load(kmlUrl);
// console.log(kmlDataPromise);
// kmlDataPromise.then(function (dataSource){
// console.log(dataSource);
// viewer.dataSources.add(dataSource);
// });


// //czml
// const czml = [
// {
// id: "document",
// name: "box",
// version: "1.0",

// },
// {
// id: "shape1",
// name: "Blue box",
// position: {
// cartographicDegrees: [-114.0, 40.0, 300000.0],
// },
// box: {
// dimensions: {
// cartesian: [400000.0, 300000.0, 500000.0],
// },
// material: {
// solidColor: {
// color: {
// rgba: [0, 0, 255, 255],
// },
// },
// },
// },
// },
// ];
// console.log(czml);

const czml = [
{
id: "document",
name: "CZML Point - Time Dynamic",
version: "1.0",
},
{
id: "point",
// 物体在什么时间范围可用
availability: "2012-08-04T16:00:00Z/2012-08-04T16:05:00Z",
position: {
// 设置物体的起始时间
epoch: "2012-08-04T16:00:00Z",
// 设置了四个维度,1维是时间,2维是经度,3维是纬度,4维是高度
cartographicDegrees: [
0, -70, 20, 150000, 100, -80, 44, 150000, 200, -90, 18, 150000, 300,
-98, 52, 150000,
],
},
point: {
color: {
rgba: [255, 255, 255, 128],
},
outlineColor: {
rgba: [255, 0, 0, 128],
},
outlineWidth: 3,
pixelSize: 15,
},
},
];

// 先设置 viewer 时钟
const startTime = Cesium.JulianDate.fromIso8601("2012-08-04T16:00:00Z");
const stopTime = Cesium.JulianDate.fromIso8601("2012-08-04T16:05:00Z");

viewer.clock.startTime = startTime;
viewer.clock.stopTime = stopTime;
viewer.clock.currentTime = startTime;
viewer.clock.clockRange = Cesium.ClockRange.LOOP_STOP;
viewer.clock.multiplier = 10;
viewer.clock.shouldAnimate = true;




//加载czm1数据
let promiseData = Cesium.CzmlDataSource.load(czml);
promiseData.then((dataSource) => {
console. log(dataSource);
viewer.dataSources.add(dataSource);
viewer.flyTo(dataSource);
});

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
