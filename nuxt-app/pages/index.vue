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
              <v-card class="preview-card mb-6" elevation="4">
                <div 
                  class="preview-box"
                  :class="{ 'preview-box--diff': diff, 'preview-box--running': running }"
                  @touchstart.prevent="toDiff"
                  @touchend.prevent="diff = false"
                  @mousedown.prevent="toDiff"
                  @mouseup.prevent="diff = false"
                  @mouseleave.prevent="diff = false"
                >
                  <img 
                    ref="imgRef" 
                    :src="src" 
                    :style="sizeStyle"
                    class="preview-img"
                  />
                  <canvas 
                    ref="canvasRef" 
                    :style="sizeStyle"
                    class="preview-canvas"
                  ></canvas>
                </div>
              </v-card>

              <!-- 控制面板 -->
              <v-card elevation="2">
                <v-card-text>
                  <!-- 主要按钮 -->
                  <div class="d-flex gap-3 mb-4">
                    <v-btn
                      :color="!isDefaultImageURL ? 'primary' : 'default'"
                      :variant="!isDefaultImageURL ? 'elevated' : 'outlined'"
                      @click="chooseFile"
                      prepend-icon="mdi-image-plus"
                    >
                      选择图片
                    </v-btn>
                    
                    <v-btn
                      :color="isDefaultImageURL ? 'success' : 'default'"
                      :variant="isDefaultImageURL ? 'elevated' : 'outlined'"
                      :disabled="running"
                      @click="save"
                      prepend-icon="mdi-download"
                    >
                      {{ running ? '生成中…' : '保存图片' }}
                    </v-btn>
                  </div>

                  <!-- 线条方案选择 -->
                  <div class="mb-4">
                    <v-chip-group
                      v-model="selectedConvoluteIndex"
                      selected-class="text-primary"
                      mandatory
                    >
                      <v-chip
                        v-for="(name, index) in convolutes"
                        :key="name"
                        :value="index"
                        @click="style.convoluteName = name; _louvre(50)"
                      >
                        {{ name }}
                      </v-chip>
                    </v-chip-group>
                  </div>

                  <!-- 开关控制 -->
                  <div class="mb-4">
                    <v-row>
                      <v-col cols="6" sm="3">
                        <v-switch
                          v-model="style.denoise"
                          label="降噪"
                          color="primary"
                          @change="_louvre(50)"
                        ></v-switch>
                      </v-col>
                      <v-col cols="6" sm="3">
                        <v-switch
                          v-model="style.kuma"
                          label="Kiss"
                          color="primary"
                          @change="_louvre(50)"
                        ></v-switch>
                      </v-col>
                      <v-col cols="6" sm="3">
                        <v-switch
                          v-model="style.watermark"
                          label="水印"
                          color="primary"
                          @change="_louvre(50)"
                        ></v-switch>
                      </v-col>
                      <v-col cols="6" sm="3">
                        <v-switch
                          v-model="style.hajimei"
                          :disabled="!style.watermark"
                          label="初回"
                          color="primary"
                          @change="_louvre(50)"
                        ></v-switch>
                      </v-col>
                    </v-row>
                  </div>

                  <!-- 滑块控制 -->
                  <div class="mb-4">
                    <v-row>
                      <v-col cols="12" sm="6">
                        <div class="mb-2">
                          <span class="text-subtitle-2">线迹轻重: {{ style.darkCut }}</span>
                        </div>
                        <v-slider
                          v-model="style.darkCut"
                          :min="80"
                          :max="126"
                          :step="1"
                          color="primary"
                          @end="_louvre(50)"
                        ></v-slider>
                      </v-col>
                      <v-col cols="12" sm="6">
                        <div class="mb-2">
                          <span class="text-subtitle-2">调子数量: {{ style.shadeLimit }}</span>
                        </div>
                        <v-slider
                          v-model="style.shadeLimit"
                          :min="20"
                          :max="200"
                          :step="1"
                          color="primary"
                          @end="_louvre(50)"
                        ></v-slider>
                      </v-col>
                    </v-row>
                  </div>

                  <!-- 提示信息 -->
                  <v-alert
                    type="info"
                    variant="tonal"
                    class="mb-4"
                  >
                    <div class="text-body-2">
                      <p class="mb-2">
                        建议上传<strong>赛璐珞风格</strong>的<strong>动画截图</strong>、<strong>插画</strong>等，效果最佳
                      </p>
                      <p class="mb-2">
                        高清图请务必
                        <v-btn
                          variant="text"
                          size="small"
                          @click="style.denoise = false"
                        >
                          关闭降噪
                        </v-btn>
                        线条更精致
                      </p>
                      <p class="mb-0">
                        也可以
                        <v-btn
                          variant="text"
                          size="small"
                          @click="saveDiff"
                        >
                          生成对比图
                        </v-btn>
                        方便分享
                      </p>
                    </div>
                  </v-alert>
                </v-card-text>
              </v-card>
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

