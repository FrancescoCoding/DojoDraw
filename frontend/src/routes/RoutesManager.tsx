import { useRoutes } from "react-router-dom";

import PrivateRoutes from "./private.routes";
import PublicRoutes from "./public.routes";

import useAuth from "@/hooks/useAuth";

import MainLayout from "@/shared/layouts/MainLayout";

/**
 * Manages the routing for the entire application.
 * Depending on authentication status, it combines public and private routes.
 */
function RoutesManager() {
  const { isAuthenticated } = useAuth();

  const routesConfig = [
    {
      path: "/",
      element: <MainLayout />,
      children: [
        ...PublicRoutes(isAuthenticated),
        ...(isAuthenticated ? PrivateRoutes() : []),
      ],
    },
  ];

  const routeElements = useRoutes(routesConfig);
  return routeElements;
}

export default RoutesManager;
