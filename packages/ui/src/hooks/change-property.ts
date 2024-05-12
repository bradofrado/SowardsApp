
type KeysMatching<T extends object, V> = {
  [K in keyof T]-?: T[K] extends V ? K : never
}[keyof T];
interface ChangePropertyType<T extends object> {
  <K extends keyof T>(item: T, key: K, value: T[K]): T;
  function: (item: T) => void;
	formFunc: <K extends keyof T>(key: K, item: T) => (value: T[K]) => void;
  formFuncNumber: <K extends KeysMatching<T, number>>(key: K, item: T) => (value: string) => void;
}
export const useChangeProperty = <T extends object>(
  func: (item: T) => void,
): ChangePropertyType<T> => {
  const ret: ChangePropertyType<T> = <K extends keyof T>(
    item: T,
    key: K,
    value: T[K],
  ): T => {
    const copy = { ...item };
    copy[key] = value;

    func(copy);

    return copy;
  };
  ret.function = func;
	ret.formFunc = (key, item) => (value) => {
		ret(item, key, value);
	};
  ret.formFuncNumber  = (key, item) => (value) => {
    ret(item, key, Number(value) as T[typeof key]);
  }

  return ret;
};

interface ChangeArrayType<T> {
  <K extends keyof T>(items: T[], index: number, key: K, value: T[K]): T[];
  function: (items: T[]) => void;
}
export const useChangeArray = <T>(
  func: (items: T[]) => void,
): ChangeArrayType<T> => {
  const ret: ChangeArrayType<T> = <K extends keyof T>(
    items: T[],
    index: number,
    key: K,
    value: T[K],
  ): T[] => {
    const copy = items.slice();
    const item = copy[index];
    //if (item === undefined) throw new Error("Invalid index");

		const copyItem = {...item};

    copyItem[key] = value;
		copy[index] = copyItem;

    func(copy);

    return copy;
  };
  ret.function = func;

  return ret;
};