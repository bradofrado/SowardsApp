"use client";
import { CategoryBudget, SpendingRecord } from "model/src/budget";
import {
  classNames,
  displayDate,
  formatDollarAmount,
  trimText,
} from "model/src/utils";
import { api } from "next-utils/src/utils/api";
import { AccountBase, Transaction } from "plaid";
import { useEffect, useMemo, useState } from "react";
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
import { AccountDisplay } from "../../../settings/components/account-display";
import { Accordion } from "ui/src/components/core/accordion";
import { useQueryState } from "ui/src/hooks/query-state";
import { usePrevious } from "ui/src/hooks/previous";

interface SpendingFormProps {
  transactions: SpendingRecord[];
  categories: CategoryBudget[];
  accounts: AccountBase[];
}
export const SpendingForm: React.FunctionComponent<SpendingFormProps> = ({
  transactions: origTransactions,
  categories,
  accounts,
}) => {
  const [transactions, setTransactions] = useStateProps(origTransactions);
  const changeProperty = useChangeArray(setTransactions);
  const [loading, setLoading] = useState(false);
  const { mutate: saveTransactions } =
    api.plaid.updateTransactions.useMutation();
  const [selected, setSelected] = useState<string[]>([]);
  const [showExportModal, setShowExportModal] = useState(false);
  const [showAddTransactionModal, setShowAddTransactionModal] = useState(false);
  const [pickCategory, setPickCategory] = useState<SpendingRecord>();
  const [updateTransaction, setUpdateTransaction] = useState<SpendingRecord>();
  const [grouping, setGrouping] = useQueryState<"all" | "account">({
    key: "grouping",
    defaultValue: "all",
  });
  const prevTransactions = usePrevious(transactions);

  useEffect(() => {
    if (prevTransactions !== transactions) {
      setSelected(
        selected.filter((id) =>
          transactions.find((t) => t.transactionId === id),
        ),
      );
    }
  }, [transactions, prevTransactions, setSelected, selected]);

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
      transactions.find((t) => selected[0] === t.transactionId),
    );
  };

  return (
    <Form className="mt-4">
      <Heading>Spending</Heading>
      <FormDivider />
      <div className="flex justify-between my-4">
        <div className="flex gap-4">
          <Button
            onClick={() => setGrouping("all")}
            plain={(grouping !== "all") as true}
          >
            All
          </Button>
          <Button
            onClick={() => setGrouping("account")}
            plain={(grouping !== "account") as true}
          >
            Group By Account
          </Button>
        </div>
        <div className="flex gap-4">
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
          {selected.length === 1 ? (
            <Button onClick={onEdit}>Edit</Button>
          ) : null}
          {selected.length > 0 ? (
            <>
              <Button onClick={onExportClick}>Export</Button>
            </>
          ) : null}
          <Button onClick={() => setShowAddTransactionModal(true)}>
            Add Transaction
          </Button>
        </div>
      </div>
      {grouping === "all" ? (
        <TransactionTable
          transactions={transactions}
          selected={selected}
          setSelected={setSelected}
          onSelect={onSelect}
          onSelectAll={onSelectAll}
          setPickCategory={setPickCategory}
        />
      ) : (
        <>
          {accounts.map((account) => (
            <AccountTransactions
              key={account.account_id}
              account={account}
              transactions={transactions}
              selected={selected}
              setSelected={setSelected}
              onSelect={onSelect}
              onSelectAll={onSelectAll}
              setPickCategory={setPickCategory}
            />
          ))}
          <AccountTransactions
            transactions={transactions}
            selected={selected}
            setSelected={setSelected}
            onSelect={onSelect}
            onSelectAll={onSelectAll}
            setPickCategory={setPickCategory}
            manual
          />
        </>
      )}
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
        show={pickCategory !== undefined}
        onClose={() => setPickCategory(undefined)}
        value={pickCategory?.category?.id}
        categories={categories}
        onChange={(category) => {
          onCategoryChange(
            transactions.findIndex(
              (t) => t.transactionId === pickCategory?.transactionId,
            ),
            category,
          );
        }}
      />
    </Form>
  );
};

type AccountTransactionProps = {
  transactions: SpendingRecord[];
  selected: string[];
  setSelected: (selected: string[]) => void;
  onSelect: (checked: boolean, transactionId: string) => void;
  onSelectAll: (checked: boolean) => void;
  setPickCategory: (transaction: SpendingRecord | undefined) => void;
} & (
  | {
      account: AccountBase;
      manual?: undefined;
    }
  | {
      account?: undefined;
      manual: true;
    }
);
export const AccountTransactions: React.FunctionComponent<
  AccountTransactionProps
> = ({
  account,
  manual,
  transactions,
  selected,
  onSelect,
  onSelectAll,
  setSelected,
  setPickCategory,
}) => {
  const balance = manual ? null : account.balances.current;
  const filteredTransactions = transactions.filter((t) =>
    manual ? t.accountId === null : t.accountId === account.account_id,
  );

  const currSelected = useMemo(
    () =>
      selected.filter((id) =>
        filteredTransactions.find((t) => t.transactionId === id),
      ),
    [filteredTransactions, selected],
  );

  const totalSelected = useMemo(
    () =>
      currSelected
        .map(
          (id) =>
            transactions.find((t) => t.transactionId === id) || transactions[0],
        )
        .reduce((prev, curr) => prev + curr.amount, 0),
    [currSelected, transactions],
  );

  if (filteredTransactions.length === 0) {
    return null;
  }

  return (
    <Accordion
      items={[
        {
          content: (
            <>
              <TransactionTable
                setSelected={setSelected}
                transactions={filteredTransactions}
                selected={selected}
                onSelect={onSelect}
                onSelectAll={onSelectAll}
                setPickCategory={setPickCategory}
                small
              />
            </>
          ),
          labelContent: (
            <div className="flex items-center gap-4 hover:bg-gray-50 rounded-md p-2">
              {manual ? (
                <div>Manual Transactions</div>
              ) : (
                <AccountDisplay account={account} className="" />
              )}
              <div>{balance ? formatDollarAmount(balance) : null}</div>
              <div className="text-gray-500">
                {totalSelected !== 0 ? formatDollarAmount(totalSelected) : null}
              </div>
            </div>
          ),
        },
      ]}
    ></Accordion>
  );
};

interface TransactionTableProps {
  transactions: SpendingRecord[];
  selected: string[];
  setSelected: (selected: string[]) => void;
  onSelect: (checked: boolean, transactionId: string) => void;
  onSelectAll: (checked: boolean) => void;
  setPickCategory: (transaction: SpendingRecord | undefined) => void;
  small?: boolean;
}
const TransactionTable: React.FunctionComponent<TransactionTableProps> = ({
  transactions,
  selected,
  setSelected,
  onSelect,
  setPickCategory,
  small = false,
}) => {
  const onSelectAll = (checked: boolean) => {
    setSelected(
      checked
        ? [
            ...selected,
            ...transactions
              .filter((t) => !selected.find((id) => t.transactionId === id))
              .map((t) => t.transactionId),
          ]
        : selected.filter(
            (id) => !transactions.find((t) => t.transactionId === id),
          ),
    );
  };
  return (
    <Table sticky={small}>
      <TableHead>
        <TableRow>
          <TableHeader>
            <CheckboxInput
              className="w-fit"
              value={
                transactions.length ===
                selected.filter((id) =>
                  transactions.find((t) => t.transactionId === id),
                ).length
              }
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
            <TableCell>{trimText(transaction.description)}</TableCell>
            <TableCell>
              <Button onClick={() => setPickCategory(transaction)} plain>
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
  );
};
