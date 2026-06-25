import type { SimpleTsunami } from "@/types";

const JMA_BASE = "https://www.jma.go.jp/bosai";

export async function fetchTsunami(env?: any): Promise<SimpleTsunami> {
  const cacheKey = "tsunami:latest";

  if (env?.JMA_CACHE) {
    const cached = await env.JMA_CACHE.get(cacheKey, "json");
    if (cached) return cached as SimpleTsunami;
  }

  const res = await fetch(`${JMA_BASE}/tsunami/data/list.json`, {
    headers: { "User-Agent": "JMA-Proxy/1.0" },
  });

  if (!res.ok) throw new Error(`JMA tsunami fetch failed: ${res.status}`);

  const data = (await res.json()) as any;
  const items = data?.items || [];

  let status = "なし";
  if (items.length > 0) {
    const grade = items[0]?.grade || "";
    switch (grade) {
      case "Warning":
        status = "津波警報";
        break;
      case "Watch":
        status = "津波注意報";
        break;
      case "MajorWarning":
        status = "大津波警報";
        break;
      default:
        status = grade || "なし";
    }
  }

  const result: SimpleTsunami = { status, updated: new Date().toISOString() };

  if (env?.JMA_CACHE) {
    await env.JMA_CACHE.put(cacheKey, JSON.stringify(result), {
      expirationTtl: 120,
    });
  }

  return result;
}
