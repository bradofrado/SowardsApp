import { Divider } from "../divider";
import { Heading, Subheading } from "../heading";
import { Text } from "../text";

interface FormProps {
  children: React.ReactNode;
  onSubmit?: (event: React.FormEvent<HTMLFormElement>) => void;
}
export const Form: React.FunctionComponent<FormProps> = ({
  children,
  onSubmit,
}) => {
  return (
    <form method="post" className="mx-auto max-w-4xl" onSubmit={onSubmit}>
      {children}
    </form>
  );
};

interface FormSectionProps {
  label: string;
  children: React.ReactNode;
}
export const FormSection: React.FunctionComponent<FormSectionProps> = ({
  label,
  children,
}) => {
  return (
    <>
      <Heading>{label}</Heading>

      <Divider className="my-10" soft />
      {children}
    </>
  );
};

interface FormRowProps {
  label: string;
  description: string;
  children: React.ReactNode;
}
export const FormRow: React.FunctionComponent<FormRowProps> = ({
  label,
  description,
  children,
}) => {
  return (
    <section className="grid gap-x-8 gap-y-6 sm:grid-cols-2">
      <div className="space-y-1">
        <Subheading>{label}</Subheading>
        {description ? <Text>{description}</Text> : null}
      </div>
      {children}
    </section>
  );
};

export const FormDivider: React.FunctionComponent = () => {
  return <Divider className="my-10" soft />;
};
