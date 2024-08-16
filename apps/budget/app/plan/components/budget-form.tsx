import { Budget, CategoryBudget } from "model/src/budget";
import {
  Form,
  FormRow,
  FormSection,
} from "ui/src/components/catalyst/form/form";
import { Card } from "ui/src/components/core/card";
import { Button } from "ui/src/components/catalyst/button";
import { NewBudgetButton } from "./new-budget";
import { classNames } from "model/src/utils";
import { BudgetCard } from "./budget-card";

interface BudgetFormProps {
  budgets: Budget[];
  categories: CategoryBudget[];
  className?: string;
}
export const BudgetForm: React.FunctionComponent<BudgetFormProps> = ({
  budgets,
  categories,
  className,
}) => {
  return (
    <div className={classNames("mx-auto max-w-4xl", className)}>
      <FormSection label="Budget Templates">
        <div className="flex flex-col gap-2">
          <NewBudgetButton className="ml-auto" categories={categories} />
          <div className="grid grid-cols-3">
            {budgets.map((budget) => (
              <BudgetCard key={budget.id} budget={budget} />
            ))}
          </div>
        </div>
      </FormSection>
    </div>
  );
};
