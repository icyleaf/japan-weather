import { serve } from "@hono/node-server";
import app from "@/index";

const port = parseInt(process.env.PORT || "3003");
const host = process.env.HOST || "0.0.0.0";

console.log(`🚀 Japan Weather API running on http://${host}:${port}`);

serve({
  fetch: app.fetch,
  port,
  hostname: host,
});
