<template>
    <div id="cesiumContainer" ref="cesiumContainer">
        <div id="loadingOverlay" v-show="showLoading">
            <div class="loading-content">
                <div class="spinner"></div>
                <div class="loading-text">🌍 (> 。 <) 场景加载中...</div>
                <div class="loading-sub">{{ loadingSubText }}</div>
                <div class="loading-progress-bar" v-if="totalProgress > 0">
                    <div class="progress-fill" :style="{ width: totalProgress + '%' }"></div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import * as Cesium from 'cesium';
import 'cesium/Build/Cesium/Widgets/widgets.css';
import { onMounted, ref, onBeforeUnmount, nextTick } from "vue";

const showLoading = ref(true);
const loadingSubText = ref('初始化场景...');
const totalProgress = ref(0);

let terrainLoaded = false;
let buildingsLoaded = false;
let terrainCheckInterval = null;
let loadingTimeout = null;
let viewer = null;

Cesium.Ion.defaultAccessToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiI3YWZiZWZlNS00ZGJkLTRjMTEtOGUxZC02NDk1MDk0OGQ4MDYiLCJpZCI6Mzg2NDg3LCJpYXQiOjE3NzAxOTcxMDF9._zIVRYkKX0_wXhD3UZv63uoqBXvW2zmKvkk-dyIQeYo';

window.CESIUM_BASE_URL = "/";

function checkAllLoaded(viewerInstance) {
    if (!viewerInstance || !viewerInstance.scene || !viewerInstance.scene.globe) return;
    
    const globe = viewerInstance.scene.globe;
    const terrainReady = globe.tilesLoaded && 
                         globe._surface._tileLoadQueueHigh.length === 0 &&
                         globe._surface._tileLoadQueueLow.length === 0;
    
    if (terrainReady && !terrainLoaded) {
        terrainLoaded = true;
        console.log('✅ 地形加载完成');
    }
    
    let progress = 0;
    if (terrainLoaded) progress += 50;
    if (buildingsLoaded) progress += 50;
    totalProgress.value = progress;
    
    if (terrainLoaded && buildingsLoaded) {
        showLoading.value = false;
        console.log('✅ 所有资源加载完成');
        if (terrainCheckInterval) {
            clearInterval(terrainCheckInterval);
            terrainCheckInterval = null;
        }
        if (loadingTimeout) {
            clearTimeout(loadingTimeout);
            loadingTimeout = null;
        }
    }
}

