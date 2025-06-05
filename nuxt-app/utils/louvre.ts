/**
 * @author itorr<https://github.com/itorr>
 * @date 2022-06-01
 * @Description One Last Image - 图像处理核心模块
 */

import { debugImageData, analyzePixelData } from './debug'

// 卷积核定义
const createConvoluteAverage = (w: number) => new Array(w * w).fill(1 / (w * w))

export const Convolutes = {
  '精细': createConvoluteAverage(5),
  '一般': createConvoluteAverage(7),
  '稍粗': createConvoluteAverage(9),
  '超粗': createConvoluteAverage(11),
  '极粗': createConvoluteAverage(13),
  '浮雕': [
    1, 1, 1,
    1, 1, -1,
    -1, -1, -1
  ],
  '线稿': null,
}

// 图像处理配置接口
export interface LouvreConfig {
  zoom?: number
  light?: number
  shadeLimit?: number
  shadeLight?: number
  shade?: boolean
  kuma?: boolean
  hajimei?: boolean
  watermark?: boolean
  convoluteName?: string
  convolute1Diff?: boolean
  convoluteName2?: string | null
  lightCut?: number
  darkCut?: number
  denoise?: boolean
  Convolutes?: typeof Convolutes
}

// 图像处理参数接口
export interface LouvreParams {
  img: HTMLImageElement
  outputCanvas: HTMLCanvasElement
  config: LouvreConfig
}

let watermarkImageEl: HTMLImageElement | null = null
let pencilTextureEl: HTMLImageElement | null = null
let lastConfigString: string | null = null

// 加载图像资源
const loadImage = (url: string): Promise<HTMLImageElement> => {
  return new Promise((resolve, reject) => {
    const el = new Image()
    el.onload = () => resolve(el)
    el.onerror = reject
    el.src = url
  })
}

// 初始化资源
export const louvreInit = async (): Promise<void> => {
  try {
    pencilTextureEl = await loadImage('/pencil-texture.jpg')
    watermarkImageEl = await loadImage('/one-last-image-logo2.png')
  } catch (error) {
    console.error('Failed to load resources:', error)
  }
}

// 卷积运算
const convolute = (pixels: ImageData, weights: number[], ctx: CanvasRenderingContext2D): ImageData => {
  const side = Math.round(Math.sqrt(weights.length))
  const halfSide = Math.floor(side / 2)
  const src = pixels.data
  const sw = pixels.width
  const sh = pixels.height
  const w = sw
  const h = sh
  const output = ctx.createImageData(w, h)
  const dst = output.data

  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const sy = y
      const sx = x
      const dstOff = (y * w + x) * 4
      let r = 0, g = 0, b = 0, a = 0

      for (let cy = 0; cy < side; cy++) {
        for (let cx = 0; cx < side; cx++) {
          const scy = sy + cy - halfSide
          const scx = sx + cx - halfSide

          if (scy >= 0 && scy < sh && scx >= 0 && scx < sw) {
            const srcOff = (scy * sw + scx) * 4
            const wt = weights[cy * side + cx]
            r += src[srcOff] * wt
            g += src[srcOff + 1] * wt
            b += src[srcOff + 2] * wt
            a += src[srcOff + 3] * wt
          }
        }
      }

      dst[dstOff] = r
      dst[dstOff + 1] = g
      dst[dstOff + 2] = b
      dst[dstOff + 3] = a
    }
  }

  return output
}

// Y通道卷积 - 与原版完全一致的实现
const convoluteY = (pixels: ImageData, weights: number[], ctx: CanvasRenderingContext2D): ImageData => {
  const side = Math.round(Math.sqrt(weights.length))
  const halfSide = Math.floor(side / 2)
  const src = pixels.data
  const w = pixels.width
  const h = pixels.height
  const output = ctx.createImageData(w, h)
  const dst = output.data

  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const sy = y
      const sx = x
      const dstOff = (y * w + x) * 4
      let val = 0

      for (let cy = 0; cy < side; cy++) {
        for (let cx = 0; cx < side; cx++) {
          const scy = Math.min(h - 1, Math.max(0, sy + cy - halfSide))
          const scx = Math.min(w - 1, Math.max(0, sx + cx - halfSide))
          const srcOff = (scy * w + scx) * 4
          const wt = weights[cy * side + cx]
          val += src[srcOff] * wt
        }
      }

      dst[dstOff] = val
      dst[dstOff + 1] = val
      dst[dstOff + 2] = val
      dst[dstOff + 3] = 255
    }
  }

  return output
}

