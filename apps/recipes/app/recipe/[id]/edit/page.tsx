"use client";

import { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Link as LinkIcon, Edit } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { api } from "next-utils/src/utils/api";
import { RecipeUrlForm } from "@/components/RecipeUrlForm";
import { RecipeManualForm } from "@/components/RecipeManualForm";

export default function EditRecipe() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [mode, setMode] = useState<"url" | "manual">("url");

  const { data: categories } = api.recipe.getCategories.useQuery();
  const { data: recipe, isLoading: recipeLoading } =
    api.recipe.getRecipe.useQuery({ id });

  const updateRecipeMutation = api.recipe.updateRecipe.useMutation({
    onSuccess: (data) => {
      toast.success("Recipe updated successfully!");
      router.push(`/recipe/${data.id}`);
    },
    onError: () => {
      toast.error("Failed to update recipe");
    },
  });

  const scrapeRecipeMutation = api.recipe.scrapeRecipeFromUrl.useMutation({
    onSuccess: (data) => {
      toast.success("Recipe updated from URL!");
      router.push(`/recipe/${data.id}`);
    },
    onError: (error) => {
      toast.error(error.message || "Failed to update recipe from URL");
    },
  });

  const handleUrlSubmit = (data: { url: string; categoryId?: string }) => {
    // For URL updates, we'll delete the old recipe and create a new one
    // This ensures we get fresh data from the URL
    scrapeRecipeMutation.mutate({
      url: data.url,
      categoryId: data.categoryId,
    });
  };

  const handleManualSubmit = (data: {
    title: string;
    description?: string;
    categoryId?: string;
    prepTime?: number;
    cookTime?: number;
    servings?: number;
    imageUrl?: string;
    ingredients: string[];
    instructions: string[];
    notes?: string;
    isPublic: boolean;
  }) => {
    updateRecipeMutation.mutate({
      id,
      ...data,
    });
  };

  if (recipeLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-accent flex items-center justify-center">
        <p className="text-muted-foreground">Loading recipe...</p>
      </div>
    );
  }

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

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-accent">
      <div className="container mx-auto px-4 py-8 max-w-3xl">
        <Link href={`/recipe/${id}`}>
          <Button variant="ghost" className="mb-6 gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Recipe
          </Button>
        </Link>

        <Card className="p-8 border-border bg-card">
          <h1 className="text-4xl font-bold text-foreground mb-8">
            Edit Recipe
          </h1>

          <Tabs
            value={mode}
            onValueChange={(value) => setMode(value as "url" | "manual")}
            className="space-y-6"
          >
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="url" className="gap-2">
                <LinkIcon className="h-4 w-4" />
                Update from URL
              </TabsTrigger>
              <TabsTrigger value="manual" className="gap-2">
                <Edit className="h-4 w-4" />
                Manual Edit
              </TabsTrigger>
            </TabsList>

            <TabsContent value="manual">
              <RecipeManualForm
                categories={categories}
                defaultValues={{
                  title: recipe.title,
                  description: recipe.description || undefined,
                  categoryId: recipe.categoryId || undefined,
                  prepTime: recipe.prepTime || undefined,
                  cookTime: recipe.cookTime || undefined,
                  servings: recipe.servings || undefined,
                  imageUrl: recipe.imageUrl || undefined,
                  ingredients: recipe.ingredients,
                  instructions: recipe.instructions,
                  notes: recipe.notes || undefined,
                }}
                onSubmit={handleManualSubmit}
                isLoading={updateRecipeMutation.isLoading}
                submitLabel="Update Recipe"
                onCancel={() => router.push(`/recipe/${id}`)}
              />
            </TabsContent>

            <TabsContent value="url" className="space-y-6">
              <div className="bg-muted p-4 rounded-lg mb-4">
                <p className="text-sm text-muted-foreground">
                  <strong>Note:</strong> Updating from a URL will replace all
                  recipe data with fresh content from the website. This is
                  useful if the original recipe has been updated.
                </p>
              </div>
              <RecipeUrlForm
                categories={categories}
                defaultCategoryId={recipe.categoryId || undefined}
                onSubmit={handleUrlSubmit}
                isLoading={scrapeRecipeMutation.isLoading}
                submitLabel="Update from URL"
                onCancel={() => router.push(`/recipe/${id}`)}
              />
            </TabsContent>
          </Tabs>
        </Card>
      </div>
    </div>
  );
}
