import { Recipes } from "../../types/core-types";
import { paths } from "../../types/generated/api-schema";
import { axiosInstance as axios } from "./axiosInstance";

export class RecipeService {
  static getSuggestions = async (
    params: Recipes["Request"]["Suggest"],
  ): Promise<Recipes["Response"]["Suggest"]> => {
    const endPoint: keyof paths = "/api/recipes/suggest";
    return await axios.post(endPoint, params).then((res) => res.data);
  };
}
