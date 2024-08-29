import { getActionItems } from "api/src/services/budget";
import { FormSection } from "ui/src/components/catalyst/form/form";
import { RegisterActions } from "./register-actions";

export const ActionList: React.FunctionComponent<{ userId: string }> = async ({
  userId,
}) => {
  const actionItems = await getActionItems(userId);
  if (actionItems.length === 0) return null;
  return (
    <>
      <FormSection label="Action Items">
        <RegisterActions actionItems={actionItems} />
      </FormSection>
    </>
  );
};
