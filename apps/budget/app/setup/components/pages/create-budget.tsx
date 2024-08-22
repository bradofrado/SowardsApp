"use client";
import { Header } from "ui/src/components/core/header";
import { SetupPage } from "../register-pages";
import { ConnectExternalAccountForm } from "../../../../utils/components/totals/connect-external-form";
import React, { SetStateAction, useEffect, useMemo, useState } from "react";
import { FormSection } from "ui/src/components/catalyst/form/form";
import {
  BudgetForm,
  BudgetItemForm,
} from "../../../../utils/components/budget/budget-form";
import { ProgressBarMultiValue } from "ui/src/components/feature/reporting/graphs/progressbar-multivalue";
import { StatusLaneContainer } from "ui/src/components/feature/reporting/status-lane";
import { Budget, BudgetItem, CategoryBudget } from "model/src/budget";
import { Card } from "ui/src/components/core/card";
import { useChangeProperty } from "ui/src/hooks/change-property";
import { HexColor } from "model/src/core/colors";
import { useAccountTotals } from "../../../../utils/hooks/account-totals";
import { formatDollarAmount } from "model/src/utils";
import { Button } from "ui/src/components/catalyst/button";
import {
  Dialog,
  DialogActions,
  DialogBody,
  DialogTitle,
} from "ui/src/components/catalyst/dialog";
import { usePrevious } from "ui/src/hooks/previous";

export const CreateBudget: SetupPage = ({
  accounts,
  setShowNext,
  categories,
}) => {
  const { netWorth } = useAccountTotals(accounts);
  const [budget, setBudget] = useState<Budget>({
    id: "",
    items: [],
    name: "My Budget",
  });
  const changeProperty = useChangeProperty<Budget>(setBudget);
  const [editItem, setEditItem] = useState<BudgetItem | null>(null);
  const [showCreateItem, setShowCreateItem] = useState(false);
  const [categoriesState, setCategoriesState] = useState(categories);
  const prevCategories = usePrevious(categories);
  useEffect(() => {
    if (prevCategories !== categories) {
      setCategoriesState(categories);
    }
  }, [categories, prevCategories]);

  const onChange = (value: BudgetItem) => {
    if (budget.items.find((item) => item.id === value.id)) {
      changeProperty(
        budget,
        "items",
        budget.items.map((item) => (item.id === value.id ? value : item)),
      );
      return;
    }

    changeProperty(budget, "items", [...budget.items, value]);
  };

  const statusItems = useMemo(
    () =>
      categoriesState
        .map<BudgetItem & { columnId: "expense" | "transfer" | "nothing" }>(
          (category) => {
            const item = budget.items.find(
              (item) => item.category.id === category.id,
            );
            if (!item) {
              return {
                id: category.id,
                amount: 0,
                columnId: "nothing",
                cadence: { type: "monthly", dayOfMonth: 1 },
                category,
              };
            }
            return {
              ...item,
              columnId:
                category.type === "income" || item.amount === 0
                  ? "nothing"
                  : category.type,
            };
          },
        )
        .sort((a, b) => a.category.order - b.category.order),
    [budget.items, categoriesState],
  );

  const onChangeItems: React.Dispatch<
    SetStateAction<
      (BudgetItem & { columnId: "expense" | "transfer" | "nothing" })[]
    >
  > = (action) => {
    const result = Array.isArray(action) ? action : action(statusItems);

    result.forEach((item, i) => {
      if (item.columnId === "nothing") {
        item.amount = 0;
      } else {
        item.category.type = item.columnId;
        if (item.amount <= 0) {
          item.amount = 100;
        }
      }
      item.category.order = i;
    });
    changeProperty(budget, "items", result);
  };
  const columns: {
    id: "expense" | "transfer" | "nothing";
    label: string;
    fill: HexColor;
    onClick?: () => void;
  }[] = [
    {
      id: "nothing",
      label: "None",
      fill: "#e2e8f0",
      onClick: () => setShowCreateItem(true),
    },
    {
      id: "expense",
      label: "Expenses",
      fill: "#14b8a6",
    },
    {
      id: "transfer",
      label: "Savings",
      fill: "#1679d3",
    },
  ];
  return (
    <FormSection label="Create Budget">
      <Header level={3}>Net Worth {formatDollarAmount(netWorth)}</Header>
      <StatusLaneContainer
        columns={columns}
        items={statusItems}
        setItems={onChangeItems}
        defaultTotal={netWorth}
      >
        {(item, isDragging) => (
          <BudgetItemCard
            setEdit={() => setEditItem(item)}
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
      <CreateItemModal
        key={String(showCreateItem)}
        show={showCreateItem}
        onChange={(value) => {
          setShowCreateItem(false);
          onChange(value);
          setCategoriesState(
            [value.category, ...categoriesState].map((cat, i) => ({
              ...cat,
              order: i,
            })),
          );
        }}
      />
    </FormSection>
  );
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
  onChange: (value: BudgetItem) => void;
}> = ({ show, onChange }) => {
  const [item, setItem] = useState<BudgetItem>({
    id: `cat-${Math.random()}${Math.random()}`,
    amount: 0,
    category: {
      id: `cat-${Math.random()}${Math.random()}`,
      name: "",
      order: 0,
      type: "expense",
    },
    cadence: { type: "monthly", dayOfMonth: 1 },
  });
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
  item: BudgetItem;
  isDragging: boolean;
  setEdit: (value: boolean) => void;
}> = ({ item, isDragging, setEdit }) => {
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
        <div>{item.category.name}</div>
        <div className="flex gap-2 items-center">
          <div>{formatDollarAmount(item.amount)}</div>
          <Button plain onPointerDown={() => setEdit(true)}>
            Edit
          </Button>
        </div>
      </div>
    </>
  );
};
