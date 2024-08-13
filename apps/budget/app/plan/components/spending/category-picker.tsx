import { CategoryBudget } from "model/src/budget";
import { Button } from "ui/src/components/catalyst/button";
import { Dialog, DialogActions } from "ui/src/components/catalyst/dialog";

interface CategoryPickerProps {
  categories: CategoryBudget[];
  onChange: (category: CategoryBudget | null) => void;
  value: string | undefined;
}
export const CategoryPicker: React.FunctionComponent<CategoryPickerProps> = ({
  onChange,
  value,
  categories,
}) => {
  return (
    <div className="grid gap-y-2 grid-cols-3">
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

export const CategoryPickerModal: React.FunctionComponent<
  CategoryPickerProps & { show: boolean; onClose: () => void }
> = ({ show, onClose, onChange: onChangeProps, ...props }) => {
  const onChange = (category: CategoryBudget) => {
    onChangeProps(category);
    onClose();
  };
  const onRemove = (): void => {
    onChangeProps(null);
    onClose();
  };
  return (
    <Dialog open={show} onClose={onClose}>
      <CategoryPicker {...props} onChange={onChange} />
      <DialogActions>
        <Button onClick={onRemove} plain>
          Remove
        </Button>
      </DialogActions>
    </Dialog>
  );
};
