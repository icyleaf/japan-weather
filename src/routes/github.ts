import { createRoute } from "@hono/zod-openapi";
import { createHonoRoute } from "@/lib";
import {
  ErrorSchema,
  GithubUserParamSchema,
  GithubUserStatsSchema,
} from "@/schemas";
import { fetchGithubUserStats } from "@/services/github";

const githubRoute = createHonoRoute();

const route = createRoute({
  method: "get",
  path: "/user/{username}",
  tags: ["GitHub"],
  summary: "GitHub User stats API",
  request: { params: GithubUserParamSchema },
  responses: {
    200: {
      content: { "application/json": { schema: GithubUserStatsSchema } },
      description: "OK",
    },
    404: {
      content: { "application/json": { schema: ErrorSchema } },
      description: "用户不存在",
    },
    500: {
      content: { "application/json": { schema: ErrorSchema } },
      description: "服务器错误",
    },
  },
});

githubRoute.openapi(route, async (c: any) => {
  const { username } = c.req.valid("param");
  try {
    return c.json(await fetchGithubUserStats(username), 200);
  } catch (e: any) {
    return c.json({ error: e.message }, 500);
  }
});

export default githubRoute;
