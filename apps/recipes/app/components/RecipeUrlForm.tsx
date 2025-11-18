"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { api } from "next-utils/src/utils/api";
import { CategoryDialog } from "@/components/CategoryDialog";

interface RecipeUrlFormProps {
  categories?: Array<{ id: string; name: string }>;
  defaultCategoryIds?: string[];
  onSubmit: (data: { url: string; categoryIds?: string[] }) => void;
  isLoading: boolean;
  submitLabel: string;
  onCancel: () => void;
  onCategoryCreated?: () => void;
}

export function RecipeUrlForm({
  categories,
  defaultCategoryIds,
  onSubmit,
  isLoading,
  submitLabel,
  onCancel,
  onCategoryCreated,
}: RecipeUrlFormProps) {
  const [recipeUrl, setRecipeUrl] = useState("");
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<string[]>(
    defaultCategoryIds || []
  );
  const [categoryDialogOpen, setCategoryDialogOpen] = useState(false);

  const createCategoryMutation = api.recipe.createCategory.useMutation({
    onSuccess: (newCategory) => {
      toast.success("Category created successfully!");
      setSelectedCategoryIds([...selectedCategoryIds, newCategory.id]);
      setCategoryDialogOpen(false);
      onCategoryCreated?.();
    },
    onError: () => {
      toast.error("Failed to create category");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!recipeUrl.trim()) {
      toast.error("Please enter a recipe URL");
      return;
    }

    try {
      new URL(recipeUrl);
    } catch {
      toast.error("Please enter a valid URL");
      return;
    }

    onSubmit({
      url: recipeUrl.trim(),
      categoryIds: selectedCategoryIds.length > 0 ? selectedCategoryIds : undefined,
    });
  };

  const toggleCategory = (categoryId: string) => {
    setSelectedCategoryIds((prev) =>
      prev.includes(categoryId)
        ? prev.filter((id) => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  const handleCreateCategory = (data: {
    name: string;
    description?: string;
    icon?: string;
  }) => {
    createCategoryMutation.mutate(data);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <div>
          <Label htmlFor="recipeUrl">Recipe URL *</Label>
          <Input
            id="recipeUrl"
            type="url"
            value={recipeUrl}
            onChange={(e) => setRecipeUrl(e.target.value)}
            placeholder="https://www.allrecipes.com/recipe/..."
            required
          />
          <p className="text-sm text-muted-foreground mt-2">
            Paste a URL from popular recipe sites like AllRecipes, Food Network,
            NYT Cooking, and more.
          </p>
        </div>

        {categories && categories.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-2">
              <Label>Categories (Optional)</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setCategoryDialogOpen(true)}
                className="gap-2"
              >
                <Plus className="h-4 w-4" />
                Add Category
              </Button>
            </div>
            <div className="border rounded-md p-4 space-y-3 max-h-48 overflow-y-auto">
              {categories.map((category) => (
                <div key={category.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={`category-url-${category.id}`}
                    checked={selectedCategoryIds.includes(category.id)}
                    onCheckedChange={() => toggleCategory(category.id)}
                  />
                  <label
                    htmlFor={`category-url-${category.id}`}
                    className="text-sm font-medium leading-none cursor-pointer"
                  >
                    {category.name}
                  </label>
                </div>
              ))}
            </div>
          </div>
        )}

        {(!categories || categories.length === 0) && (
          <div>
            <Label>Categories (Optional)</Label>
            <div className="flex items-center justify-center border rounded-md p-4">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setCategoryDialogOpen(true)}
                className="gap-2"
              >
                <Plus className="h-4 w-4" />
                Create First Category
              </Button>
            </div>
          </div>
        )}
      </div>

      <div className="flex gap-4">
        <Button type="submit" size="lg" disabled={isLoading} className="flex-1">
          {isLoading ? `${submitLabel}...` : submitLabel}
        </Button>
        <Button
          type="button"
          variant="outline"
          size="lg"
          onClick={onCancel}
          disabled={isLoading}
        >
          Cancel
        </Button>
      </div>

      <CategoryDialog
        open={categoryDialogOpen}
        onOpenChange={setCategoryDialogOpen}
        onSubmit={handleCreateCategory}
        isLoading={createCategoryMutation.isLoading}
      />
    </form>
  );
}
