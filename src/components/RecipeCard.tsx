import { Badge } from "./ui/badge";
import { cn } from "@/lib/utils";

type RecipeCardProps = {
  className?: string;
  children: React.ReactNode;
};

type RecipeCardTitleProps = {
  className?: string;
  children: React.ReactNode;
};

type RecipeCardDescriptionProps = {
  className?: string;
  children: React.ReactNode;
};

type RecipeCardIngredientsProps = {
  className?: string;
  ingredients: string[];
};

type RecipeCardStepsProps = {
  className?: string;
  steps: string[];
};

export const RecipeCard = ({ className, children }: RecipeCardProps) => {
  return (
    <div className={cn("rounded-xl bg-secondary p-6", className)}>
      {children}
    </div>
  );
};

const RecipeCardTitle = ({ className, children }: RecipeCardTitleProps) => {
  return <p className={cn("text-lg font-bold", className)}>{children}</p>;
};

const RecipeCardDescription = ({
  className,
  children,
}: RecipeCardDescriptionProps) => {
  return <p className={cn("mb-4 text-sm", className)}>{children}</p>;
};

const RecipeCardIngredients = ({
  className,
  ingredients,
}: RecipeCardIngredientsProps) => {
  return (
    <div
      className={cn(
        "flex flex-wrap items-center justify-start gap-1",
        className,
      )}
    >
      {ingredients.map((ingredient, index) => (
        <Badge
          key={`${ingredient}-${index}`}
          className="font-normal"
          variant={"outline"}
        >
          {ingredient}
        </Badge>
      ))}
    </div>
  );
};

const RecipeCardSteps = ({ className, steps }: RecipeCardStepsProps) => {
  return (
    <div className={cn("mt-4", className)}>
      <p className="text-sm font-semibold">Steps:</p>
      <div className="">
        {steps.map((step, index) => (
          <p key={`${step}-${index}`} className="text-sm">
            {index + 1}. {step}
          </p>
        ))}
      </div>
    </div>
  );
};

RecipeCard.Title = RecipeCardTitle;
RecipeCard.Description = RecipeCardDescription;
RecipeCard.Ingredients = RecipeCardIngredients;
RecipeCard.Steps = RecipeCardSteps;
