import { classNames } from "model/src/utils";

type HyperlinkComponentProps = React.ComponentPropsWithoutRef<"a">;
export const Hyperlink = ({
  className,
  children,
  ...rest
}: HyperlinkComponentProps) => {
  return (
    <a
      {...rest}
      className={classNames(
        className,
        "font-semibold leading-6 text-primary hover:text-opacity-80 cursor-pointer",
      )}
    >
      {children}
    </a>
  );
};
