import { z } from "zod";

// ============ 请求参数 Schemas ============

export const AreaQuerySchema = z.object({
  region: z
    .string()
    .optional()
    .describe("地区名（如 北海道地方、関東・甲信地方）"),
  prefecture: z.string().optional().describe("都道府県名（如 東京都、大阪府）"),
  q: z.string().optional().describe("城市名搜索（模糊匹配）"),
});

export const TenkiParamSchema = z.object({
  code: z
    .string()
    .regex(/^\d{4,5}$/, "格式: 4-5位地区编码，如 13101")
    .describe("地区编码（统一编码）"),
});

export const WeatherQuerySchema = z.object({
  code: z
    .string()
    .regex(/^\d{4,5}$/, "格式: 4-5位地区编码，如 13101")
    .describe("统一地区编码"),
});

export const EarthquakeQuerySchema = z.object({
  code: z
    .string()
    .regex(/^\d{4,5}$/, "格式: 4-5位地区编码，如 13101")
    .optional()
    .describe("统一地区编码（按都道府県过滤）"),
});

export const AllQuerySchema = z.object({
  area: z.string().default("130000").describe("都道府県代码"),
  sub: z.string().optional().describe("子区域代码"),
  pref: z.string().optional().describe("都道府県代码（地震用）"),
});

// ============ 响应 Schemas ============

export const ErrorSchema = z.object({
  error: z.string(),
});

export const HealthSchema = z.object({
  health: z.string(),
});

export const TenkiWeatherSchema = z.object({
  city: z.string().describe("城市名"),
  weather: z.string().describe("天气描述"),
  weather_code: z.number().describe("天气图标代码"),
  temp_max: z.number().nullable().describe("最高气温"),
  temp_min: z.number().nullable().describe("最低气温"),
  rain_prob: z.string().describe("降水確率"),
  current_wind: z.string().describe("現在の風向・風速"),
  current_temp: z.string().describe("現在の気温"),
  pressure: z.string().describe("海面気圧"),
  observation_time: z.string().describe("観測時間"),
  sunrise: z.string().describe("日の出"),
  sunset: z.string().describe("日の入"),
  warnings: z.array(z.string()).describe("警報情報"),
  updated: z.string().datetime().describe("更新時間"),
});

export const JmaWeatherSchema = z.object({
  weather: z.string().describe("天气描述"),
  temp_max: z.number().nullable().describe("最高气温"),
  temp_min: z.number().nullable().describe("最低气温"),
  updated: z.string().datetime().describe("更新時間"),
});

export const EarthquakeSchema = z.object({
  time: z.string().describe("地震発生時間"),
  place: z.string().describe("震源地"),
  magnitude: z.string().describe("震級"),
  shindo: z.string().describe("最大震度"),
  updated: z.string().datetime().describe("更新時間"),
});

export const TsunamiSchema = z.object({
  status: z.string().describe("海啸警報状態"),
  updated: z.string().datetime().describe("更新時間"),
});

export const AllSchema = z.object({
  weather: JmaWeatherSchema,
  earthquake: EarthquakeSchema,
  tsunami: TsunamiSchema,
});

export const AreaSchema = z.object({
  code: z.string(),
  name: z.string(),
  region: z.string().optional(),
  prefecture: z.string().optional(),
});

export const AreasResponseSchema = z.object({
  total: z.number(),
  areas: z.array(AreaSchema),
});

export const GithubUserParamSchema = z.object({
  username: z.string().describe("GitHub 用户名"),
});

export const GithubUserStatsSchema = z.object({
  login: z.string().describe("GitHub 用户名"),
  public_repos: z.number().describe("公开仓库数量"),
  followers: z.number().describe("粉丝数量"),
  following: z.number().describe("关注数量"),
  public_gists: z.number().describe("公开 Gist 数量"),
});

export type GithubUserStats = z.infer<typeof GithubUserStatsSchema>;
