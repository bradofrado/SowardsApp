import { Button } from "ui/src/components/catalyst/button";
import {
  Dialog,
  DialogActions,
  DialogBody,
  DialogDescription,
  DialogTitle,
} from "ui/src/components/catalyst/dialog";
import {
  Form,
  FormDivider,
  FormRow,
} from "ui/src/components/catalyst/form/form";
import { Input, InputBlur } from "ui/src/components/core/input";
import { CategoryPicker } from "./category-picker";
import { useState } from "react";
import { CategoryBudget, SpendingRecord } from "model/src/budget";
import { useChangeProperty } from "ui/src/hooks/change-property";
import { DatePicker } from "ui/src/components/core/calendar/date-picker";
import { api } from "next-utils/src/utils/api";
import { useRouter } from "next/navigation";
import { AccountBase } from "plaid";

interface EditTransactionModalBaseProps {
  show: boolean;
  onClose: () => void;
  categories: CategoryBudget[];
  accounts?: AccountBase[];
}
export const AddTransactionModal: React.FunctionComponent<
  EditTransactionModalBaseProps
> = (props) => {
  const { mutate: saveTransaction } = api.plaid.saveTransaction.useMutation();

  const onSave = async (transaction: SpendingRecord): Promise<void> => {
    return new Promise<void>((resolve, reject) =>
      saveTransaction(
        { transaction },
        {
          onSuccess() {
            props.onClose();
            resolve();
          },
          onError(error) {
            reject(error.message);
          },
        },
      ),
    );
  };
  return (
    <EditTransactionModal
      {...props}
      label="Add Transaction"
      description="Add a new transaction"
      transaction={{
        amount: 0,
        transactionCategories: [],
        date: new Date(),
        recordDate: new Date(),
        transactionId: "",
        description: "",
        accountId: null,
        isTransfer: false,
      }}
      onSave={onSave}
    />
  );
};

export const UpdateTransactionModal: React.FunctionComponent<
  EditTransactionModalBaseProps & { transaction: SpendingRecord | undefined }
> = (props) => {
  const { mutate: updateTransaction } =
    api.plaid.updateTransaction.useMutation();

  const { mutate: deleteTransaction } =
    api.plaid.deleteTransaction.useMutation();

  const onSave = async (transaction: SpendingRecord): Promise<void> => {
    return new Promise<void>((resolve, reject) =>
      updateTransaction(
        { transaction },
        {
          onSuccess() {
            props.onClose();
            resolve();
          },
          onError(error) {
            reject(error.message);
          },
        },
      ),
    );
  };

  const onDelete = async (transaction: SpendingRecord): Promise<void> => {
    return new Promise<void>((resolve, reject) =>
      deleteTransaction(
        { transactionId: transaction.transactionId },
        {
          onSuccess() {
            props.onClose();
            resolve();
          },
          onError(error) {
            reject(error.message);
          },
        },
      ),
    );
  };

  if (!props.transaction) return null;

  return (
    <EditTransactionModal
      key={props.transaction.transactionId}
      label="Update Transaction"
      description="Update the transaction"
      {...props}
      transaction={props.transaction}
      onSave={onSave}
      onDelete={onDelete}
    />
  );
};

interface EditTransactionModalProps extends EditTransactionModalBaseProps {
  transaction: SpendingRecord;
  onSave: (transaction: SpendingRecord) => Promise<void>;
  onDelete?: (transaction: SpendingRecord) => Promise<void>;
  label: string;
  description: string;
}
const EditTransactionModal: React.FunctionComponent<
  EditTransactionModalProps
> = ({
  show,
  onClose,
  onDelete,
  categories,
  accounts = [],
  transaction: transactionProps,
  onSave: onSaveProps,
  label,
  description,
}) => {
  const [transaction, setTransaction] =
    useState<SpendingRecord>(transactionProps);
  const changeProperty = useChangeProperty<SpendingRecord>(setTransaction);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const account = accounts.find(
    (acc) => acc.account_id === transaction.accountId
  );

  const onSave = () => {
    if (transaction.transactionCategories.length === 0) {
      setError("Please select a category");
      return;
    }

    setLoading(true);
    onSaveProps(transaction)
      .then(() => {
        setLoading(false);
        router.refresh();
      })
      .catch((error: string) => {
        setError(error);
        setLoading(false);
      });
  };

  const onDeleteClick = (): void => {
    if (!onDelete) return;

    setLoading(true);
    onDelete(transaction)
      .then(() => {
        setLoading(false);
        router.refresh();
      })
      .catch((error: string) => {
        setError(error);
        setLoading(false);
      });
  };

  return (
    <Dialog open={show} onClose={onClose} size="2xl">
      <DialogTitle>{label}</DialogTitle>
      <DialogDescription>{description}</DialogDescription>
      <DialogBody>
        <Form>
          {account && (
            <>
              <FormRow
                label="Source"
                description="The account this transaction is from"
              >
                <div className="flex items-center gap-2">
                  <div className="flex flex-col">
                    <div className="text-sm font-medium">{account.name}</div>
                    <div className="text-xs text-gray-500">
                      {account.subtype} ••••{account.mask}
                    </div>
                  </div>
                </div>
              </FormRow>
              <FormDivider />
            </>
          )}
          {!account && transaction.accountId === null && (
            <>
              <FormRow
                label="Source"
                description="The account this transaction is from"
              >
                <span className="text-sm text-gray-500">Manual Transaction</span>
              </FormRow>
              <FormDivider />
            </>
          )}
          <FormRow label="Amount" description="The amount of the transaction">
            <InputBlur
              value={transaction.amount}
              onChange={(value) => {
                const ret = changeProperty.formFuncNumber(
                  "amount",
                  transaction,
                )(value);
                changeProperty(
                  ret,
                  "transactionCategories",
                  transaction.transactionCategories.map((c) => ({
                    ...c,
                    amount: Number(value),
                  })),
                );
              }}
            />
          </FormRow>
          <FormDivider />
          <FormRow label="Name" description="The name of the transaction">
            <Input
              value={transaction.description}
              onChange={changeProperty.formFunc("description", transaction)}
            />
          </FormRow>
          <FormDivider />
          <FormRow
            label="Category"
            description="The category of the transaction"
            sameLine
          >
            <CategoryPicker
              values={transaction.transactionCategories}
              onChange={(category) =>
                changeProperty(transaction, "transactionCategories", [
                  {
                    id: "",
                    amount: transaction.amount,
                    category,
                    transactionId: transaction.transactionId,
                  },
                ])
              }
              categories={categories}
            />
          </FormRow>
          <FormDivider />
          <FormRow label="Date" description="The date of the transaction">
            <DatePicker
              date={transaction.date}
              onChange={changeProperty.formFunc("date", transaction)}
            />
          </FormRow>
        </Form>
        {error ? <p className="text-sm text-red-400 mt-4">{error}</p> : null}
      </DialogBody>
      <DialogActions>
        <Button onClick={onClose} plain>
          Cancel
        </Button>
        {onDelete ? (
          <Button onClick={onDeleteClick} plain>
            Delete
          </Button>
        ) : null}
        <Button onClick={onSave} loading={loading}>
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
};
