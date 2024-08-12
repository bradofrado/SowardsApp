"use client";
import { SpendingRecord } from "model/src/budget";
import { displayDate, formatDollarAmount } from "model/src/utils";
import { Transaction } from "plaid";
import { useState } from "react";
import { Button } from "ui/src/components/catalyst/button";
import { FormDivider } from "ui/src/components/catalyst/form/form";
import { Heading } from "ui/src/components/catalyst/heading";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "ui/src/components/catalyst/table";

interface SpendingFormProps {
  transactions: SpendingRecord[];
  categoryNames: string[];
}
export const SpendingForm: React.FunctionComponent<SpendingFormProps> = ({
  transactions,
  categoryNames,
}) => {
  const [categories, setCategories] = useState<{ id: string; name: string }[]>(
    [],
  );

  const onCategoryChange = (transactionId: string, name: string) => {
    setCategories((prev) => {
      const copy = prev.slice();
      const index = copy.findIndex((c) => c.id === transactionId);
      if (index > -1) {
        copy[index] = {
          id: transactionId,
          name,
        };
        return copy;
      }
      return [...copy, { id: transactionId, name }];
    });
  };
  return (
    <div>
      <Heading>Spending</Heading>
      <FormDivider />
      <Table>
        <TableHead>
          <TableHeader>Date</TableHeader>
          <TableHeader>Name</TableHeader>
          <TableHeader>Category</TableHeader>
          <TableHeader>Amount</TableHeader>
        </TableHead>
        <TableBody>
          {transactions
            .filter((t) => t.category?.[0] !== "Payment")
            .map((transaction) => (
              <TableRow key={transaction.transactionId}>
                <TableCell>{displayDate(transaction.date)}</TableCell>
                <TableCell>{transaction.description}</TableCell>
                <TableCell>
                  <CategoryPicker
                    value={
                      categories.find((c) => c.id === transaction.transactionId)
                        ?.name
                    }
                    categories={categoryNames}
                    onChange={(name) => {
                      onCategoryChange(transaction.transactionId, name);
                    }}
                  />
                </TableCell>
                <TableCell>{formatDollarAmount(transaction.amount)}</TableCell>
              </TableRow>
            ))}
        </TableBody>
      </Table>
    </div>
  );
};

export const CategoryPicker: React.FunctionComponent<{
  onChange: (name: string) => void;
  value: string | undefined;
  categories: string[];
}> = ({ onChange, value, categories }) => {
  return (
    <div className="flex gap-2">
      {categories.map((category) => (
        <Button
          key={category}
          onClick={() => onChange(category)}
          plain={value !== category}
        >
          {category}
        </Button>
      ))}
    </div>
  );
};
