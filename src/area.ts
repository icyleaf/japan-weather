// 预加载地区数据
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
const __dirname = dirname(fileURLToPath(import.meta.url));
const areasData = JSON.parse(
  readFileSync(join(__dirname, "data/areas-lookup.json"), "utf-8"),
);

export const areas = Object.entries(areasData).map(
  ([code, info]: [string, any]) => ({
    code,
    name: info.name,
    region: info.region,
    prefecture: info.prefecture,
  }),
) as Record<string, any>;

export function getAreaByCode(code: string): {
  name: string;
  tenki: string;
  jma: string | null;
  jma_office: string | null;
  region: string;
  prefecture: string;
} | null {
  const area = (areasData as Record<string, any>)[code];
  return area || null;
}
