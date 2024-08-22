import { TooltipProvider } from "ui/src/components/core/tooltip";
import { ApplicationLayout } from "./application-layout";

const DashboardLayout: React.FunctionComponent<{
  children: React.ReactNode;
}> = ({ children }) => {
  return (
    <TooltipProvider>
      <ApplicationLayout>{children}</ApplicationLayout>
    </TooltipProvider>
  );
};

export default DashboardLayout;
