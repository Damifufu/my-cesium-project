<template>
  <div class="smart-city-container">
    <div class="header">
      <h1>🏙️ 智慧城市可视化系统 - 城市白模</h1>
      <div class="header-stats">
        <div class="stat-item"><span class="stat-label">实时人数</span><span class="stat-value">{{ formatNumber(populationData.current) }}</span></div>
        <div class="stat-item"><span class="stat-label">能耗指数</span><span class="stat-value">{{ energyData.current }}%</span></div>
        <div class="stat-item"><span class="stat-label">环境指数</span><span class="stat-value">{{ environmentData.aqi }}</span></div>
      </div>
    </div>

    <div class="right-panel">
      <div class="info-card">
        <h3>🚗 实时交通流量</h3>
        <div class="traffic-stats">
          <div class="traffic-item"><span class="road-name">内环高架</span><div class="progress-bar"><div class="progress-fill" :style="{ width: trafficData.innerRing + '%' }"></div></div><span>{{ trafficData.innerRing }}%</span></div>
          <div class="traffic-item"><span class="road-name">外环高速</span><div class="progress-bar"><div class="progress-fill" :style="{ width: trafficData.outerRing + '%' }"></div></div><span>{{ trafficData.outerRing }}%</span></div>
          <div class="traffic-item"><span class="road-name">世纪大道</span><div class="progress-bar"><div class="progress-fill" :style="{ width: trafficData.centuryAve + '%' }"></div></div><span>{{ trafficData.centuryAve }}%</span></div>
        </div>
      </div>

      <div class="info-card">
        <h3>🌿 环境监测</h3>
        <div class="env-grid">
          <div class="env-item"><span>PM2.5</span><span :class="getAirQualityClass(environmentData.pm25)">{{ environmentData.pm25 }}</span></div>
          <div class="env-item"><span>温度</span><span>{{ environmentData.temperature }}°C</span></div>
          <div class="env-item"><span>湿度</span><span>{{ environmentData.humidity }}%</span></div>
          <div class="env-item"><span>噪音</span><span>{{ environmentData.noise }}dB</span></div>
        </div>
      </div>

      <div class="info-card">
        <h3>⚡ 能源监控</h3>
        <div class="energy-chart">
          <div class="energy-bar"><div class="energy-fill electricity" :style="{ height: energyData.electricity + '%' }"></div><span>电力</span></div>
          <div class="energy-bar"><div class="energy-fill water" :style="{ height: energyData.water + '%' }"></div><span>水务</span></div>
          <div class="energy-bar"><div class="energy-fill gas" :style="{ height: energyData.gas + '%' }"></div><span>燃气</span></div>
        </div>
      </div>

      <div class="info-card">
        <h3>📋 实时事件</h3>
        <div class="event-list">
          <div v-for="(event, index) in events" :key="index" class="event-item">
            <span class="event-time">{{ event.time }}</span>
            <span class="event-desc">{{ event.desc }}</span>
          </div>
        </div>
      </div>
    </div>

    <div class="bottom-left">
      <div class="legend">
        <h4>📊 图例</h4>
        <div class="legend-item"><span class="legend-color" style="background: #ff4444"></span>高密度建筑区</div>
        <div class="legend-item"><span class="legend-color" style="background: #ffaa00"></span>商业中心</div>
        <div class="legend-item"><span class="legend-color" style="background: #44ff44"></span>绿地/公园</div>
      </div>
    </div>

    <div v-if="loading" class="loading-overlay">
      <div class="loading-spinner"></div>
      <div class="loading-text">{{ loadStatus }}</div>
    </div>

    <div id="cesiumContainer" class="map-container"></div>
  </div>
</template>

<script>
import * as Cesium from 'cesium'
import 'cesium/Build/Cesium/Widgets/widgets.css'

