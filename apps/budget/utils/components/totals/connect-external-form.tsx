"use client";
import { AccountBase } from "plaid";
import {
  Form,
  FormDivider,
  FormSection,
} from "ui/src/components/catalyst/form/form";
import { PlaidLink } from "../plaid";
import { Button } from "ui/src/components/catalyst/button";
import { BankIcon } from "ui/src/components/core/icons";
import { api } from "next-utils/src/utils/api";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { AccountDisplay } from "../../../app/(dashboard)/settings/components/account-display";
import { Alert } from "ui/src/components/core/alert";
import { ExternalAccount } from "./types";

interface ConnectExternalAccountFormProps {
  accounts: ExternalAccount[];
  onDone?: () => void;
}
export const ConnectExternalAccountForm: React.FunctionComponent<
  ConnectExternalAccountFormProps
> = ({ accounts, onDone }) => {
  return (
    <Form className="w-full">
      <FormSection label="External Accounts">
        <div className="flex flex-col gap-4">
          {accounts.map((account) => (
            <AccountItem key={account.account_id} account={account} />
          ))}
        </div>
        {accounts.length > 0 ? <FormDivider /> : null}
        <div className="flex gap-2">
          <PlaidLink />
          {onDone ? <Button onClick={onDone}>Done</Button> : null}
        </div>
      </FormSection>
    </Form>
  );
};

const AccountItem: React.FunctionComponent<{ account: ExternalAccount }> = ({
  account,
}) => {
  const { mutate: removeAccount } = api.plaid.removeAccount.useMutation();
  const [loading, setLoading] = useState(false);
  const [label, setLabel] = useState<string | undefined>();
  const router = useRouter();
  const onRemove = () => {
    setLoading(true);
    removeAccount(
      { accessToken: account.access_token },
      {
        onSuccess() {
          setLoading(false);
          router.refresh();
          setLabel("Account removed successfully");
        },
        onError() {
          setLoading(false);
        },
      },
    );
  };
  return (
    <>
      <div className="flex justify-between items-center">
        <AccountDisplay account={account} />
        <Button onClick={onRemove} loading={loading}>
          Remove
        </Button>
      </div>
      <Alert label={label} setLabel={setLabel} type="info" />
    </>
  );
};
