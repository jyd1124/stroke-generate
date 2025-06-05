<template>
  <v-container fluid class="pa-0">
    <!-- 加载状态 -->
    <v-overlay v-model="loading" class="align-center justify-center">
      <div class="text-center">
        <v-progress-circular
          indeterminate
          size="64"
          color="primary"
        ></v-progress-circular>
        <div class="mt-4">
          <h2 class="text-h4 mb-2">One Last Image</h2>
          <p class="text-subtitle-1">Magic Conch</p>
        </div>
      </div>
    </v-overlay>

    <!-- 主应用 -->
    <div class="app" :class="{ 'app--running': running }">
      <!-- 头部 -->
      <v-app-bar color="transparent" flat>
        <v-toolbar-title class="text-h4 font-weight-bold">
          One Last Image
        </v-toolbar-title>
      </v-app-bar>

      <!-- 主内容 -->
      <v-main>
        <v-container>
          <v-row justify="center">
            <v-col cols="12" md="8" lg="6">
              <!-- 预览区域 -->
              <OneLastImageImagePreview
                :image-src="src"
                :show-diff="diff"
                :processing="running"
                :width="previewWidth"
                :height="previewHeight"
                @show-diff="diff = $event"
                @image-loaded="setImageAndDraw"
                ref="previewRef"
              />

              <!-- 上传控制 -->
              <OneLastImageImageUploader
                :is-default-image="isDefaultImageURL"
                :processing="running"
                @file-selected="readFileAndSetIMGSrc"
                @save="save"
                @save-diff="saveDiff"
                @toggle-denoise="style.denoise = !style.denoise; _louvre(50)"
              />

              <!-- 控制面板 -->
              <OneLastImageControlPanel
                :settings="style"
                :selected-convolute-index="selectedConvoluteIndex"
                :convolutes="convolutes"
                @update:selected-convolute-index="selectedConvoluteIndex = $event"
                @update:denoise="style.denoise = $event; _louvre(50)"
                @update:kuma="style.kuma = $event; _louvre(50)"
                @update:watermark="style.watermark = $event; _louvre(50)"
                @update:hajimei="style.hajimei = $event; _louvre(50)"
                @update:dark-cut="style.darkCut = $event; _louvre(50)"
                @update:shade-limit="style.shadeLimit = $event; _louvre(50)"
                @convolute-changed="style.convoluteName = $event; _louvre(50)"
              />
            </v-col>
          </v-row>
        </v-container>
      </v-main>

      <!-- 底部 -->
      <v-footer class="text-center">
        <v-container>
          <div class="d-flex flex-wrap justify-center gap-4">
            <v-btn
              href="https://lab.magiconch.com/magi/"
              target="_blank"
              variant="text"
              size="small"
            >
              Magi
            </v-btn>
            <v-btn
              href="https://lab.magiconch.com/eva-title/"
              target="_blank"
              variant="text"
              size="small"
            >
              标题生成器
            </v-btn>
            <v-btn
              href="https://v.magiconch.com/mine-sweeper"
              target="_blank"
              variant="text"
              size="small"
            >
              扫雷
            </v-btn>
            <v-btn
              href="https://github.com/itorr/one-last-image"
              target="_blank"
              variant="text"
              size="small"
            >
              GitHub
            </v-btn>
            <v-btn
              href="https://lab.magiconch.com"
              target="_blank"
              variant="text"
              size="small"
            >
              神奇海螺实验室
            </v-btn>
            <v-btn
              href="https://weibo.com/1197780522/M19X18EGP"
              target="_blank"
              variant="text"
              size="small"
            >
              @卜卜口
            </v-btn>
          </div>
        </v-container>
      </v-footer>
    </div>

    <!-- 输出对话框 -->
    <v-dialog v-model="showOutput" max-width="600">
      <v-card>
        <v-card-title class="text-h5">
          生成好啦
        </v-card-title>
        <v-card-text>
          <div class="text-center">
            <img :src="output" :alt="downloadFilename" class="w-100" />
            <p class="mt-4 text-body-2">
              手机端保存失败时可尝试长按图片 <strong>"添加到照片"</strong>
            </p>
            <p class="text-body-2">
              如果能在发布生成图时，标注当前项目信息会很开心🤒
            </p>
          </div>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn @click="closeOutput">关闭窗口</v-btn>
          <v-btn @click="downloadCurrentImage" variant="text">下载当前图片</v-btn>
          <v-btn @click="saveDiff" variant="text">上下对比图</v-btn>
          <v-btn @click="saveDiff2" variant="text">斜切对比图</v-btn>
        </v-card-actions>
        <v-card-text v-if="showOutput">
          <div class="mb-2">
            <span class="text-subtitle-2">斜切位置: {{ bevelPosition }}</span>
          </div>
          <v-slider
            v-model="bevelPosition"
            :min="0"
            :max="72"
            :step="1"
            color="primary"
            @update:model-value="_saveDiff2(50)"
          ></v-slider>
        </v-card-text>
      </v-card>
    </v-dialog>

    <!-- 歌词显示 -->
    <div class="lyric-box" v-if="lyrics.length > 0">
      <div 
        class="lyric-list"
        :style="{ transform: `translateY(-${lyricIndex * 48}px)` }"
      >
        <div
          v-for="(lyric, index) in lyrics"
          :key="lyric.time"
          class="lyric-item"
          :class="{ 'lyric-item--current': index === lyricIndex }"
        >
          <div class="lyric-text">
            <a 
              :href="`https://www.bilibili.com/video/BV1Sg411w7T9?t=${Math.floor((lyric.time+7)*10)/10}`"
              target="_mv"
            >
              {{ lyric.text }}
            </a>
          </div>
          <div v-if="lyric.translation" class="lyric-cn">{{ lyric.translation }}</div>
        </div>
      </div>
    </div>
  </v-container>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, nextTick, watch, onUnmounted } from 'vue'
