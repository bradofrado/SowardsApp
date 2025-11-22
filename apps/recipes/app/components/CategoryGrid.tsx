import Link from "next/link";
import { Card } from "@/components/ui/card";
import { ImageIcon } from "lucide-react";

interface Category {
  id: string;
  name: string;
  description: string | null;
  image: string | null;
}

interface CategoryGridProps {
  categories: Category[];
}

export const CategoryGrid = ({ categories }: CategoryGridProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {categories.map((category) => (
        <Link key={category.id} href={`/category/${category.id}`}>
          <Card className="overflow-hidden hover:shadow-[var(--shadow-hover)] transition-all duration-300 cursor-pointer group border-border bg-card">
            <div className="aspect-[4/3] overflow-hidden bg-muted">
              {category.image ? (
                <img
                  src={category.image}
                  alt={category.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <ImageIcon className="w-16 h-16 text-muted-foreground" />
                </div>
              )}
            </div>
            <div className="p-6">
              <h3 className="text-xl font-semibold text-foreground mb-2 group-hover:text-primary transition-colors">
                {category.name}
              </h3>
              {category.description && (
                <p className="text-muted-foreground text-sm line-clamp-2">
                  {category.description}
                </p>
              )}
            </div>
          </Card>
        </Link>
      ))}
    </div>
  );
};