// DOM引用
const imgRef = ref<HTMLImageElement>()
const canvasRef = ref<HTMLCanvasElement>()

// 计算属性
const sizeStyle = computed(() => ({
  width: `${previewWidth.value}px`,
  height: `${previewHeight.value}px`,
}))

const isDefaultImageURL = computed(() => src.value !== defaultImageURL)

// 方法
const chooseFile = () => {
  const input = document.createElement('input')
  input.type = 'file'
  input.accept = 'image/*'
  input.onchange = (e) => {
    const file = (e.target as HTMLInputElement).files?.[0]
    if (file) {
      readFileAndSetIMGSrc(file)
    }
  }
  input.click()
}

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

  if (imgRef.value && canvasRef.value) {
    try {
      await louvre({
        img: imgRef.value,
        outputCanvas: canvasRef.value,
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
  if (!imgRef.value) return

  const { naturalWidth, naturalHeight } = imgRef.value
  const maxPreviewWidth = Math.min(800, window.innerWidth)
  const newPreviewWidth = Math.min(maxPreviewWidth, naturalWidth)
  const newPreviewHeight = Math.floor(newPreviewWidth / naturalWidth * naturalHeight)

  previewWidth.value = newPreviewWidth
  previewHeight.value = newPreviewHeight

  await louvreProcess()
}

const save = () => {
  if (!canvasRef.value) return
  output.value = canvasRef.value.toDataURL('image/jpeg', 0.9)
  downloadFilename.value = `[lab.magiconch.com][One-Last-Image]-${Date.now()}.jpg`

  // 立即下载图片
  downloadImage(output.value, downloadFilename.value)

  showOutput.value = true
}

const saveDiff = () => {
  if (!imgRef.value || !canvasRef.value) return

  const mixCanvas = document.createElement('canvas')
  const mixCanvasCtx = mixCanvas.getContext('2d')!
  mixCanvas.width = canvasRef.value.width
  mixCanvas.height = canvasRef.value.height * 2

  mixCanvasCtx.drawImage(canvasRef.value, 0, 0, canvasRef.value.width, canvasRef.value.height)
  mixCanvasCtx.drawImage(
    imgRef.value,
    0, 0, imgRef.value.naturalWidth, imgRef.value.naturalHeight,
    0, canvasRef.value.height, canvasRef.value.width, canvasRef.value.height
  )

  output.value = mixCanvas.toDataURL('image/jpeg', 0.9)
  downloadFilename.value = `[lab.magiconch.com][One-Last-Image]-diff-${Date.now()}.jpg`

  // 立即下载图片
  downloadImage(output.value, downloadFilename.value)

  showOutput.value = true
}

const saveDiff2 = () => {
  if (!imgRef.value || !canvasRef.value) return

  const mixCanvas = document.createElement('canvas')
  const mixCanvasCtx = mixCanvas.getContext('2d')!
  mixCanvas.width = canvasRef.value.width
  mixCanvas.height = canvasRef.value.height

  mixCanvasCtx.drawImage(canvasRef.value, 0, 0, canvasRef.value.width, canvasRef.value.height)

  const topXScale = bevelPosition.value / 100 + 0.24
  const bottomXScale = bevelPosition.value / 100 + 0.04
  const topX = Math.floor(canvasRef.value.width * topXScale)
  const bottomX = Math.floor(canvasRef.value.width * bottomXScale)

  mixCanvasCtx.beginPath()
  mixCanvasCtx.moveTo(0, 0)
  mixCanvasCtx.lineTo(topX, 0)
  mixCanvasCtx.lineTo(bottomX, canvasRef.value.height)
  mixCanvasCtx.lineTo(0, canvasRef.value.height)
  mixCanvasCtx.closePath()

  const pattern = mixCanvasCtx.createPattern(imgRef.value, 'no-repeat')!
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

const toDiff = () => {
  diff.value = true
}

const closeOutput = () => {
  showOutput.value = false
  output.value = ''
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

  // 设置图片加载事件
  if (imgRef.value) {
    imgRef.value.onload = setImageAndDraw
    if (imgRef.value.complete) {
      setImageAndDraw()
    }
  }

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

.preview-card {
  overflow: hidden;
}

.preview-box {
  position: relative;
  cursor: pointer;
  display: flex;
  justify-content: center;
  align-items: center;
  background: #f5f5f5;
}

.preview-img {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  margin: auto;
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.1s ease;
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
}

.preview-canvas {
  display: block;
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
}

.preview-box--diff .preview-img,
.preview-box--running .preview-img {
  opacity: 1;
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