import { louvre, louvreInit, Convolutes, type LouvreConfig } from '~/utils/louvre'
import { parseLyrics, getCurrentLyricIndex, type LyricLine } from '~/utils/lyric'

// SEO 元数据
useSeoMeta({
  title: 'One Last Image - 卢浮宫生成器',
  description: 'One Last Kiss 风格图片转线稿生成器，将图片转换为精美的线稿艺术',
  ogTitle: 'One Last Image - 卢浮宫生成器',
  ogDescription: 'One Last Kiss 风格图片转线稿生成器',
  ogImage: '/one-last-image-logo2.png',
})

// 响应式数据
const loading = ref(true)
const running = ref(false)
const diff = ref(false)
const src = ref('images/asuka-8.jpg')
const defaultImageURL = 'images/asuka-8.jpg'
const output = ref('')
const showOutput = ref(false)
const downloadFilename = ref('[One-Last-Image].jpg')
const previewWidth = ref(800)
const previewHeight = ref(474)
const lyrics = ref<LyricLine[]>([])
const lyricIndex = ref(0)
const bevelPosition = ref(20)
const selectedConvoluteIndex = ref(1) // 默认选择"一般"

// 组件引用
const previewRef = ref()

// 图像处理样式配置
const style = reactive({
  zoom: 1,
  light: 0,
  shadeLimit: 108,
  shadeLight: 80,
  shade: true,
  kuma: true,
  hajimei: false,
  watermark: true,
  convoluteName: '一般',
  convolute1Diff: true,
  convoluteName2: null,
  lightCut: 128,
  darkCut: 118,
  denoise: true,
})

// 卷积核选项
const convolutes = [
  '精细', '一般', '稍粗', '超粗', '极粗', '浮雕', '线稿'
]

// 计算属性
const isDefaultImageURL = computed(() => src.value !== defaultImageURL)

// 方法
const readFileAndSetIMGSrc = (file: File) => {
  const reader = new FileReader()
  reader.onload = () => {
    src.value = reader.result as string
  }
  reader.readAsDataURL(file)
}

const _louvre = (ms = 300) => {
  running.value = true
  clearTimeout(louvreTimer)
  louvreTimer = setTimeout(louvreProcess, ms)
}

let louvreTimer: NodeJS.Timeout

const louvreProcess = async () => {
  running.value = true
  await nextTick()
  
  if (previewRef.value?.imgRef && previewRef.value?.canvasRef) {
    try {
      await louvre({
        img: previewRef.value.imgRef,
        outputCanvas: previewRef.value.canvasRef,
        config: {
          ...style,
          Convolutes,
        } as LouvreConfig
      })
    } catch (error) {
      console.error('图像处理失败:', error)
    }
  }
  
  running.value = false
}

