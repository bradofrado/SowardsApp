import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { RecipeCard } from "@/components/RecipeCard";
import { withAuth, type AuthProps } from "next-utils/src/utils/protected-routes-hoc";

async function RecipeList({ ctx }: AuthProps) {
  const recipes = await ctx.prisma.recipe.findMany({
    where: {
      userId: ctx.session.auth.userVacation.id,
      isPublic: true,
    },
    include: {
      category: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-accent">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <header className="mb-12">
          <Link href="/">
            <Button variant="ghost" className="mb-4 gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Home
            </Button>
          </Link>
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            All Recipes
          </h1>
          <p className="text-xl text-muted-foreground">
            {recipes.length} {recipes.length === 1 ? "recipe" : "recipes"} found
          </p>
        </header>

        {/* Recipes Grid */}
        <section>
          {recipes.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {recipes.map((recipe) => (
                <RecipeCard key={recipe.id} recipe={recipe} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground mb-4">
                No recipes found yet
              </p>
              <Link href="/add">
                <Button>Add Your First Recipe</Button>
              </Link>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

export default withAuth(RecipeList);
