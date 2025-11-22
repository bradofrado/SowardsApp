"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Edit,
  Trash2,
  FolderOpen,
  FilePlus,
  ListPlus,
  ImageIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { toast } from "sonner";
import { api } from "next-utils/src/utils/api";
import { CategoryDialog } from "@/components/CategoryDialog";
import { AddRecipesToCategoryDialog } from "@/components/AddRecipesToCategoryDialog";

interface Category {
  id: string;
  name: string;
  description?: string | null;
  image?: string | null;
}

interface Recipe {
  id: string;
  title: string;
  categoryIds?: string[];
}

interface CategoryCardProps {
  category: Category;
  allRecipes: Recipe[];
}

export function CategoryCard({ category, allRecipes }: CategoryCardProps) {
  const router = useRouter();
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [addRecipesDialogOpen, setAddRecipesDialogOpen] = useState(false);

  const updateCategoryMutation = api.recipe.updateCategory.useMutation({
    onSuccess: () => {
      toast.success("Category updated successfully!");
      setEditDialogOpen(false);
      router.refresh();
    },
    onError: () => {
      toast.error("Failed to update category");
    },
  });

  const deleteCategoryMutation = api.recipe.deleteCategory.useMutation({
    onSuccess: () => {
      toast.success("Category deleted successfully!");
      router.refresh();
    },
    onError: () => {
      toast.error("Failed to delete category");
    },
  });

  const updateRecipeMutation = api.recipe.updateRecipe.useMutation({
    onSuccess: () => {
      router.refresh();
    },
    onError: () => {
      toast.error("Failed to update recipe");
    },
  });

  const handleDeleteCategory = async () => {
    if (
      !confirm(
        `Are you sure you want to delete "${category.name}"? This will not delete the recipes in this category.`,
      )
    ) {
      return;
    }
    deleteCategoryMutation.mutate({ id: category.id });
  };

  const handleUpdateCategory = (data: {
    name: string;
    description?: string;
    image?: string;
  }) => {
    updateCategoryMutation.mutate({
      id: category.id,
      ...data,
    });
  };

  const handleAssignRecipes = async (recipeIds: string[]) => {
    let successCount = 0;
    let errorCount = 0;

    for (const recipeId of recipeIds) {
      try {
        const recipe = allRecipes.find((r) => r.id === recipeId);
        const currentCategoryIds = recipe?.categoryIds || [];
        const newCategoryIds = currentCategoryIds.includes(category.id)
          ? currentCategoryIds
          : [...currentCategoryIds, category.id];

        await updateRecipeMutation.mutateAsync({
          id: recipeId,
          categoryIds: newCategoryIds,
        });
        successCount++;
      } catch {
        errorCount++;
      }
    }

    if (successCount > 0) {
      toast.success(
        `${successCount} recipe${successCount !== 1 ? "s" : ""} added to ${
          category.name
        }`,
      );
    }
    if (errorCount > 0) {
      toast.error(
        `Failed to add ${errorCount} recipe${errorCount !== 1 ? "s" : ""}`,
      );
    }

    setAddRecipesDialogOpen(false);
  };

  return (
    <>
      <Card className="overflow-hidden border-border bg-card">
        <div className="aspect-[4/3] overflow-hidden bg-muted relative group">
          {category.image ? (
            <img
              src={category.image}
              alt={category.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <ImageIcon className="w-16 h-16 text-muted-foreground" />
            </div>
          )}
          <div className="absolute top-2 right-2 flex gap-1">
            <Button
              variant="secondary"
              size="icon"
              className="h-8 w-8 opacity-90 hover:opacity-100"
              onClick={() => setEditDialogOpen(true)}
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button
              variant="secondary"
              size="icon"
              className="h-8 w-8 text-destructive opacity-90 hover:opacity-100"
              onClick={handleDeleteCategory}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">{category.name}</CardTitle>
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
              onClick={() => setAddRecipesDialogOpen(true)}
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

      <CategoryDialog
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        category={category}
        onSubmit={handleUpdateCategory}
        isLoading={updateCategoryMutation.isLoading}
      />

      <AddRecipesToCategoryDialog
        open={addRecipesDialogOpen}
        onOpenChange={setAddRecipesDialogOpen}
        categoryId={category.id}
        categoryName={category.name}
        recipes={allRecipes}
        onAssignRecipes={handleAssignRecipes}
        isLoading={updateRecipeMutation.isLoading}
      />
    </>
  );
}
