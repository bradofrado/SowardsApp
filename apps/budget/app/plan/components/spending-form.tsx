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
import { useChangeArray } from "ui/src/hooks/change-property";

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

  const onCategoryChange = (index: number, category: CategoryBudget) => {
    changeProperty(transactions, index, "category", category);
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
  return (
    <Form>
      <Heading>Spending</Heading>
      <FormDivider />
      {transactions !== origTransactions ? (
        <div className="flex justify-end gap-4 my-4">
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
        </div>
      ) : null}
      <Table>
        <TableHead>
          <TableHeader>Date</TableHeader>
          <TableHeader>Name</TableHeader>
          <TableHeader>Category</TableHeader>
          <TableHeader>Amount</TableHeader>
        </TableHead>
        <TableBody>
          {transactions.map((transaction, i) => (
            <TableRow key={transaction.transactionId}>
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
          plain={value !== category.id}
        >
          {category.name}
        </Button>
      ))}
    </div>
  );
};
