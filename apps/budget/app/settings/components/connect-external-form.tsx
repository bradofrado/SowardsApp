"use client";
import { AccountBase } from "plaid";
import {
  Form,
  FormDivider,
  FormSection,
} from "ui/src/components/catalyst/form/form";
import { PlaidLink } from "./plaid";
import { Button } from "ui/src/components/catalyst/button";
import { BankIcon } from "ui/src/components/core/icons";
import { api } from "next-utils/src/utils/api";
import { useState } from "react";
import { useRouter } from "next/navigation";

type ExternalAccount = AccountBase & { access_token: string };
interface ConnectExternalAccountFormProps {
  accounts: ExternalAccount[];
}
export const ConnectExternalAccountForm: React.FunctionComponent<
  ConnectExternalAccountFormProps
> = ({ accounts }) => {
  return (
    <Form>
      <FormSection label="External Accounts">
        <div className="flex flex-col gap-4">
          {accounts.map((account) => (
            <AccountItem key={account.account_id} account={account} />
          ))}
        </div>
        {accounts.length > 0 ? <FormDivider /> : null}
        <PlaidLink />
      </FormSection>
    </Form>
  );
};

const AccountItem: React.FunctionComponent<{ account: ExternalAccount }> = ({
  account,
}) => {
  const { mutate: removeAccount } = api.plaid.removeAccount.useMutation();
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const onRemove = () => {
    setLoading(true);
    removeAccount(
      { accessToken: account.access_token },
      {
        onSuccess() {
          setLoading(false);
          router.refresh();
        },
        onError() {
          setLoading(false);
        },
      },
    );
  };
  return (
    <div className="flex justify-between items-center">
      <div className="flex items-center gap-2">
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
      <Button onClick={onRemove} loading={loading}>
        Remove
      </Button>
    </div>
  );
};
