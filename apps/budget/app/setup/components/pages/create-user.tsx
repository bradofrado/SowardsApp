import { Header } from "ui/src/components/core/header";
import { SetupPage } from "../register-pages";
import { FormSection, FormRow } from "ui/src/components/catalyst/form/form";
import { Input } from "ui/src/components/core/input";
import { use, useCallback, useEffect, useState } from "react";
import { api } from "next-utils/src/utils/api";
import { useQueryState } from "ui/src/hooks/query-state";

export const CreateUser: SetupPage = ({ setShowNext }) => {
  const [name, setName] = useQueryState({ key: "name", defaultValue: "" });

  useEffect(() => {
    if (name) {
      setShowNext(true);
    } else {
      setShowNext(false);
    }
  }, [name, setShowNext]);

  return (
    <>
      <div className="text-center">
        <Header level={1}>Welcome to plinq!</Header>
        <p className="mt-4 text-muted-foreground text-left">
          First, create your user account.
        </p>
      </div>
      <FormSection label="User Account">
        <FormRow label="Name" description="The name of your plinq account">
          <Input className="h-fit" value={name} onChange={setName} />
        </FormRow>
      </FormSection>
    </>
  );
};

export const useCreateUser = () => {
  const [name] = useQueryState({ key: "name", defaultValue: "" });
  const { mutate: createUser } = api.account.createAccount.useMutation();
  const onNext = useCallback(() => {
    return new Promise<void>((resolve, reject) =>
      createUser(
        { account: { name } },
        {
          onSuccess: () => resolve(),
          onError: (error) => reject(error),
        },
      ),
    );
  }, [name, createUser]);

  return { onNext };
};
