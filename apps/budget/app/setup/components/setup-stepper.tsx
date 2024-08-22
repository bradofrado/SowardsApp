"use client";

import { useEffect, useMemo, useState } from "react";
import { usePages } from "./register-pages";
import { ExternalAccount } from "../../../utils/components/totals/connect-external-form";
import { Button } from "ui/src/components/catalyst/button";
import { useRouter } from "next/navigation";
import { useQueryState } from "ui/src/hooks/query-state";
import { usePrevious } from "ui/src/hooks/previous";
import { ProgressStep, StepperProgress } from "./stepper-progress";
import { Header } from "ui/src/components/core/header";
import { UserVacation } from "model/src/vacation";
import { CategoryBudget } from "model/src/budget";

interface SetupStepperProps {
  accounts: ExternalAccount[];
  categories: CategoryBudget[];
  user: UserVacation | undefined;
}
export const SetupStepper: React.FunctionComponent<SetupStepperProps> = ({
  accounts,
  categories,
  user,
}) => {
  const [currPage, setCurrPage] = useQueryState({
    key: "page",
    defaultValue: 0,
  });
  const [loading, setLoading] = useState(false);
  const [loadingDone, setLoadingDone] = useState(false);
  const previousPage = usePrevious(currPage);
  const [showNext, setShowNext] = useState(false);
  const pagesProps = useMemo(
    () => ({ user, accounts, setShowNext, categories }),
    [user, accounts, setShowNext, categories],
  );
  const pages = usePages(pagesProps);
  const page = useMemo(() => pages[currPage], [currPage, pages]);
  const router = useRouter();
  const pageSteps: ProgressStep[] = useMemo(
    () =>
      pages.map<ProgressStep>((page, i) => ({
        id: `Step ${i + 1}`,
        name: page.title,
        status:
          i < currPage ? "complete" : i === currPage ? "current" : "upcoming",
        //href: `/setup?page=${i}`,
      })),
    [pages, currPage],
  );

  useEffect(() => {
    if (previousPage !== currPage) {
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
    setLoadingDone(true);
    router.push("/");
  };

  return (
    <div className="flex flex-col min-h-[100dvh] bg-background px-4 py-12 sm:px-6 lg:px-8">
      <StepperProgress
        className="mx-auto max-w-xl w-full mb-4"
        steps={pageSteps}
      />
      <div className="flex flex-col items-center justify-center flex-1">
        <div
          className="mx-auto w-full max-w-xl space-y-6"
          style={{ maxWidth: page.maxWidth }}
        >
          <div className="text-center">
            <Header level={1}>{page.dynamicTitle || page.title}</Header>
            <p className="mt-4 text-muted-foreground text-left">
              {page.description}
            </p>
          </div>
          <page.component {...pagesProps} />
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
                <Button plain onClick={onDone} loading={loadingDone}>
                  Done
                </Button>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
