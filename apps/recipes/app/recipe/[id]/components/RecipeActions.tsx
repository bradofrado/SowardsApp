"use client";

import { useRouter } from "next/navigation";
import { Share2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { api } from "next-utils/src/utils/api";

interface RecipeActionsProps {
  recipeId: string;
}

export function RecipeActions({ recipeId }: RecipeActionsProps) {
  const router = useRouter();
  const deleteRecipeMutation = api.recipe.deleteRecipe.useMutation({
    onSuccess: () => {
      toast.success("Recipe deleted successfully");
      router.push("/");
    },
    onError: () => {
      toast.error("Failed to delete recipe");
    },
  });

  const handleShare = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url);
    toast.success("Recipe link copied to clipboard!");
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this recipe?")) return;
    deleteRecipeMutation.mutate({ id: recipeId });
  };

  return (
    <div className="flex gap-2">
      <Button variant="outline" size="icon" onClick={handleShare}>
        <Share2 className="h-4 w-4" />
      </Button>
      <Button variant="outline" size="icon" onClick={handleDelete}>
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  );
}
