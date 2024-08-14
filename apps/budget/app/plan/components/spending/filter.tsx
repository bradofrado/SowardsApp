import { SpendingRecord } from "model/src/budget";
import { displayDate } from "model/src/utils";
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
import { Label } from "ui/src/components/core/label";
import { useQueryState } from "ui/src/hooks/query-state";

const filterQueryKey = "filter";

interface FilterModalProps {
  show: boolean;
  onClose: () => void;
  onApplyFilter: (date: Date | null) => void;
}
export const FilterModal: React.FunctionComponent<FilterModalProps> = ({
  show,
  onClose,
  onApplyFilter,
}) => {
  const [filterQuery] = useFilterQueryState();
  const [date, setDate] = useState<Date | null>(filterQuery);
  const onApply = () => {
    onApplyFilter(date);
  };

  const onRemove = () => {
    onApplyFilter(null);
  };
  return (
    <Dialog open={show} onClose={onClose}>
      <DialogTitle>Filter Transactions</DialogTitle>
      <DialogDescription>
        Filter the displayed spending transactions
      </DialogDescription>
      <DialogBody>
        <Label label="Start Date">
          <DatePicker date={date} onChange={setDate} />
        </Label>
      </DialogBody>
      <DialogActions>
        <Button onClick={onRemove} plain>
          Remove
        </Button>
        <Button onClick={onApply}>Apply</Button>
      </DialogActions>
    </Dialog>
  );
};

interface FilterOptions {
  transactions: SpendingRecord[];
}
export const useFilter = ({ transactions }: FilterOptions) => {
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [filterDate, setFilterDate] = useFilterQueryState();

  const onFilterClick = (): void => {
    setShowFilterModal(true);
  };

  const onFilterModalClose = (): void => {
    setShowFilterModal(false);
  };

  const onApplyFilter = (date: Date | null): void => {
    setFilterDate(date ? new Date(displayDate(date)) : null);
    setShowFilterModal(false);
  };

  const filteredTransactions = useMemo(
    () =>
      filterDate
        ? transactions.filter((t) => t.date >= filterDate)
        : transactions,
    [transactions, filterDate],
  );

  return {
    showFilterModal,
    onFilterModalClose,
    filterDate,
    onFilterClick,
    onApplyFilter,
    filteredTransactions,
  };
};

const useFilterQueryState = () => {
  return useQueryState<Date | null>({ key: "filter", defaultValue: null });
};
