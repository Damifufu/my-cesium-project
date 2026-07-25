<template>
  <!-- 1. 定义 Cesium 容器 -->
  <div id="cesiumContainer" class="cesium-container"></div>
</template>

<script>
import * as Cesium from 'cesium'
import 'cesium/Build/Cesium/Widgets/widgets.css'

export default {
  name: 'App',
  mounted() {
    this.initCesium()
  },
  beforeDestroy() {
    // 组件销毁时清理 Cesium 资源，防止内存泄漏
    if (this.viewer && !this.viewer.isDestroyed()) {
      this.viewer.destroy()
    }
  },
  methods: {
    async initCesium() {
      // 2. 初始化 Viewer（改用 ID 选择器）
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
        baseLayer: false,
      })

      // 3. 添加高德底图
      this.viewer.imageryLayers.addImageryProvider(
        new Cesium.UrlTemplateImageryProvider({
          url: 'https://webrd02.is.autonavi.com/appmaptile?lang=zh_cn&size=1&scale=2&style=8&x={x}&y={y}&z={z}',
          maximumLevel: 18
        })
      )

      // 4. 设置主题
      this.setViewerTheme()

      // 5. 加载 3D Tiles
      try {
        const palaceTileset = await Cesium.Cesium3DTileset.fromUrl('https://g2657.github.io/gz-city/tileset.json')
        this.viewer.scene.primitives.add(palaceTileset)
        palaceTileset.maximumScreenSpaceError = 4
        this.viewer.camera.viewBoundingSphere(palaceTileset.boundingSphere, new Cesium.HeadingPitchRange(0, -0.5, 0))
        
        // 6. 添加光源效果
        this.addCustomShader(palaceTileset)
      } catch (error) {
        console.error('3D Tiles加载失败:', error)
      }
    },

    setViewerTheme(options = {}) {
      const baseLayer = this.viewer.imageryLayers.get(0)
      if (!baseLayer) return

      baseLayer.brightness = options.brightness ?? 0.6
      baseLayer.contrast = options.contrast ?? 1.8
      baseLayer.gamma = options.gamma ?? 0.3
      baseLayer.hue = options.hue ?? 1
      baseLayer.saturation = options.saturation || 0

      const baseFragShader = this.viewer.scene.globe._surfaceShaderSet.baseFragmentShaderSource.sources
      for (let i = 0; i < baseFragShader.length; i++) {
        const strS = 'color = czm_saturation(color, textureSaturation);\n#endif\n'
        let strT = 'color = czm_saturation(color, textureSaturation);\n#endif\n'
        if (!options.invertColor) {
          strT += `
            color.r = 1.0 - color.r;
            color.g = 1.0 - color.g;
            color.b = 1.0 - color.b;
          `
        }
        strT += `
          color.r = color.r * ${options.filterRGB_R ?? 100}.0/255.0;
          color.g = color.g * ${options.filterRGB_G ?? 138}.0/255.0;
          color.b = color.b * ${options.filterRGB_B ?? 230}.0/255.0;
        `
        baseFragShader[i] = baseFragShader[i].replace(strS, strT)
      }
      this.viewer.scene.requestRender()
    },

    addCustomShader(palaceTileset) {
      const center = Cesium.Cartographic.fromCartesian(palaceTileset.boundingSphere.center)
      const longitude = Cesium.Math.toDegrees(center.longitude)
      const latitude = Cesium.Math.toDegrees(center.latitude)
      const lightRadius = 1000.0

      const lightPositionRed = Cesium.Cartesian3.fromDegrees(longitude, latitude, 100)
      const lightPositionGreen = Cesium.Cartesian3.fromDegrees(longitude - 0.015, latitude + 0.015, 100)
      const lightPositionBlue = Cesium.Cartesian3.fromDegrees(longitude + 0.015, latitude - 0.015, 100)
      const lightColorRed = new Cesium.Cartesian3(3.0, 0.0, 0.0)
      const lightColorGreen = new Cesium.Cartesian3(0.0, 3.0, 0.0)
      const lightColorBlue = new Cesium.Cartesian3(0.0, 3.0, 3.0)

      palaceTileset.customShader = new Cesium.CustomShader({
        mode: Cesium.CustomShaderMode.REPLACE_MATERIAL,
        lightingModel: Cesium.LightingModel.UNLIT,
        uniforms: {
          u_lightPositionRed: { type: Cesium.UniformType.VEC3, value: lightPositionRed },
          u_lightPositionGreen: { type: Cesium.UniformType.VEC3, value: lightPositionGreen },
          u_lightPositionBlue: { type: Cesium.UniformType.VEC3, value: lightPositionBlue },
          u_lightColorRed: { type: Cesium.UniformType.VEC3, value: lightColorRed },
          u_lightColorGreen: { type: Cesium.UniformType.VEC3, value: lightColorGreen },
          u_lightColorBlue: { type: Cesium.UniformType.VEC3, value: lightColorBlue },
          u_lightRadius: { type: Cesium.UniformType.FLOAT, value: lightRadius },
        },
        fragmentShaderText: `
          void fragmentMain(FragmentInput fsInput, inout czm_modelMaterial material) {                 
            vec3 positionWC = (czm_model * vec4(fsInput.attributes.positionMC, 1.0)).xyz;
            vec3 normalEC = normalize(fsInput.attributes.normalEC);
            vec3 totalLight = vec3(0.0);
            
            vec3 lightDirRed = u_lightPositionRed - positionWC;
            float distanceRed = length(lightDirRed);
            vec3 lightDirectionRed = normalize(lightDirRed);
            float diffuseFactorRed = max(dot(normalEC, lightDirectionRed), 0.9);
            vec3 diffuseRed = diffuseFactorRed * u_lightColorRed;
            float distanceFactorRed = clamp(distanceRed / u_lightRadius, 0.2, 1.0);
            vec3 customRedColor = vec3(0.0, 0.1, 0.3);
            vec3 mixedColorRed = mix(customRedColor, diffuseRed, 1.0 - distanceFactorRed);
            totalLight += mixedColorRed;
            
            vec3 lightDirGreen = u_lightPositionGreen - positionWC;
            float distanceGreen = length(lightDirGreen);
            vec3 lightDirectionGreen = normalize(lightDirGreen);
            float diffuseFactorGreen = max(dot(normalEC, lightDirectionGreen), 0.9);
            vec3 diffuseGreen = diffuseFactorGreen * u_lightColorGreen;
            float distanceFactorGreen = clamp(distanceGreen / u_lightRadius, 0.2, 1.0);
            vec3 customGreenColor = vec3(0,0.1,0.3);
            vec3 mixedColorGreen = mix(customGreenColor, diffuseGreen, 1.0 - distanceFactorGreen);
            totalLight += mixedColorGreen;
            
            vec3 lightDirBlue = u_lightPositionBlue - positionWC;
            float distanceBlue = length(lightDirBlue);
            vec3 lightDirectionBlue = normalize(lightDirBlue);
            float diffuseFactorBlue = max(dot(normalEC, lightDirectionBlue), 0.9);
            vec3 diffuseBlue = diffuseFactorBlue * u_lightColorBlue;
            float distanceFactorBlue = clamp(distanceBlue / u_lightRadius, 0.2, 1.0);
            vec3 customBlueColor = vec3(0,0.1,0.3);
            vec3 mixedColorBlue = mix(customBlueColor, diffuseBlue, 1.0 - distanceFactorBlue);
            totalLight += mixedColorBlue;
            
            material.diffuse = totalLight;
            
            float _baseHeight = -10.0;
            float _heightRange = 100.0;
            float _glowRange = 300.0;
            float vtxf_height = fsInput.attributes.positionMC.z - _baseHeight;
            float vtxf_a11 = fract(czm_frameNumber / 100.0) * 3.14159265 * 2.0;
            float vtxf_a12 = vtxf_height / _heightRange + sin(vtxf_a11) * 0.1;
            material.diffuse *= vec3(vtxf_a12, vtxf_a12, vtxf_a12);
            
            float vtxf_a13 = fract(czm_frameNumber / 360.0);
            float vtxf_h = clamp(vtxf_height / _glowRange, 0.0, 1.0);
            vtxf_a13 = abs(vtxf_a13 - 0.5) * 2.0;
            float vtxf_diff = step(0.005, abs(vtxf_h - vtxf_a13));
            material.diffuse += material.diffuse * (1.0 - vtxf_diff);
          }
        `
      })
    }
  }
}
</script>

<style scoped>
.cesium-container {
  width: 100vw;
  height: 100vh;
  margin: 0;
  padding: 0;
  overflow: hidden;
}
</style>