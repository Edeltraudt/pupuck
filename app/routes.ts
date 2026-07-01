import {
  type RouteConfig,
  index,
  layout,
  route,
} from "@react-router/dev/routes";

export default [
  layout("components/View.tsx", [
    index("routes/home.tsx"),
    route(":commit/:decision?", "routes/commit.tsx"),
  ]),
] satisfies RouteConfig;
