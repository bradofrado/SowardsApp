"use client";
import { CategoryBudget, SpendingRecord } from "model/src/budget";
import { classNames, displayDate, formatDollarAmount } from "model/src/utils";
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
import { CategoryPicker, CategoryPickerModal } from "./category-picker";
import { AddTransactionModal, UpdateTransactionModal } from "./add-transaction";
import { useStateProps } from "ui/src/hooks/state-props";

interface SpendingFormProps {
  transactions: SpendingRecord[];
  categories: CategoryBudget[];
}
export const SpendingForm: React.FunctionComponent<SpendingFormProps> = ({
  transactions: origTransactions,
  categories,
}) => {
  const [transactions, setTransactions] = useStateProps(origTransactions);
  const changeProperty = useChangeArray(setTransactions);
  const [loading, setLoading] = useState(false);
  const { mutate: saveTransactions } =
    api.plaid.updateTransactions.useMutation();
  const [selected, setSelected] = useState<string[]>([]);
  const [showExportModal, setShowExportModal] = useState(false);
  const [showAddTransactionModal, setShowAddTransactionModal] = useState(false);
  const [pickCategory, setPickCategory] = useState(-1);
  const [updateTransaction, setUpdateTransaction] = useState<SpendingRecord>();

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

  const onEdit = (): void => {
    setUpdateTransaction(
      transactions.find((t) => selected.includes(t.transactionId)),
    );
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
        {selected.length === 1 ? <Button onClick={onEdit}>Edit</Button> : null}
        {selected.length > 0 ? (
          <>
            <Button onClick={onExportClick}>Export</Button>
          </>
        ) : null}
        <Button onClick={() => setShowAddTransactionModal(true)}>
          Add Transaction
        </Button>
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
                <Button onClick={() => setPickCategory(i)} plain>
                  {transaction.category?.name ?? (
                    <span className="text-red-400">Select Category</span>
                  )}
                </Button>
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
      <AddTransactionModal
        show={showAddTransactionModal}
        onClose={() => setShowAddTransactionModal(false)}
        categories={categories}
      />
      <UpdateTransactionModal
        show={updateTransaction !== undefined}
        onClose={() => setUpdateTransaction(undefined)}
        transaction={updateTransaction || transactions[0]}
        categories={categories}
      />
      <CategoryPickerModal
        show={pickCategory > -1}
        onClose={() => setPickCategory(-1)}
        value={transactions[pickCategory]?.category?.id}
        categories={categories}
        onChange={(category) => {
          onCategoryChange(pickCategory, category);
        }}
      />
    </Form>
  );
};
