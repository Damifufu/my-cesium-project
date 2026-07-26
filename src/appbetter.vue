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
// ============================================================
// ❌ 删除这两行（改用 CDN）
// import * as Cesium from 'cesium';
// import 'cesium/Build/Cesium/Widgets/widgets.css';
// ============================================================

import { onMounted, ref, onBeforeUnmount, nextTick } from "vue";

// ✅ 从 window 获取 Cesium
const Cesium = window.Cesium;

const showLoading = ref(true);
const loadingSubText = ref('初始化场景...');
const totalProgress = ref(0);

let terrainLoaded = false;
let buildingsLoaded = false;
let terrainCheckInterval = null;
let loadingTimeout = null;
let viewer = null;
let osmBuildings = null;

// ✅ 从 window 获取 Token
Cesium.Ion.defaultAccessToken = window.CESIUM_ION_TOKEN || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiI3YWZiZWZlNS00ZGJkLTRjMTEtOGUxZC02NDk1MDk0OGQ4MDYiLCJpZCI6Mzg2NDg3LCJpYXQiOjE3NzAxOTcxMDF9._zIVRYkKX0_wXhD3UZv63uoqBXvW2zmKvkk-dyIQeYo';

// ✅ CESIUM_BASE_URL 已在 index.html 中设置
// window.CESIUM_BASE_URL = "/";

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

