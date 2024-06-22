import { useState } from "react";
import { ChevronLeftIcon, ChevronRightIcon } from "../../catalyst/core/icons";

export const PagedDocumentViewer: React.FunctionComponent<{
  children: (page: number, setPage: (page: number) => void) => React.ReactNode;
}> = ({ children }) => {
  const [page, setPage] = useState(1);
  const [numPages, setNumPages] = useState<number>(1);

  const setThePage = (newPage: number): void => {
    if (newPage <= numPages && newPage >= 1) {
      setPage(newPage);
    }
  };

  return (
    <div className="flex gap-2 justify-center">
      {numPages > 1 ? (
        <button
          onClick={() => {
            setThePage(page - 1);
          }}
          type="button"
        >
          <ChevronLeftIcon className="w-5 h-5" />
        </button>
      ) : null}
      <div>
        <div className="text-center text-white">
          Page {page} of {numPages}
        </div>
        {children(page, setNumPages)}
      </div>
      {numPages > 1 ? (
        <button
          onClick={() => {
            setThePage(page + 1);
          }}
          type="button"
        >
          <ChevronRightIcon className="w-5 h-5" />
        </button>
      ) : null}
    </div>
  );
};
