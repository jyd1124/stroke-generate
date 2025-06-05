# One Last Image - Nuxt3 + Vue3 + Vuetify 版本

这是 One Last Image 项目从 Vue2 迁移到 Nuxt3 + Vue3 + Vuetify 的现代化版本。

## 🚀 技术栈升级

### 原版本 (Vue2)
- Vue 2.6.11
- 原生 JavaScript
- Less CSS
- 手动 DOM 操作

### 新版本 (Nuxt3 + Vue3 + Vuetify)
- **Nuxt 3.17.5** - 现代化的 Vue.js 框架
- **Vue 3.5.16** - 最新的 Vue.js 版本，支持 Composition API
- **Vuetify 3.8.8** - Material Design 组件库
- **TypeScript** - 类型安全
- **Vite** - 快速的构建工具
- **pnpm** - 高效的包管理器

## 🎨 主要改进

### 1. 现代化的 UI 设计
- 使用 Vuetify 3 的 Material Design 组件
- 响应式设计，更好的移动端体验
- 统一的设计语言和交互模式

### 2. 代码架构优化
- Vue 3 Composition API，更好的逻辑复用
- TypeScript 支持，提供类型安全
- 模块化的代码结构
- 更好的性能和开发体验

### 3. 功能保持完整
- ✅ 图片上传和处理
- ✅ 多种线条处理方案
- ✅ 实时预览和对比
- ✅ 水印和特效
- ✅ 歌词同步显示
- ✅ 多种导出格式

## 📁 项目结构

```
nuxt-app/
├── pages/
│   └── index.vue          # 主页面
├── plugins/
│   └── vuetify.ts         # Vuetify 配置
├── utils/
│   ├── louvre.ts          # 图像处理核心
│   └── lyric.ts           # 歌词解析工具
├── public/
│   ├── images/            # 示例图片
│   ├── pencil-texture.jpg # 铅笔纹理
│   ├── one-last-image-logo2.png # 水印图片
│   ├── one-last-kiss.lrc  # 歌词文件
│   └── manifest.json      # PWA 配置
└── nuxt.config.ts         # Nuxt 配置
```

## 🛠️ 开发指南

### 安装依赖
```bash
pnpm install
```

### 启动开发服务器
```bash
pnpm run dev
```

### 构建生产版本
```bash
pnpm run build
```

### 预览生产版本
```bash
pnpm run preview
```

## 🎯 核心功能

### 图像处理
- **多种卷积核**: 精细、一般、稍粗、超粗、极粗、浮雕、线稿
- **智能降噪**: 可选的图像降噪处理
- **线迹控制**: 可调节的线条轻重
- **调子处理**: 可控制的阴影数量

### 用户体验
- **拖拽上传**: 支持拖拽图片到页面
- **粘贴上传**: 支持从剪贴板粘贴图片
- **实时预览**: 鼠标按下时显示原图对比
- **多种导出**: 单图、上下对比图、斜切对比图

### PWA 支持
- 离线可用
- 可安装到桌面
- 移动端友好

## 🎵 特色功能

### 歌词同步
- 自动解析 LRC 格式歌词
- 实时同步显示当前歌词
- 点击歌词跳转到对应 MV 时间点

### 水印系统
- 可选的项目水印
- 支持初回限定版样式
- 自适应大小和位置

## 🔧 技术细节

### Vue 3 Composition API
使用现代的 Composition API 重写了所有组件逻辑，提供更好的类型推断和逻辑复用。

### Vuetify 3 组件
- `v-card` - 卡片布局
- `v-btn` - 按钮组件
- `v-switch` - 开关控件
- `v-slider` - 滑块控件
- `v-chip-group` - 选项卡组
- `v-dialog` - 对话框
- `v-alert` - 提示信息

### 图像处理算法
保持了原版的核心图像处理算法，包括：
- 灰度转换
- 卷积运算
- 阈值处理
- 模糊优化

## 🌟 迁移亮点

1. **完全保持功能兼容** - 所有原有功能都得到保留
2. **现代化的开发体验** - TypeScript + Vite + 热重载
3. **更好的用户界面** - Material Design 风格
4. **移动端优化** - 响应式设计，更好的触摸体验
5. **性能提升** - Vue 3 和 Vite 带来的性能优化
6. **代码质量** - 类型安全和模块化架构

## 📱 兼容性

- ✅ 现代浏览器 (Chrome, Firefox, Safari, Edge)
- ✅ 移动端浏览器
- ✅ PWA 支持
- ✅ 触摸设备优化

## 🤝 贡献

欢迎提交 Issue 和 Pull Request 来改进这个项目！

## 📄 许可证

与原项目保持一致的开源许可证。

---

**原项目**: [itorr/one-last-image](https://github.com/itorr/one-last-image)
**技术支持**: 神奇海螺实验室
