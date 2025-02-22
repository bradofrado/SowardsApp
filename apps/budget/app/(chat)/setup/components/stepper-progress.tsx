export interface ProgressStep {
  id: string;
  name: string;
  href?: string;
  status: "complete" | "current" | "upcoming";
}

interface StepperProgressProps {
  steps: ProgressStep[];
  className?: string;
}
export const StepperProgress: React.FunctionComponent<StepperProgressProps> = ({
  steps,
  className,
}) => {
  return (
    <nav className={className} aria-label="Progress">
      <ol role="list" className="space-y-4 md:flex md:space-x-8 md:space-y-0">
        {steps.map((step) => (
          <li key={step.name} className="md:flex-1">
            {step.status === "complete" ? (
              <div
                //href={step.href}
                className="group flex flex-col border-l-4 border-primary py-2 pl-4  md:border-l-0 md:border-t-4 md:pb-0 md:pl-0 md:pt-4"
              >
                <span className="text-sm font-medium text-primary ">
                  {step.id}
                </span>
                <span className="text-sm font-medium">{step.name}</span>
              </div>
            ) : step.status === "current" ? (
              <div
                //href={step.href}
                aria-current="step"
                className="flex flex-col border-l-4 border-primary py-2 pl-4 md:border-l-0 md:border-t-4 md:pb-0 md:pl-0 md:pt-4"
              >
                <span className="text-sm font-medium text-primary">
                  {step.id}
                </span>
                <span className="text-sm font-medium">{step.name}</span>
              </div>
            ) : (
              <div
                //href={step.href}
                className="group flex flex-col border-l-4 border-gray-200 py-2 pl-4  md:border-l-0 md:border-t-4 md:pb-0 md:pl-0 md:pt-4"
              >
                <span className="text-sm font-medium text-gray-500 ">
                  {step.id}
                </span>
                <span className="text-sm font-medium">{step.name}</span>
              </div>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
};
