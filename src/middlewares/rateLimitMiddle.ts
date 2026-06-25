import type { ConfigProps } from "hono-rate-limiter";
import { HTTPException } from "hono/http-exception";

const GLOBAL_RATE_LIMITER_LIMIT = 100;
const GLOBAL_RATE_LIMITER_WINDOW_MS = 15 * 60 * 1000; // 15 minutes

const AUTH_RATE_LIMITER_LIMIT = 10;
const AUTH_RATE_LIMITER_WINDOW_MS = 30 * 60 * 1000; // 30 minutes

export const globalRateLimiterOptions: ConfigProps = {
  handler: () => {
    throw new HTTPException(429, {
      message: "Too many requests from this IP, please try again later.",
    });
  },
  keyGenerator: (ctx) => ctx.req.header("x-forwarded-for") ?? "unknown",
  limit: GLOBAL_RATE_LIMITER_LIMIT,
  standardHeaders: "draft-7",
  windowMs: GLOBAL_RATE_LIMITER_WINDOW_MS,
};

export const authRateLimiterOptions: ConfigProps = {
  handler: () => {
    throw new HTTPException(429, {
      message: "Too many auth attempts from this IP, please try again later.",
    });
  },
  keyGenerator: (ctx) => ctx.req.header("x-forwarded-for") ?? "unknown",
  standardHeaders: "draft-7",
  limit: AUTH_RATE_LIMITER_LIMIT,
  windowMs: AUTH_RATE_LIMITER_WINDOW_MS,
};
