import { Navigate, RouteObject } from "react-router-dom";

import LandingPage from "@/views/public/LandingPage";
import LoginPage from "@/views/public/Login";
import RegisterPage from "@/views/public/Register";

/**
 * Returns an array of RouteObjects for the public routes.
 * @returns {RouteObject[]} An array of RouteObjects for the public routes.
 */
function PublicRoutes(isAuthenticated: boolean): RouteObject[] {
  // console.log("PublicRoutes called, isAuthenticated:", isAuthenticated);

  // Redirects the user to the user page if they are already authenticated
  const requireUnauth = (element: JSX.Element) => {
    return isAuthenticated ? <Navigate to="/" /> : element;
  };

  return [
    {
      path: "/",
      element: <LandingPage />,
      index: true,
    },
    {
      path: "login",
      element: requireUnauth(<LoginPage />),
    },
    {
      path: "register",
      element: requireUnauth(<RegisterPage />),
    },
    // Fallback route
    {
      path: "*",
      element: (
        <p
          style={{
            color: "black",
          }}>
          404 Not Found
        </p>
      ),
    },
  ];
}

export default PublicRoutes;
