import { useMemo, useState, type FC } from "react";

import { ConnectExternalAccountForm } from "@/utils/components/totals/connect-external-form";
import {
  type ToolCallName,
  type ToolCall,
} from "@/lib/ai/tools/budget-workflow.utils";
import { api } from "next-utils/src/utils/api";
import { TransactionTotals } from "@/utils/components/totals/transaction-totals";
import { AccountTotals } from "@/utils/components/totals/account-totals";
import { Card } from "ui/src/components/core/card";
import { Confetti } from "@/utils/components/totals/confetti";
import {
  MonthlyTotals,
  useMonthlyTotals,
} from "@/utils/components/totals/monthly-totals";
import { Button } from "../ui/button";
import { BudgetForm } from "@/utils/components/budget/budget-form";
import { Budget, CategoryBudget } from "model/src/budget";
import { createBudgetFromBudgetTool } from "@/lib/budget-item";

type ToolCallComponentArgs<NAME extends ToolCallName> =
  ToolCall[NAME]["parameters"]["_type"];
type ToolCallComponentResult<NAME extends ToolCallName = ToolCallName> =
  Exclude<ToolCall[NAME]["resultParameters"], undefined>["_type"];

type ToolCallComponent<NAME extends ToolCallName = ToolCallName> = FC<{
  toolCallId: string;
  toolName: NAME;
  args: ToolCallComponentArgs<NAME>;
  addToolResult?: ({
    toolCallId,
    result,
  }: {
    toolCallId: string;
    result: ToolCallComponentResult<NAME>;
  }) => void;
}>;

const ConnectBankAccountToolCall: ToolCallComponent<"connectBankAccount"> = ({
  toolCallId,
  args,
  addToolResult,
}) => {
  const { data: accounts } = api.budget.getExternalAccounts.useQuery();
  return (
    <ConnectExternalAccountForm
      accounts={accounts ?? []}
      onDone={
        addToolResult
          ? () => {
              addToolResult({
                toolCallId,
                result: {},
              });
            }
          : undefined
      }
    />
  );
};

const CalculateFinanceTotalsToolCall: ToolCallComponent<
  "calculateFinanceTotals"
> = ({ toolCallId, addToolResult }) => {
  // useOnce(() => {
  //   addToolResult?.({
  //     toolCallId,
  //     result: {},
  //   });
  // }, !!addToolResult);

  return (
    <>
      <div className="flex flex-col gap-2 mt-4">
        <AccountTotals future />
        <Card className="flex-1" label="Monthly Totals">
          <TransactionTotals label="" type="income" />
        </Card>
        <MonthlyTotals />
      </div>
      <Confetti />
      <Button
        onClick={() =>
          addToolResult?.({
            toolCallId,
            result: {},
          })
        }
      >
        Done
      </Button>
    </>
  );
};

const CreateBudgetToolCall: ToolCallComponent<"createBudgetTool"> = ({
  toolCallId,
  args: { budgetName, budgetItems },
  addToolResult,
}) => {
  const categoryTotals = useMonthlyTotals();
  const categories = useMemo(
    () => categoryTotals.map(({ category }) => category),
    [categoryTotals],
  );

  const [budget, setBudget] = useState<Budget>(
    createBudgetFromBudgetTool(
      { budgetName, budgetItems },
      categoryTotals,
      categories,
    ),
  );

  const budgetCategories = useMemo(() => {
    return budget.items.map<CategoryBudget>((item) => item.category);
  }, [budget]);

  return (
    <>
      <BudgetForm
        budget={budget}
        onChange={setBudget}
        categories={budgetCategories}
      />
      <Button
        onClick={() => addToolResult?.({ toolCallId, result: { budget } })}
      >
        Done
      </Button>
    </>
  );
};

export const toolCallComponents: Record<ToolCallName, ToolCallComponent> = {
  connectBankAccount: ConnectBankAccountToolCall,
  calculateFinanceTotals: CalculateFinanceTotalsToolCall,
  createBudgetTool: CreateBudgetToolCall,
};
