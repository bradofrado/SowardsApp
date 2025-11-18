"use client";

import { useState } from "react";
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

interface RecipeUrlFormProps {
  categories?: Array<{ id: string; name: string }>;
  defaultCategoryId?: string;
  onSubmit: (data: { url: string; categoryId?: string }) => void;
  isLoading: boolean;
  submitLabel: string;
  onCancel: () => void;
}

export function RecipeUrlForm({
  categories,
  defaultCategoryId,
  onSubmit,
  isLoading,
  submitLabel,
  onCancel,
}: RecipeUrlFormProps) {
  const [recipeUrl, setRecipeUrl] = useState("");
  const [categoryId, setCategoryId] = useState(defaultCategoryId || "");

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
            <Label htmlFor="categoryUrl">Category (Optional)</Label>
            <Select value={categoryId} onValueChange={setCategoryId}>
              <SelectTrigger>
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
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
    </form>
  );
}
