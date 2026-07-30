"use client";
import {
  Dialog,
  DialogBody,
  DialogDescription,
  DialogTitle,
} from "ui/src/components/catalyst/dialog";
import { PlaidLink } from "./plaid";

export const UpdateItemModal: React.FunctionComponent<{
  accessToken: string;
  open?: boolean;
  onClose?: () => void;
}> = ({ accessToken, open = true, onClose = () => undefined }) => {
  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Update Account Login</DialogTitle>
      <DialogDescription>
        One or more of your accounts needs you to reauthenticate
      </DialogDescription>
      <DialogBody>
        <PlaidLink accessToken={accessToken} />
      </DialogBody>
    </Dialog>
  );
};
