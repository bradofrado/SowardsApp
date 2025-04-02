import { Header } from "ui/src/components/core/header";
import { SetupPage } from "../register-pages";
import { FormSection, FormRow } from "ui/src/components/catalyst/form/form";
import { Input } from "ui/src/components/core/input";
import { use, useCallback, useEffect, useState } from "react";
import { api } from "next-utils/src/utils/api";
import { UserVacation } from "model/src/vacation";
import { useQueryState } from "../../../../utils/hooks/query-state";

export const CreateUser: SetupPage = ({ setShowNext, user }) => {
  const [name, setName] = useQueryState({
    key: "name",
    defaultValue: user?.name ?? "",
  });

  useEffect(() => {
    if (name) {
      setShowNext(true);
    } else {
      setShowNext(false);
    }
  }, [name, setShowNext]);

  return (
    <FormSection label="User Account">
      <FormRow label="Name" description="The name of your plinq account">
        <Input className="h-fit" value={name} onChange={setName} />
      </FormRow>
    </FormSection>
  );
};

export const useCreateUser = ({ user }: { user: UserVacation | undefined }) => {
  const [name] = useQueryState({ key: "name", defaultValue: "" });
  const { mutate: createUser } = api.account.createAccount.useMutation();
  const { mutate: updateUser } = api.account.updateAccount.useMutation();
  const onNext = useCallback(() => {
    return new Promise<void>((resolve, reject) => {
      const func: (
        input: { account: { name: string } },
        methods: {
          onSuccess: () => void;
          onError: (error: { message: string }) => void;
        },
      ) => void = user ? updateUser : createUser;
      func(
        { account: { name } },
        {
          onSuccess: () => resolve(),
          onError(error) {
            reject(error.message);
          },
        },
      );
    });
  }, [name, createUser, updateUser, user]);

  return { onNext };
};
