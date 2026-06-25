import { createRoute } from "@hono/zod-openapi";
import { createHonoRoute } from "@/lib";
import {
  AreaQuerySchema,
  TenkiParamSchema,
  ErrorSchema,
  TenkiWeatherSchema,
  AreasResponseSchema,
} from "@/schemas";
import { fetchTenkiWeather } from "@/services/tenki";
import { areas, getAreaByCode } from "@/area";

const coreRoute = createHonoRoute();

const weatherRoute = createRoute({
  method: "get",
  path: "/weather/{code}",
  tags: ["Core"],
  summary: "日本天气",
  description:
    "市区町村级别天气。code 为统一地区编码，如 `13104`（東京都新宿区）",
  request: { params: TenkiParamSchema },
  responses: {
    200: {
      content: { "application/json": { schema: TenkiWeatherSchema } },
      description: "天气数据",
    },
    404: {
      content: { "application/json": { schema: ErrorSchema } },
      description: "地区编码不存在",
    },
    500: {
      content: { "application/json": { schema: ErrorSchema } },
      description: "Error",
    },
  },
});

coreRoute.openapi(weatherRoute, async (c: any) => {
  const { code } = c.req.valid("param");
  try {
    const area = getAreaByCode(code);
    if (!area) {
      return c.json({ error: `地区编码 ${code} 不存在` }, 404);
    }
    const tenkiCode = area.tenki.replace(/\//g, "-");
    return c.json(await fetchTenkiWeather(tenkiCode), 200);
  } catch (e: any) {
    return c.json({ error: e.message }, 500);
  }
});

const areasRoute = createRoute({
  method: "get",
  path: "/areas",
  tags: ["Core"],
  summary: "地区代码列表",
  description: "查询自维护的地区编码，支持按地区、都道府県、城市名过滤",
  request: { query: AreaQuerySchema },
  responses: {
    200: {
      content: { "application/json": { schema: AreasResponseSchema } },
      description: "地区列表",
    },
    500: {
      content: { "application/json": { schema: ErrorSchema } },
      description: "Error",
    },
  },
});

coreRoute.openapi(areasRoute, (c: any) => {
  const { region, prefecture, q } = c.req.valid("query");
  try {
    let results = Object.values(areas);

    if (region) {
      results = results.filter((a) => a.region === region);
    }
    if (prefecture) {
      results = results.filter((a) => a.prefecture === prefecture);
    }
    if (q) {
      results = results.filter((a) => a.name.includes(q));
    }

    return c.json({ total: results.length, areas: results }, 200);
  } catch (e: any) {
    return c.json({ error: e.message }, 500);
  }
});

export default coreRoute;
