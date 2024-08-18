"use client";

import { useEffect, useMemo, useState } from "react";
import { usePages } from "./register-pages";
import { ExternalAccount } from "../../../utils/components/totals/connect-external-form";
import { Button } from "ui/src/components/catalyst/button";
import { useRouter } from "next/navigation";
import { useQueryState } from "ui/src/hooks/query-state";
import { usePrevious } from "ui/src/hooks/previous";

interface SetupStepperProps {
  accounts: ExternalAccount[];
}
export const SetupStepper: React.FunctionComponent<SetupStepperProps> = ({
  accounts,
}) => {
  const [currPage, setCurrPage] = useQueryState({
    key: "page",
    defaultValue: 0,
  });
  const [loading, setLoading] = useState(false);
  const previousPage = usePrevious(currPage);
  const [showNext, setShowNext] = useState(false);
  const pages = usePages();
  const page = useMemo(() => pages[currPage], [currPage, pages]);
  const router = useRouter();

  useEffect(() => {
    if (previousPage !== undefined && previousPage !== currPage) {
      setShowNext(pages[currPage].defaultShowNext ?? true);
    }
  }, [currPage, pages, previousPage]);

  const onNext = (): void => {
    setLoading(true);
    const onNextPage = pages[currPage].onNext;
    (onNextPage?.() ?? Promise.resolve())
      .then(() => {
        if (currPage < pages.length - 1) {
          setCurrPage(currPage + 1);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
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
      <div className="mx-auto w-full max-w-xl space-y-6">
        <page.component accounts={accounts} setShowNext={setShowNext} />
        <div className="flex justify-between">
          {currPage > 0 ? (
            <Button plain onClick={onBack}>
              Back
            </Button>
          ) : null}
          <div className="ml-auto h-9">
            {showNext && currPage < pages.length - 1 ? (
              <Button plain onClick={onNext} loading={loading}>
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
    </div>
  );
};
