import { classNames } from 'model/src/utils';
import clsx from 'clsx';
import { Divider } from '../divider';
import { Heading, Subheading } from '../heading';
import { Text } from '../text';

interface FormProps {
  children: React.ReactNode;
  className?: string;
  onSubmit?: (event: React.FormEvent<HTMLFormElement>) => void;
}
export const Form: React.FunctionComponent<FormProps> = ({
  children,
  onSubmit,
  className,
}) => {
  return (
    <form
      className={classNames('mx-auto max-w-4xl', className)}
      method="post"
      onSubmit={onSubmit}
    >
      {children}
    </form>
  );
};

interface FormSectionProps {
  label: string;
  children: React.ReactNode;
  button?: React.ReactNode;
}
export const FormSection: React.FunctionComponent<FormSectionProps> = ({
  label,
  children,
  button,
}) => {
  return (
    <>
      <div className="flex justify-between">
        <Heading>{label}</Heading>
        {button ?? <div />}
      </div>

      <Divider className="my-10" soft />
      {children}
    </>
  );
};

interface FormRowProps {
  label: string;
  description: string;
  children: React.ReactNode;
  sameLine?: boolean;
}
export const FormRow: React.FunctionComponent<FormRowProps> = ({
  label,
  description,
  children,
  sameLine = false,
}) => {
  return (
    <section
      className={clsx('grid gap-x-8 gap-y-6', sameLine ? '' : 'sm:grid-cols-2')}
    >
      <div className="space-y-1">
        <Subheading>{label}</Subheading>
        {description ? <Text>{description}</Text> : null}
      </div>
      {children}
    </section>
  );
};

export const FormDivider: React.FunctionComponent<{ className?: string }> = ({
  className,
}) => {
  return <Divider className={classNames('my-10', className)} soft />;
};