// 主要的图像处理函数
export const louvre = async ({ img, outputCanvas, config }: LouvreParams): Promise<void> => {
  if (!img || !config) return

  console.time('louvre')

  const configString = [
    JSON.stringify(config),
    img.src,
  ].join('-')

  if (configString === lastConfigString) {
    console.timeEnd('louvre')
    return
  }
  lastConfigString = configString

  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')!
  const canvasMin = document.createElement('canvas')
  const canvasShade = document.createElement('canvas')
  const canvasShadeMin = document.createElement('canvas')

  const { naturalWidth, naturalHeight } = img
  let _width = naturalWidth
  let _height = naturalHeight

  // 限制最大尺寸
  const maxSize = 2048
  if (_width > maxSize || _height > maxSize) {
    const scale = Math.min(maxSize / _width, maxSize / _height)
    _width = Math.floor(_width * scale)
    _height = Math.floor(_height * scale)
  }

  canvas.width = _width
  canvas.height = _height

  // 绘制原图
  ctx.fillStyle = '#FFF'
  ctx.fillRect(0, 0, _width, _height)
  ctx.drawImage(img, 0, 0, _width, _height)

  let pixel = ctx.getImageData(0, 0, _width, _height)
  let pixelData = pixel.data

  // 转换为灰度
  for (let i = 0; i < pixelData.length; i += 4) {
    const y = pixelData[i] * 0.299 + pixelData[i + 1] * 0.587 + pixelData[i + 2] * 0.114
    pixelData[i] = y
    pixelData[i + 1] = y
    pixelData[i + 2] = y
  }

  console.log('Step 1: 灰度转换完成')
  analyzePixelData(pixel, 'grayscale')

  // 处理阴影和铅笔纹理
  let shadePixel: ImageData | null = null
  let pencilTexturePixel: ImageData | null = null

  if (config.shade && config.kuma && pencilTextureEl) {
    const { shadeLimit = 108, shadeLight = 80 } = config

    // 创建铅笔纹理
    const pencilTextureCanvas = document.createElement('canvas')
    const pencilTextureCtx = pencilTextureCanvas.getContext('2d')!
    const pencilSetWidthHeight = Math.max(_width, _height)

    pencilTextureCanvas.width = _width
    pencilTextureCanvas.height = _height
    pencilTextureCtx.drawImage(
      pencilTextureEl,
      0, 0, 1200, 1200,
      0, 0, pencilSetWidthHeight, pencilSetWidthHeight
    )
    pencilTexturePixel = pencilTextureCtx.getImageData(0, 0, _width, _height)

    // 处理阴影
    shadePixel = ctx.createImageData(_width, _height)

    for (let i = 0; i < pixelData.length; i += 4) {
      let y = pixelData[i]
      y = y > shadeLimit ? 0 : 255

      shadePixel.data[i] = y
      shadePixel.data[i + 1] = 128
      shadePixel.data[i + 2] = 128
      shadePixel.data[i + 3] = Math.floor(Math.random() * 255)
    }

    // 阴影模糊处理
    const ctxShade = canvasShade.getContext('2d')!
    const ctxShadeMin = canvasShadeMin.getContext('2d')!

    canvasShade.width = _width
    canvasShade.height = _height
    ctxShade.putImageData(shadePixel, 0, 0)

    const shadeZoom = 4
    canvasShadeMin.width = Math.floor(_width / shadeZoom)
    canvasShadeMin.height = Math.floor(_height / shadeZoom)

    ctxShadeMin.drawImage(canvasShade, 0, 0, canvasShadeMin.width, canvasShadeMin.height)
    ctxShade.clearRect(0, 0, _width, _height)
    ctxShade.drawImage(canvasShadeMin, 0, 0, _width, _height)
    shadePixel = ctxShade.getImageData(0, 0, _width, _height)

    // 应用铅笔纹理到阴影
    for (let i = 0; i < shadePixel.data.length; i += 4) {
      let y = shadePixel.data[i]
      y = Math.round((255 - pencilTexturePixel.data[i]) / 255 * y / 255 * shadeLight)
      shadePixel.data[i] = y
    }
  }

  // 亮度调整
  const { light = 0 } = config
  if (light) {
    for (let i = 0; i < pixelData.length; i += 4) {
      let y = pixelData[i]
      y = y + y * (light / 100)
      pixelData[i] = y
      pixelData[i + 1] = y
      pixelData[i + 2] = y
    }
  }

  // 降噪处理
  if (config.denoise) {
    pixel = convoluteY(
      pixel,
      [
        1/9, 1/9, 1/9,
        1/9, 1/9, 1/9,
        1/9, 1/9, 1/9
      ],
      ctx
    )
  }

  // 应用卷积核
  const { convoluteName = '一般', Convolutes: convolutes = Convolutes } = config
  const convoluteMatrix = convolutes[convoluteName as keyof typeof convolutes]

  console.log('Step 3: 应用卷积核', { convoluteName, hasMatrix: !!convoluteMatrix })
  let pixel1 = convoluteMatrix ? convoluteY(pixel, convoluteMatrix, ctx) : pixel

  if (convoluteMatrix) {
    analyzePixelData(pixel1, 'after-convolute')
  }

  // 处理卷积差分
  if (convoluteMatrix && config.convolute1Diff) {
    let pixel2 = config.convoluteName2 ?
      convoluteY(pixel, convolutes[config.convoluteName2 as keyof typeof convolutes] || [], ctx) :
      pixel

    for (let i = 0; i < pixel2.data.length; i += 4) {
      const r = 128 + pixel2.data[i] - pixel1.data[i]
      pixel2.data[i] = r
      pixel2.data[i + 1] = r
      pixel2.data[i + 2] = r
      pixel2.data[i + 3] = 255
    }
    pixel = pixel2
  } else {
    pixel = pixel1
  }

  pixelData = pixel.data

  // 亮度裁切处理 - 这是关键的线稿生成步骤
  if (convoluteMatrix) {
    const { lightCut = 0, darkCut = 118 } = config

    console.log('Step 4: 亮度裁切处理', { lightCut, darkCut })

    if (lightCut || darkCut) {
      const scale = 255 / (255 - lightCut - darkCut)

      for (let i = 0; i < pixelData.length; i += 4) {
        let y = pixelData[i]
        y = (y - darkCut) * scale
        y = Math.max(0, y)

        pixelData[i] = y
        pixelData[i + 1] = y
        pixelData[i + 2] = y
        pixelData[i + 3] = 255
      }

      analyzePixelData(pixel, 'after-threshold')
    }
  }

  // Kiss 渐变效果
  if (config.kuma) {
    const gradient = ctx.createLinearGradient(0, 0, _width, _height)
    gradient.addColorStop(0, '#fbba30')
    gradient.addColorStop(0.4, '#fc7235')
    gradient.addColorStop(0.6, '#fc354e')
    gradient.addColorStop(0.7, '#cf36df')
    gradient.addColorStop(0.8, '#37b5d9')
    gradient.addColorStop(1, '#3eb6da')

    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, _width, _height)
    const gradientPixel = ctx.getImageData(0, 0, _width, _height)

    for (let i = 0; i < pixelData.length; i += 4) {
      let y = pixelData[i]

      pixelData[i] = gradientPixel.data[i]
      pixelData[i + 1] = gradientPixel.data[i + 1]
      pixelData[i + 2] = gradientPixel.data[i + 2]

      y = 255 - y
      if (config.shade && shadePixel) {
        y = Math.max(y, shadePixel.data[i])
      }
      pixelData[i + 3] = y
    }
  }

  // 绘制到画布
  ctx.putImageData(pixel, 0, 0)

  // 模糊处理
  const ctxMin = canvasMin.getContext('2d')!
  canvasMin.width = Math.floor(_width / 1.4)
  canvasMin.height = Math.floor(_height / 1.3)
  ctxMin.clearRect(0, 0, canvasMin.width, canvasMin.height)
  ctxMin.drawImage(canvas, 0, 0, canvasMin.width, canvasMin.height)

  ctx.clearRect(0, 0, _width, _height)
  ctx.drawImage(canvasMin, 0, 0, canvasMin.width, canvasMin.height, 0, 0, _width, _height)

  // 添加水印
  if (config.watermark && watermarkImageEl) {
    const watermarkImageWidth = watermarkImageEl.naturalWidth
    const watermarkImageHeight = watermarkImageEl.naturalHeight / 2
    let setWidth = _width * 0.3
    let setHeight = setWidth / watermarkImageWidth * watermarkImageHeight

    if (_width / _height > 1.1) {
      setHeight = _height * 0.15
      setWidth = setHeight / watermarkImageHeight * watermarkImageWidth
    }

    const cutTop = config.hajimei ? watermarkImageHeight : 0
    const setLeft = _width - setWidth - setHeight * 0.2
    const setTop = _height - setHeight - setHeight * 0.16

    ctx.drawImage(
      watermarkImageEl,
      0, cutTop,
      watermarkImageWidth, watermarkImageHeight,
      setLeft, setTop,
      setWidth, setHeight
    )
  }

  // 输出到目标画布
  const outputCtx = outputCanvas.getContext('2d')!
  outputCanvas.width = _width
  outputCanvas.height = _height
  outputCtx.fillStyle = '#FFF'
  outputCtx.fillRect(0, 0, _width, _height)
  outputCtx.drawImage(canvas, 0, 0, _width, _height)

  console.timeEnd('louvre')
}
