"use client";

import Link from "next/link";
import { Plus, ChefHat } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CategoryGrid } from "@/components/CategoryGrid";
import { api } from "next-utils/src/utils/api";

export default function Home() {
  const { data: categories, isLoading } = api.recipe.getCategories.useQuery();

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-accent">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <header className="mb-12">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <ChefHat className="h-10 w-10 text-primary" />
              <h1 className="text-4xl md:text-5xl font-bold text-foreground">
                My Recipe Collection
              </h1>
            </div>
            <Link href="/add">
              <Button size="lg" className="gap-2 shadow-md hover:shadow-lg transition-shadow">
                <Plus className="h-5 w-5" />
                <span className="hidden sm:inline">Add Recipe</span>
              </Button>
            </Link>
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
          {isLoading ? (
            <div className="text-center py-12 text-muted-foreground">
              Loading categories...
            </div>
          ) : categories && categories.length > 0 ? (
            <CategoryGrid categories={categories} />
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              No categories found
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
