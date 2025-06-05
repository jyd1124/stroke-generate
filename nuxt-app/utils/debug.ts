// 调试工具

export const debugImageData = (imageData: ImageData, name: string) => {
  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')!
  canvas.width = imageData.width
  canvas.height = imageData.height
  ctx.putImageData(imageData, 0, 0)
  
  // 创建下载链接
  const link = document.createElement('a')
  link.download = `debug-${name}-${Date.now()}.png`
  link.href = canvas.toDataURL()
  
  console.log(`Debug image: ${name}`, {
    width: imageData.width,
    height: imageData.height,
    dataLength: imageData.data.length,
    downloadLink: link.href
  })
  
  // 自动下载（可选）
  // document.body.appendChild(link)
  // link.click()
  // document.body.removeChild(link)
}

export const analyzePixelData = (imageData: ImageData, name: string) => {
  const data = imageData.data
  let min = 255, max = 0, sum = 0, count = 0
  
  for (let i = 0; i < data.length; i += 4) {
    const gray = data[i] // R通道作为灰度值
    min = Math.min(min, gray)
    max = Math.max(max, gray)
    sum += gray
    count++
  }
  
  const avg = sum / count
  
  console.log(`Pixel analysis: ${name}`, {
    min,
    max,
    avg: avg.toFixed(2),
    range: max - min,
    totalPixels: count
  })
}
