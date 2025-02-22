import { useMutation, useQueryClient } from "@tanstack/react-query";
import { CoreService } from "../../services/CoreService";

export default function useRecipes() {
  const queryClient = useQueryClient();

  const getSuggestionsMutation = useMutation({
    mutationFn: (
      params: Parameters<typeof CoreService.recipe.getSuggestions>[0],
    ) => CoreService.recipe.getSuggestions(params),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["suggested-recipes"],
        refetchType: "all",
      });
    },
  });

  return {
    getSuggestionsMutation,
  };
}
