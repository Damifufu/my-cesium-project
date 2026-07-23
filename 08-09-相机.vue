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
  // 生成position是天安门的位置
var position = Cesium.Cartesian3. fromDegrees(116.393428, 39.90923, 100);
 //flyto,让相机飞往某个地方
//viwer.camera.flyTo({
viwer.camera.setView({
// 指定相机位置
destination: position,
//指定相机视角
orientation:{
// 指定相机的朝向,偏航角
heading: Cesium.Math.toRadians(0),
//指定相机的俯仰角,0度是竖直向上,-90度是向下
pitch: Cesium.Math.toRadians(-20),
// 指定相机的滚转角,翻滚角
roll: 0,
}
});
// 通过按键移动相机
document.addEventListener("keydown", (e) => {
// console.log(e);
// 获取相机离地面的高度
var height = viwer. camera.positionCartographic.height;
var moveRate = height / 100;
if (e.key == "w") {
// 设置相机向前移动
  viwer. camera.moveForward(moveRate);
}else if(e.key == "s"){
// 设置相机向后移动
  viwer. camera.moveBackward(moveRate);
}else if(e.key == "a"){
// 设置相机向左移动
  viwer. camera.moveLeft(moveRate);
J}else if(e.key == "d"){
// 设置相机向右移动
  viwer.camera.moveRight(moveRate);
} else if (e.key == "q") {
// 设置相机向左旋转相机
  viwer. camera.lookLeft(Cesium.Math.toRadians(0.1));
} else if (e.key == "e"){
// 设置相机向右旋转相机
  viwer.camera.lookRight(Cesium.Math.toRadians(0.1));

} else if (e.key == "r") {
// 设置相机向上旋转相机
  viwer.camera.lookUp(Cesium.Math.toRadians(0.1));
} else if (e.key == "f") {
// 设置相机向下旋转相机
  viwer.camera.lookDown(Cesium.Math.toRadians(0.1));
} else if (e.key == "g") {
// 向左逆时针翻滚
  viwer. camera.twistLeft(Cesium.Math.toRadians(0.1));
} else if (e.key == "h")
// 向右顺时针翻滚
  viwer.camera.twistRight(Cesium.Math.toRadians(0.1));
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
