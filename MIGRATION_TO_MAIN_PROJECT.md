# 迁移到主项目指南

## 🎯 迁移目标

将 One Last Image 项目迁移到您的主项目中，使其兼容主项目的 Nuxt 配置。

## 📋 迁移步骤

### 1. 更新依赖包

在主项目中安装以下依赖：

```bash
# 如果还没有安装这些依赖
pnpm add vuetify-nuxt-module @nuxtjs/sitemap @pinia/nuxt pinia-plugin-persistedstate
```

### 2. 更新 nuxt.config.ts

我已经更新了 `nuxt-app/nuxt.config.ts` 文件以匹配您的主项目配置：

```typescript
// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-04-01',
  devtools: { enabled: true },
  
  modules: [
    'vuetify-nuxt-module',
    '@nuxtjs/sitemap',
    '@pinia/nuxt',
    'pinia-plugin-persistedstate/nuxt',
  ],
  
  site: {
    url: 'https://www.color-page.com',
    name: 'Free Coloring Page | Stroke',
  },
  
  sitemap: {
    urls: async () => {
      const sitemap = await fetch(`https://api.color-page.com/api/sitemap/get-additional-sitemap`, {
        method: 'GET'
      })
      const sitemapData = await sitemap.json()
      return sitemapData
    }
  },
  
  imports: {
    dirs: [
      'composables', 
      'datas'
    ],
  },
  
  components: true,
  
  vuetify: {
    moduleOptions: {},
    vuetifyOptions: {},
  },
  
  features: {
    inlineStyles: false
  },
  
  ssr: true,
  nitro: {
    preset: 'cloudflare',
    prerender: {
      autoSubfolderIndex: false
    }
  },
  
  app: {
    head: {
      title: 'One Last Image - 卢浮宫生成器',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'description', content: 'One Last Kiss 卢浮宫生成器 风格 图片转线稿 封面生成 宇多田光 神奇海螺实验室' },
        { name: 'apple-mobile-web-app-capable', content: 'yes' },
        { name: 'apple-mobile-web-app-status-bar-style', content: 'black-translucent' },
      ],
      link: [
        { rel: 'manifest', href: '/manifest.json' },
        { rel: 'apple-touch-icon', href: '/favicon.ico' },
        { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' }
      ],
    },
  },
})
```

### 3. 移除旧的 Vuetify 插件

删除 `plugins/vuetify.ts` 文件，因为 `vuetify-nuxt-module` 会自动处理 Vuetify 的配置。

### 4. 项目结构调整

将以下文件和目录迁移到主项目：

```
主项目/
├── pages/
│   └── one-last-image.vue          # 重命名 index.vue
├── utils/
│   ├── louvre.ts                   # 图像处理核心
│   ├── lyric.ts                    # 歌词解析工具
│   └── debug.ts                    # 调试工具
├── public/
│   ├── images/                     # 示例图片
│   ├── pencil-texture.jpg          # 铅笔纹理
│   ├── one-last-image-logo2.png    # 水印图片
│   ├── one-last-kiss.lrc           # 歌词文件
│   └── manifest.json               # PWA 配置
└── composables/                    # 如果需要创建可复用逻辑
```

### 5. 页面路由调整

将 `pages/index.vue` 重命名为 `pages/one-last-image.vue`，这样访问路径就是 `/one-last-image`。

或者如果您希望作为子路由，可以创建：
- `pages/tools/one-last-image.vue` (访问路径: `/tools/one-last-image`)
- `pages/image/one-last-image.vue` (访问路径: `/image/one-last-image`)

### 6. 组件化改进（可选）

为了更好地集成到主项目，建议将页面拆分为组件：

```
components/
├── OneLastImage/
│   ├── ImageUploader.vue           # 图片上传组件
│   ├── ImageProcessor.vue          # 图像处理组件
│   ├── ControlPanel.vue            # 控制面板组件
│   ├── PreviewDialog.vue           # 预览对话框组件
│   └── LyricDisplay.vue            # 歌词显示组件
```

### 7. 状态管理（可选）

如果需要与主项目的其他部分共享状态，可以创建 Pinia store：

```typescript
// stores/oneLastImage.ts
export const useOneLastImageStore = defineStore('oneLastImage', {
  state: () => ({
    currentImage: null,
    processedImage: null,
    settings: {
      convoluteName: '一般',
      darkCut: 118,
      // ... 其他设置
    }
  }),
  
  actions: {
    async processImage(image: HTMLImageElement) {
      // 图像处理逻辑
    }
  },
  
  persist: true // 持久化设置
})
```

### 8. 样式调整

确保样式与主项目的主题一致：

```vue
<style scoped>
/* 使用主项目的设计系统 */
.one-last-image-container {
  /* 继承主项目的容器样式 */
}
</style>
```

## 🔧 具体迁移操作

### 步骤 1: 复制文件到主项目

```bash
# 复制核心文件到主项目
cp -r nuxt-app/utils/ /path/to/main-project/
cp -r nuxt-app/public/images/ /path/to/main-project/public/
cp nuxt-app/public/pencil-texture.jpg /path/to/main-project/public/
cp nuxt-app/public/one-last-image-logo2.png /path/to/main-project/public/
cp nuxt-app/public/one-last-kiss.lrc /path/to/main-project/public/
cp nuxt-app/pages/index.vue /path/to/main-project/pages/one-last-image.vue
```

### 步骤 2: 更新主项目的 nuxt.config.ts

将我提供的配置合并到您的主项目配置中。

### 步骤 3: 安装依赖

```bash
cd /path/to/main-project
pnpm install
```

### 步骤 4: 测试运行

```bash
pnpm dev
```

访问 `http://localhost:3000/one-last-image` 测试功能。

## 🎨 主题集成建议

### 1. 使用主项目的 Vuetify 主题

在主项目的 `nuxt.config.ts` 中配置 Vuetify 主题：

```typescript
vuetify: {
  vuetifyOptions: {
    theme: {
      defaultTheme: 'light',
      themes: {
        light: {
          colors: {
            primary: '#1976D2',  // 与主项目保持一致
            secondary: '#424242',
            // ... 其他颜色
          },
        },
      },
    },
  },
}
```

### 2. 统一导航

在主项目的导航中添加 One Last Image 的入口：

```vue
<v-list-item to="/one-last-image">
  <v-list-item-title>One Last Image</v-list-item-title>
</v-list-item>
```

## 🚀 部署注意事项

### CloudFlare Pages 兼容性

由于主项目使用 CloudFlare Pages，确保：

1. 所有静态资源都在 `public/` 目录下
2. 图像处理在客户端进行（已经是这样）
3. 没有使用 Node.js 特定的 API

### SEO 优化

为 One Last Image 页面添加 SEO 元数据：

```vue
<script setup>
useSeoMeta({
  title: 'One Last Image - 卢浮宫生成器',
  description: 'One Last Kiss 风格图片转线稿生成器',
  ogTitle: 'One Last Image - 卢浮宫生成器',
  ogDescription: 'One Last Kiss 风格图片转线稿生成器',
  ogImage: '/one-last-image-logo2.png',
})
</script>
```

## ✅ 迁移检查清单

- [ ] 复制所有必要文件到主项目
- [ ] 更新 nuxt.config.ts 配置
- [ ] 安装新的依赖包
- [ ] 删除旧的 Vuetify 插件文件
- [ ] 测试图像处理功能
- [ ] 测试文件下载功能
- [ ] 测试响应式设计
- [ ] 验证 PWA 功能
- [ ] 检查 CloudFlare Pages 部署

---

**迁移完成后，您将拥有一个完全集成到主项目中的 One Last Image 功能！**
