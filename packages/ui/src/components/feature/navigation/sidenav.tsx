import { useExpand } from "../../../hooks/expand";
import { HamburgerIcon } from "../../catalyst/core/icons";
import { SidePanel, type SidePanelItems } from "../../catalyst/core/side-panel";

export type SideNavComponentProps = {
  items: SidePanelItems[];
  className?: string;
  path: string;
  title?: string;
  profileContent?: React.ReactNode;
} & React.PropsWithChildren;
export const SideNavComponent: React.FunctionComponent<
  SideNavComponentProps
> = ({ children, items, className, path, title, profileContent }) => {
  const { onExpand, expandClass } = useExpand(
    "translate-x-0",
    "-translate-x-full",
  );

  return (
    <>
      <button
        aria-controls="default-sidebar"
        className="inline-flex items-center p-2 mt-2 ml-3 text-sm text-gray-500 rounded-lg sm:hidden hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-200 dark:text-gray-400 dark:hover:bg-gray-700 dark:focus:ring-gray-600"
        onClick={() => {
          onExpand();
        }}
        type="button"
      >
        <span className="sr-only">Open sidebar</span>
        <HamburgerIcon className="w-6 h-6" />
      </button>

      <SidePanel
        bottomContent={profileContent}
        className={`${className || ""} ${expandClass}`}
        items={items}
        onBodyClick={() => {
          onExpand(false);
        }}
        path={path}
        title={title}
      >
        {children}
      </SidePanel>
    </>
  );
};
