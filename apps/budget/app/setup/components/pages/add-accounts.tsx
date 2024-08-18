"use client";
import { Header } from "ui/src/components/core/header";
import { SetupPage } from "../register-pages";
import { ConnectExternalAccountForm } from "../../../components/connect-external-form";
import { useEffect, useState } from "react";
import { FormRow, FormSection } from "ui/src/components/catalyst/form/form";
import { Label } from "ui/src/components/core/label";
import { Input } from "ui/src/components/core/input";

export const AddAccounts: SetupPage = ({ accounts, setShowNext }) => {
  const [name, setName] = useState("");
  useEffect(() => {
    if (accounts.length > 0) {
      setShowNext(true);
    }
  }, [accounts, setShowNext]);

  return (
    <>
      <div className="text-center">
        <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
          Welcome to plinq
        </h1>
        <p className="mt-4 text-muted-foreground text-left">
          To get started, enter in your account information and connect your
          external accounts (bank accounts, credit carts, etc.)
        </p>
      </div>
      <FormSection label="Account">
        <FormRow label="Name" description="The name of your account">
          <Input className="h-fit" value={name} onChange={setName} />
        </FormRow>
      </FormSection>
      <ConnectExternalAccountForm accounts={accounts} />
    </>
  );
};
