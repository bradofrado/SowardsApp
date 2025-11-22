import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Clock, User, Users } from "lucide-react";

interface Recipe {
  id: string;
  title: string;
  description: string | null | undefined;
  prepTime: number | null | undefined;
  cookTime: number | null | undefined;
  servings: number | null | undefined;
  imageUrl: string | null | undefined;
  user: { name: string };
}

interface RecipeCardProps {
  recipe: Recipe;
}

export const RecipeCard = ({ recipe }: RecipeCardProps) => {
  const totalTime = (recipe.prepTime || 0) + (recipe.cookTime || 0);

  return (
    <Link href={`/recipe/${recipe.id}`}>
      <Card className="overflow-hidden hover:shadow-[var(--shadow-hover)] transition-all duration-300 group border-border bg-card">
        <div className="aspect-[4/3] overflow-hidden bg-muted">
          {recipe.imageUrl ? (
            <img
              src={recipe.imageUrl}
              alt={recipe.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-6xl">
              🍽️
            </div>
          )}
        </div>
        <div className="p-6">
          <h3 className="text-xl font-semibold text-foreground mb-2 group-hover:text-primary transition-colors">
            {recipe.title}
          </h3>
          {recipe.description && (
            <p className="text-muted-foreground text-sm mb-4 line-clamp-2">
              {recipe.description}
            </p>
          )}
          <div className="flex gap-4 text-sm text-muted-foreground">
            {totalTime > 0 && (
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                <span>{totalTime} min</span>
              </div>
            )}
            {recipe.servings && (
              <div className="flex items-center gap-1">
                <Users className="h-4 w-4" />
                <span>{recipe.servings} servings</span>
              </div>
            )}
            {recipe.user && (
              <div className="flex items-center gap-1">
                <User className="h-4 w-4" />
                <span>{recipe.user.name}</span>
              </div>
            )}
          </div>
        </div>
      </Card>
    </Link>
  );
};