function initControls() {
    console.log('🔄 初始化UI控件...');
    if (!viewer) {
        console.warn('viewer 未就绪');
        return;
    }
    const container = document.getElementById('cesiumContainer');
    if (!container) {
        console.warn('容器未找到');
        return;
    }

    // 1. 智能搜索框（顶部居中）
    const searchBox = document.createElement('div');
    searchBox.id = 'searchBox';
    searchBox.style.cssText = `
        position: absolute;
        top: 20px;
        left: 50%;
        transform: translateX(-50%);
        z-index: 999;
        display: flex;
        gap: 0;
        background: rgba(0, 0, 0, 0.75);
        border-radius: 10px;
        backdrop-filter: blur(8px);
        border: 1px solid rgba(255,255,255,0.1);
        overflow: hidden;
        box-shadow: 0 4px 20px rgba(0,0,0,0.3);
    `;
    searchBox.innerHTML = `
        <input id="searchInput" placeholder="🔍 搜索地名 或 输入坐标 (113.3,23.1)" style="
            padding: 10px 16px;
            background: transparent;
            border: none;
            color: white;
            font-size: 13px;
            width: 280px;
            outline: none;
            font-family: 'Microsoft YaHei', sans-serif;
        ">
        <button id="searchBtn" style="
            padding: 10px 18px;
            background: #00aaff;
            border: none;
            color: white;
            cursor: pointer;
            font-size: 14px;
            font-weight: 600;
            transition: background 0.2s;
        " onmouseover="this.style.background='#0088dd'" onmouseout="this.style.background='#00aaff'">前往</button>
    `;
    container.appendChild(searchBox);

    function handleSearch() {
        const input = document.getElementById('searchInput').value.trim();
        if (!input) return;
        
        const parts = input.split(',').map(s => parseFloat(s.trim()));
        if (parts.length === 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
            viewer.camera.flyTo({
                destination: Cesium.Cartesian3.fromDegrees(parts[0], parts[1], 500),
                duration: 1.5
            });
            return;
        }
        
        loadingSubText.value = `正在搜索 "${input}"...`;
        fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(input)}&count=1&language=zh`)
            .then(res => res.json())
            .then(data => {
                loadingSubText.value = '搜索完成';
                if (data.results && data.results.length > 0) {
                    const result = data.results[0];
                    viewer.camera.flyTo({
                        destination: Cesium.Cartesian3.fromDegrees(
                            result.longitude,
                            result.latitude,
                            500
                        ),
                        duration: 1.5
                    });
                    document.getElementById('searchInput').value = 
                        `${result.name} (${result.longitude.toFixed(4)}, ${result.latitude.toFixed(4)})`;
                } else {
                    alert(`未找到 "${input}"，请尝试输入经纬度，如: 113.3, 23.1`);
                }
            })
            .catch(() => {
                loadingSubText.value = '搜索失败';
                alert('搜索失败，请检查网络或输入坐标，如: 113.3, 23.1');
            });
    }

    document.getElementById('searchBtn').addEventListener('click', handleSearch);
    document.getElementById('searchInput').addEventListener('keyup', (e) => {
        if (e.key === 'Enter') {
            handleSearch();
        }
    });

    // 右下角按钮组
    const btnStyle = `
        padding: 10px 16px;
        background: rgba(0, 0, 0, 0.7);
        color: white;
        border: none;
        border-radius: 8px;
        font-size: 13px;
        cursor: pointer;
        backdrop-filter: blur(8px);
        border: 1px solid rgba(255,255,255,0.1);
        transition: all 0.2s;
        font-family: 'Microsoft YaHei', sans-serif;
        min-width: 90px;
        text-align: center;
    `;

    const btnGroup = document.createElement('div');
    btnGroup.id = 'btnGroup';
    btnGroup.style.cssText = `
        position: absolute;
        bottom: 30px;
        right: 20px;
        z-index: 999;
        display: flex;
        flex-direction: column;
        gap: 8px;
    `;
    container.appendChild(btnGroup);

    // 定位
    const locateBtn = document.createElement('button');
    locateBtn.innerHTML = '📍 定位';
    locateBtn.style.cssText = btnStyle;
    locateBtn.addEventListener('click', () => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition((pos) => {
                viewer.camera.flyTo({
                    destination: Cesium.Cartesian3.fromDegrees(
                        pos.coords.longitude,
                        pos.coords.latitude,
                        500
                    ),
                    duration: 2
                });
            }, () => {
                alert('无法获取位置，请检查权限');
            });
        } else {
            alert('浏览器不支持定位');
        }
    });
    btnGroup.appendChild(locateBtn);

    // 复位
    const resetBtn = document.createElement('button');
    resetBtn.innerHTML = '🏠 复位';
    resetBtn.style.cssText = btnStyle;
    resetBtn.addEventListener('click', () => {
        viewer.camera.flyTo({
            destination: Cesium.Cartesian3.fromDegrees(113.3191, 23.100, 1000),
            orientation: {
                heading: Cesium.Math.toRadians(0),
                pitch: Cesium.Math.toRadians(-20),
                roll: 0,
            },
            duration: 1.5
        });
    });
    btnGroup.appendChild(resetBtn);

    // 隐藏建筑
    let buildingsVisible = true;
    const toggleBtn = document.createElement('button');
    toggleBtn.innerHTML = '🏗️ 隐藏建筑';
    toggleBtn.style.cssText = btnStyle;
    toggleBtn.addEventListener('click', () => {
        buildingsVisible = !buildingsVisible;
        if (osmBuildings) {
            osmBuildings.show = buildingsVisible;
        }
        toggleBtn.innerHTML = buildingsVisible ? '🏗️ 隐藏建筑' : '🏗️ 显示建筑';
    });
    btnGroup.appendChild(toggleBtn);

    // 全屏
    const fullscreenBtn = document.createElement('button');
    fullscreenBtn.innerHTML = '⛶ 全屏';
    fullscreenBtn.style.cssText = btnStyle;
    fullscreenBtn.addEventListener('click', () => {
        const el = document.getElementById('cesiumContainer');
        if (el.requestFullscreen) {
            el.requestFullscreen();
        } else if (el.webkitRequestFullscreen) {
            el.webkitRequestFullscreen();
        }
    });
    btnGroup.appendChild(fullscreenBtn);

    // 坐标信息（左下）
    const coordDisplay = document.createElement('div');
    coordDisplay.id = 'coordDisplay';
    coordDisplay.style.cssText = `
        position: absolute;
        bottom: 30px;
        left: 20px;
        z-index: 999;
        color: rgba(255,255,255,0.8);
        font-size: 12px;
        font-family: 'Courier New', monospace;
        background: rgba(0, 0, 0, 0.5);
        padding: 6px 14px;
        border-radius: 6px;
        backdrop-filter: blur(4px);
        pointer-events: none;
        border: 1px solid rgba(255,255,255,0.05);
    `;
    container.appendChild(coordDisplay);

    viewer.scene.canvas.addEventListener('mousemove', (e) => {
        const rect = viewer.scene.canvas.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
        const y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
        
        const ray = viewer.camera.getPickRay(new Cesium.Cartesian2(
            (x + 1) / 2 * rect.width,
            (1 - y) / 2 * rect.height
        ));
        const result = viewer.scene.globe.pick(ray, viewer.scene);
        if (result) {
            const carto = Cesium.Cartographic.fromCartesian(result);
            const lon = Cesium.Math.toDegrees(carto.longitude).toFixed(6);
            const lat = Cesium.Math.toDegrees(carto.latitude).toFixed(6);
            const height = carto.height.toFixed(1);
            coordDisplay.textContent = `📍 ${lon}°, ${lat}°  |  海拔: ${height}m`;
        } else {
            coordDisplay.textContent = '📍 鼠标移出地球';
        }
    });

    console.log('✅ UI控件初始化完成');
}

onMounted(async () => {
    // ✅ 确保 Cesium 已加载
    if (typeof Cesium === 'undefined') {
        console.error('❌ Cesium 未加载，请检查网络');
        loadingSubText.value = 'Cesium 加载失败，请刷新重试';
        setTimeout(() => {
            showLoading.value = false;
        }, 3000);
        return;
    }

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

    await nextTick();
    initControls();

    terrainCheckInterval = setInterval(() => {
        checkAllLoaded(viewer);
    }, 500);

    try {
        loadingSubText.value = '正在加载建筑数据...';

        osmBuildings = await Cesium.createOsmBuildingsAsync();
        
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

    // 点击拾取功能
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
    overflow: hidden;
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

#searchInput::placeholder {
    color: rgba(255, 255, 255, 0.5);
}

[style*="cursor: pointer"]:hover {
    transform: scale(1.02);
}
</style>
