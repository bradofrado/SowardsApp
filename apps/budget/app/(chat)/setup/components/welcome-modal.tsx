"use client";

import {
  Dialog,
  DialogActions,
  DialogBody,
  DialogDescription,
  DialogTitle,
} from "ui/src/components/catalyst/dialog";
import {
  ConnectExternalAccountForm,
  ExternalAccount,
} from "../../../../utils/components/totals/connect-external-form";
import { Button } from "ui/src/components/catalyst/button";

interface WelcomeModalProps {
  show: boolean;
  accounts: ExternalAccount[];
}
export const WelcomeModal: React.FunctionComponent<WelcomeModalProps> = ({
  show,
  accounts,
}) => {
  const onDone = () => {
    window.location.href = "/?setup-complete=true";
  };

  return (
    <Dialog open={show} onClose={() => undefined}>
      <DialogTitle>Welcome to plinq</DialogTitle>
      <DialogDescription>
        To get started, connect your external accounts (bank accounts, credit
        carts, etc.)
      </DialogDescription>
      <DialogBody>
        <ConnectExternalAccountForm accounts={accounts} />
      </DialogBody>
      <DialogActions>
        {accounts.length > 0 ? <Button onClick={onDone}>Done</Button> : null}
      </DialogActions>
    </Dialog>
  );
};
