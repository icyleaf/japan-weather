import { createHonoApp } from "@/lib";
import coreRoute from "@/routes/core";
import healthRoute from "@/routes/health";
import jmaRoute from "@/routes/jma";

const app = createHonoApp();
const routes = [
  {
    path: "/",
    route: coreRoute,
  },
  {
    path: "/jma",
    route: jmaRoute,
  },
  {
    path: "/",
    route: healthRoute,
  },
];

routes.map(({ path, route }) => {
  app.route(path, route);
});

export default app;
