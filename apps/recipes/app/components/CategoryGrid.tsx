import Link from "next/link";
import { Card } from "@/components/ui/card";

interface Category {
  id: string;
  name: string;
  description: string | null;
  icon: string | null;
}

interface CategoryGridProps {
  categories: Category[];
}

export const CategoryGrid = ({ categories }: CategoryGridProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {categories.map((category) => (
        <Link key={category.id} href={`/category/${category.id}`}>
          <Card className="p-8 hover:shadow-[var(--shadow-hover)] transition-all duration-300 cursor-pointer group border-border bg-card">
            <div className="flex flex-col items-center text-center gap-4">
              <div className="text-6xl group-hover:scale-110 transition-transform duration-300">
                {category.icon || "🍽️"}
              </div>
              <div>
                <h3 className="text-2xl font-semibold text-foreground mb-2">
                  {category.name}
                </h3>
                {category.description && (
                  <p className="text-muted-foreground text-sm">
                    {category.description}
                  </p>
                )}
              </div>
            </div>
          </Card>
        </Link>
      ))}
    </div>
  );
};