export default {
  name: 'SmartCity',
  data() {
    return {
      viewer: null,
      cityTileset: null,
      loading: true,
      loadStatus: '正在初始化3D场景...',
      populationData: { current: 125000 },
      trafficData: { innerRing: 78, outerRing: 45, centuryAve: 92 },
      environmentData: { aqi: 52, pm25: 35, temperature: 24, humidity: 65, noise: 58 },
      energyData: { electricity: 67, water: 43, gas: 28, current: 67 },
      events: [
        { time: new Date().toLocaleTimeString(), desc: '系统初始化中...' }
      ],
      dataInterval: null
    }
  },
  mounted() {
    this.$nextTick(() => {
      this.initCesium()
    })
    this.startDataRefresh()
  },
  beforeDestroy() {
    if (this.dataInterval) clearInterval(this.dataInterval)
    if (this.cityTileset && !this.cityTileset.isDestroyed) {
      this.viewer?.scene.primitives.remove(this.cityTileset)
      this.cityTileset.destroy()
    }
    if (this.viewer && !this.viewer.isDestroyed()) {
      this.viewer.destroy()
      this.viewer = null
    }
  },
  methods: {
    formatNumber(num) {
      return num >= 10000 ? (num / 10000).toFixed(1) + '万' : num.toString()
    },
    getAirQualityClass(value) {
      if (value <= 50) return 'good'
      if (value <= 100) return 'moderate'
      return 'bad'
    },
    startDataRefresh() {
      this.dataInterval = setInterval(() => {
        this.trafficData.innerRing = Math.min(100, Math.max(0, this.trafficData.innerRing + (Math.random() - 0.5) * 10))
        this.trafficData.outerRing = Math.min(100, Math.max(0, this.trafficData.outerRing + (Math.random() - 0.5) * 8))
        this.populationData.current = Math.max(80000, this.populationData.current + (Math.random() - 0.5) * 2000)
        this.environmentData.pm25 = Math.max(0, Math.min(200, this.environmentData.pm25 + (Math.random() - 0.5) * 5))
        this.energyData.electricity = Math.min(100, Math.max(20, this.energyData.electricity + (Math.random() - 0.5) * 8))
        this.energyData.current = Math.floor(this.energyData.electricity)
      }, 3000)
    },

    async initCesium() {
      try {
        const container = document.getElementById('cesiumContainer')
        if (!container) return

        this.loadStatus = '创建3D场景...'

        // 初始化 Viewer
        this.viewer = new Cesium.Viewer('cesiumContainer', {
          animation: false,
          baseLayerPicker: false,
          fullscreenButton: false,
          geocoder: false,
          homeButton: false,
          sceneMode: Cesium.SceneMode.SCENE3D,
          sceneModePicker: false,
          navigationHelpButton: false,
          selectionIndicator: false,
          timeline: false,
          infoBox: false,
          scene3DOnly: true,
          orderIndependentTranslucency: false,
          contextOptions: { webgl: { alpha: true } },
          skyBox: new Cesium.SkyBox({ show: false }),
          baseLayer: false
        })

        // 添加高德地图底图
        this.loadStatus = '加载地图底图...'
        this.viewer.imageryLayers.addImageryProvider(
          new Cesium.UrlTemplateImageryProvider({
            url: 'https://webrd02.is.autonavi.com/appmaptile?lang=zh_cn&size=1&scale=2&style=8&x={x}&y={y}&z={z}',
            maximumLevel: 18
          })
        )

        // 设置底图样式
        this.setViewerTheme()

        // 添加简单建筑确保有内容可见
        this.addFallbackBuildings()

        // 尝试加载城市白模
        await this.loadCityModel()

        this.loading = false
        this.events.unshift({ time: new Date().toLocaleTimeString(), desc: '系统初始化完成' })

      } catch (error) {
        console.error('Cesium初始化错误:', error)
        this.loading = false
        this.events.unshift({ time: new Date().toLocaleTimeString(), desc: '初始化完成（使用基础模式）' })
      }
    },

    setViewerTheme() {
      const baseLayer = this.viewer.imageryLayers.get(0)
      if (!baseLayer) return
      
      baseLayer.brightness = 0.6
      baseLayer.contrast = 1.5
      baseLayer.gamma = 0.4
    },

    // 添加备用的简单建筑（确保有内容可见）
    addFallbackBuildings() {
      // 创建一批简单的建筑作为底垫
      const centerLng = 113.2644
      const centerLat = 23.1291
      
      for (let i = 0; i < 30; i++) {
        const angle = Math.random() * Math.PI * 2
        const radius = 0.002 + Math.random() * 0.005
        const lng = centerLng + Math.cos(angle) * radius
        const lat = centerLat + Math.sin(angle) * radius
        const height = 30 + Math.random() * 80
        
        this.viewer.entities.add({
          position: Cesium.Cartesian3.fromDegrees(lng, lat, height / 2),
          box: {
            dimensions: new Cesium.Cartesian3(25, 25, height),
            material: Cesium.Color.fromCssColorString('rgba(65, 131, 196, 0.8)'),
            outline: true,
            outlineColor: Cesium.Color.WHITE,
            outlineWidth: 0.5
          }
        })
      }
      
      // 添加一些光点
      for (let i = 0; i < 50; i++) {
        const lng = 113.2644 + (Math.random() - 0.5) * 0.02
        const lat = 23.1291 + (Math.random() - 0.5) * 0.02
        this.viewer.entities.add({
          position: Cesium.Cartesian3.fromDegrees(lng, lat, 5),
          point: {
            pixelSize: 3,
            color: Cesium.Color.YELLOW.withAlpha(0.6)
          }
        })
      }
      
      // 定位相机到广州市中心
      this.viewer.camera.flyTo({
        destination: Cesium.Cartesian3.fromDegrees(113.2644, 23.1291, 1200),
        orientation: {
          heading: Cesium.Math.toRadians(0),
          pitch: Cesium.Math.toRadians(-40),
          roll: 0
        },
        duration: 2
      })
    },

    async loadCityModel() {
      try {
        // 尝试多个可用的城市模型数据源
        const modelUrls = [
          // 广州城市白模
          'https://g2657.github.io/gz-city/tileset.json',
          // Cesium 官方示例建筑数据（纽约）
          'https://assets.cesium.com/13839/tileset.json',
          // 另一个备选
          'https://tiles.cesium.com/13839/tileset.json'
        ]
        
        let loaded = false
        
        for (const url of modelUrls) {
          try {
            this.loadStatus = `尝试加载模型: ${url.substring(0, 50)}...`
            console.log('尝试加载:', url)
            
            this.cityTileset = await Cesium.Cesium3DTileset.fromUrl(url)
            
            this.viewer.scene.primitives.add(this.cityTileset)
            this.cityTileset.maximumScreenSpaceError = 4
            
            // 不设置 style，避免属性不存在的问题
            // 只设置是否显示
            this.cityTileset.show = true
            
            // 定位到模型
            if (this.cityTileset.boundingSphere) {
              this.viewer.camera.flyToBoundingSphere(this.cityTileset.boundingSphere, {
                duration: 1.5,
                offset: new Cesium.HeadingPitchRange(0, -0.4, 500)
              })
            }
            
            loaded = true
            this.events.unshift({ time: new Date().toLocaleTimeString(), desc: '3D城市模型加载成功' })
            console.log('模型加载成功:', url)
            break
            
          } catch (err) {
            console.warn(`加载 ${url} 失败:`, err.message)
            // 继续尝试下一个
          }
        }
        
        if (!loaded) {
          console.log('所有模型源均加载失败，使用基础建筑模式')
          this.events.unshift({ time: new Date().toLocaleTimeString(), desc: '使用基础建筑模式（模型加载失败）' })
        }
        
      } catch (error) {
        console.error('城市模型加载失败:', error)
        this.events.unshift({ time: new Date().toLocaleTimeString(), desc: '模型加载失败，使用基础建筑' })
      }
    }
  }
}
</script>

