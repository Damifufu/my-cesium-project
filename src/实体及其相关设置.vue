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
//Cesium.Camera.DEFAULT_VIEW_RECTANGLE = Cesium.Rectangle.fromDegrees(
// 西边的经度
// 89.5,
// 南边维度
// 20.4,
// 东边经度
// 110.4,
// 北边维度
 //61.2
//);

onMounted(async () => {
  var viewer = new Cesium.Viewer("cesiumContainer",{
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
  //    terrainProvider: await Cesium.createWorldTerrainAsync({ // ✅ 新版 API
   //     requestVertexNormals: true,
   //     requestWaterMask: true,
   //   }),    

  });

 // 隐藏logo
  viewer.cesiumWidget.creditContainer.style.display = "none";

  // 生成position是天安门的位置
var position = Cesium.Cartesian3. fromDegrees(116.393428, 39.90923, 100);
var position2 = Cesium. Cartesian3.fromDegrees(115, 20, 13500000);
//flyto,让相机飞往某个地方
//  viwer.camera.flyTo({ 
  viewer.camera.setView({
// 指定相机位置
destination: position2,
//指定相机视角
orientation:{
// 指定相机的朝向,偏航角
heading: Cesium.Math.toRadians(0),
//指定相机的俯仰角,0度是竖直向上,-90度是向下
pitch: Cesium.Math.toRadians(-90),
// 指定相机的滚转角,翻滚角
roll: 0,
}
});
// 通过按键移动相机
document.addEventListener("keydown", (e) => {
// console.log(e);
// 获取相机离地面的高度
var height = viewer. camera.positionCartographic.height;
var moveRate = height / 100;
if (e.key == "w") {
// 设置相机向前移动
  viewer. camera.moveForward(moveRate);
}else if(e.key == "s"){
// 设置相机向后移动
  viewer. camera.moveBackward(moveRate);
}else if(e.key == "a"){
// 设置相机向左移动
  viewer. camera.moveLeft(moveRate);
}else if(e.key == "d"){
// 设置相机向右移动
  viewer.camera.moveRight(moveRate);
} else if (e.key == "q") {
// 设置相机向左旋转相机
  viewer. camera.lookLeft(Cesium.Math.toRadians(0.1));
} else if (e.key == "e"){
// 设置相机向右旋转相机
  viewer.camera.lookRight(Cesium.Math.toRadians(0.1));
}
});

//const viewer = new Cesium.Viewer("cesiumContainer", {
//    globe: false,
//    geocoder: Cesium.IonGeocodeProviderType.GOOGLE,
//});

//try {
 // const tileset = await Cesium.createGooglePhotorealistic3DTileset();
//  viewer.scene.primitives.add(tileset);
//} catch (error) {
 // console.log(`Failed to load tileset: ${error}`);
//}

// 添加3D建筑（异步方式）
//try {
//    const osmBuildings = await Cesium.createOsmBuildingsAsync();
//    viewer.scene.primitives.add(osmBuildings);
//} catch (error) {
 //   console.error('添加3D建筑失败:', error);
//}

// 添加3D模型
const airplane = viewer.entities.add({
name: "Airplane",
position: Cesium.Cartesian3.fromDegrees(113.3191, 23.109, 1500),
model: {
uri: "./tkh/em.glb",
// 设置飞机的最小像素
minimumPixelSize: 256,
// 设置飞机的轮廓
silhouetteSize: 5,
// 设置轮廓的颜色
silhouetteColor: Cesium.Color.WHITE,
// 设置相机距离模型多远的距离显示
distanceDisplayCondition: new Cesium.DistanceDisplayCondition(
0,
200000
),
},
});

// 使用entity创建矩形

// let material = new Cesium.ColorMaterialProperty(
//new Cesium.Color(1.0, 1.0, 1.0, 1.0)
//);
  var rectangle = viewer.entities.add({
    rectangle: {
      coordinates: Cesium.Rectangle. fromDegrees(
// 西边的经度
90,
// 南边维度
20,
// 东边经度
110,
// 北边维度
30

),
// 设置entity材质,MaterialProperty
//material:material
material: Cesium.Color.RED.withAlpha(0.5)

},
});


//primivite创建矩形
//01-创建几何体
let rectGeometry = new Cesium.RectangleGeometry({
    rectangle: Cesium.Rectangle.fromDegrees(
// 西边的经度
115,
// 南边维度
20,
// 东边经度
135,
// 北边维度
30
),
height: 0,
vertexFormat: Cesium.EllipsoidSurfaceAppearance.VERTEX_FORMAT,
});

// 02-创建几何体实例
let instance = new Cesium.GeometryInstance({
geometry: rectGeometry,
attributes: {
color: Cesium. ColorGeometryInstanceAttribute.fromColor(
Cesium.Color.RED.withAlpha(0.5)
),
},
});

// 03-设置外观
//let appearance = new Cesium.PerInstanceColorAppearance({
 // flat: true,
//});

// type color
//let material1 = new Cesium.Material. fromType("Color",{
//color: Cesium.Color.AQUA.withAlpha(0.5),
//});
// 设定几何体都是与地球的椭球体平行
//let appearance = new Cesium. EllipsoidSurfaceAppearance({
//material: material1,
//});

//let appearance = new Cesium.MaterialAppearance({
//material: material1,
//});

// type image
let material1 = new Cesium.Material. fromType("Image", {
image: "./assets/images/logo.png",
repeat: new Cesium.Cartesian2(1.0, 1.0),
});

// type disffuseMap
// let material1 = new Cesium.Material.fromType("DiffuseMap", {
// image: "./texture/logo.png",
// });

// type grid
// let material1 = new Cesium.Material.fromType("Grid", {
//color: Cesium.Color.AQUA.withAlpha(0.5),
//cellAlpha: 0.2,
//lineCount: new Cesium.Cartesian2(4, 4),
//lineThickness: new Cesium.Cartesian2(4.0, 4.0),
// });

//fabric
// let material1 = new Cesium.Material({
//fabric: {
//type: "Color",
//uniforms: {
//color: new Cesium.Color(1.0, 0.0, 0.0, 0.5),
//},
//},
//});

// let material1 = new Cesium.Material({
// fabric: {
// type: "Image",
// uniforms :
// image: "texture/logo.png",  
// },
// }, 
// });

// 编写着色器修改材质
// let material1 = new Cesium.Material({
// fabric:
// uniforms: {},
// source:'
// czm_material czm_getMaterial(czm_materialInput materialInput)
//{
//  czm_material material = czm_getDefaultMaterial(materialInput);
//  material.diffuse = vec3(1.0, 0.0, 0.0);
//  return material;
// }
//',
//},
// });

//自定义
class CustomMaterialPropery{
constructor(){
this.definitionChanged = new Cesium. Event();
Cesium.Material._materialCache. addMaterial("CustomMaterial",{
fabric:{
type:"CustomMaterial",
uniforms: {
},
source:'czm_material czm_getMaterial(czm_materialInput materialInput)
{
// 生成默认的基础材质
czm_material material = czm_getDefaultMaterial(materialInput);
// material.diffuse = vec3(materialInput.st+uTime, 0.0);
float strength = mod((materialInput.st.x-uTime) * 10.0, 1.0);
material.diffuse = vec3(strength, 0.0, 0.0);
return material;'
}
});
}
}





// 04-图元
let primitive = new Cesium.Primitive({
  geometryInstances: instance,
  appearance: appearance,
});
viewer.scene.primitives.add(primitive);

viewer.camera.setView(viewer.entities);



// 创建一个点
var point = viewer.entities.add({
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

// 拾取
var handler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas);
handler.setInputAction(function (movement) {
// console.log(movement);
// scene.pick选中物体
var pickedObject = viewer.scene.pick(movement.position);
console.log(pickedObject);
if (Cesium.defined(pickedObject)) {
  console.log(pickedObject.id);
}
}, Cesium.ScreenSpaceEventType.LEFT_CLICK);

  viewer.camera.setView(viewer.entities);


//线
const glowingLine = viewer.entities.add({
name: "Glowing blue line on the surface",
polyline: {
positions: Cesium.Cartesian3.fromDegreesArray([-75, 37, -125, 37]),
width: 10,
material: new Cesium.PolylineGlowMaterialProperty ({
glowPower: 0.2,
taperPower: 0.5,
color: Cesium.Color.CORNFLOWERBLUE,
}),
},
});

var purpleArrow = viewer. entities. add({
name: "Purple straight arrow at height",
polyline: {
positions: Cesium. Cartesian3. fromDegreesArrayHeights([
75,
43,
500000,
125,
43,
500000,
]),
width: 10,
//arcType: Cesium. ArcType. NONE,//直线
material: new Cesium. PolylineArrowMaterialProperty(
Cesium. Color. PURPLE),
},
});



// 添加文字标签和广告牌
var label = viewer.entities.add({
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
