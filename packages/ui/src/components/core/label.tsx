import { Label as LabelBase, Field } from "../catalyst/fieldset";

type LabelProps = {
  className?: string;
  label: string;
  sameLine?: boolean;
} & React.PropsWithChildren;
export const Label: React.FunctionComponent<LabelProps> = ({
  children,
  className,
  label,
  sameLine,
}) => {
  return (
    <Field
      className={`${className || ""} ${sameLine ? "flex items-center" : ""}`}
    >
      <LabelBase>{label}</LabelBase>
      <div className={`${sameLine ? "ml-1" : "mt-1"} `}>{children}</div>
    </Field>
  );
};
