"use client";
import { ActionItem } from "api/src/services/budget";
import { Project, ProjectList } from "ui/src/components/core/project-list";
import { TransferFundsModal } from "./transfer-funds";
import { useState } from "react";
import { BudgetItem } from "model/src/budget";

interface RegisterActionsProps {
  actionItems: ActionItem[];
}
export const RegisterActions: React.FunctionComponent<RegisterActionsProps> = ({
  actionItems,
}) => {
  const [transferItems, setTransferItems] = useState<{
    items: BudgetItem[];
  } | null>(null);
  const projects: Project[] = actionItems.map<Project>((item, i) => ({
    id: i,
    title: item.title,
    subtitle: item.description,
    status: "In progress",
    buttonText: "View Item",
    onButtonClick: () => {
      setTransferItems({
        items: item.action.items,
      });
    },
  }));

  return (
    <>
      <ProjectList items={projects} />
      {transferItems ? (
        <TransferFundsModal
          key={[...transferItems.items].map((i) => i.id).join()}
          show={transferItems !== null}
          onClose={() => setTransferItems(null)}
          items={transferItems.items}
        />
      ) : null}
    </>
  );
};
