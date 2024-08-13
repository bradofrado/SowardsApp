"use client";
import { CategoryBudget, SpendingRecord } from "model/src/budget";
import { displayDate, formatDollarAmount } from "model/src/utils";
import { api } from "next-utils/src/utils/api";
import { Transaction } from "plaid";
import { useState } from "react";
import { Button } from "ui/src/components/catalyst/button";
import { Form, FormDivider } from "ui/src/components/catalyst/form/form";
import { Heading } from "ui/src/components/catalyst/heading";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "ui/src/components/catalyst/table";
import { CheckboxInput } from "ui/src/components/core/input";
import { useChangeArray } from "ui/src/hooks/change-property";
import { ExportSpendingModal } from "./export-spending";

interface SpendingFormProps {
  transactions: SpendingRecord[];
  categories: CategoryBudget[];
}
export const SpendingForm: React.FunctionComponent<SpendingFormProps> = ({
  transactions: origTransactions,
  categories,
}) => {
  const [transactions, setTransactions] = useState(origTransactions);
  const changeProperty = useChangeArray(setTransactions);
  const [loading, setLoading] = useState(false);
  const { mutate: saveTransactions } =
    api.plaid.updateTransactions.useMutation();
  const [selected, setSelected] = useState<string[]>([]);
  const [showExportModal, setShowExportModal] = useState(false);

  const onCategoryChange = (index: number, category: CategoryBudget) => {
    changeProperty(transactions, index, "category", category);
  };

  const onSelect = (checked: boolean, transactionId: string) => {
    if (checked) {
      setSelected([...selected, transactionId]);
    } else {
      setSelected(selected.filter((id) => id !== transactionId));
    }
  };

  const onSelectAll = (checked: boolean) => {
    if (checked) {
      setSelected(transactions.map((t) => t.transactionId));
    } else {
      setSelected([]);
    }
  };

  const onSubmit = () => {
    setLoading(true);
    saveTransactions(
      { transactions },
      {
        onSuccess() {
          setLoading(false);
        },
        onError() {
          setLoading(false);
        },
      },
    );
  };

  const onExportClick = () => {
    setShowExportModal(true);
  };
  return (
    <Form className="mt-4">
      <Heading>Spending</Heading>
      <FormDivider />
      <div className="flex justify-end gap-4 my-4">
        {transactions !== origTransactions ? (
          <>
            <Button
              onClick={() => setTransactions(origTransactions)}
              plain
              type="reset"
            >
              Reset
            </Button>
            <Button loading={loading} type="submit" onClick={onSubmit}>
              Save changes
            </Button>
          </>
        ) : null}
        {selected.length > 0 ? (
          <Button onClick={onExportClick}>Export</Button>
        ) : null}
      </div>
      <Table>
        <TableHead>
          <TableRow>
            <TableHeader>
              <CheckboxInput
                className="w-fit"
                value={transactions.length === selected.length}
                onChange={onSelectAll}
              />
            </TableHeader>
            <TableHeader>Date</TableHeader>
            <TableHeader>Name</TableHeader>
            <TableHeader>Category</TableHeader>
            <TableHeader>Amount</TableHeader>
          </TableRow>
        </TableHead>
        <TableBody>
          {transactions.map((transaction, i) => (
            <TableRow key={transaction.transactionId}>
              <TableCell>
                <CheckboxInput
                  className="w-fit"
                  value={selected.includes(transaction.transactionId)}
                  onChange={(checked) =>
                    onSelect(checked, transaction.transactionId)
                  }
                />
              </TableCell>
              <TableCell>{displayDate(transaction.date)}</TableCell>
              <TableCell>{transaction.description}</TableCell>
              <TableCell>
                <CategoryPicker
                  value={transaction.category?.id}
                  categories={categories}
                  onChange={(category) => {
                    onCategoryChange(i, category);
                  }}
                />
              </TableCell>
              <TableCell>{formatDollarAmount(transaction.amount)}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <ExportSpendingModal
        show={showExportModal}
        onClose={() => setShowExportModal(false)}
        transactions={transactions.filter((t) =>
          selected.includes(t.transactionId),
        )}
        categories={categories}
      />
    </Form>
  );
};

export const CategoryPicker: React.FunctionComponent<{
  onChange: (name: CategoryBudget) => void;
  value: string | undefined;
  categories: CategoryBudget[];
}> = ({ onChange, value, categories }) => {
  return (
    <div className="flex gap-2">
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
