"use client";

import { CategoryBudget, SpendingRecord } from "model/src/budget";
import { useMemo, useState } from "react";
import { Form, FormSection } from "ui/src/components/catalyst/form/form";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "ui/src/components/catalyst/table";
import { CheckboxInput } from "ui/src/components/core/input";
import { DraggableListComponent } from "ui/src/components/core/draggable-list";
import { formatDollarAmount } from "model/src/utils";

interface TotalsFormProps {
  transactions: SpendingRecord[];
  categories: CategoryBudget[];
}
export const TotalsForm: React.FunctionComponent<TotalsFormProps> = ({
  transactions,
  categories: origCategories,
}) => {
  const [selected, setSelected] = useState<string[]>([]);
  const [categories, setCategories] = useState(origCategories);

  const onSelect = (checked: boolean, categoryId: string) => {
    if (checked) {
      setSelected([...selected, categoryId]);
    } else {
      setSelected(selected.filter((id) => id !== categoryId));
    }
  };

  const onSelectAll = (checked: boolean) => {
    if (checked) {
      setSelected(totals.map((t) => t.categoryId));
    } else {
      setSelected([]);
    }
  };

  const totals = useMemo(
    () =>
      transactions.reduce<
        { id: number; name: string; categoryId: string; amount: number }[]
      >(
        (prev, curr, i) => {
          if (!curr.category) return prev;

          const category = curr.category.id;
          const categoryIndex = prev.findIndex(
            (item) => item.categoryId === category,
          );
          if (categoryIndex > -1) {
            prev[categoryIndex].amount += curr.amount;
            return prev;
          }
          return [
            ...prev,
            {
              name: curr.category.name,
              categoryId: category,
              amount: curr.amount,
              id: i,
            },
          ];
        },
        categories.map((cateogory, i) => ({
          name: cateogory.name,
          categoryId: cateogory.id,
          id: i,
          amount: 0,
        })),
      ),
    [transactions, categories],
  );
  return (
    <Form>
      <FormSection label="Totals">
        <Table>
          <TableHead>
            <TableRow>
              <TableHeader>
                <CheckboxInput
                  className="w-fit"
                  value={totals.length === selected.length}
                  onChange={onSelectAll}
                />
              </TableHeader>
              <TableHeader>Category</TableHeader>
              <TableHeader>Total Amount</TableHeader>
            </TableRow>
          </TableHead>
          <DraggableListComponent
            id="category-list"
            as={TableBody}
            itemAs={TableRow}
            items={totals}
            onReorder={(items) =>
              setCategories(
                items.map(
                  (item) =>
                    categories.find((c) => c.id === item.categoryId) ||
                    categories[0],
                ),
              )
            }
          >
            {(total) => (
              <>
                <TableCell>
                  <CheckboxInput
                    className="w-fit"
                    value={selected.includes(total.categoryId)}
                    onChange={(checked) => onSelect(checked, total.categoryId)}
                  />
                </TableCell>
                <TableCell>{total.name}</TableCell>
                <TableCell>{formatDollarAmount(total.amount)}</TableCell>
              </>
            )}
          </DraggableListComponent>
        </Table>
      </FormSection>
    </Form>
  );
};
