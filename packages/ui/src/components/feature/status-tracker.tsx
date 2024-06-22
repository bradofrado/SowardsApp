import { CheckmarkIcon } from "../catalyst/core/icons";

export interface StatusTrackerProps {
  statuses: readonly string[];
  value: string | undefined;
  className?: string;
}
export const StatusTracker: React.FunctionComponent<StatusTrackerProps> = ({
  statuses,
  value,
  className,
}) => {
  const valueIndex = value ? statuses.indexOf(value) : statuses.length;
  if (valueIndex < 0) throw new Error("Status must contain value");
  return (
    <div className={`flex gap-4 ${className}`}>
      {statuses.map((status, i) => (
        <div className="flex flex-col items-center" key={status}>
          <div
            className={`flex rounded-full h-16 aspect-square ${
              i <= valueIndex ? "bg-primary" : "bg-gray"
            }`}
          >
            {i < valueIndex ? (
              <CheckmarkIcon className="fill-white" />
            ) : (
              <div
                className={`m-auto text-2xl ${
                  i <= valueIndex ? "text-white" : "text-gray-700"
                } font-bold`}
              >
                {i + 1}
              </div>
            )}
          </div>
          <div className="text-sm font-medium">{status}</div>
        </div>
      ))}
    </div>
  );
};
