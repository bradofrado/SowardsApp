import { ApplicationLayout } from "./application-layout";

const DashboardLayout: React.FunctionComponent<{
  children: React.ReactNode;
}> = ({ children }) => {
  return <ApplicationLayout>{children}</ApplicationLayout>;
};

export default DashboardLayout;
