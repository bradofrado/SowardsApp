import { XMarkIcon } from "./icons";

export type PillMode = "primary" | "secondary" | "error" | "success";
export interface PillProps {
  children: string;
  className?: string;
  mode?: PillMode;
  onClose?: () => void;
}
export const Pill: React.FunctionComponent<PillProps> = ({
  children,
  className,
  mode = "primary",
  onClose
}) => {
  const backgrounds: Record<PillMode, string> = {
    primary: "bg-primary-light text-primary",
    secondary: "bg-white text-gray-800 border",
    error: "bg-red-300/60 text-red-600",
    success: "bg-[#66b1eb]/20 text-[#318bd0]",
  };
  const background = backgrounds[mode];
  return (
    <div
      className={`${
        className || ""
      } ${background} flex items-center justify-between rounded-full px-3 py-1 text-xs font-semibold leading-5`}
    >
      {children}
      {onClose ? <button type="button" onClick={onClose}><XMarkIcon className="h-3 w-4"/></button> : null}
    </div>
  );
};
