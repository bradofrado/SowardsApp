import { useState } from "react";
import { getClass } from "model/src/utils";

export interface TabItem {
  label: string;
  component: React.ReactElement;
  id: string | number;
}

interface TabControlProps {
  items: TabItem[];
  className?: string;
}

export const TabControl: React.FunctionComponent<TabControlProps> = ({
  items,
  className,
}) => {
  const [selected, setSelected] = useState<string | number>(items[0]?.id ?? -1);

  const selectedComponent = items.find((item) => item.id === selected)
    ?.component;
  if (!selectedComponent) {
    throw new Error(`Could not find tab component with id ${selected}`);
  }

  const onTabSelect = (id: string | number): void => {
    setSelected(id);
  };

  return (
    <div className={className}>
      <div className="text-sm font-medium text-center border-b border-gray-200 dark:text-gray-400 dark:border-gray-700">
        <ul className="flex flex-wrap -mb-px font-semibold text-2xl">
          {items.map((item, i) => (
            <li className="mr-2" key={i}>
              <button
                className={getClass(
                  "inline-block px-4 py-2 border-b-2 rounded-t-lg outline-none",
                  selected === item.id
                    ? "border-b-4 border-primary rounded-t-lg active dark:text-primary-light dark:border-primary-light"
                    : "border-transparent hover:border-gray-300 dark:hover:text-gray-300",
                )}
                onClick={() => {
                  onTabSelect(item.id);
                }}
                type="button"
              >
                {item.label}
              </button>
            </li>
          ))}
        </ul>
      </div>
      <div className="mt-8 mx-2">{selectedComponent}</div>
    </div>
  );
};
