import { components, paths } from "./generated/api-schema";

export type Recipes = {
  Request: {
    Suggest: paths["/api/recipes/suggest"]["post"]["requestBody"]["content"]["application/json"];
  };
  Response: {
    Suggest: paths["/api/recipes/suggest"]["post"]["responses"]["200"]["content"]["application/json"];
  };
};

export type Recipe = components["schemas"]["Recipe"];
