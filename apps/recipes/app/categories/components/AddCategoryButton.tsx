"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { api } from "next-utils/src/utils/api";
import { CategoryDialog } from "@/components/CategoryDialog";

export function AddCategoryButton() {
  const router = useRouter();
  const [dialogOpen, setDialogOpen] = useState(false);

  const createCategoryMutation = api.recipe.createCategory.useMutation({
    onSuccess: () => {
      toast.success("Category created successfully!");
      setDialogOpen(false);
      router.refresh();
    },
    onError: () => {
      toast.error("Failed to create category");
    },
  });

  const handleSubmit = (data: {
    name: string;
    description?: string;
    icon?: string;
  }) => {
    createCategoryMutation.mutate(data);
  };

  return (
    <>
      <Button onClick={() => setDialogOpen(true)} size="lg" className="gap-2">
        <Plus className="h-5 w-5" />
        Add Category
      </Button>

      <CategoryDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSubmit={handleSubmit}
        isLoading={createCategoryMutation.isLoading}
      />
    </>
  );
}
