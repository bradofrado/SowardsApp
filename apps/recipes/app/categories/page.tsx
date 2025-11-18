"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Plus, Edit, Trash2, FolderOpen, FilePlus, ListPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { api } from "next-utils/src/utils/api";
import { CategoryDialog } from "@/components/CategoryDialog";
import { AddRecipesToCategoryDialog } from "@/components/AddRecipesToCategoryDialog";

export default function CategoriesPage() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [addRecipesDialogOpen, setAddRecipesDialogOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<{
    id: string;
    name: string;
  } | null>(null);
  const [editingCategory, setEditingCategory] = useState<{
    id: string;
    name: string;
    description?: string | null;
    icon?: string | null;
  } | null>(null);

  const { data: categories, refetch: refetchCategories } = api.recipe.getCategories.useQuery();
  const { data: allRecipes, refetch: refetchRecipes } = api.recipe.getRecipes.useQuery();

  const createCategoryMutation = api.recipe.createCategory.useMutation({
    onSuccess: () => {
      toast.success("Category created successfully!");
      refetchCategories();
      setDialogOpen(false);
    },
    onError: () => {
      toast.error("Failed to create category");
    },
  });

  const updateCategoryMutation = api.recipe.updateCategory.useMutation({
    onSuccess: () => {
      toast.success("Category updated successfully!");
      refetchCategories();
      setDialogOpen(false);
      setEditingCategory(null);
    },
    onError: () => {
      toast.error("Failed to update category");
    },
  });

  const deleteCategoryMutation = api.recipe.deleteCategory.useMutation({
    onSuccess: () => {
      toast.success("Category deleted successfully!");
      refetchCategories();
    },
    onError: () => {
      toast.error("Failed to delete category");
    },
  });

  const updateRecipeMutation = api.recipe.updateRecipe.useMutation({
    onSuccess: () => {
      refetchRecipes();
      refetchCategories();
    },
    onError: () => {
      toast.error("Failed to update recipe");
    },
  });

  const handleAddCategory = () => {
    setEditingCategory(null);
    setDialogOpen(true);
  };

  const handleEditCategory = (category: {
    id: string;
    name: string;
    description?: string | null;
    icon?: string | null;
  }) => {
    setEditingCategory(category);
    setDialogOpen(true);
  };

  const handleDeleteCategory = async (categoryId: string, categoryName: string) => {
    if (
      !confirm(
        `Are you sure you want to delete "${categoryName}"? This will not delete the recipes in this category.`
      )
    ) {
      return;
    }
    deleteCategoryMutation.mutate({ id: categoryId });
  };

  const handleOpenAddRecipes = (category: { id: string; name: string }) => {
    setSelectedCategory(category);
    setAddRecipesDialogOpen(true);
  };

  const handleAssignRecipes = async (recipeIds: string[]) => {
    if (!selectedCategory) return;

    let successCount = 0;
    let errorCount = 0;

    // Update each recipe with the new category
    for (const recipeId of recipeIds) {
      try {
        await updateRecipeMutation.mutateAsync({
          id: recipeId,
          categoryId: selectedCategory.id,
        });
        successCount++;
      } catch {
        errorCount++;
      }
    }

    if (successCount > 0) {
      toast.success(
        `${successCount} recipe${successCount !== 1 ? "s" : ""} added to ${selectedCategory.name}`
      );
    }
    if (errorCount > 0) {
      toast.error(`Failed to add ${errorCount} recipe${errorCount !== 1 ? "s" : ""}`);
    }

    setAddRecipesDialogOpen(false);
    setSelectedCategory(null);
  };

  const handleSubmit = (data: {
    name: string;
    description?: string;
    icon?: string;
  }) => {
    if (editingCategory) {
      updateCategoryMutation.mutate({
        id: editingCategory.id,
        ...data,
      });
    } else {
      createCategoryMutation.mutate(data);
    }
  };

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
          <Button onClick={handleAddCategory} size="lg" className="gap-2">
            <Plus className="h-5 w-5" />
            Add Category
          </Button>
        </div>

        {categories && categories.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {categories.map((category) => (
              <Card key={category.id} className="border-border bg-card">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      {category.icon && (
                        <span className="text-2xl">{category.icon}</span>
                      )}
                      <CardTitle className="text-lg">{category.name}</CardTitle>
                    </div>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => handleEditCategory(category)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive"
                        onClick={() =>
                          handleDeleteCategory(category.id, category.name)
                        }
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  {category.description && (
                    <CardDescription className="mt-2">
                      {category.description}
                    </CardDescription>
                  )}
                </CardHeader>
                <CardContent className="space-y-2">
                  <Link href={`/category/${category.id}`}>
                    <Button variant="outline" size="sm" className="w-full gap-2">
                      <FolderOpen className="h-4 w-4" />
                      View Recipes
                    </Button>
                  </Link>
                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      variant="secondary"
                      size="sm"
                      className="gap-2"
                      onClick={() => handleOpenAddRecipes(category)}
                    >
                      <ListPlus className="h-4 w-4" />
                      Add Existing
                    </Button>
                    <Link href={`/add?categoryId=${category.id}`}>
                      <Button variant="secondary" size="sm" className="w-full gap-2">
                        <FilePlus className="h-4 w-4" />
                        Create New
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="border-border bg-card">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <FolderOpen className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground text-center mb-4">
                No categories yet. Create your first category to organize recipes.
              </p>
              <Button onClick={handleAddCategory} className="gap-2">
                <Plus className="h-4 w-4" />
                Add First Category
              </Button>
            </CardContent>
          </Card>
        )}

        <CategoryDialog
          open={dialogOpen}
          onOpenChange={(open) => {
            setDialogOpen(open);
            if (!open) setEditingCategory(null);
          }}
          category={editingCategory || undefined}
          onSubmit={handleSubmit}
          isLoading={
            createCategoryMutation.isLoading || updateCategoryMutation.isLoading
          }
        />

        {selectedCategory && allRecipes && (
          <AddRecipesToCategoryDialog
            open={addRecipesDialogOpen}
            onOpenChange={(open) => {
              setAddRecipesDialogOpen(open);
              if (!open) setSelectedCategory(null);
            }}
            categoryId={selectedCategory.id}
            categoryName={selectedCategory.name}
            recipes={allRecipes}
            onAssignRecipes={handleAssignRecipes}
            isLoading={updateRecipeMutation.isLoading}
          />
        )}
      </div>
    </div>
  );
}
