type LabelProps = {
  className?: string;
  label: string;
  sameLine?: boolean;
} & React.PropsWithChildren;
export const Label: React.FunctionComponent<LabelProps> = ({ children, className, label, sameLine }) => {
  return (
    <div
      className={`${className || ""} ${
        sameLine ? "flex items-center" : ""
      }`}
    >
      <label className="block font-medium">{label}:</label>
      <div className={`${sameLine ? "ml-1" : "mt-1"} `}>{children}</div>
    </div>
  );
};
