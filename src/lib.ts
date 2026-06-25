import { OpenAPIHono } from "@hono/zod-openapi";
import { swaggerUI } from "@hono/swagger-ui";
import { logger } from "hono/logger";
import { rateLimiter } from "hono-rate-limiter";
import { requestId } from "hono/request-id";
import { globalRateLimiterOptions } from "@/middlewares/rateLimitMiddle";

export const createHonoApp = () => {
  const app = new OpenAPIHono();
  app.use(logger()).use(rateLimiter(globalRateLimiterOptions)).use(requestId());

  app.get("/", swaggerUI({ url: "/doc" }));
  app.doc("/doc", {
    openapi: "3.1.0",
    info: {
      title: "Japan Weather API",
      version: "0.2.0",
      description: "轻量级日本气象厅数据代理，针对 SD2/SD3 小电视友好",
    },
  });

  app
    .notFound((c) => c.json({ error: "Endpoint not found" }, 404))
    .onError((err, c) => c.json({ error: "Internal server error" }, 500));

  return app;
};

export const createHonoRoute = (options: any = {}) => {
  return new OpenAPIHono(options);
};
