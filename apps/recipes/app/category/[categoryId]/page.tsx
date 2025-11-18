"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { RecipeCard } from "@/components/RecipeCard";
import { api } from "next-utils/src/utils/api";

export default function CategoryRecipeList() {
  const params = useParams();
  const categoryId = params.categoryId as string;

  const { data: recipes, isLoading } = api.recipe.getRecipes.useQuery({
    categoryId,
  });

  const { data: categories } = api.recipe.getCategories.useQuery();
  const category = categories?.find((c) => c.id === categoryId);

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
            {category?.name || "Category Recipes"}
          </h1>
          <p className="text-xl text-muted-foreground">
            {recipes?.length || 0} {recipes?.length === 1 ? "recipe" : "recipes"} found
          </p>
        </header>

        {/* Recipes Grid */}
        <section>
          {isLoading ? (
            <div className="text-center py-12 text-muted-foreground">
              Loading recipes...
            </div>
          ) : recipes && recipes.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {recipes.map((recipe) => (
                <RecipeCard key={recipe.id} recipe={recipe} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground mb-4">
                No recipes found in this category yet
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