const setImageAndDraw = async () => {
  if (!previewRef.value?.imgRef) return
  
  const { naturalWidth, naturalHeight } = previewRef.value.imgRef
  const maxPreviewWidth = Math.min(800, window.innerWidth)
  const newPreviewWidth = Math.min(maxPreviewWidth, naturalWidth)
  const newPreviewHeight = Math.floor(newPreviewWidth / naturalWidth * naturalHeight)

  previewWidth.value = newPreviewWidth
  previewHeight.value = newPreviewHeight
  
  await louvreProcess()
}

// 下载图片工具函数
const downloadImage = (dataUrl: string, filename: string) => {
  const link = document.createElement('a')
  link.download = filename
  link.href = dataUrl
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

const save = () => {
  if (!previewRef.value?.canvasRef) return
  output.value = previewRef.value.canvasRef.toDataURL('image/jpeg', 0.9)
  downloadFilename.value = `[lab.magiconch.com][One-Last-Image]-${Date.now()}.jpg`
  
  // 立即下载图片
  downloadImage(output.value, downloadFilename.value)
  
  showOutput.value = true
}

const saveDiff = () => {
  if (!previewRef.value?.imgRef || !previewRef.value?.canvasRef) return

  const mixCanvas = document.createElement('canvas')
  const mixCanvasCtx = mixCanvas.getContext('2d')!
  mixCanvas.width = previewRef.value.canvasRef.width
  mixCanvas.height = previewRef.value.canvasRef.height * 2

  mixCanvasCtx.drawImage(previewRef.value.canvasRef, 0, 0, previewRef.value.canvasRef.width, previewRef.value.canvasRef.height)
  mixCanvasCtx.drawImage(
    previewRef.value.imgRef,
    0, 0, previewRef.value.imgRef.naturalWidth, previewRef.value.imgRef.naturalHeight,
    0, previewRef.value.canvasRef.height, previewRef.value.canvasRef.width, previewRef.value.canvasRef.height
  )

  output.value = mixCanvas.toDataURL('image/jpeg', 0.9)
  downloadFilename.value = `[lab.magiconch.com][One-Last-Image]-diff-${Date.now()}.jpg`
  
  // 立即下载图片
  downloadImage(output.value, downloadFilename.value)
  
  showOutput.value = true
}

const saveDiff2 = () => {
  if (!previewRef.value?.imgRef || !previewRef.value?.canvasRef) return

  const mixCanvas = document.createElement('canvas')
  const mixCanvasCtx = mixCanvas.getContext('2d')!
  mixCanvas.width = previewRef.value.canvasRef.width
  mixCanvas.height = previewRef.value.canvasRef.height

  mixCanvasCtx.drawImage(previewRef.value.canvasRef, 0, 0, previewRef.value.canvasRef.width, previewRef.value.canvasRef.height)

  const topXScale = bevelPosition.value / 100 + 0.24
  const bottomXScale = bevelPosition.value / 100 + 0.04
  const topX = Math.floor(previewRef.value.canvasRef.width * topXScale)
  const bottomX = Math.floor(previewRef.value.canvasRef.width * bottomXScale)

  mixCanvasCtx.beginPath()
  mixCanvasCtx.moveTo(0, 0)
  mixCanvasCtx.lineTo(topX, 0)
  mixCanvasCtx.lineTo(bottomX, previewRef.value.canvasRef.height)
  mixCanvasCtx.lineTo(0, previewRef.value.canvasRef.height)
  mixCanvasCtx.closePath()

  const pattern = mixCanvasCtx.createPattern(previewRef.value.imgRef, 'no-repeat')!
  mixCanvasCtx.fillStyle = pattern
  mixCanvasCtx.fill()

  output.value = mixCanvas.toDataURL('image/jpeg', 0.9)
  downloadFilename.value = `[lab.magiconch.com][One-Last-Image]-diff2-${Date.now()}.jpg`
  
  // 只在首次生成时下载，实时更新时不下载
  if (!showOutput.value) {
    downloadImage(output.value, downloadFilename.value)
    showOutput.value = true
  }
}

const _saveDiff2 = (ms = 100) => {
  clearTimeout(saveDiff2Timer)
  saveDiff2Timer = setTimeout(() => {
    // 只有在弹窗显示且当前图片是斜切对比图时才更新
    if (showOutput.value && output.value && downloadFilename.value.includes('diff2')) {
      saveDiff2()
    }
  }, ms)
}

let saveDiff2Timer: NodeJS.Timeout

const closeOutput = () => {
  showOutput.value = false
  output.value = ''
}

// 下载当前显示的图片
const downloadCurrentImage = () => {
  if (output.value && downloadFilename.value) {
    downloadImage(output.value, downloadFilename.value)
  }
}

// 生命周期
onMounted(async () => {
  // 初始化图像处理资源
  await louvreInit()
  
  // 模拟加载
  setTimeout(() => {
    loading.value = false
  }, 2000)
  
  // 加载歌词
  try {
    const response = await fetch('/one-last-kiss.lrc')
    const lrcText = await response.text()
    lyrics.value = parseLyrics(lrcText)
    
    // 启动歌词同步
    if (lyrics.value.length > 0) {
      const lastLyric = lyrics.value[lyrics.value.length - 1]
      const duration = lastLyric.time
      
      const updateLyric = () => {
        const now = Date.now() / 1000
        const currentTime = now % duration
        lyricIndex.value = getCurrentLyricIndex(lyrics.value, currentTime)
      }
      
      setInterval(updateLyric, 500)
    }
  } catch (error) {
    console.log('歌词加载失败:', error)
  }
})

// 监听样式变化
watch(style, () => {
  _louvre()
}, { deep: true })

// 处理粘贴和拖拽
onMounted(() => {
  const handlePaste = (e: ClipboardEvent) => {
    const clipboardData = e.clipboardData
    if (!clipboardData) return
    
    if (clipboardData.items[0]) {
      const file = clipboardData.items[0].getAsFile()
      if (file && /^image\/(jpeg|gif|png|bmp|webp)$/.test(file.type)) {
        readFileAndSetIMGSrc(file)
      }
    }
    
    if (clipboardData.files.length) {
      for (let i = 0; i < clipboardData.files.length; i++) {
        if (/^image\/(jpeg|gif|png|bmp|webp)$/.test(clipboardData.files[i].type)) {
          readFileAndSetIMGSrc(clipboardData.files[i])
        }
      }
    }
  }
  
  const handleDragOver = (e: DragEvent) => {
    e.preventDefault()
  }
  
  const handleDrop = (e: DragEvent) => {
    e.preventDefault()
    const file = e.dataTransfer?.files[0]
    if (file && /^image\/(jpeg|gif|png|bmp|webp)$/.test(file.type)) {
      readFileAndSetIMGSrc(file)
    }
  }
  
  document.addEventListener('paste', handlePaste)
  document.addEventListener('dragover', handleDragOver)
  document.addEventListener('drop', handleDrop)
  
  onUnmounted(() => {
    document.removeEventListener('paste', handlePaste)
    document.removeEventListener('dragover', handleDragOver)
    document.removeEventListener('drop', handleDrop)
  })
})
</script>

<style scoped>
.app {
  min-height: 100vh;
  transition: opacity 0.3s ease;
}

.app--running {
  opacity: 0.8;
}

.lyric-box {
  position: fixed;
  right: 20px;
  top: 50%;
  transform: translateY(-50%);
  width: 300px;
  height: 200px;
  overflow: hidden;
  pointer-events: none;
  z-index: 1000;
}

.lyric-list {
  transition: transform 0.5s ease;
}

.lyric-item {
  height: 48px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 0 16px;
  opacity: 0.6;
  transition: opacity 0.3s ease;
}

.lyric-item--current {
  opacity: 1;
  font-weight: bold;
}

.lyric-text a {
  color: inherit;
  text-decoration: none;
  pointer-events: auto;
}

.lyric-text a:hover {
  text-decoration: underline;
}

.lyric-cn {
  font-size: 0.8em;
  opacity: 0.7;
}

@media (max-width: 768px) {
  .lyric-box {
    display: none;
  }
}
</style>
