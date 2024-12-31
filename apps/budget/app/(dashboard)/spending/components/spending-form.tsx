"use client";
import {
  CategoryBudget,
  SpendingRecord,
  TransactionCategory,
} from "model/src/budget";
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
import {
  CategoryPicker,
  CategoryPickerModal,
  CategorySplitModal,
} from "./category-picker";
import { AddTransactionModal, UpdateTransactionModal } from "./add-transaction";
import { useStateProps } from "ui/src/hooks/state-props";
import { AccountDisplay } from "../../../(dashboard)/settings/components/account-display";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "ui/src/components/core/accordion";
import { useQueryState } from "ui/src/hooks/query-state";
import { usePrevious } from "ui/src/hooks/previous";
import { Alert } from "ui/src/components/core/alert";
import { FilterModal, useFilter } from "./filter";
import {
  Dropdown,
  DropdownButton,
  DropdownItem,
  DropdownMenu,
} from "ui/src/components/catalyst/dropdown";
import { EllipsisHorizontalIcon } from "ui/src/components/core/icons";
import { isTransferTransactionAndUpdateCache } from "../../../../utils/utils";

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
  const { mutate: saveTransaction } = api.plaid.updateTransaction.useMutation();
  const [selected, setSelected] = useState<string[]>([]);
  const [showExportModal, setShowExportModal] = useState(false);
  const [showAddTransactionModal, setShowAddTransactionModal] = useState(false);
  const [pickCategory, setPickCategory] = useState<SpendingRecord>();
  const [split, setSplit] = useState(false);
  const [updateTransaction, setUpdateTransaction] = useState<SpendingRecord>();
  const [grouping, setGrouping] = useQueryState<"all" | "account">({
    key: "grouping",
    defaultValue: "all",
  });
  const prevTransactions = usePrevious(transactions);
  const [error, setError] = useState<string>();

  const {
    onApplyFilter,
    onFilterClick,
    onFilterModalClose,
    showFilterModal,
    filteredTransactions,
  } = useFilter({ transactions });

  useEffect(() => {
    if (prevTransactions !== transactions) {
      setSelected(
        selected.filter((id) =>
          transactions.find((t) => t.transactionId === id),
        ),
      );
    }
  }, [transactions, prevTransactions, setSelected, selected]);

  const onCategoryChange = (
    index: number,
    categories: TransactionCategory[],
  ) => {
    const newTransactions = changeProperty(
      transactions,
      index,
      "transactionCategories",
      categories,
    );
    saveTransaction(
      { transaction: newTransactions[index] },
      {
        onError(error) {
          changeProperty(
            transactions,
            index,
            "transactionCategories",
            transactions[index].transactionCategories,
          );
          setError(error.message);
        },
      },
    );
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
      setSelected(filteredTransactions.map((t) => t.transactionId));
    } else {
      setSelected([]);
    }
  };

  const onExportClick = () => {
    setShowExportModal(true);
  };

  const onEdit = (): void => {
    setUpdateTransaction(
      filteredTransactions.find((t) => selected[0] === t.transactionId),
    );
  };

  const onPickCategory = (
    transaction: SpendingRecord | undefined,
    split: boolean,
  ) => {
    setPickCategory(transaction);
    setSplit(split);
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
          {selected.length === 1 ? (
            <Button onClick={onEdit}>Edit</Button>
          ) : null}
          {selected.length > 0 ? (
            <>
              <Button onClick={onExportClick}>Export</Button>
            </>
          ) : null}
          <Button onClick={onFilterClick}>Filter</Button>
          <Button onClick={() => setShowAddTransactionModal(true)}>
            Add Transaction
          </Button>
        </div>
      </div>
      {grouping === "all" ? (
        <TransactionTable
          transactions={filteredTransactions}
          selected={selected}
          setSelected={setSelected}
          onSelect={onSelect}
          onSelectAll={onSelectAll}
          setPickCategory={onPickCategory}
        />
      ) : (
        <>
          {accounts.map((account) => (
            <AccountTransactions
              key={account.account_id}
              account={account}
              transactions={filteredTransactions}
              selected={selected}
              setSelected={setSelected}
              onSelect={onSelect}
              onSelectAll={onSelectAll}
              setPickCategory={onPickCategory}
            />
          ))}
          <AccountTransactions
            transactions={filteredTransactions}
            selected={selected}
            setSelected={setSelected}
            onSelect={onSelect}
            onSelectAll={onSelectAll}
            setPickCategory={onPickCategory}
            manual
          />
        </>
      )}
      <ExportSpendingModal
        show={showExportModal}
        onClose={() => setShowExportModal(false)}
        transactions={filteredTransactions.filter((t) =>
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
        transaction={updateTransaction}
        categories={categories}
      />
      <CategoryPickerModal
        show={pickCategory !== undefined && !split}
        onClose={() => setPickCategory(undefined)}
        values={pickCategory?.transactionCategories ?? []}
        categories={categories}
        onChange={(categories) => {
          onCategoryChange(
            transactions.findIndex(
              (t) => t.transactionId === pickCategory?.transactionId,
            ),
            categories,
          );
        }}
        transaction={pickCategory}
      />
      <CategorySplitModal
        key={pickCategory?.transactionId}
        show={pickCategory !== undefined && split}
        onClose={() => setPickCategory(undefined)}
        values={pickCategory?.transactionCategories ?? []}
        categories={categories}
        onChange={(transactionCategories) => {
          onCategoryChange(
            transactions.findIndex(
              (t) => t.transactionId === pickCategory?.transactionId,
            ),
            transactionCategories,
          );
        }}
        transaction={pickCategory}
      />
      <FilterModal
        show={showFilterModal}
        onClose={onFilterModalClose}
        onApplyFilter={onApplyFilter}
      />
      <Alert label={error} setLabel={setError} type="danger" />
    </Form>
  );
};

type AccountTransactionProps = {
  transactions: SpendingRecord[];
  selected: string[];
  setSelected: (selected: string[]) => void;
  onSelect: (checked: boolean, transactionId: string) => void;
  onSelectAll: (checked: boolean) => void;
  setPickCategory: (
    transaction: SpendingRecord | undefined,
    split: boolean,
  ) => void;
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
    <Accordion type="multiple">
      <AccordionItem value="item">
        <AccordionTrigger>
          <div className="flex items-center gap-4">
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
        </AccordionTrigger>
        <AccordionContent>
          <TransactionTable
            setSelected={setSelected}
            transactions={filteredTransactions}
            selected={selected}
            onSelect={onSelect}
            onSelectAll={onSelectAll}
            setPickCategory={setPickCategory}
            small
          />
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
};

interface TransactionTableProps {
  transactions: SpendingRecord[];
  selected: string[];
  setSelected: (selected: string[]) => void;
  onSelect: (checked: boolean, transactionId: string) => void;
  onSelectAll: (checked: boolean) => void;
  setPickCategory: (
    transaction: SpendingRecord | undefined,
    split: boolean,
  ) => void;
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
  const transferTransactions = useMemo(() => {
    const transferCache = transactions.slice();
    return transactions.filter((transaction) =>
      isTransferTransactionAndUpdateCache(transaction, transferCache),
    );
  }, [transactions]);

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
          <TableHeader className="relative w-0">
            <span className="sr-only">Actions</span>
          </TableHeader>
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
              {transferTransactions.includes(transaction) ? (
                <Button disabled plain>
                  Transfer
                </Button>
              ) : (
                (transaction.transactionCategories.length > 0
                  ? transaction.transactionCategories
                  : [undefined]
                ).map((transactionCategory) => (
                  <Button
                    key={transactionCategory?.id || "none"}
                    onClick={() =>
                      setPickCategory(
                        transaction,
                        transaction.transactionCategories.length > 1,
                      )
                    }
                    plain
                  >
                    {transactionCategory?.category.name ?? (
                      <span className="text-blue-400">Select Category</span>
                    )}
                  </Button>
                ))
              )}
            </TableCell>
            <TableCell>{formatDollarAmount(transaction.amount)}</TableCell>
            <TableCell className="pl-1">
              <div className="-my-1.5">
                <Dropdown>
                  <DropdownButton plain aria-label="More options">
                    <EllipsisHorizontalIcon className="h-4 w-4" />
                  </DropdownButton>
                  <DropdownMenu anchor="bottom end">
                    <DropdownItem
                      onClick={() => setPickCategory(transaction, true)}
                    >
                      Split Cost
                    </DropdownItem>
                  </DropdownMenu>
                </Dropdown>
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};