// 移动端适配默认信息窗口
function adaptInfoBox() {
    if (!viewer) return;
    
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) 
                     || window.innerWidth < 768;
    
    if (!isMobile) return;
    
    // 等待 infoBox 渲染
    setTimeout(() => {
        const infoBox = document.querySelector('.cesium-infoBox');
        if (infoBox) {
            // 移动端样式适配 - 右上角显示，内容完全可见
            infoBox.style.cssText = `
                max-width: 70% !important;
                max-height: none !important;
                height: auto !important;
                width: auto !important;
                min-width: 180px !important;
                border-radius: 10px !important;
                box-shadow: 0 4px 20px rgba(0,0,0,0.4) !important;
                top: 12px !important;
                right: 12px !important;
                left: auto !important;
                bottom: auto !important;
                transform: none !important;
                overflow: visible !important;
            `;
            
            // 适配标题字体减小
            const title = infoBox.querySelector('.cesium-infoBox-title');
            if (title) {
                title.style.fontSize = '13px';
                title.style.padding = '8px 12px 6px';
                title.style.fontWeight = '600';
            }
            
            // 适配内容字体减小，完全可见
            const content = infoBox.querySelector('.cesium-infoBox-body');
            if (content) {
                content.style.fontSize = '11px';
                content.style.padding = '0 12px 10px';
                content.style.lineHeight = '1.5';
                content.style.maxHeight = 'none';
                content.style.overflow = 'visible';
                content.style.height = 'auto';
            }
            
            // 适配关闭按钮缩小
            const closeBtn = infoBox.querySelector('.cesium-infoBox-close');
            if (closeBtn) {
                closeBtn.style.width = '24px';
                closeBtn.style.height = '24px';
                closeBtn.style.fontSize = '16px';
                closeBtn.style.lineHeight = '24px';
                closeBtn.style.top = '4px';
                closeBtn.style.right = '4px';
            }
            
            // 适配 iframe
            const iframe = infoBox.querySelector('iframe');
            if (iframe) {
                iframe.style.width = '100%';
                iframe.style.height = '150px';
                iframe.style.borderRadius = '6px';
            }
        }
    }, 100);
    
    // 监听 infoBox 变化每次打开时重新适配
    const observer = new MutationObserver(() => {
        const infoBox = document.querySelector('.cesium-infoBox');
        if (infoBox && infoBox.style.display !== 'none') {
            infoBox.style.cssText = `
                max-width: 70% !important;
                max-height: none !important;
                height: auto !important;
                width: auto !important;
                min-width: 180px !important;
                border-radius: 10px !important;
                box-shadow: 0 4px 20px rgba(0,0,0,0.4) !important;
                top: 12px !important;
                right: 12px !important;
                left: auto !important;
                bottom: auto !important;
                transform: none !important;
                overflow: visible !important;
            `;
            
            const title = infoBox.querySelector('.cesium-infoBox-title');
            if (title) {
                title.style.fontSize = '13px';
                title.style.padding = '8px 12px 6px';
                title.style.fontWeight = '600';
            }
            
            const content = infoBox.querySelector('.cesium-infoBox-body');
            if (content) {
                content.style.fontSize = '11px';
                content.style.padding = '0 12px 10px';
                content.style.lineHeight = '1.5';
                content.style.maxHeight = 'none';
                content.style.overflow = 'visible';
                content.style.height = 'auto';
            }
            
            const closeBtn = infoBox.querySelector('.cesium-infoBox-close');
            if (closeBtn) {
                closeBtn.style.width = '24px';
                closeBtn.style.height = '24px';
                closeBtn.style.fontSize = '16px';
                closeBtn.style.lineHeight = '24px';
                closeBtn.style.top = '4px';
                closeBtn.style.right = '4px';
            }
        }
    });
    
    const container = document.querySelector('.cesium-infoBox-container');
    if (container) {
        observer.observe(container, {
            attributes: true,
            attributeFilter: ['style'],
            childList: true,
            subtree: true
        });
    }
}

