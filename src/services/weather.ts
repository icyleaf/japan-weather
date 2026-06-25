import type { JMAForecast, SimpleWeather } from "@/types";

const DEFAULT_AREA = "130000";
const JMA_BASE = "https://www.jma.go.jp/bosai";

const TEMP_STATION_MAP: Record<string, string> = {
  "130010": "44132",
  "130020": "44172",
  "130030": "44263",
  "130040": "44301",
};

export async function fetchWeather(
  areaCode: string = DEFAULT_AREA,
  env?: any,
  subAreaCode?: string,
): Promise<SimpleWeather> {
  const cacheKey = `weather:${areaCode}:${subAreaCode || "default"}`;

  if (env?.JMA_CACHE) {
    const cached = await env.JMA_CACHE.get(cacheKey, "json");
    if (cached) return cached as SimpleWeather;
  }

  const res = await fetch(
    `${JMA_BASE}/forecast/data/forecast/${areaCode}.json`,
    {
      headers: { "User-Agent": "JMA-Proxy/1.0" },
    },
  );

  if (!res.ok) throw new Error(`JMA weather fetch failed: ${res.status}`);

  const data = (await res.json()) as JMAForecast[];

  let weatherText = "不明";
  if (subAreaCode) {
    const found = data[0]?.timeSeries[0]?.areas.find(
      (a) => a.area.code === subAreaCode,
    );
    if (found) weatherText = found.weathers?.[0] ?? "不明";
  } else {
    weatherText = data[0]?.timeSeries[0]?.areas[0]?.weathers?.[0] ?? "不明";
  }

  let tempSeries: string[] = [];
  if (subAreaCode && TEMP_STATION_MAP[subAreaCode]) {
    const stationCode = TEMP_STATION_MAP[subAreaCode];
    const tempArea = data[0]?.timeSeries[2]?.areas.find(
      (a) => a.area.code === stationCode,
    );
    tempSeries = tempArea?.temps ?? [];
  } else {
    tempSeries = data[0]?.timeSeries[2]?.areas[0]?.temps ?? [];
  }

  const validTemps = tempSeries
    .filter((t): t is string => t !== "" && t !== undefined)
    .map(Number);
  const tempMin = validTemps.length > 0 ? Math.min(...validTemps) : null;
  const tempMax = validTemps.length > 0 ? Math.max(...validTemps) : null;

  const result: SimpleWeather = {
    weather: weatherText,
    temp_max: tempMax,
    temp_min: tempMin,
    updated: new Date().toISOString(),
  };

  if (env?.JMA_CACHE) {
    await env.JMA_CACHE.put(cacheKey, JSON.stringify(result), {
      expirationTtl: 300,
    });
  }

  return result;
}
