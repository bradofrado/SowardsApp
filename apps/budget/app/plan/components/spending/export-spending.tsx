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
import { Button } from "ui/src/components/catalyst/button";
import {
  DialogTitle,
  DialogDescription,
  Dialog,
  DialogBody,
  DialogActions,
} from "ui/src/components/catalyst/dialog";
import { Alert } from "ui/src/components/core/alert";

interface ExportSpendingModalProps {
  transactions: SpendingRecord[];
  categories: CategoryBudget[];
  onClose: () => void;
  show: boolean;
}
export const ExportSpendingModal: React.FunctionComponent<
  ExportSpendingModalProps
> = ({ transactions, categories: origCategories, onClose, show }) => {
  const [categories, setCategories] = useState(origCategories);
  const [copiedLabel, setCopiedLabel] = useState<string>();

  const onExport = () => {
    const content = totals.reduce(
      (prev, curr) =>
        prev + curr.transactions.map((t) => t.amount).join("\t") + "\n",
      "",
    );
    navigator.clipboard.writeText(content);
    setCopiedLabel("Copied to clipboard");
  };

  const totals = useMemo(
    () =>
      transactions.reduce<
        {
          id: number;
          name: string;
          categoryId: string;
          totalAmount: number;
          transactions: SpendingRecord[];
        }[]
      >(
        (prev, curr, i) => {
          if (!curr.category) return prev;

          const category = curr.category.id;
          const categoryIndex = prev.findIndex(
            (item) => item.categoryId === category,
          );
          const amount =
            curr.category.type === "expense" ? curr.amount : -curr.amount;
          if (categoryIndex > -1) {
            prev[categoryIndex].totalAmount += amount;
            prev[categoryIndex].transactions.push(curr);
            return prev;
          }
          return [
            ...prev,
            {
              name: curr.category.name,
              categoryId: category,
              totalAmount: amount,
              transactions: [curr],
              id: i,
            },
          ];
        },
        categories.map((cateogory, i) => ({
          name: cateogory.name,
          categoryId: cateogory.id,
          id: i,
          transactions: [],
          totalAmount: 0,
        })),
      ),
    [transactions, categories],
  );
  return (
    <Dialog open={show} onClose={onClose}>
      <DialogTitle>Export Totals</DialogTitle>
      <DialogDescription>
        Exporting totals copies the transactions for each category to your
        clipboard.
      </DialogDescription>
      <DialogBody>
        <Table>
          <TableHead>
            <TableRow>
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
                <TableCell>{total.name}</TableCell>
                <TableCell>{formatDollarAmount(total.totalAmount)}</TableCell>
              </>
            )}
          </DraggableListComponent>
        </Table>
      </DialogBody>
      <DialogActions>
        <Button onClick={onClose} plain>
          Cancel
        </Button>
        <Button onClick={onExport}>Export</Button>
      </DialogActions>
      <Alert label={copiedLabel} setLabel={setCopiedLabel} />
    </Dialog>
  );
};