onMounted(async () => {
    loadingSubText.value = '正在加载地形...';
    
    viewer = new Cesium.Viewer("cesiumContainer", {
        infoBox: true,
        geocoder: false,
        homeButton: false,
        sceneModePicker: false,
        baseLayerPicker: false,
        navigationHelpButton: false,
        animation: false,
        timeline: false,
        fullscreenButton: false,
        
        antialias: false,
        useBrowserRecommendedResolution: true,
        resolutionScale: 0.7,
        shadows: false,
        fog: false,
        skyAtmosphere: false,
        
        terrainProvider: await Cesium.createWorldTerrainAsync({
            url: Cesium.IonResource.fromAssetId(1),
            requestVertexNormals: false,
            requestWaterMask: false,
        }),
    });

    viewer.cesiumWidget.creditContainer.style.display = "none";

    viewer.scene.requestRenderMode = true;
    viewer.scene.maximumRenderTime = 1000 / 30;
    
    if (viewer.scene.skyAtmosphere) {
        viewer.scene.skyAtmosphere.show = false;
    }
    if (viewer.scene.fog) {
        viewer.scene.fog.enabled = false;
    }
    if (viewer.scene.globe) {
        viewer.scene.globe.enableLighting = false;
    }

    viewer.camera.setView({
        destination: Cesium.Cartesian3.fromDegrees(113.3191, 23.100, 1000),
        orientation: {
            heading: Cesium.Math.toRadians(0),
            pitch: Cesium.Math.toRadians(-20),
            roll: 0,
        }
    });

    terrainCheckInterval = setInterval(() => {
        checkAllLoaded(viewer);
    }, 500);

    try {
        loadingSubText.value = '正在加载建筑数据...';

        const osmBuildings = await Cesium.createOsmBuildingsAsync();
        
        osmBuildings.maximumScreenSpaceError = 32;
        osmBuildings.maximumMemoryUsage = 256;
        osmBuildings.distanceDisplayCondition = new Cesium.DistanceDisplayCondition(0, 3000);

        osmBuildings.style = new Cesium.Cesium3DTileStyle({
            color: {
                conditions: [
                    ["${feature['cesium#estimatedHeight']} >= 100", "rgba(255, 1, 1, 0.85)"],
                    ["${feature['cesium#estimatedHeight']} >= 50", "rgba(255, 100, 1, 0.85)"],
                    ["${feature['cesium#estimatedHeight']} >= 20", "rgba(255, 255, 1, 0.85)"],
                    ["true", "rgba(127, 255, 0, 0.85)"]
                ]
            }
        });

        viewer.scene.primitives.add(osmBuildings);

        let isFirstLoad = true;
        
        osmBuildings.loadProgress.addEventListener((pending, processing) => {
            if (!isFirstLoad) return;
            
            if (pending > 0) {
                loadingSubText.value = `加载建筑中... (${pending + processing} 个切片)`;
            }
            
            if (pending === 0 && processing === 0) {
                isFirstLoad = false;
                buildingsLoaded = true;
                loadingSubText.value = '建筑加载完成';
                checkAllLoaded(viewer);
            }
        });

        loadingTimeout = setTimeout(() => {
            if (showLoading.value) {
                terrainLoaded = true;
                buildingsLoaded = true;
                showLoading.value = false;
                console.warn('⏰ 超时强制关闭遮罩');
            }
            if (terrainCheckInterval) {
                clearInterval(terrainCheckInterval);
                terrainCheckInterval = null;
            }
        }, 20000);

    } catch (error) {
        console.error('添加3D建筑失败:', error);
        loadingSubText.value = '建筑加载失败，请刷新重试';
        setTimeout(() => {
            if (showLoading.value) {
                buildingsLoaded = true;
                checkAllLoaded(viewer);
            }
        }, 3000);
    }

    await nextTick();
    adaptInfoBox();

    //  自定义信息窗口
    const infoWindow = document.createElement('div');
    
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) 
                     || window.innerWidth < 768;
    
    infoWindow.style.cssText = `
        position: fixed;
        background: rgba(0, 0, 0, 0.88);
        color: white;
        padding: ${isMobile ? '8px 12px' : '12px 16px'};
        border-radius: ${isMobile ? '10px' : '8px'};
        border-left: 3px solid #00aaff;
        font-family: 'Microsoft YaHei', sans-serif;
        font-size: ${isMobile ? '11px' : '14px'};
        pointer-events: none;
        z-index: 1000;
        max-width: ${isMobile ? '65%' : '280px'};
        width: auto;
        height: auto;
        max-height: none;
        overflow: visible;
        backdrop-filter: blur(8px);
        display: none;
        box-shadow: 0 4px 16px rgba(0,0,0,0.35);
        touch-action: none;
        top: 12px;
        right: 12px;
        left: auto;
        bottom: auto;
        line-height: 1.4;
    `;
    document.body.appendChild(infoWindow);

    let pickTimeout = null;

    const handler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas);
    handler.setInputAction(function(clickEvent) {
        if (pickTimeout) return;
        pickTimeout = setTimeout(() => {
            pickTimeout = null;
        }, 500);
        
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
            return;
        }
        
        const picked = viewer.scene.pick(new Cesium.Cartesian2(x, y));
        
        if (picked && picked.content) {
            try {
                const feature = picked.content.getFeature(picked.featureId);
                if (feature && typeof feature.getProperty === 'function') {
                    const nameZh = feature.getProperty('name:zh') || feature.getProperty('name') || '未知建筑';
                    const height = feature.getProperty('cesium#estimatedHeight') || feature.getProperty('height') || 0;
                    const levels = feature.getProperty('building:levels') || '?';
                    
                    infoWindow.innerHTML = `
                        <div style="font-weight:600; margin-bottom:4px; color:#00aaff; font-size:${isMobile ? '12px' : '14px'};">📋 建筑信息</div>
                        <div style="font-size:${isMobile ? '10px' : '12px'}; line-height:1.5;">
                            <div><span style="color:#aaa;">🏢 名称：</span>${nameZh}</div>
                            <div><span style="color:#aaa;">📏 高度：</span>${height} 米</div>
                            <div><span style="color:#aaa;">📚 楼层：</span>${levels} 层</div>
                        </div>
                    `;
                    infoWindow.style.display = 'block';
                    
                    // 右上角固定位置
                    infoWindow.style.top = '12px';
                    infoWindow.style.right = '12px';
                    infoWindow.style.left = 'auto';
                    infoWindow.style.bottom = 'auto';
                    
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

    if (isMobile) {
        handler.setInputAction(() => {
            infoWindow.style.display = 'none';
        }, Cesium.ScreenSpaceEventType.PINCH_START);
        
        handler.setInputAction(() => {
            infoWindow.style.display = 'none';
        }, Cesium.ScreenSpaceEventType.PAN);
    }
    
    window.addEventListener('resize', () => {
        const isMobileNow = window.innerWidth < 768;
        const infoBox = document.querySelector('.cesium-infoBox');
        if (infoBox && isMobileNow) {
            infoBox.style.cssText = `
                max-width: 70% !important;
                max-height: none !important;
                height: auto !important;
                width: auto !important;
                min-width: 180px !important;
                border-radius: 10px !important;
                box-shadow: 0 4px 20px rgba(0,0,0,0.4) !important;
                top: 12px !important;
                right: 12px !important;
                left: auto !important;
                bottom: auto !important;
                transform: none !important;
                overflow: visible !important;
            `;
        }
    });
});

onBeforeUnmount(() => {
    if (terrainCheckInterval) {
        clearInterval(terrainCheckInterval);
        terrainCheckInterval = null;
    }
    if (loadingTimeout) {
        clearTimeout(loadingTimeout);
        loadingTimeout = null;
    }
    if (viewer) {
        viewer.destroy();
        viewer = null;
    }
});
</script>

<style>
* {
    margin: 0;
    padding: 0;
}
#cesiumContainer {
    width: 100vw;
    height: 100vh;
    position: relative;
}

#loadingOverlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    background: rgba(10, 10, 20, 0.88);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 99999;
    backdrop-filter: blur(12px);
    transition: opacity 0.6s ease;
}

