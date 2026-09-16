# 第9页：感谢

直接打开项目根目录的 index.html 即可播放。← → 切换讲座页面；感谢页内 ↑ ↓ 或滚轮推进一张记忆。一个连续滚动手势最多前进一张，停下再滚继续。R 重播本页。最后一张后再向下，进入感谢文字与 THANK YOU 收束。

## 数据与照片

thanksData.js 是独立内容配置：image、title、text、themeColor、accentColor、side、rotation。顺序为陈老师两张、宋老师两张、科组1—6。源文件与 public/images/thanks/01.jpg—10.jpg 的对应写在 source 字段中。照片经过方向校正、等比缩小与 JPEG 压缩，未裁切。

themeColor 是每张照片的深色基底，accentColor 驱动右上和左下的低饱和色晕，两种颜色均在切换时缓动。姓名与寄语为 HTML 文本，保持清晰。

HTTP 访问直接读取 image 路径。file:// 离线模式使用生成的图片数据包，以避免本地 WebGL 纹理的跨源限制。替换照片后需运行一次本目录 build.cjs 更新离线数据包；修改姓名、寄语、背景色无需重新打包。

开发依赖：three 0.183.0、esbuild 0.25.12。安装到任意开发工具目录后，通过 NODE_PATH 指向其 node_modules，执行 node thanks/build.cjs。演示电脑无需安装这些依赖。

## 源码研究与迁移依据

参考：https://github.com/houmahani/codrops-depth-gallery ，作者 Houmahani Kane，MIT。在线效果：https://tympanus.net/Tutorials/DepthGallery/ 。许可原文位于 resources/vendor/thanks/DepthGallery-LICENSE.txt，Three.js 许可同目录保留。

已阅读原项目 Scroll.js、Gallery.js、Engine.js、Experience/index.js、Label.js、Background/index.js、背景 fragment.glsl 和 galleryData.js，并对照了在线示例的滚动前后画面。

| 原实现 | 本项目迁移 |
|---|---|
| Scroll：scrollTarget/scrollCurrent、lerp、归一化 deltaMode、速度阻尼，相机Z = startZ - scroll * factor | ThanksScroll：时间增量阻尼、归一化输入、手势边界、离散目标与连续相机位置；不让一次触控板惯性穿过多张照片 |
| Gallery：plane.position.z = -index * planeGap；根据纹理宽高比例缩放 | ThanksGallery：固定12单位纵深间距，PerspectiveCamera沿Z轴推进；按投影尺寸等比适配，横竖图保持原貌 |
| Gallery：相机采样位置决定相邻照片交叠、透明度与活动图 | 当前照片完整，离开照片淡去、后两张低透明度留在深处；按浮点进度驱动caption |
| Gallery：velocity影响breathScale、tilt、gesture drift | 轻微缩放、相机Y位移和受限顶点弯曲，速度衰减到零后完全静止 |
| Background：currentMood/nextMood插值，速度影响氛围强度；独立正交背景场景 | 为报告厅削减彩色光斑与后处理，改为深度选色 + 1.2—1.5秒CSS背景过渡，静态轻微暗角 |
| Engine：TextureLoader预载Map、单一RAF、DPR限制、dispose | 图片一次加载，共享几何体，每图一个持久材质；稳定后停止RAF，离页完整释放，重新进入新建；慢帧降DPR并关闭形变 |
| Label：根据活动平面更新DOM标签 | 28px左右正文、约52px姓名，左右随照片交错；无标签卡片、色板UI |

原项目普通照片使用 MeshBasicMaterial，并没有照片液态形变 shader；原 GLSL 主要用于氛围背景。本项目的极轻微顶点响应为新增，不冒称直接复制。

移除了示例的粒子、光轨、调试UI及持续鼠标视差；额外实现黑场开场、最终照片退远、双行感谢与 THANK YOU、无WebGL的CSS纵深备用模式。

## 兼容与资源管理

依赖为本地经典脚本包，无ES模块跨源请求、CDN或在线字体。丢失纹理以低饱和占位代替，其他图继续；WebGL不可用或context lost时切换CSS透视模式。隐藏标签页暂停RAF，离开页面销毁纹理/材质/几何体/renderer与监听器；异步加载完成时检查disposed避免泄漏。减少动态效果设置禁用照片形变。

首屏不下载感谢页Three.js和纹理包，进入第9页时按需加载。图像纹理最长边1920，DPR上限1.5，慢帧降到1；没有模糊后处理通道。动画稳定后无持续渲染循环。
