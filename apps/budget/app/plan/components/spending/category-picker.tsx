import { CategoryBudget } from "model/src/budget";
import { Button } from "ui/src/components/catalyst/button";

export const CategoryPicker: React.FunctionComponent<{
  onChange: (name: CategoryBudget) => void;
  value: string | undefined;
  categories: CategoryBudget[];
}> = ({ onChange, value, categories }) => {
  return (
    <div className="flex items-start gap-2">
      {categories.map((category) => (
        <Button
          key={category.id}
          onClick={() => onChange(category)}
          plain={(value !== category.id) as true}
        >
          {category.name}
        </Button>
      ))}
    </div>
  );
};
