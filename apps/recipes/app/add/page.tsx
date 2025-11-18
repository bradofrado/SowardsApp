"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Plus, Link as LinkIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { api } from "next-utils/src/utils/api";
import { RecipeUrlForm } from "@/components/RecipeUrlForm";
import { RecipeManualForm } from "@/components/RecipeManualForm";

export default function AddRecipe() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const categoryIdParam = searchParams.get("categoryId");

  const { data: categories, refetch: refetchCategories } = api.recipe.getCategories.useQuery();

  const [mode, setMode] = useState<"url" | "manual">("url");
  const [defaultCategoryId, setDefaultCategoryId] = useState<string | undefined>(
    categoryIdParam || undefined
  );

  useEffect(() => {
    if (categoryIdParam) {
      setDefaultCategoryId(categoryIdParam);
      // Switch to manual mode if a category is pre-selected
      setMode("manual");
    }
  }, [categoryIdParam]);

  const createRecipeMutation = api.recipe.createRecipe.useMutation({
    onSuccess: (data) => {
      toast.success("Recipe added successfully!");
      router.push(`/recipe/${data.id}`);
    },
    onError: () => {
      toast.error("Failed to add recipe");
    },
  });

  const scrapeRecipeMutation = api.recipe.scrapeRecipeFromUrl.useMutation({
    onSuccess: (data) => {
      toast.success("Recipe imported successfully!");
      router.push(`/recipe/${data.id}`);
    },
    onError: (error) => {
      toast.error(error.message || "Failed to import recipe from URL");
    },
  });

  const handleUrlSubmit = (data: { url: string; categoryId?: string }) => {
    scrapeRecipeMutation.mutate(data);
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
    createRecipeMutation.mutate(data);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-accent">
      <div className="container mx-auto px-4 py-8 max-w-3xl">
        <Link href="/">
          <Button variant="ghost" className="mb-6 gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Home
          </Button>
        </Link>

        <Card className="p-8 border-border bg-card">
          <h1 className="text-4xl font-bold text-foreground mb-8">
            Add New Recipe
          </h1>

          <Tabs
            value={mode}
            onValueChange={(value) => setMode(value as "url" | "manual")}
            className="space-y-6"
          >
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="url" className="gap-2">
                <LinkIcon className="h-4 w-4" />
                Import from URL
              </TabsTrigger>
              <TabsTrigger value="manual" className="gap-2">
                <Plus className="h-4 w-4" />
                Manual Entry
              </TabsTrigger>
            </TabsList>

            <TabsContent value="url" className="space-y-6">
              <RecipeUrlForm
                categories={categories}
                defaultCategoryId={defaultCategoryId}
                onSubmit={handleUrlSubmit}
                isLoading={scrapeRecipeMutation.isLoading}
                submitLabel="Import Recipe"
                onCancel={() => router.push("/")}
                onCategoryCreated={() => refetchCategories()}
              />
            </TabsContent>

            <TabsContent value="manual">
              <RecipeManualForm
                categories={categories}
                defaultValues={
                  defaultCategoryId ? { categoryId: defaultCategoryId } : undefined
                }
                onSubmit={handleManualSubmit}
                isLoading={createRecipeMutation.isLoading}
                submitLabel="Add Recipe"
                onCancel={() => router.push("/")}
                onCategoryCreated={() => refetchCategories()}
              />
            </TabsContent>
          </Tabs>
        </Card>
      </div>
    </div>
  );
}
