import { XMarkIcon } from "./icons";

export interface ClosableContentProps {
  onClose: () => void;
  children: React.ReactNode;
  className: string | undefined;
  xMarkClassName?: string;
}
export const ClosableContent: React.FunctionComponent<ClosableContentProps> = ({
  onClose,
  children,
  className,
  xMarkClassName,
}) => {
  return (
    <div className={`relative ${className}`}>
      <div className="absolute top-0 right-0">
        <button className="hover:opacity-50" onClick={onClose} type="button">
          <XMarkIcon className={xMarkClassName || "w-4 h-4"} />
        </button>
      </div>
      {children}
    </div>
  );
};
