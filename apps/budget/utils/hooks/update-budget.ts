import { Budget } from "model/src/budget";
import { api } from "next-utils/src/utils/api";

export const useUpdateBudget = () => {
  const { mutate: saveBudget } = api.budget.updateBudget.useMutation();

  const onSave = (budget: Budget): Promise<void> => {
    return new Promise<void>((resolve, reject) =>
      saveBudget(
        { budget },
        {
          onSuccess() {
            resolve();
          },
          onError() {
            reject();
          },
        },
      ),
    );
  };

  return onSave;
};
