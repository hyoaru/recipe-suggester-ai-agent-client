import { createFileRoute } from "@tanstack/react-router";
import DynamicListInput from "../components/DynamicListInput";
import { useCallback, useState } from "react";
import { Button } from "../components/ui/button";
import { LoaderCircle, Sparkles } from "lucide-react";
import { Recipe } from "../types/core-types";
import useRecipes from "../hooks/core/useRecipes";
import { toast } from "sonner";
import { ThemeModeToggle } from "@/components/ThemeModeToggle";
import { RecipeCard } from "@/components/RecipeCard";

export const Route = createFileRoute("/")({
  component: RouteComponent,
});

function RouteComponent() {
  const [ingredients, setIngredients] = useState<string[]>([]);
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const { getSuggestionsMutation } = useRecipes();

  const onSubmit = useCallback(async () => {
    if (!ingredients.length) {
      toast.error("Please add some ingredients to get suggestions");
      return;
    }

    setIngredients([]);
    await getSuggestionsMutation.mutateAsync({ ingredients }).then((res) => {
      setRecipes(res);
    }).catch((error) => {
      toast.error(error.message)
    });

  }, [getSuggestionsMutation, ingredients]);

  return (
    <>
      <div id="header" className="sticky top-0 pb-4 backdrop-blur-md">
        <div className="h-[1rem] lg:h-[4rem]"></div>
        <div className="mb-4 ms-auto w-max">
          <ThemeModeToggle />
        </div>
        <div className="space-y-2">
          <p className="text-center text-2xl font-bold md:text-4xl">
            Recipe Suggester AI Agent
          </p>
          <p className="text-center text-sm">
            This is AI agent will suggests recipes based on the ingredients that
            you provide.
          </p>
        </div>
        <div className="mx-auto mt-8">
          <div className="relative">
            <div className="absolute bottom-0 right-0 p-4">
              <Button
                variant={"outline"}
                onClick={onSubmit}
                disabled={getSuggestionsMutation.isPending}
              >
                {getSuggestionsMutation.isPending ? (
                  <LoaderCircle className="animate-spin" />
                ) : (
                  <Sparkles />
                )}
              </Button>
            </div>
            <DynamicListInput items={ingredients} setItems={setIngredients} />
          </div>
        </div>
      </div>
      <div className="mt-4 space-y-4">
        {recipes.map((recipe) => (
          <RecipeCard key={`recipe-${recipe.name}`}>
            <RecipeCard.Title>{recipe.name}</RecipeCard.Title>
            <RecipeCard.Description>
              {recipe.description}
            </RecipeCard.Description>
            <RecipeCard.Ingredients ingredients={recipe.ingredients} />
            <RecipeCard.Steps steps={recipe.steps} />
          </RecipeCard>
        ))}
      </div>
    </>
  );
}
