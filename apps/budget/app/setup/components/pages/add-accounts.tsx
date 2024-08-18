"use client";
import { Header } from "ui/src/components/core/header";
import { SetupPage } from "../register-pages";
import { ConnectExternalAccountForm } from "../../../../utils/components/totals/connect-external-form";
import { useEffect } from "react";

export const AddAccounts: SetupPage = ({ accounts, setShowNext }) => {
  useEffect(() => {
    if (accounts.length > 0) {
      setShowNext(true);
    }
  }, [accounts, setShowNext]);

  return <ConnectExternalAccountForm accounts={accounts} />;
};
