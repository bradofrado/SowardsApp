"use client";

import { useState, useEffect } from "react";
import { Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
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

interface RecipeData {
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
}

interface RecipeManualFormProps {
  categories?: Array<{ id: string; name: string }>;
  defaultValues?: Partial<RecipeData>;
  onSubmit: (data: RecipeData & { isPublic: boolean }) => void;
  isLoading: boolean;
  submitLabel: string;
  onCancel: () => void;
  onCategoryCreated?: () => void;
}

export function RecipeManualForm({
  categories,
  defaultValues,
  onSubmit,
  isLoading,
  submitLabel,
  onCancel,
  onCategoryCreated,
}: RecipeManualFormProps) {
  const [title, setTitle] = useState(defaultValues?.title || "");
  const [description, setDescription] = useState(defaultValues?.description || "");
  const [categoryId, setCategoryId] = useState(defaultValues?.categoryId || "");
  const [prepTime, setPrepTime] = useState(defaultValues?.prepTime?.toString() || "");
  const [cookTime, setCookTime] = useState(defaultValues?.cookTime?.toString() || "");
  const [servings, setServings] = useState(defaultValues?.servings?.toString() || "");
  const [imageUrl, setImageUrl] = useState(defaultValues?.imageUrl || "");
  const [ingredients, setIngredients] = useState<string[]>(
    defaultValues?.ingredients || [""]
  );
  const [instructions, setInstructions] = useState<string[]>(
    defaultValues?.instructions || [""]
  );
  const [notes, setNotes] = useState(defaultValues?.notes || "");
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

  useEffect(() => {
    if (defaultValues) {
      setTitle(defaultValues.title || "");
      setDescription(defaultValues.description || "");
      setCategoryId(defaultValues.categoryId || "");
      setPrepTime(defaultValues.prepTime?.toString() || "");
      setCookTime(defaultValues.cookTime?.toString() || "");
      setServings(defaultValues.servings?.toString() || "");
      setImageUrl(defaultValues.imageUrl || "");
      setIngredients(defaultValues.ingredients || [""]);
      setInstructions(defaultValues.instructions || [""]);
      setNotes(defaultValues.notes || "");
    }
  }, [defaultValues]);

  const addIngredient = () => {
    setIngredients([...ingredients, ""]);
  };

  const removeIngredient = (index: number) => {
    setIngredients(ingredients.filter((_, i) => i !== index));
  };

  const updateIngredient = (index: number, value: string) => {
    const updated = [...ingredients];
    updated[index] = value;
    setIngredients(updated);
  };

  const addInstruction = () => {
    setInstructions([...instructions, ""]);
  };

  const removeInstruction = (index: number) => {
    setInstructions(instructions.filter((_, i) => i !== index));
  };

  const updateInstruction = (index: number, value: string) => {
    const updated = [...instructions];
    updated[index] = value;
    setInstructions(updated);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      toast.error("Please enter a recipe title");
      return;
    }

    const filteredIngredients = ingredients.filter((i) => i.trim());
    const filteredInstructions = instructions.filter((i) => i.trim());

    if (filteredIngredients.length === 0) {
      toast.error("Please add at least one ingredient");
      return;
    }

    if (filteredInstructions.length === 0) {
      toast.error("Please add at least one instruction");
      return;
    }

    onSubmit({
      title: title.trim(),
      description: description.trim() || undefined,
      categoryId: categoryId || undefined,
      prepTime: prepTime ? parseInt(prepTime) : undefined,
      cookTime: cookTime ? parseInt(cookTime) : undefined,
      servings: servings ? parseInt(servings) : undefined,
      ingredients: filteredIngredients,
      instructions: filteredInstructions,
      notes: notes.trim() || undefined,
      imageUrl: imageUrl.trim() || undefined,
      isPublic: true,
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
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Basic Info */}
      <div className="space-y-4">
        <div>
          <Label htmlFor="title">Recipe Title *</Label>
          <Input
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g., Chocolate Chip Cookies"
            required
          />
        </div>

        <div>
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Brief description of your recipe"
            rows={3}
          />
        </div>

        <div>
          <Label htmlFor="category">Category</Label>
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

        <div className="grid grid-cols-3 gap-4">
          <div>
            <Label htmlFor="prepTime">Prep Time (min)</Label>
            <Input
              id="prepTime"
              type="number"
              value={prepTime}
              onChange={(e) => setPrepTime(e.target.value)}
              placeholder="15"
              min="0"
            />
          </div>
          <div>
            <Label htmlFor="cookTime">Cook Time (min)</Label>
            <Input
              id="cookTime"
              type="number"
              value={cookTime}
              onChange={(e) => setCookTime(e.target.value)}
              placeholder="30"
              min="0"
            />
          </div>
          <div>
            <Label htmlFor="servings">Servings</Label>
            <Input
              id="servings"
              type="number"
              value={servings}
              onChange={(e) => setServings(e.target.value)}
              placeholder="4"
              min="1"
            />
          </div>
        </div>

        <div>
          <Label htmlFor="imageUrl">Image URL</Label>
          <Input
            id="imageUrl"
            type="url"
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            placeholder="https://example.com/image.jpg"
          />
        </div>
      </div>

      {/* Ingredients */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <Label>Ingredients *</Label>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={addIngredient}
            className="gap-2"
          >
            <Plus className="h-4 w-4" />
            Add Ingredient
          </Button>
        </div>
        <div className="space-y-2">
          {ingredients.map((ingredient, index) => (
            <div key={index} className="flex gap-2">
              <Input
                value={ingredient}
                onChange={(e) => updateIngredient(index, e.target.value)}
                placeholder="e.g., 2 cups all-purpose flour"
              />
              {ingredients.length > 1 && (
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() => removeIngredient(index)}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Instructions */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <Label>Instructions *</Label>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={addInstruction}
            className="gap-2"
          >
            <Plus className="h-4 w-4" />
            Add Step
          </Button>
        </div>
        <div className="space-y-2">
          {instructions.map((instruction, index) => (
            <div key={index} className="flex gap-2">
              <div className="flex-shrink-0 w-8 h-10 rounded-full bg-muted flex items-center justify-center font-semibold text-sm text-muted-foreground">
                {index + 1}
              </div>
              <Textarea
                value={instruction}
                onChange={(e) => updateInstruction(index, e.target.value)}
                placeholder="Describe this step..."
                rows={2}
              />
              {instructions.length > 1 && (
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() => removeInstruction(index)}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Notes */}
      <div>
        <Label htmlFor="notes">Notes</Label>
        <Textarea
          id="notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Any additional tips or variations..."
          rows={4}
        />
      </div>

      {/* Submit */}
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
