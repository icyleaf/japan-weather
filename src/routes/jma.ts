import { createRoute } from "@hono/zod-openapi";
import { createHonoRoute } from "@/lib";
import { getAreaByCode } from "@/area";
import { fetchWeather } from "@/services/weather";
import { fetchEarthquake } from "@/services/earthquake";
import { fetchTsunami } from "@/services/tsunami";
import {
  WeatherQuerySchema,
  EarthquakeQuerySchema,
  ErrorSchema,
  JmaWeatherSchema,
  EarthquakeSchema,
  TsunamiSchema,
} from "@/schemas";

const jmaRoute = createHonoRoute();

const tag = "JMA";

// --- Weather ---

const jmaWeatherRoute = createRoute({
  method: "get",
  path: "/weather",
  tags: [tag],
  summary: "JMA 天气预报",
  description: "从日本气象厅获取天气预报。code 为统一地区编码，如 13101（千代田区）",
  request: { query: WeatherQuerySchema },
  responses: {
    200: {
      content: { "application/json": { schema: JmaWeatherSchema } },
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

jmaRoute.openapi(jmaWeatherRoute, async (c: any) => {
  const { code } = c.req.valid("query");
  try {
    const area = getAreaByCode(code);
    if (!area || !area.jma_office) {
      return c.json({ error: `地区编码 ${code} 不存在或无 JMA 映射` }, 404);
    }
    return c.json(await fetchWeather(area.jma_office), 200);
  } catch (e: any) {
    return c.json({ error: e.message }, 500);
  }
});

// --- Earthquake ---

const earthquakeRoute = createRoute({
  method: "get",
  path: "/earthquake",
  tags: [tag],
  summary: "地震速报",
  description: "获取最新地震信息。code 为统一地区编码，按都道府県过滤",
  request: { query: EarthquakeQuerySchema },
  responses: {
    200: {
      content: { "application/json": { schema: EarthquakeSchema } },
      description: "地震数据",
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

jmaRoute.openapi(earthquakeRoute, async (c: any) => {
  const { code } = c.req.valid("query");
  try {
    let jmaCode: string | undefined;
    if (code) {
      const area = getAreaByCode(code);
      if (!area || !area.jma) {
        return c.json({ error: `地区编码 ${code} 不存在或无 JMA 映射` }, 404);
      }
      jmaCode = area.jma;
    }
    return c.json(await fetchEarthquake(undefined, jmaCode), 200);
  } catch (e: any) {
    return c.json({ error: e.message }, 500);
  }
});

// --- Tsunami ---

const tsunamiRoute = createRoute({
  method: "get",
  path: "/tsunami",
  tags: [tag],
  summary: "海啸预警",
  description: "获取海啸预警信息",
  responses: {
    200: {
      content: { "application/json": { schema: TsunamiSchema } },
      description: "海啸数据",
    },
    500: {
      content: { "application/json": { schema: ErrorSchema } },
      description: "Error",
    },
  },
});

jmaRoute.openapi(tsunamiRoute, async (c: any) => {
  try {
    return c.json(await fetchTsunami(undefined), 200);
  } catch (e: any) {
    return c.json({ error: e.message }, 500);
  }
});

// --- All ---

// const allRoute = createRoute({
//   method: "get",
//   path: "/a",
//   tags: ["Core"],
//   summary: "综合数据",
//   description: "一次性获取天气、地震、海啸数据",
//   request: { query: AllQuerySchema },
//   responses: {
//     200: {
//       content: { "application/json": { schema: AllSchema } },
//       description: "综合数据",
//     },
//     500: {
//       content: { "application/json": { schema: ErrorSchema } },
//       description: "Error",
//     },
//   },
// });

// jmaRoute.openapi(allRoute, async (c: any) => {
//   const { area, sub, pref } = c.req.valid("query");
//   try {
//     const [weather, earthquake, tsunami] = await Promise.all([
//       fetchWeather(area, undefined, sub),
//       fetchEarthquake(undefined, pref),
//       fetchTsunami(undefined),
//     ]);
//     return c.json({ weather, earthquake, tsunami }, 200);
//   } catch (e: any) {
//     return c.json({ error: e.message }, 500);
//   }
// });

export default jmaRoute;
