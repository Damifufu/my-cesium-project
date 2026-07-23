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
  var viewer = new Cesium.Viewer("cesiumContainer",{
     // 是否显示信息窗口
 // infoBox: false,
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

// 设置沙箱允许使用js
var iframe = document.getElementsByClassName("cesium-infoBox-iframe") [0];
iframe.setAttribute(
"sandbox",
"allow-same-origin allow-scripts allow-popups allow-forms"
);
iframe.setAttribute("src", "");

 // 隐藏logo
  viewer.cesiumWidget.creditContainer.style.display = "none";
// //3dtile
// const tileset = new Cesium. Cesium3DTileset({
// url: "./Assets/tileset.json",
// });

// viewer.scene.primitives.add(tileset);
// tileset.readyPromise.then(function (tileset){
// viewer.zoomTo(tileset);
// });
// // 3dtiles调试面板
// viewer.extend(Cesium.viewerCesium3DTilesInspectorMixin);



//样式设置
// console.log(tiles3d);
// tiles3d.style = new Cesium.Cesium3DTileStyle({
////  颜色设置,颜色名称/16进制颜色值/rgba颜色值
// color: "color('yellow')",
// color: "rgba(255, 255, 0, 0.5)",
//color: "color('#f00')",
//show: true,
// });

// tiles3d.style = new Cesium.Cesium3DTileStyle({

// color: {
// conditions: [
// [
// "${feature['building']} === 'apartments'",
// "color('rgba(50, 255, 0, 0.5)')",
// ],
// ["${feature['cesium#estimatedHeight' ]} > 300",
// "color('rgba(100, 100, 255, 0.7)')",
// ],
// ["true", "color('white' )"],
// ],
// },
// show: true,
// });

tiles3d.style = new Cesium.Cesium3DTileStyle({
defines: {
distance:
"distance(vec2(${feature['cesium#longitude' ]},${feature['cesium#latitude']}), vec2(113.3191,23.109))",
},
color: {
conditions: [
["${distance} <[0.01","color('rgba(0,0,50, 0.7)')"],
["${distance} < 0.02", "color('rgba(0,0,50, 0.5)')"],
["${distance} < 0.04", "color('rgba(0,0,50,0.2)')"],
["true", "color('white')"],
],
},
show: "${distance} < 0.04 && ${feature['building']} === 'apartments'",
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
