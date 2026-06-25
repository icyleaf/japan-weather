// 地区编码类型
export interface AreaCity {
  name: string;
  code: string;       // 统一编码（全国地方公共団体コード，5位）
  tenki: string;      // tenki.jp 路径，如 "3/16/4410/13101"
  jma: string | null; // JMA class20s 编码，如 "1310100"
}

export interface AreaSubregion {
  cities: AreaCity[];
}

export interface AreaPrefecture {
  name: string;
  tenki: string;           // tenki.jp 路径，如 "3/16"
  jma: string | null;      // JMA office 编码，如 "130000"
  subregions: Record<string, AreaSubregion>;
}

export interface AreaRegion {
  name: string;
  prefectures: Record<string, AreaPrefecture>;
}

// 扁平查找表类型
export interface AreaLookupEntry {
  name: string;
  region: string;
  prefecture: string;
  tenki: string;
  jma: string | null;
}

// 极简响应类型（给小电视用的）
export interface SimpleWeather {
  weather: string       // 天气描述: "晴れ", "曇り", "雨" 等
  temp_max: number | null  // 最高气温
  temp_min: number | null  // 最低气温
  updated: string       // ISO 时间戳
}

export interface SimpleEarthquake {
  time: string          // 地震发生时间 (JST)
  place: string         // 震源地
  magnitude: string     // 震级
  shindo: string        // 最大震度
  updated: string       // ISO 时间戳
}

export interface SimpleTsunami {
  status: string        // "なし", "津波注意報", "津波警報" 等
  updated: string       // ISO 时间戳
}

// 综合响应（一次性获取所有数据）
export interface SimpleAll {
  weather: SimpleWeather
  earthquake: SimpleEarthquake
  tsunami: SimpleTsunami
}

// JMA 原始数据类型（部分）
export interface JMAForecast {
  publishingOffice: string
  reportDatetime: string
  timeSeries: Array<{
    timeDefines: string[]
    areas: Array<{
      area: { name: string; code: string }
      weathers?: string[]
      winds?: string[]
      waves?: string[]
      pops?: string[]
      temps?: string[]
      reliabilities?: string[]
    }>
  }>
}

export interface JMAQuake {
  id: string
  code: number
  time: string
  hypocenter: {
    name: string
    latitude: number
    longitude: number
    depth: number
  }
  maxScale: number
  domesticTsunami: string
  foreignTsunami: string
}

export interface JMATsunami {
  id: string
  code: number
  reportDatetime: string
  areas: Array<{
    name: string
    grade: string       // "Warning", "Watch", etc.
    kind: string
  }>
}
