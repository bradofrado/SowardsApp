import { BudgetItem, TransferCategory } from "model/src/budget";
import { formatDollarAmount, isDateInBetween } from "model/src/utils";
import { api } from "next-utils/src/utils/api";
import { useMemo, useState } from "react";
import { Button } from "ui/src/components/catalyst/button";
import {
  Dialog,
  DialogActions,
  DialogBody,
  DialogDescription,
  DialogTitle,
} from "ui/src/components/catalyst/dialog";
import { DatePicker } from "ui/src/components/core/calendar/date-picker";
import { Dropdown } from "ui/src/components/core/dropdown";
import { XMarkIcon } from "ui/src/components/core/icons";
import { InputBlur } from "ui/src/components/core/input";
import { Label } from "ui/src/components/core/label";
import { useDateState } from "../../hooks/date-state";

interface TransferFundsModalProps {
  show: boolean;
  onClose: () => void;
  items: BudgetItem[];
}
export const TransferFundsModal: React.FunctionComponent<
  TransferFundsModalProps
> = ({ show, onClose, items: itemsProps }) => {
  const [items, setItems] = useState<TransferCategory[]>([]);
  const { currentDate } = useDateState();

  const [date, setDate] = useState<Date | null>(currentDate);

  const [loading, setLoading] = useState(false);
  const [transferItem, setTransferItem] = useState<{
    item: TransferCategory;
    editIndex: number | null;
  } | null>(null);
  const [error, setError] = useState("");
  const { mutate: transferFunds } = api.budget.transferFunds.useMutation();

  const currentItems = useMemo(
    () =>
      itemsProps.filter((item) =>
        isDateInBetween(date ?? new Date(), item.periodStart, item.periodEnd),
      ),
    [itemsProps, date],
  );

  const onTransfer = (): void => {
    setLoading(true);
    transferFunds(
      {
        transfers: items,
        date: date ?? new Date(),
      },
      {
        onSuccess() {
          onClose();
        },
        onError() {
          setLoading(false);
          setError("There wasn an error transferring funds");
        },
      },
    );
  };
  const onAddTransfer = (): void => {
    setTransferItem({
      item: {
        id: String(Math.random()),
        from: undefined,
        to: currentItems[0],
        amount: 0,
        date: new Date(),
      },
      editIndex: null,
    });
  };
  return (
    <>
      <Dialog open={show} onClose={onClose}>
        <DialogTitle>Transfer Funds</DialogTitle>
        <DialogDescription>
          Transfer funds from different categories to make sure every dollar is
          accounted for.
        </DialogDescription>
        <DialogBody>
          <div className="space-y-2">
            <Label label="Date">
              <DatePicker
                date={date}
                onChange={(value) => {
                  // Clear the items because they depend on the date
                  setItems([]);
                  setDate(value);
                }}
              />
            </Label>
            {items.map((item, i) => (
              <div key={i} className="flex gap-2">
                <button
                  className="flex justify-between items-center w-full border rounded-md p-2 hover:bg-gray-100"
                  onClick={() => setTransferItem({ item, editIndex: i })}
                >
                  <div className="flex p-1 gap-2">
                    <span>{item.from?.category.name ?? "Net Worth"}</span>
                    <span className="text-gray-400">to</span>
                    <span>{item.to.category.name}</span>
                  </div>
                  <span>{formatDollarAmount(item.amount)}</span>
                </button>
                <Button
                  plain
                  onClick={() =>
                    setItems((prev) => prev.filter((_, j) => j !== i))
                  }
                >
                  <XMarkIcon className="size-4" />
                </Button>
              </div>
            ))}
            <Button className="mt-1" onClick={onAddTransfer}>
              Add Transfer
            </Button>
            {error ? (
              <p className="text-red-400 text-sm mt-2">{error}</p>
            ) : null}
          </div>
        </DialogBody>
        <DialogActions>
          <Button plain onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={onTransfer} loading={loading}>
            Transfer
          </Button>
        </DialogActions>
      </Dialog>
      {currentItems[0] ? (
        <TransferItemModal
          show={transferItem !== null}
          onClose={() => setTransferItem(null)}
          onChange={(item) => {
            if (!transferItem) return;
            if (transferItem.editIndex === null) {
              setItems([...items, item]);
            } else {
              setItems([
                ...items.slice(0, transferItem.editIndex),
                item,
                ...items.slice(transferItem.editIndex + 1),
              ]);
            }
            setTransferItem(null);
          }}
          items={currentItems}
          transfer={
            transferItem?.item || {
              id: String(Math.random()),
              to: currentItems[0],
              amount: 0,
              date: new Date(),
            }
          }
          edit={transferItem?.editIndex !== null}
        />
      ) : null}
    </>
  );
};
const TransferItemModal: React.FunctionComponent<{
  transfer: TransferCategory;
  items: BudgetItem[];
  show: boolean;
  onClose: () => void;
  onChange: (transferItem: TransferCategory) => void;
  edit: boolean;
}> = ({ transfer: transferProps, items, show, onClose, onChange, edit }) => {
  const [transfer, setTransfer] = useState<TransferCategory>(transferProps);
  const onAddFrom = (item: BudgetItem | undefined): void => {
    setTransfer({
      ...transfer,
      from: item,
    });
  };
  const onAddTo = (item: BudgetItem): void => {
    setTransfer({
      ...transfer,
      to: item,
    });
  };
  return (
    <Dialog open={show} onClose={onClose}>
      <DialogTitle>Transfer</DialogTitle>
      <DialogBody>
        <Label label="From">
          {/* Item index 0 is networth, so initialValue and onChange need to account for that */}
          <Dropdown
            items={[
              { id: 0, name: "Net Worth" },
              ...items.map((item, i) => ({
                id: i + 1,
                name: item.category.name,
              })),
            ]}
            onChange={(item) =>
              item.id > 0 ? onAddFrom(items[item.id - 1]) : onAddFrom(undefined)
            }
            initialValue={
              transfer.from
                ? items.findIndex(
                    (i) => i.category.id === transfer.from?.category.id,
                  ) + 1
                : 0
            }
          >
            {transfer.from?.category.name || "Select Category"}
          </Dropdown>
        </Label>
        <Label label="To">
          <Dropdown
            items={items.map((item, i) => ({
              id: i,
              name: item.category.name,
            }))}
            onChange={(item) => onAddTo(items[item.id])}
          >
            {transfer.to.category.name}
          </Dropdown>
        </Label>
        <Label label="Amount">
          <InputBlur
            value={transfer.amount}
            onChange={(value) =>
              setTransfer({
                ...transfer,
                amount: parseFloat(value),
              })
            }
          />
        </Label>
      </DialogBody>
      <DialogActions>
        <Button plain onClick={onClose}>
          Cancel
        </Button>
        <Button onClick={() => onChange(transfer)}>
          {edit ? "Update" : "Add"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
