import type { SimpleEarthquake } from "@/types";

const JMA_BASE = "https://www.jma.go.jp/bosai";

const SHINDO_MAP: Record<number, string> = {
  10: "1",
  20: "2",
  30: "3",
  40: "4",
  45: "5弱",
  50: "5強",
  55: "6弱",
  60: "6強",
  70: "7",
};

export async function fetchEarthquake(
  env?: any,
  areaCode?: string,
): Promise<SimpleEarthquake> {
  const cacheKey = `earthquake:latest:${areaCode || "all"}`;

  if (env?.JMA_CACHE) {
    const cached = await env.JMA_CACHE.get(cacheKey, "json");
    if (cached) return cached as SimpleEarthquake;
  }

  const res = await fetch(`${JMA_BASE}/quake/data/list.json`, {
    headers: { "User-Agent": "JMA-Proxy/1.0" },
  });

  if (!res.ok) throw new Error(`JMA earthquake fetch failed: ${res.status}`);

  const data = (await res.json()) as any[];

  let latest = data[0];
  if (areaCode) {
    const prefCode = areaCode.substring(0, 2);
    latest = data.find((eq) => eq.int?.some((i: any) => i.code === prefCode));
    if (!latest) {
      return {
        time: "",
        place: "データなし",
        magnitude: "-",
        shindo: "-",
        updated: new Date().toISOString(),
      };
    }
  }

  if (!latest) {
    return {
      time: "",
      place: "データなし",
      magnitude: "-",
      shindo: "-",
      updated: new Date().toISOString(),
    };
  }

  let shindo = SHINDO_MAP[latest.maxi] || String(latest.maxi || "-");
  if (areaCode && latest.int) {
    const prefCode = areaCode.substring(0, 2);
    const prefData = latest.int.find((i: any) => i.code === prefCode);
    if (prefData)
      shindo = SHINDO_MAP[prefData.maxi] || String(prefData.maxi || "-");
  }

  const result: SimpleEarthquake = {
    time: latest.at || "",
    place: latest.anm || "不明",
    magnitude: latest.mag || "-",
    shindo,
    updated: new Date().toISOString(),
  };

  if (env?.JMA_CACHE) {
    await env.JMA_CACHE.put(cacheKey, JSON.stringify(result), {
      expirationTtl: 120,
    });
  }

  return result;
}
