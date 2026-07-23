# 🌍 Vue + Cesium 三维可视化技术验证

> 本项目为个人学习 Vue 与 Cesium 结合开发的练习与功能验证仓库。包含一个完整的三维城市建筑可视化演示（`App.vue`），以及多个独立的功能探索示例。

## 🔗 在线预览

**主程序演示：** [https://cesium-city-ashen.vercel.app/](https://cesium-city-ashen.vercel.app/)

## 📋 主要演示（App.vue）

`App.vue` 集成了当前最完整的功能，是项目的主入口，包含：

*   **🌐 数字地球**：加载高精度地形与影像底图。
*   **🏙️ 3D 建筑白模**：加载 OpenStreetMap 建筑数据，**根据高度动态着色**。
*   **🖱️ 建筑信息查询**：点击建筑弹出信息窗（名称、高度、楼层）。
*   **🎮 相机控制**：通过 `setView` 精确控制初始视角。

## 🧪 功能探索示例

仓库中包含了以下独立的功能验证文件，用于测试和掌握 Cesium 的核心 API
├── examples/                     # 🧪 功能示例合集（独立组件）
│   ├── 01-020304-基础配置.vue
│   ├── 07坐标系.vue
│   ├── 08-09-相机.vue
│   ├── 10-17物体.vue
│   ├── 3dtile.vue
│   ├── 飞机.vue
│   ├── 动态光影和呼吸灯效果的城市建筑白模.vue
│   ├── 自定义地图.vue
│   ├── 实体及其相关设置.vue
│   └── geojson; kml; czml数据的使用.vue


## 🛠️ 技术栈

*   **框架：** Vue 3 (Composition API)
*   **3D 引擎：** Cesium (1.111+)
*   **构建工具：** Vite
*   **语言：** JavaScript、HTML5、CSS3


## 📝 学习记录

本仓库是我学习 Vue + Cesium 全栈开发的实践笔记，涵盖了：
*   **基础**：Viewer 配置、坐标系、相机操作
*   **数据**：GeoJSON、KML、3D Tiles 加载
*   **交互**：鼠标拾取、信息弹窗
*   **特效**：动态光影、建筑着色、动画

## 👤 作者

*   **Damifufu** - [GitHub 主页](https://github.com/Damifufu)
*   **项目地址：** [https://github.com/Damifufu/my-cesium-project](https://github.com/Damifufu/my-cesium-project)
