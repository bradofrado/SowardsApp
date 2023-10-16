export type FunctionType = (...args: unknown[]) => unknown;
export type Subscriber<T extends FunctionType> = (func: T) => void;
export interface UseSubscriberProps<T extends FunctionType> {
  subscriber: Subscriber<T>;
  emit: FunctionType;
}
export const useSubscriber = <
  T extends FunctionType,
>(): UseSubscriberProps<T> => {
  const subscriptions: T[] = [];

  return {
    subscriber: (func: T) => {
      subscriptions.push(func);
    },
    emit: (args: unknown) => {
      subscriptions.forEach((func) => func(args));
    },
  };
};
