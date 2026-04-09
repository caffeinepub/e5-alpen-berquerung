import {
  RouterProvider,
  createRootRoute,
  createRoute,
  createRouter,
} from "@tanstack/react-router";
import { HomePage } from "./pages/HomePage";
import { Stage1DetailPage } from "./pages/Stage1DetailPage";
import { Stage2DetailPage } from "./pages/Stage2DetailPage";
import { Stage3DetailPage } from "./pages/Stage3DetailPage";

const rootRoute = createRootRoute();

const homeRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: HomePage,
});

const stage1Route = createRoute({
  getParentRoute: () => rootRoute,
  path: "/etappe/1",
  component: Stage1DetailPage,
});

const stage2Route = createRoute({
  getParentRoute: () => rootRoute,
  path: "/etappe/2",
  component: Stage2DetailPage,
});

const stage3Route = createRoute({
  getParentRoute: () => rootRoute,
  path: "/etappe/3",
  component: Stage3DetailPage,
});

const routeTree = rootRoute.addChildren([
  homeRoute,
  stage1Route,
  stage2Route,
  stage3Route,
]);

const router = createRouter({ routeTree });

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

export default function App() {
  return <RouterProvider router={router} />;
}
