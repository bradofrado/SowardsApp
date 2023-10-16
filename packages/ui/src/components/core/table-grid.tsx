import { useState } from "react";
import { compare } from "model/src/utils";
import { ChevronSwitch } from "./chevron-switch";
import { Input } from "./input";
import type { FilterChildren, FilterItem } from "./filter-button";
import { FilterButton } from "./filter-button";

export type TableGridItemValue =
  | string
  | { compareKey: string | number; label: React.ReactNode };
export type TableGridItem<T, S extends keyof T = keyof T> = {[Key in S]: TableGridItemValue};
export interface TableGridColumn<S> {
  id: S;
  label: string;
}
export type TableGridFooter<S extends string | number | symbol> = Record<S, React.ReactNode>
export interface TableGridProps<T, S extends keyof T> {
  data: T[];
	columns: TableGridColumn<S>[];
  itemsPerPage?: number;
  footer?: TableGridFooter<S> | ((data: T[]) => TableGridFooter<S>);
  onItemClick?: (item: T) => void;
  className?: string;
	search?: boolean;
	children: (item: T) => TableGridItem<T, S>
}
export const TableGrid = <T, S extends keyof T>({
  data,
  columns,
  onItemClick,
  itemsPerPage,
  footer: footerFunc,
  className,
	children,
}: TableGridProps<T, S>): JSX.Element => {
  const [sortId, setSortId] = useState<S | undefined>();
  const [sortOrder, setSortOrder] = useState<"ASC" | "DESC">("DESC");
  const [pageNum, setPageNum] = useState(1);

	const items: TableGridItem<T, S>[] = data.map(children);
	
  const totalPages = (function getTotalPages(): number {
    if (itemsPerPage !== undefined) {
      const numItems = items.length / itemsPerPage;

      return Math.floor(numItems) + (Math.floor(numItems) < numItems ? 1 : 0);
    }

    return 1;
  })();

  const getCompareKey = (item: TableGridItemValue): string | number => {
    if (typeof item === "string") return item;

    return item.compareKey;
  };

  const getLabel = (item: TableGridItemValue): React.ReactNode => {
    if (typeof item === "string") return item;

    return item.label;
  };

  const sortItems = (): TableGridItem<T, S>[] => {
    if (sortId) {
      return items.slice().sort((a, b) => {
        let first = a;
        let second = b;
        if (sortOrder === "DESC") {
          first = b;
          second = a;
        }

				const firstVal = first[sortId];
				const secondVal = second[sortId];
				
        return compare(
          getCompareKey(firstVal),
          getCompareKey(secondVal),
        );
      });
    }

    return items;
  };

  const paginateItems = (pageItems: TableGridItem<T, S>[]): TableGridItem<T, S>[] => {
    const pageNumIndexed = pageNum - 1;
    if (itemsPerPage !== undefined) {
      return pageItems.slice(
        pageNumIndexed * itemsPerPage,
        pageNumIndexed * itemsPerPage + itemsPerPage,
      );
    }

    return pageItems;
  };

  const onSortClick = (id: S): void => {
    const newSortOrder =
      sortId === undefined || sortOrder === "DESC" ? "ASC" : "DESC";
    setSortId(id);
    setSortOrder(newSortOrder);
  };

  const onRowClick = (item: T): void => {
    onItemClick && onItemClick(item);
  };

  const sorted = paginateItems(sortItems());
	const footer = typeof footerFunc === 'function' ? footerFunc(data) : footerFunc;
  return (
    <div className={`${className} flex flex-col gap-2`}>
      <div className="relative overflow-x-auto">
        <table className="w-full text-sm text-left rounded-md shadow-md overflow-hidden">
          <thead className="text-xs bg-gray dark:bg-gray-700 font-semibold">
            <tr>
              {columns.map(({ label, id }) => (
                <th className="px-4 py-1 border-b" key={label} scope="col">
                  <ChevronSwitch
                    label={label}
                    onChange={() => {
                      onSortClick(id);
                    }}
                    value={id === sortId && sortOrder === "ASC"}
                  />
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sorted.map((item, i) => (
              <tr
                className={`bg-gray-50 border-b dark:bg-gray-800 dark:border-gray-700 ${
                  onItemClick ? "hover:bg-gray-100 cursor-pointer" : ""
                }`}
                key={i}
                onClick={() => {
                  onRowClick(data[i]);
                }}
              >
                {columns.map(({ id }) => (
                  <td className="px-6 py-4" key={id.toString()}>
                    {getLabel(item[id])}
                  </td>
                ))}
              </tr>
            ))}
            {footer ? (
              <tr className="bg-gray-50 border-b dark:bg-gray-800 dark:border-gray-700">
                {columns.map(({ id }) => (
                  <td className="px-6 py-4" key={id.toString()}>
                    {footer[id]}
                  </td>
                ))}
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
      {itemsPerPage !== undefined && totalPages > 1 ? (
        <div className="flex flex-col mx-auto text-center">
          <span>
            {pageNum} of {totalPages}
          </span>
          <div>
            <button
              className="text-primary hover:text-primary-light disabled:text-primary/50"
              disabled={pageNum === 1}
              onClick={() => {
                setPageNum(pageNum > 1 ? pageNum - 1 : 1);
              }}
              type="button"
            >
              Prev
            </button>
            <span> | </span>
            <button
              className="text-primary hover:text-primary-light disabled:text-primary/50"
              disabled={pageNum === totalPages}
              onClick={() => {
                setPageNum(pageNum < totalPages ? pageNum + 1 : totalPages);
              }}
              type="button"
            >
              Next
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
};

export type FilterTableGridProps<TFilter, TTable extends Record<string, unknown>, TTableKey extends keyof TTable> = {
	search?: boolean,
	items: FilterItem<TFilter>[],
	onChange: (items: FilterItem<TFilter>[]) => void,
	getFilterContent: FilterChildren<TFilter>,
	filterFunctions: {[P in keyof TTable]?: (key: TTable[P]) => boolean;}
	filterKeys: (keyof TTable)[],
} & TableGridProps<TTable, TTableKey>

export const FilterTableGrid = <TFilter, TTable extends Record<string, unknown>, TTableKey extends keyof TTable>({search, items, onChange, getFilterContent, filterFunctions, filterKeys, ...tableProps}: FilterTableGridProps<TFilter, TTable, TTableKey>): JSX.Element => {
	const [searchKey, setSearchKey] = useState<string | undefined>();
	const filteredData = searchItems(
    filterItems<TTable, TTableKey>(tableProps.data, filterFunctions),
    searchKey,
    filterKeys,
  );
	return (
		<div className="flex flex-col gap-2">
			<div className="flex w-fit gap-2">
				{search ? <Input
					className="h-8"
					onChange={setSearchKey}
					placeholder="Search"
					value={searchKey}
				/> : null}
				<FilterButton items={items} onChange={onChange}>
					{getFilterContent}
				</FilterButton>
			</div>
			<TableGrid {...tableProps} data={filteredData}/>
		</div>
	)
}

function filterItems<T, S extends keyof T>(
  items: T[],
  filterObject: { [P in S]?: (key: T[P]) => boolean },
): T[] {
  const filterItem = (item: T): boolean => {
    for (const key in filterObject) {
      const predicate = filterObject[key];
      if (predicate && !predicate(item[key])) {
        return false;
      }
    }
    return true;
  };
  return items.filter((item) => filterItem(item));
}

function searchItems<T extends Record<string, unknown>>(
  items: T[],
  filterKey: string | undefined,
  keys?: (keyof T)[],
): T[] {
  const _getCompareKey = (value: unknown): string | number => {
    return String(value).toLowerCase();
  };
  const reduceItem = (item: T): string =>
    Object.entries(item).reduce<string>(
      (prev, [key, value]) =>
        prev +
        (keys === undefined || keys.includes(key) ? _getCompareKey(value) : ""),
      "",
    );

  return items.filter((item) =>
    reduceItem(item).includes((filterKey || "").toLowerCase()),
  );
}