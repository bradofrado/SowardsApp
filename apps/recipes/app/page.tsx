import Link from "next/link";
import { Plus, ChefHat, FolderTree } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CategoryGrid } from "@/components/CategoryGrid";
import { RecipeCard } from "@/components/RecipeCard";
import {
  withAuth,
  type AuthProps,
} from "next-utils/src/utils/protected-routes-hoc";

async function Home({ ctx }: AuthProps) {
  const [categories, recentRecipes] = await Promise.all([
    ctx.prisma.recipeCategory.findMany({
      where: {
        userId: ctx.session.auth.userVacation.id,
      },
      orderBy: {
        name: "asc",
      },
    }),
    ctx.prisma.recipe.findMany({
      where: {
        userId: ctx.session.auth.userVacation.id,
        isPublic: true,
      },
      include: {
        categories: true,
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 6,
    }),
  ]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-accent">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <header className="mb-12">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <ChefHat className="h-10 w-10 text-primary" />
              <h1 className="text-4xl md:text-5xl font-bold text-foreground">
                Sowards Sweets
              </h1>
            </div>
            <div className="flex gap-2">
              <Link href="/categories">
                <Button
                  variant="outline"
                  size="lg"
                  className="gap-2 shadow-md hover:shadow-lg transition-shadow"
                >
                  <FolderTree className="h-5 w-5" />
                  <span className="hidden sm:inline">Manage Categories</span>
                </Button>
              </Link>
              <Link href="/add">
                <Button
                  size="lg"
                  className="gap-2 shadow-md hover:shadow-lg transition-shadow"
                >
                  <Plus className="h-5 w-5" />
                  <span className="hidden sm:inline">Add Recipe</span>
                </Button>
              </Link>
            </div>
          </div>
          <p className="text-xl text-muted-foreground">
            Discover and organize your favorite recipes by category
          </p>
        </header>

        {/* Categories */}
        <section>
          <h2 className="text-3xl font-semibold text-foreground mb-6">
            Browse by Category
          </h2>
          {categories.length > 0 ? (
            <CategoryGrid categories={categories} />
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              No categories found
            </div>
          )}
        </section>

        {/* All Recipes */}
        <section className="mt-16">
          <h2 className="text-3xl font-semibold text-foreground mb-6">
            All Recipes
          </h2>
          {recentRecipes.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {recentRecipes.map((recipe) => (
                <RecipeCard key={recipe.id} recipe={recipe} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              No recipes found yet
            </div>
          )}
        </section>

        {/* Quick Link to All Recipes */}
        <section className="mt-12 text-center">
          <Link href="/recipes">
            <Button variant="outline" size="lg" className="gap-2">
              View All Recipes
            </Button>
          </Link>
        </section>
      </div>
    </div>
  );
}

export default withAuth(Home);
