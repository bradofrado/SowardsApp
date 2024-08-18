"use client";

import { useMemo, useState } from "react";
import { pages } from "./register-pages";
import { ExternalAccount } from "../../components/connect-external-form";
import { Button } from "ui/src/components/catalyst/button";
import { useRouter } from "next/navigation";

interface SetupStepperProps {
  accounts: ExternalAccount[];
}
export const SetupStepper: React.FunctionComponent<SetupStepperProps> = ({
  accounts,
}) => {
  const [currPage, setCurrPage] = useState(0);
  const [showNext, setShowNext] = useState(false);
  const page = useMemo(() => pages[currPage], [currPage]);
  const router = useRouter();

  const onNext = (): void => {
    if (currPage < pages.length - 1) {
      setCurrPage(currPage + 1);
    }
  };

  const onBack = (): void => {
    if (currPage > 0) {
      setCurrPage(currPage - 1);
    }
  };

  const onDone = (): void => {
    router.push("/");
  };

  return (
    <div className="flex min-h-[100dvh] flex-col items-center justify-center bg-background px-4 py-12 sm:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-md space-y-6">
        <page.component accounts={accounts} setShowNext={setShowNext} />
        <div className="flex justify-between">
          {currPage > 0 ? (
            <Button plain onClick={onBack}>
              Back
            </Button>
          ) : null}
          {showNext && currPage < pages.length - 1 ? (
            <Button plain onClick={onNext}>
              Next
            </Button>
          ) : null}
          {currPage === pages.length - 1 && showNext ? (
            <Button plain onClick={onDone}>
              Done
            </Button>
          ) : null}
        </div>
      </div>
    </div>
  );
};