<style scoped>
.smart-city-container {
  position: relative;
  width: 100vw;
  height: 100vh;
  overflow: hidden;
}

.map-container {
  width: 100%;
  height: 100%;
}

.header {
  position: absolute;
  top: 20px;
  left: 20px;
  right: 20px;
  background: linear-gradient(135deg, rgba(0, 0, 0, 0.85) 0%, rgba(0, 0, 0, 0.7) 100%);
  backdrop-filter: blur(10px);
  border-radius: 12px;
  padding: 0 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  z-index: 10;
  border: 1px solid rgba(52, 152, 219, 0.3);
}

.header h1 {
  color: #3498db;
  font-size: 18px;
  margin: 16px 0;
}

.header-stats { display: flex; gap: 32px; }
.stat-item { display: flex; flex-direction: column; align-items: center; }
.stat-label { font-size: 12px; color: rgba(255, 255, 255, 0.7); }
.stat-value { font-size: 20px; font-weight: bold; color: #ffaa00; }

.right-panel {
  position: absolute;
  top: 100px;
  right: 20px;
  width: 280px;
  z-index: 10;
  display: flex;
  flex-direction: column;
  gap: 15px;
  max-height: calc(100vh - 120px);
  overflow-y: auto;
}

.info-card {
  background: linear-gradient(135deg, rgba(0, 0, 0, 0.8) 0%, rgba(20, 20, 40, 0.9) 100%);
  backdrop-filter: blur(10px);
  border-radius: 12px;
  padding: 15px;
  border: 1px solid rgba(52, 152, 219, 0.3);
}

.info-card h3 {
  color: #3498db;
  font-size: 14px;
  margin: 0 0 12px 0;
  padding-bottom: 8px;
  border-bottom: 1px solid rgba(52, 152, 219, 0.3);
}

.traffic-item {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 10px;
  font-size: 12px;
  color: #fff;
}

.road-name { width: 70px; }
.progress-bar { flex: 1; height: 6px; background: rgba(255, 255, 255, 0.2); border-radius: 3px; overflow: hidden; }
.progress-fill { height: 100%; background: linear-gradient(90deg, #ffaa00, #ff4444); border-radius: 3px; transition: width 0.3s ease; }

.env-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px; }
.env-item { display: flex; justify-content: space-between; color: #fff; font-size: 12px; padding: 5px 0; }
.env-item .good { color: #2ecc71; }
.env-item .moderate { color: #f39c12; }
.env-item .bad { color: #e74c3c; }

.energy-chart { display: flex; justify-content: space-around; align-items: flex-end; height: 120px; gap: 20px; }
.energy-bar { flex: 1; display: flex; flex-direction: column; align-items: center; gap: 8px; height: 100px; }
.energy-fill { width: 40px; border-radius: 6px 6px 0 0; transition: height 0.3s ease; }
.energy-fill.electricity { background: linear-gradient(180deg, #ff6b6b, #ee5a24); }
.energy-fill.water { background: linear-gradient(180deg, #4dabf7, #1971c2); }
.energy-fill.gas { background: linear-gradient(180deg, #51cf66, #2f9e44); }
.energy-bar span { font-size: 12px; color: #fff; }

.event-list { max-height: 200px; overflow-y: auto; }
.event-item { display: flex; gap: 10px; padding: 8px 0; border-bottom: 1px solid rgba(255, 255, 255, 0.1); font-size: 11px; }
.event-time { color: #ffaa00; font-family: monospace; }
.event-desc { color: rgba(255, 255, 255, 0.8); flex: 1; }

.bottom-left { position: absolute; bottom: 20px; left: 20px; z-index: 10; }
.legend {
  background: linear-gradient(135deg, rgba(0, 0, 0, 0.7) 0%, rgba(0, 0, 0, 0.5) 100%);
  backdrop-filter: blur(8px);
  border-radius: 8px;
  padding: 10px 15px;
  border: 1px solid rgba(52, 152, 219, 0.3);
}
.legend h4 { color: #fff; font-size: 12px; margin: 0 0 8px 0; }
.legend-item { display: flex; align-items: center; gap: 8px; font-size: 11px; color: rgba(255, 255, 255, 0.8); margin-bottom: 4px; }
.legend-color { width: 16px; height: 16px; border-radius: 3px; }

.loading-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  z-index: 100;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}

.loading-spinner {
  width: 50px;
  height: 50px;
  border: 4px solid rgba(52, 152, 219, 0.3);
  border-top-color: #3498db;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

.loading-text {
  margin-top: 20px;
  color: #3498db;
  font-size: 14px;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}
</style>