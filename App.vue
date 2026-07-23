<template>
    <div id="cesiumContainer" ref="cesiumContainer"></div> 
</template>

<script setup>
import * as Cesium from 'cesium';
import 'cesium/Build/Cesium/Widgets/widgets.css';
import { onMounted } from "vue";

Cesium. Ion. defaultAccessToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiI3YWZiZWZlNS00ZGJkLTRjMTEtOGUxZC02NDk1MDk0OGQ4MDYiLCJpZCI6Mzg2NDg3LCJpYXQiOjE3NzAxOTcxMDF9._zIVRYkKX0_wXhD3UZv63uoqBXvW2zmKvkk-dyIQeYo'

window.CESIUM_BASE_URL = "/";


onMounted(async () => {
  var viwer = new Cesium.Viewer("cesiumContainer",{
     // 是否显示信息窗口
  infoBox: true,
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
        url: Cesium.IonResource.fromAssetId(1), 
        requestVertexNormals: false,
       requestWaterMask: false,
      }),    

  });


var position = Cesium.Cartesian3. fromDegrees(116.393428, 39.90923, 100);
var position2 = Cesium. Cartesian3.fromDegrees(113.3191, 23.109, 2000);
//flyto,让相机飞往某个地方
//  viwer.camera.flyTo({ 
viwer.camera.setView({
// 指定相机位置
destination: position2,
//指定相机视角
orientation:{
// 指定相机的朝向,偏航角
heading: Cesium.Math.toRadians(0),
//指定相机的俯仰角,0度是竖直向上,-90度是向下
pitch: Cesium.Math.toRadians(-50
),
// 指定相机的滚转角,翻滚角
roll: 0,
}
});

// 先加卫星底图
// var satellite = new Cesium.UrlTemplateImageryProvider({
//   url: 'https://webst0{s}.is.autonavi.com/appmaptile?style=7&x={x}&y={y}&z={z}',
//   subdomains: ['1', '2', '3', '4']
// });

// // 再加道路标注层
// var label = new Cesium.UrlTemplateImageryProvider({
//   url: 'https://webst0{s}.is.autonavi.com/appmaptile?style=8&x={x}&y={y}&z={z}',
//   subdomains: ['1', '2', '3', '4']
// });

// viwer.scene.imageryLayers.addImageryProvider(satellite);
// viwer.scene.imageryLayers.addImageryProvider(label);


 // 隐藏logo
  viwer.cesiumWidget.creditContainer.style.display = "none";

try {
    const osmBuildings = await Cesium.createOsmBuildingsAsync();
    // 设置最大加载距离（米），超出这个距离的建筑不加载
      osmBuildings.maximumScreenSpaceError = 16;  // 默认是16，调大可以降精度提速度
      osmBuildings.maximumMemoryUsage = 512;      // 限制最大内存使用（MB）

// 设置可见距离（米），超出不渲染
      osmBuildings.distanceDisplayCondition = new Cesium.DistanceDisplayCondition(0, 5000);
    viwer.scene.primitives.add(osmBuildings);

    osmBuildings.style = new Cesium.Cesium3DTileStyle({
        color: {
            conditions: [
                 ["${feature['cesium#estimatedHeight']} >= 100", "rgba(255, 1, 1, 0.9)"],
                ["${feature['cesium#estimatedHeight']} >= 50", "rgba(255, 100, 1, 0.9)"],
                ["${feature['cesium#estimatedHeight']} >= 20", "rgba(255, 255, 1, 0.9)"],
                ["true", "rgba(127, 255, 0, 0.9)"]
            ]
        }
    });
} catch (error) {
    console.error('添加3D建筑失败:', error);
}

const infoWindow = document.createElement('div');
infoWindow.style.cssText = `
    position: absolute;
    background: rgba(0, 0, 0, 0.85);
    color: white;
    padding: 12px 16px;
    border-radius: 8px;
    border-left: 4px solid #00aaff;
    font-family: 'Microsoft YaHei', sans-serif;
    font-size: 14px;
    pointer-events: none;
    z-index: 1000;
    max-width: 280px;
    backdrop-filter: blur(8px);
    display: none;
    box-shadow: 0 2px 10px rgba(0,0,0,0.3);
`;
document.body.appendChild(infoWindow);




const handler = new Cesium.ScreenSpaceEventHandler(viwer.scene.canvas);
handler.setInputAction(function(clickEvent) {
    // 兼容不同的位置属性
    let x, y;
    
    if (clickEvent.position) {
        x = clickEvent.position.x;
        y = clickEvent.position.y;
    } else if (clickEvent.endPosition) {
        x = clickEvent.endPosition.x;
        y = clickEvent.endPosition.y;
    } else if (clickEvent.clientX !== undefined) {
        x = clickEvent.clientX;
        y = clickEvent.clientY;
    } else {
        console.warn('无法获取点击位置');
        return;
    }
    
    console.log('点击坐标:', x, y);
    
    // 执行拾取
    const picked = viwer.scene.pick(new Cesium.Cartesian2(x, y));
    
    if (picked && picked.content) {
        try {
            const feature = picked.content.getFeature(picked.featureId);
            
            if (feature && typeof feature.getProperty === 'function') {
                const nameZh = feature.getProperty('name:zh') || feature.getProperty('name') || '未知建筑';
                const height = feature.getProperty('cesium#estimatedHeight') || feature.getProperty('height') || 0;
                const levels = feature.getProperty('building:levels') || '?';
                
                infoWindow.innerHTML = `
                    <div style="font-weight:bold; margin-bottom:8px; color:#00aaff;">📋 建筑信息</div>
                    <div style="font-size:12px; line-height:1.6;">
                        <div><span style="color:#aaa;">🏢 名称：</span>${nameZh}</div>
                        <div><span style="color:#aaa;">📏 高度：</span>${height} 米</div>
                        <div><span style="color:#aaa;">📚 楼层：</span>${levels} 层</div>
                    </div>
                `;
                infoWindow.style.display = 'block';
                
                let left = x + 15;
                let top = y - 10;
                if (left + 280 > window.innerWidth) left = x - 290;
                if (top < 0) top = y + 20;
                
                infoWindow.style.left = left + 'px';
                infoWindow.style.top = top + 'px';
                
                setTimeout(() => {
                    infoWindow.style.display = 'none';
                }, 4000);
            }
        } catch (e) {
            console.error('获取属性失败:', e);
        }
    } else {
        infoWindow.style.display = 'none';
    }
}, Cesium.ScreenSpaceEventType.LEFT_CLICK);

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
