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
import {
  useCategoryTotals,
  useTransactionCategoryTotals,
} from "../../../../utils/hooks/category-totals";

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
  const totals = useTransactionCategoryTotals({ transactions, categories });

  const onExport = () => {
    const content = totals.reduce(
      (prev, curr) => prev + curr.amounts.join("\t") + "\n",
      "",
    );
    navigator.clipboard.writeText(content);
    setCopiedLabel("Copied to clipboard");
  };

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
              setCategories(items.map((item) => item.category))
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
