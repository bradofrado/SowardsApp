import Link from "next/link";
import { ArrowLeft, Clock, Users, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { withAuth, type AuthProps } from "next-utils/src/utils/protected-routes-hoc";
import { RecipeActions } from "./components/RecipeActions";

async function RecipeDetail({ ctx, params }: AuthProps) {
  const recipe = await ctx.prisma.recipe.findUnique({
    where: {
      id: params.id,
      userId: ctx.session.auth.userVacation.id,
    },
    include: {
      category: true,
    },
  });

  if (!recipe) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-accent flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">Recipe not found</p>
          <Link href="/">
            <Button>Back to Home</Button>
          </Link>
        </div>
      </div>
    );
  }

  const totalTime = (recipe.prepTime || 0) + (recipe.cookTime || 0);

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-accent">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Navigation */}
        <Link href="/">
          <Button variant="ghost" className="mb-6 gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Home
          </Button>
        </Link>

        {/* Recipe Header */}
        <Card className="overflow-hidden mb-8 border-border bg-card">
          {recipe.imageUrl && (
            <div className="aspect-[16/9] overflow-hidden">
              <img
                src={recipe.imageUrl}
                alt={recipe.title}
                className="w-full h-full object-cover"
              />
            </div>
          )}
          <div className="p-8">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h1 className="text-4xl font-bold text-foreground mb-2">
                  {recipe.title}
                </h1>
                {recipe.category && (
                  <p className="text-primary font-medium">{recipe.category.name}</p>
                )}
              </div>
              <RecipeActions recipeId={recipe.id} />
            </div>

            {recipe.description && (
              <p className="text-muted-foreground text-lg mb-6">
                {recipe.description}
              </p>
            )}

            <div className="flex gap-6 text-muted-foreground flex-wrap">
              {totalTime > 0 && (
                <div className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  <span>{totalTime} minutes</span>
                </div>
              )}
              {recipe.servings && (
                <div className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  <span>{recipe.servings} servings</span>
                </div>
              )}
            </div>

            {recipe.sourceUrl && (
              <div className="mt-6 pt-6 border-t border-border">
                <a
                  href={recipe.sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-primary hover:underline"
                >
                  <ExternalLink className="h-4 w-4" />
                  View Original Recipe
                </a>
              </div>
            )}
          </div>
        </Card>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Ingredients */}
          <Card className="p-8 border-border bg-card">
            <h2 className="text-2xl font-semibold text-foreground mb-6">
              Ingredients
            </h2>
            <ul className="space-y-3">
              {recipe.ingredients.map((ingredient, index) => (
                <li key={index} className="flex items-start gap-3">
                  <span className="text-primary mt-1">•</span>
                  <span className="text-foreground">{ingredient}</span>
                </li>
              ))}
            </ul>
          </Card>

          {/* Instructions */}
          <Card className="p-8 border-border bg-card">
            <h2 className="text-2xl font-semibold text-foreground mb-6">
              Instructions
            </h2>
            <ol className="space-y-4">
              {recipe.instructions.map((instruction, index) => (
                <li key={index} className="flex gap-4">
                  <span className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-semibold text-sm">
                    {index + 1}
                  </span>
                  <span className="text-foreground pt-1">{instruction}</span>
                </li>
              ))}
            </ol>
          </Card>
        </div>

        {/* Notes */}
        {recipe.notes && (
          <Card className="p-8 mt-8 border-border bg-card">
            <h2 className="text-2xl font-semibold text-foreground mb-4">
              Notes
            </h2>
            <p className="text-muted-foreground whitespace-pre-wrap">
              {recipe.notes}
            </p>
          </Card>
        )}
      </div>
    </div>
  );
}

export default withAuth(RecipeDetail);
