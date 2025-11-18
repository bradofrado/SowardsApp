import Link from "next/link";
import { ArrowLeft, FolderOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  withAuth,
  type AuthProps,
} from "next-utils/src/utils/protected-routes-hoc";
import { CategoryCard } from "./components/CategoryCard";
import { AddCategoryButton } from "./components/AddCategoryButton";

async function CategoriesPage({ ctx }: AuthProps) {
  const [categories, allRecipes] = await Promise.all([
    ctx.prisma.recipeCategory.findMany({
      // where: {
      //   userId: ctx.session.auth.userVacation.id,
      // },
      orderBy: {
        name: "asc",
      },
    }),
    ctx.prisma.recipe.findMany({
      where: {
        //userId: ctx.session.auth.userVacation.id,
        isPublic: true,
      },
      select: {
        id: true,
        title: true,
        categoryIds: true,
      },
    }),
  ]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-accent">
      <div className="container mx-auto px-4 py-8 max-w-5xl">
        <Link href="/">
          <Button variant="ghost" className="mb-6 gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Home
          </Button>
        </Link>

        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-foreground mb-2">
              Manage Categories
            </h1>
            <p className="text-muted-foreground">
              Organize your recipes into categories
            </p>
          </div>
          <AddCategoryButton />
        </div>

        {categories.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {categories.map((category) => (
              <CategoryCard
                key={category.id}
                category={category}
                allRecipes={allRecipes}
              />
            ))}
          </div>
        ) : (
          <Card className="border-border bg-card">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <FolderOpen className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground text-center mb-4">
                No categories yet. Create your first category to organize
                recipes.
              </p>
              <AddCategoryButton />
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

export default withAuth(CategoriesPage);
