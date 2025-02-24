import { classNames } from "model/src/utils";
import { ExternalAccount } from "../../../../utils/components/totals/types";
import { BankIcon } from "ui/src/components/core/icons";

interface AccountDisplayProps {
  account: Omit<ExternalAccount, "access_token">;
  className?: string;
}
export const AccountDisplay: React.FunctionComponent<AccountDisplayProps> = ({
  account,
  className,
}) => {
  return (
    <div className={classNames("flex items-center gap-2", className)}>
      <div className="flex items-center justify-center h-10 w-10 rounded-full bg-gray-100">
        <BankIcon className="h-5 w-5 fill-[#6e6e6e]" />
      </div>
      <div className="flex flex-col">
        <div>{account.name}</div>
        <div className="text-gray-400 text-sm">
          {account.subtype} ••••{account.mask}
        </div>
      </div>
    </div>
  );
};
