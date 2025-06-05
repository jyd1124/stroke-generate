// 歌词解析工具

export interface LyricLine {
  time: number
  text: string
  translation?: string
}

export const parseLyrics = (lrcText: string): LyricLine[] => {
  const lines = lrcText.split('\n')
  const lyrics: LyricLine[] = []
  
  for (const line of lines) {
    const match = line.match(/\[(\d{2}):(\d{2})\.(\d{2})\](.*)/)
    if (match) {
      const minutes = parseInt(match[1])
      const seconds = parseInt(match[2])
      const centiseconds = parseInt(match[3])
      const time = minutes * 60 + seconds + centiseconds / 100
      const text = match[4].trim()
      
      if (text) {
        lyrics.push({
          time,
          text,
        })
      }
    }
  }
  
  return lyrics.sort((a, b) => a.time - b.time)
}

export const getCurrentLyricIndex = (lyrics: LyricLine[], currentTime: number): number => {
  for (let i = lyrics.length - 1; i >= 0; i--) {
    if (lyrics[i].time <= currentTime) {
      return i
    }
  }
  return 0
}
