import { RouteObject } from "react-router-dom";

/**
 * Returns an array of RouteObjects for the public routes.
 * @returns {RouteObject[]} An array of RouteObjects for the private routes.
 */
function PrivateRoutes(): RouteObject[] {
  return [
    {
      path: "user",
      element: (
        <h2
          style={{
            padding: "0 1.5rem",
            color: "black",
            height: "calc(100vh - 104px)",
          }}>
          Private user page
        </h2>
      ),
    },
  ];
}

export default PrivateRoutes;
