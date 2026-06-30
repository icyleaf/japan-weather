import * as cheerio from "cheerio";
import type { SimpleWeather } from "@/types";
import { japaneseToChineseWeather } from "@/utils/wordConverter";

interface TenkiWeather extends SimpleWeather {
  city: string;
  weather_code: string;
  rain_prob: string;
  current_wind: string;
  pressure: string;
  current_temp: string;
  observation_time: string;
  sunrise: string;
  sunset: string;
  warnings: string[];
}

/**
 * tenki.jp から天気データを取得（cheerio 使用）
 * @param code tenki.jp のパスコード（- で区切る、例: 3-16-4410-13117）
 */
export async function fetchTenkiWeather(code: string): Promise<TenkiWeather> {
  const path = code.replace(/-/g, "/");
  const url = `https://tenki.jp/forecast/${path}/`;

  // weather
  // https://static.tenki.jp/static-api/history/forecast/13117.js

  // heatstroke 熱中症
  // https://static.tenki.jp/static-api/history/heatstroke/13117.js

  // heatshock 熱中症指数
  // https://static.tenki.jp/static-api/history/heatshock/13117.js

  // 気圧
  // https://static.tenki.jp/static-api/history/pressure/13117.js

  //
  // https://static.tenki.jp/static-api/history/sakura/13117.js

  // pollen 花粉
  // https://static.tenki.jp/static-api/history/pollen/13117.js

  const res = await fetch(url, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      "Accept-Language": "ja",
    },
  });

  if (!res.ok) throw new Error(`tenki.jp fetch failed: ${res.status}`);

  const html = await res.text();
  const $ = cheerio.load(html);

  // 城市名
  const h2Text = $("h2").first().text();
  const cityMatch = h2Text.match(/^(.+?)の天気/);
  const city = cityMatch ? cityMatch[1].trim() : "-";

  // 天气描述
  const weather = japaneseToChineseWeather(
    $(".weather-telop").first().text().trim() || "不明",
  );

  // 天气图标代码（从 img src 提取文件名数字）
  const iconSrc =
    $(".today-weather .weather-icon img").first().attr("src") || "";
  const iconFileName = iconSrc.split("/").pop()?.split("?")[0] || "";
  const weatherCodeMatch = iconFileName.match(
    /^(\d+)(?:_[a-z]+)?(?:@[\w-]+)?\.png$/i,
  );
  const weather_code = weatherCodeMatch ? weatherCodeMatch[1] : "-";

  // 最高/最低气温
  const highTemp = $(".high-temp.temp .value").first().text().trim();
  const lowTemp = $(".low-temp.temp .value").first().text().trim();

  // 降水確率（--- → 0）
  const rawRainProb = getCurrentRainProb($);
  const rainProb = rawRainProb === "---" ? "0" : rawRainProb;

  // 观测时间
  const observationTime =
    $("li.time")
      .text()
      .match(/(\d+:\d+)現在/)?.[1] || "-";

  // 当前气温
  const currentTemp =
    $("li.temp")
      .text()
      .match(/([\d.]+)\s*℃/)?.[1] || "-";

  // 风向・风速
  const currentWind = japaneseToChineseWeather(
    $("li.wind").text().replace(/\s+/g, "").trim() || "-",
  );

  // 海面气压
  const pressure =
    $("li.pressure")
      .text()
      .match(/([\d.]+)\s*hPa/)?.[1] + "hPa" || "-";

  // 日の出・日の入（HH:MM 形式）
  const sunrise = formatTime($(".sunrise span").first().text().trim());
  const sunset = formatTime($(".sunset span").first().text().trim());

  // 警報情報を取得
  const warnings = (await fetchWarnings(path)).map(japaneseToChineseWeather);

  return {
    city,
    weather,
    weather_code,
    temp_max: highTemp ? Number(highTemp) : null,
    temp_min: lowTemp ? Number(lowTemp) : null,
    rain_prob: rainProb,
    current_wind: currentWind,
    current_temp: currentTemp,
    pressure,
    observation_time: observationTime,
    sunrise,
    sunset,
    warnings,
    updated: new Date().toISOString(),
  };
}

/**
 * 警報情報を取得
 * @param path tenki.jp のパス（例: 3/16/4410/13117）
 */
async function fetchWarnings(path: string): Promise<string[]> {
  try {
    // パスから region/prefecture を抽出（例: 3/16）
    const parts = path.split("/");
    if (parts.length < 2) return [];
    const warnUrl = `https://tenki.jp/bousai/warn/${parts[0]}/${parts[1]}/`;

    const res = await fetch(warnUrl, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        "Accept-Language": "ja",
      },
    });

    if (!res.ok) return [];

    const html = await res.text();
    const $ = cheerio.load(html);

    // 最後のパスセグメント（例: 13117）でリンクを検索
    const areaCode = parts[parts.length - 1];

    // href に areaCode を含む <a> タグを探す
    const link = $(`a[href*="/${areaCode}"]`).first();
    if (!link.length) return [];

    // 親の <tr> を取得
    const row = link.closest("tr");
    if (!row.length) return [];

    // <td> 内の <span> を取得
    const alerts: string[] = [];
    row.find("span").each((_, el) => {
      const text = $(el).text().trim();
      if (text) alerts.push(text);
    });

    return alerts;
  } catch {
    return [];
  }
}

/**
 * 「04時26分」→「04:26」に変換
 */
function formatTime(text: string): string {
  const match = text.match(/(\d{2})時(\d{2})分/);
  return match ? `${match[1]}:${match[2]}` : "-";
}

/**
 * 当前時間帯の降水確率を取得
 */
function getCurrentRainProb($: cheerio.CheerioAPI): string {
  const timeSlots: string[] = [];
  $("tr")
    .first()
    .find("th")
    .each((_, el) => {
      const text = $(el).text().trim();
      if (text.match(/^\d{2}-\d{2}$/)) {
        timeSlots.push(text);
      }
    });

  const values: string[] = [];
  $("tr.rain-probability")
    .first()
    .find("td")
    .each((_, el) => {
      values.push($(el).text().trim());
    });

  const now = new Date();
  const jstOffset = 9 * 60;
  const jstTime = new Date(
    now.getTime() + (jstOffset - now.getTimezoneOffset()) * 60000,
  );
  const currentHour = jstTime.getHours();

  for (let i = 0; i < timeSlots.length; i++) {
    const [start, end] = timeSlots[i].split("-").map(Number);
    if (currentHour >= start && currentHour < end) {
      return values[i] || "-";
    }
  }

  return "-";
}
