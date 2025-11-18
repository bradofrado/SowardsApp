"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { api } from "next-utils/src/utils/api";
import { CategoryDialog } from "@/components/CategoryDialog";

interface RecipeUrlFormProps {
  categories?: Array<{ id: string; name: string }>;
  defaultCategoryId?: string;
  onSubmit: (data: { url: string; categoryId?: string }) => void;
  isLoading: boolean;
  submitLabel: string;
  onCancel: () => void;
  onCategoryCreated?: () => void;
}

export function RecipeUrlForm({
  categories,
  defaultCategoryId,
  onSubmit,
  isLoading,
  submitLabel,
  onCancel,
  onCategoryCreated,
}: RecipeUrlFormProps) {
  const [recipeUrl, setRecipeUrl] = useState("");
  const [categoryId, setCategoryId] = useState(defaultCategoryId || "");
  const [categoryDialogOpen, setCategoryDialogOpen] = useState(false);

  const createCategoryMutation = api.recipe.createCategory.useMutation({
    onSuccess: (newCategory) => {
      toast.success("Category created successfully!");
      setCategoryId(newCategory.id);
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
      categoryId: categoryId || undefined,
    });
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

        <div>
          <Label htmlFor="categoryUrl">Category (Optional)</Label>
          <div className="flex gap-2">
            <Select value={categoryId} onValueChange={setCategoryId}>
              <SelectTrigger>
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                {categories?.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={() => setCategoryDialogOpen(true)}
              title="Create new category"
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </div>
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
