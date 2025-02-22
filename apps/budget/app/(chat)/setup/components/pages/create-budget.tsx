"use client";
import { Header } from "ui/src/components/core/header";
import { SetupPage } from "../register-pages";
import { ConnectExternalAccountForm } from "../../../../../utils/components/totals/connect-external-form";
import React, {
  SetStateAction,
  use,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { FormSection } from "ui/src/components/catalyst/form/form";
import {
  BudgetForm,
  BudgetItemForm,
} from "../../../../../utils/components/budget/budget-form";
import { ProgressBarMultiValue } from "ui/src/components/feature/reporting/graphs/progressbar-multivalue";
import { StatusLaneContainer } from "ui/src/components/feature/reporting/status-lane";
import {
  Budget,
  BudgetItem,
  calculateCadenceMonthlyAmount,
  CategoryBudget,
  getCadenceStartAndEnd,
} from "model/src/budget";
import { Card } from "ui/src/components/core/card";
import { useChangeProperty } from "ui/src/hooks/change-property";
import { HexColor } from "model/src/core/colors";
import { useAccountTotals } from "../../../../../utils/hooks/account-totals";
import {
  capitalizeFirstLetter,
  classNames,
  formatDollarAmount,
} from "model/src/utils";
import { Button } from "ui/src/components/catalyst/button";
import {
  Dialog,
  DialogActions,
  DialogBody,
  DialogTitle,
} from "ui/src/components/catalyst/dialog";
import { usePrevious } from "ui/src/hooks/previous";
import { useQueryState } from "ui/src/hooks/query-state";
import { api } from "next-utils/src/utils/api";
import { calculateAmount } from "../../../../../utils/utils";

const budgetQueryKey = "budget";
export const CreateBudget: SetupPage = ({
  accounts,
  setShowNext,
  categories,
  budget: budgetProps,
}) => {
  const { netWorth } = useAccountTotals(accounts);
  const [budget, setBudget] = useQueryState<Budget>({
    key: budgetQueryKey,
    defaultValue: budgetProps ?? {
      id: "",
      items: [],
      name: "My Budget",
    },
  });
  const changeProperty = useChangeProperty<Budget>(setBudget);
  const [editItem, setEditItem] = useState<BudgetItem | null>(null);
  const [createItem, setCreateItem] = useState<BudgetItem | null>(null);
  const [categoriesState, setCategoriesState] = useState([
    ...categories,
    ...budget.items
      .filter((item) => !categories.find((cat) => cat.id === item.category.id))
      .map((item) => item.category),
  ]);

  const onChange = (value: BudgetItem) => {
    if (budget.items.find((item) => item.id === value.id)) {
      changeProperty(
        budget,
        "items",
        budget.items.map<BudgetItem>((item) =>
          item.id === value.id ? (value as BudgetItem) : item,
        ),
      );
      return;
    }

    changeProperty(budget, "items", [...budget.items, value]);
  };

  const statusItems = useMemo(
    () =>
      categoriesState
        .filter((cat) => cat.type !== "income")
        .map<
          BudgetItem & {
            columnId: "expense" | "transfer";
            type: "expense" | "transfer";
            cadenceAmount: number;
          }
        >((category) => {
          let type: "expense" | "transfer" = "expense";
          let item: BudgetItem | undefined = budget.items.find(
            (item) => item.category.id === category.id,
          );

          if (!item) {
            type = "transfer";
          }

          if (!item) {
            const { periodStart, periodEnd } = getCadenceStartAndEnd({
              type: "monthly",
              dayOfMonth: 1,
            });
            return {
              id: category.id,
              targetAmount: 0,
              amount: 0,
              cadenceAmount: 0,
              columnId: "expense",
              cadence: { type: "monthly", dayOfMonth: 1 },
              category,
              type: "expense",
              periodStart,
              periodEnd,
            };
          }
          const cadenceAmount = item.amount;
          const amount = calculateCadenceMonthlyAmount(item);

          const { periodStart, periodEnd } = getCadenceStartAndEnd(
            item.cadence,
          );

          return {
            id: item.id,
            cadence:
              "cadence" in item
                ? item.cadence
                : { type: "monthly", dayOfMonth: 1 },
            category: item.category,
            amount,
            targetAmount: item.targetAmount,
            cadenceAmount,
            columnId: type,
            type,
            periodStart,
            periodEnd,
          };
        })
        .sort((a, b) => a.category.order - b.category.order),
    [budget.items, categoriesState],
  );

  const onChangeItems: React.Dispatch<
    SetStateAction<
      (BudgetItem & {
        columnId: "expense" | "transfer";
        type: "expense" | "transfer";
        cadenceAmount: number;
      })[]
    >
  > = (action) => {
    const result = Array.isArray(action) ? action : action(statusItems);

    result.forEach((item, i) => {
      item.amount = item.cadenceAmount;
      item.category.order = i;
    });
    const newBudget = changeProperty(
      budget,
      "items",
      result.filter(
        (item) => item.columnId === "expense" && item.amount > 0,
      ) as BudgetItem[],
    );
  };
  const columns: {
    id: "expense" | "transfer";
    label: string;
    fill: HexColor;
    onClick?: () => void;
  }[] = [
    {
      id: "expense",
      label: `Expenses ${formatDollarAmount(
        calculateAmount(
          statusItems.filter((item) => item.columnId === "expense"),
        ),
      )}`,
      fill: "#14b8a6",
      onClick: () => {
        const { periodStart, periodEnd } = getCadenceStartAndEnd({
          type: "monthly",
          dayOfMonth: 1,
        });
        setCreateItem({
          id: `cat-${Math.random()}}`,
          targetAmount: 100,
          amount: 100,
          cadenceAmount: 100,
          category: {
            id: `cat-${Math.random()}}`,
            name: "",
            order: 0,
            type: "expense",
          },
          cadence: { type: "monthly", dayOfMonth: 1 },
          periodStart,
          periodEnd,
        });
      },
    },
    {
      id: "transfer",
      label: `Savings ${formatDollarAmount(
        calculateAmount(
          statusItems.filter((item) => item.columnId === "transfer"),
        ),
      )}`,
      fill: "#1679d3",
      onClick: () => {
        const { periodStart, periodEnd } = getCadenceStartAndEnd({
          type: "monthly",
          dayOfMonth: 1,
        });
        setCreateItem({
          id: `cat-${Math.random()}}`,
          targetAmount: 100,
          amount: 100,
          cadenceAmount: 100,
          category: {
            id: `cat-${Math.random()}}`,
            name: "",
            order: 0,
            type: "expense",
          },
          cadence: { type: "monthly", dayOfMonth: 1 },
          periodStart,
          periodEnd,
        });
      },
    },
  ];

  const amountLeft =
    netWorth - statusItems.reduce((prev, curr) => prev + curr.amount, 0);
  return (
    <FormSection label="Create Budget">
      <Header level={3}>Net Worth {formatDollarAmount(netWorth)}</Header>
      <Header level={4}>
        Amount Left{" "}
        <span
          className={classNames(
            amountLeft < 0 ? "text-red-400" : "text-green-600",
          )}
        >
          {formatDollarAmount(amountLeft)}
        </span>
      </Header>
      <StatusLaneContainer
        columns={columns}
        items={statusItems}
        setItems={onChangeItems}
        defaultTotal={netWorth}
      >
        {(item, isDragging) => (
          <BudgetItemCard
            setEdit={() => setEditItem({ ...item, amount: item.cadenceAmount })}
            onRemove={() => {
              changeProperty(
                budget,
                "items",
                budget.items.filter((i) => i.id !== item.id),
              );
              setCategoriesState(
                categoriesState.filter((cat) => cat.id !== item.category.id),
              );
            }}
            item={item}
            isDragging={isDragging}
          />
        )}
      </StatusLaneContainer>
      {editItem ? (
        <BudgetItemModal
          show={editItem !== null}
          item={editItem}
          onChange={(value) => {
            setEditItem(null);
            onChange(value);
          }}
          categories={categoriesState}
        />
      ) : null}
      {createItem ? (
        <CreateItemModal
          key={String(createItem?.id)}
          show={createItem !== null}
          item={createItem}
          onChange={(value) => {
            setCreateItem(null);
            onChange(value);
            setCategoriesState(
              [value.category, ...categoriesState].map((cat, i) => ({
                ...cat,
                order: i,
              })),
            );
          }}
        />
      ) : null}
    </FormSection>
  );
};

export const useCreateBudget = () => {
  const [budget] = useQueryState<Budget>({ key: budgetQueryKey });
  const { mutate: createBudget } = api.budget.createBudget.useMutation();

  const onNext = useCallback(() => {
    if (!budget) {
      return Promise.reject("No budget found");
    }

    return new Promise<void>((resolve, reject) =>
      createBudget(
        {
          budget: {
            ...budget,
            items: budget.items.map((item) => ({
              ...item,
              periodStart: new Date(item.periodStart),
              periodEnd: new Date(item.periodEnd),
            })),
          },
        },
        {
          onSuccess() {
            resolve();
          },
          onError(err) {
            reject(err.message);
          },
        },
      ),
    );
  }, [budget]);

  return onNext;
};

const BudgetItemModal: React.FunctionComponent<{
  item: BudgetItem;
  show: boolean;
  onChange: (value: BudgetItem) => void;
  categories: CategoryBudget[];
}> = ({ show, item: itemProps, onChange, categories }) => {
  const [item, setItem] = useState(itemProps);
  const onClose = () => {
    onChange(item);
  };
  return (
    <Dialog open={show} onClose={onClose}>
      <DialogTitle>{item.category.name}</DialogTitle>
      <DialogBody>
        <BudgetItemForm
          item={item}
          onChange={setItem}
          categories={categories}
        />
      </DialogBody>
    </Dialog>
  );
};

const CreateItemModal: React.FunctionComponent<{
  show: boolean;
  item: BudgetItem;
  onChange: (value: BudgetItem) => void;
}> = ({ show, item: itemProp, onChange }) => {
  const [item, setItem] = useState<BudgetItem>(itemProp);
  const onClose = () => {
    onChange(item);
  };
  return (
    <Dialog open={show} onClose={onClose}>
      <DialogTitle>Create Item</DialogTitle>
      <DialogBody>
        <BudgetItemForm item={item} onChange={setItem} categories={[]} />
      </DialogBody>
      <DialogActions>
        <Button onClick={onClose}>Save</Button>
      </DialogActions>
    </Dialog>
  );
};

const BudgetItemCard: React.FunctionComponent<{
  item: BudgetItem & { cadenceAmount: number };
  isDragging: boolean;
  setEdit: (value: boolean) => void;
  onRemove: () => void;
}> = ({ item, isDragging, setEdit, onRemove }) => {
  if (isDragging) {
    return (
      <div className="border rounded-md p-4 bg-gray-200 h-[70px]">
        <div className="invisible">Sample Text</div>
      </div>
    );
  }
  return (
    <>
      <div className="flex justify-between p-4 rounded-md bg-white border items-center">
        <div className="flex gap-2">
          <div>{item.category.name}</div>
          {item.amount > 0 ? (
            <div className="text-red-400">
              -{formatDollarAmount(item.amount)}
            </div>
          ) : null}
        </div>
        <div className="flex gap-2 items-center">
          <div>{formatDollarAmount(item.targetAmount)}</div>
          <div>{capitalizeFirstLetter(item.cadence.type)}</div>
          <Button plain onPointerDown={() => setEdit(true)}>
            Edit
          </Button>
          {item.id.includes("cat") ? (
            <Button plain onPointerDown={onRemove}>
              Remove
            </Button>
          ) : null}
        </div>
      </div>
    </>
  );
};