.loading-content {
    text-align: center;
    user-select: none;
    min-width: 280px;
}

.spinner {
    width: 60px;
    height: 60px;
    margin: 0 auto 20px;
    border: 4px solid rgba(255, 255, 255, 0.1);
    border-top: 4px solid #00aaff;
    border-radius: 50%;
    animation: spin 0.8s linear infinite;
}

@keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
}

.loading-text {
    color: #ffffff;
    font-size: 22px;
    font-weight: 600;
    font-family: 'Microsoft YaHei', sans-serif;
    letter-spacing: 2px;
}

.loading-sub {
    color: rgba(255, 255, 255, 0.6);
    font-size: 14px;
    font-family: 'Microsoft YaHei', sans-serif;
    margin-top: 8px;
    min-height: 24px;
}

.loading-progress-bar {
    width: 100%;
    max-width: 300px;
    height: 4px;
    background: rgba(255, 255, 255, 0.15);
    border-radius: 2px;
    margin: 16px auto 0;
    overflow: hidden;
}

.progress-fill {
    height: 100%;
    background: linear-gradient(90deg, #00aaff, #0066ff);
    border-radius: 2px;
    transition: width 0.3s ease;
    width: 0%;
}

/*  移动端默认信息窗口右上角显示，内容完全可见  */
@media (max-width: 768px) {
    .cesium-infoBox {
        max-width: 70% !important;
        max-height: none !important;
        height: auto !important;
        width: auto !important;
        min-width: 180px !important;
        border-radius: 10px !important;
        box-shadow: 0 4px 20px rgba(0,0,0,0.4) !important;
        top: 12px !important;
        right: 12px !important;
        left: auto !important;
        bottom: auto !important;
        transform: none !important;
        overflow: visible !important;
    }
    
    .cesium-infoBox-title {
        font-size: 13px !important;
        padding: 8px 12px 6px !important;
        font-weight: 600 !important;
    }
    
    .cesium-infoBox-body {
        font-size: 11px !important;
        padding: 0 12px 10px !important;
        line-height: 1.5 !important;
        max-height: none !important;
        overflow: visible !important;
        height: auto !important;
    }
    
    .cesium-infoBox-close {
        width: 24px !important;
        height: 24px !important;
        font-size: 16px !important;
        line-height: 24px !important;
        top: 4px !important;
        right: 4px !important;
    }
    
    .cesium-infoBox iframe {
        width: 100% !important;
        height: 150px !important;
        border-radius: 6px !important;
    }
}
</style>
