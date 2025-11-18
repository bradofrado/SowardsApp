"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";

interface Recipe {
  id: string;
  title: string;
  categoryId?: string | null;
}

interface AddRecipesToCategoryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  categoryId: string;
  categoryName: string;
  recipes: Recipe[];
  onAssignRecipes: (recipeIds: string[]) => void;
  isLoading: boolean;
}

export function AddRecipesToCategoryDialog({
  open,
  onOpenChange,
  categoryId,
  categoryName,
  recipes,
  onAssignRecipes,
  isLoading,
}: AddRecipesToCategoryDialogProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRecipeIds, setSelectedRecipeIds] = useState<Set<string>>(
    new Set()
  );

  // Filter out recipes that are already in this category
  const availableRecipes = recipes.filter(
    (recipe) => recipe.categoryId !== categoryId
  );

  // Filter by search query
  const filteredRecipes = availableRecipes.filter((recipe) =>
    recipe.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  useEffect(() => {
    if (!open) {
      setSelectedRecipeIds(new Set());
      setSearchQuery("");
    }
  }, [open]);

  const toggleRecipe = (recipeId: string) => {
    const newSelected = new Set(selectedRecipeIds);
    if (newSelected.has(recipeId)) {
      newSelected.delete(recipeId);
    } else {
      newSelected.add(recipeId);
    }
    setSelectedRecipeIds(newSelected);
  };

  const handleSubmit = () => {
    if (selectedRecipeIds.size === 0) {
      toast.error("Please select at least one recipe");
      return;
    }

    onAssignRecipes(Array.from(selectedRecipeIds));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Add Recipes to {categoryName}</DialogTitle>
          <DialogDescription>
            Select recipes to add to this category. Recipes already in this
            category are not shown.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label htmlFor="search">Search Recipes</Label>
            <Input
              id="search"
              placeholder="Search by recipe name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {availableRecipes.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              All recipes are already in this category or you have no recipes yet.
            </div>
          ) : filteredRecipes.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No recipes match your search.
            </div>
          ) : (
            <ScrollArea className="h-[300px] pr-4">
              <div className="space-y-2">
                {filteredRecipes.map((recipe) => (
                  <div
                    key={recipe.id}
                    className="flex items-center space-x-2 p-3 rounded-lg border border-border hover:bg-accent cursor-pointer"
                    onClick={() => toggleRecipe(recipe.id)}
                  >
                    <Checkbox
                      id={recipe.id}
                      checked={selectedRecipeIds.has(recipe.id)}
                      onCheckedChange={() => toggleRecipe(recipe.id)}
                    />
                    <label
                      htmlFor={recipe.id}
                      className="flex-1 text-sm font-medium leading-none cursor-pointer"
                    >
                      {recipe.title}
                      {recipe.categoryId && (
                        <span className="text-xs text-muted-foreground ml-2">
                          (currently in another category)
                        </span>
                      )}
                    </label>
                  </div>
                ))}
              </div>
            </ScrollArea>
          )}

          {selectedRecipeIds.size > 0 && (
            <div className="text-sm text-muted-foreground">
              {selectedRecipeIds.size} recipe{selectedRecipeIds.size !== 1 ? "s" : ""}{" "}
              selected
            </div>
          )}
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isLoading || selectedRecipeIds.size === 0}
          >
            {isLoading ? "Adding..." : `Add ${selectedRecipeIds.size || ""} Recipe${selectedRecipeIds.size !== 1 ? "s" : ""}`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
