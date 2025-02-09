import { BudgetItem, TransferCategory } from "model/src/budget";
import { formatDollarAmount } from "model/src/utils";
import { api } from "next-utils/src/utils/api";
import { useState } from "react";
import { Button } from "ui/src/components/catalyst/button";
import {
  Dialog,
  DialogActions,
  DialogBody,
  DialogDescription,
  DialogTitle,
} from "ui/src/components/catalyst/dialog";
import { Dropdown } from "ui/src/components/core/dropdown";
import { InputBlur } from "ui/src/components/core/input";
import { Label } from "ui/src/components/core/label";

interface TransferFundsModalProps {
  show: boolean;
  onClose: () => void;
  items: BudgetItem[];
}
export const TransferFundsModal: React.FunctionComponent<
  TransferFundsModalProps
> = ({ show, onClose, items: itemsProps }) => {
  const [items, setItems] = useState<TransferCategory[]>([]);
  const [loading, setLoading] = useState(false);
  const [transferItem, setTransferItem] = useState<{
    item: TransferCategory;
    editIndex: number | null;
  } | null>(null);
  const [error, setError] = useState("");
  const { mutate: transferFunds } = api.budget.transferFunds.useMutation();
  const onTransfer = (): void => {
    setLoading(true);
    transferFunds(
      {
        transfers: items,
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
        to: itemsProps[0],
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
          {items.map((item, i) => (
            <div key={i} className="flex flex-col gap-2 mt-4 p-0">
              <div className="flex justify-between items-center w-full border rounded-md p-2">
                <div className="flex p-1 gap-2">
                  <span>{item.from?.category.name ?? "Net Worth"}</span>
                  <span className="text-gray-400">to</span>
                  <span>{item.to.category.name}</span>
                </div>
                <span>{formatDollarAmount(item.amount)}</span>
              </div>
            </div>
          ))}
          <Button onClick={onAddTransfer}>Add Transfer</Button>

          {error ? <p className="text-red-400 text-sm mt-2">{error}</p> : null}
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
        items={itemsProps}
        transfer={
          transferItem?.item || {
            id: String(Math.random()),
            to: itemsProps[0],
            amount: 0,
            date: new Date(),
          }
        }
      />
    </>
  );
};
const TransferItemModal: React.FunctionComponent<{
  transfer: TransferCategory;
  items: BudgetItem[];
  show: boolean;
  onClose: () => void;
  onChange: (transferItem: TransferCategory) => void;
}> = ({ transfer: transferProps, items, show, onClose, onChange }) => {
  const [transfer, setTransfer] = useState<TransferCategory>(transferProps);
  const onAddFrom = (item: BudgetItem): void => {
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
          <Dropdown
            items={items.map((item, i) => ({
              id: i,
              name: item.category.name,
            }))}
            onChange={(item) => onAddFrom(items[item.id])}
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
        <Button onClick={() => onChange(transfer)}>Add</Button>
      </DialogActions>
    </Dialog>
  );
};
