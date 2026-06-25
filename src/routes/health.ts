import { createRoute } from "@hono/zod-openapi";
import { createHonoRoute } from "@/lib";
import { HealthSchema } from "@/schemas";

const healthRoute = createHonoRoute();

const route = createRoute({
  method: "get",
  path: "/",
  tags: ["System"],
  summary: "健康检查",
  responses: {
    200: {
      content: { "application/json": { schema: HealthSchema } },
      description: "OK",
    },
  },
});

healthRoute.openapi(route, (c: any) => {
  return c.json({ health: "ok" }, 200);
});

export default healthRoute;
