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
  // 添加3D建筑（异步方式）
try {
    const osmBuildings = await Cesium.createOsmBuildingsAsync();
    viwer.scene.primitives.add(osmBuildings);
} catch (error) {
    console.error('添加3D建筑失败:', error);
}

// 添加3D模型
const airplane = viwer.entities.add({
name: "Airplane",
position: Cesium.Cartesian3.fromDegrees(113.3191, 23.109, 1500),
model: {
uri: "./tkh/em.glb",
// 设置飞机的最小像素
minimumPixelSize: 128,
// 设置飞机的轮廓
silhouetteSize: 10,
// 设置轮廓的颜色
silhouetteColor: Cesium.Color.WHITE,
// 设置相机距离模型多远的距离显示
distanceDisplayCondition: new Cesium.DistanceDisplayCondition(
0,
200000
),
},
});

// 创建一个点
var point = viwer.entities.add({
// 定位点
position: Cesium.Cartesian3.fromDegrees (113.3191, 23.109, 20),
//点
point: {
pixelSize: 10,
color: Cesium.Color.RED,
outlineColor: Cesium.Color.WHITE,
outlineWidth: 4,

},
});
// 添加文字标签和广告牌
var label = viwer.entities.add({
position: Cesium.Cartesian3.fromDegrees(113.3191, 23.109, 700),
label:{
text:"广州塔",
font: "24px sans-serif",
fillColor: Cesium.Color.WHITE,
outlineColor: Cesium.Color.BLACK,
outlineWidth: 4,
// FILL填充文字,OUTLINE勾勒标签,FILL_AND_OUTLINE填充文字和勾勒标签
style: Cesium. LabelStyle. FILL_AND_OUTLINE,
// 设置文字的偏移量
pixelOffset: new Cesium.Cartesian2(0, -24),
// 设置文字的显示位置,LEFT /RIGHT /CENTER
horizontalOrigin: Cesium.HorizontalOrigin.CENTER,
// 设置文字的显示位置
verticalOrigin: Cesium. VerticalOrigin.BOTTOM,
},
billboard:{
image: "./tkh/mx.png",
width: 50,
height: 50,
// 设置广告牌的显示位置
verticalOrigin: Cesium.VerticalOrigin.TOP,
// 设置广告牌的显示位置
horizontalOrigin: Cesium.HorizontalOrigin.CENTER,
}
});


 // 隐藏logo
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
