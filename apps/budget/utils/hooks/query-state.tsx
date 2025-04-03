"use client";
import { useRouter, useSearchParams } from "next/navigation";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { z } from "zod";

/** Stores state as search parameter json values in the url */
export function useQueryState<T = undefined>(props: {
  key: string;
  server?: boolean;
}): [T | undefined, (value: T | undefined) => void];
export function useQueryState<T>(props: {
  key: string;
  defaultValue: T;
  server?: boolean;
}): [T, (value: T) => void];
export function useQueryState<T>({
  key,
  defaultValue,
  server = false,
}: {
  key: string;
  defaultValue?: T;
  server?: boolean;
}): [T | undefined, (value: T | undefined) => void] {
  const { setSearchParam, deleteSearchParam, searchParams, addServerKey } =
    useContext(QueryStateContext);

  const setUrlValue = useCallback(
    (value: T | undefined): void => {
      const encodedValue = encodeState(value);
      //If stuff is empty, remove it from the url
      if (
        value === undefined ||
        value === "" ||
        value === null ||
        (Array.isArray(value) && value.length === 0) ||
        (typeof value === "object" && Object.keys(value).length === 0)
      ) {
        deleteSearchParam(key);
      } else {
        setSearchParam(key, encodedValue);
      }
    },
    [deleteSearchParam, setSearchParam, key],
  );

  useEffect(() => {
    if (defaultValue && !searchParams?.get(key)) {
      setUrlValue(defaultValue);
    }
  }, []);

  useEffect(() => {
    if (server) {
      addServerKey(key);
    }
  }, [server, addServerKey, key]);

  const value: T | undefined = useMemo(() => {
    if (!searchParams)
      throw new Error("Must use QueryStateProvider to use useQueryState");
    const val = searchParams.get(key);
    return val ? decodeState<T>(val) : defaultValue;
  }, [key, searchParams, defaultValue]);

  return [value, setUrlValue];
}

interface QueryStateContextType {
  url: string;
  searchParams?: URLSearchParams;
  setSearchParam: (key: string, value: string) => void;
  deleteSearchParam: (key: string) => void;
  addServerKey: (key: string) => void;
}
const QueryStateContext = createContext<QueryStateContextType>({
  url: "",
  searchParams: undefined,
  setSearchParam: () => undefined,
  deleteSearchParam: () => undefined,
  addServerKey: () => undefined,
});

export const QueryStateProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const urlRef = useRef(
    typeof window !== "undefined" ? window.location.href : "",
  );
  const [forceRerender, setForceRerender] = useState(0);
  const [serverKeys, setServerKeys] = useState<Set<string>>(new Set());

  const router = useRouter();

  const searchParams = useSearchParams();

  const setUrl = useCallback(
    (newUrl: string) => {
      const url = new URL(newUrl);
      //Removes dependency on the path so that only the search params are updated
      url.pathname = window.location.pathname;

      const hasChanged = url.href !== urlRef.current;
      urlRef.current = url.href;
      hasChanged && setForceRerender((prev) => prev + 1);
    },
    [urlRef, setForceRerender],
  );

  const setSearchParam = useCallback(
    (key: string, value: string) => {
      const url = new URL(urlRef.current);
      url.searchParams.set(key, value);
      setUrl(url.href);
    },
    [urlRef, setUrl],
  );

  const deleteSearchParam = useCallback(
    (key: string) => {
      const url = new URL(urlRef.current);
      url.searchParams.delete(key);
      setUrl(url.href);
    },
    [urlRef, setUrl],
  );

  const addServerKey = useCallback((key: string) => {
    setServerKeys((prev) => {
      const newSet = new Set(prev);
      newSet.add(key);
      return newSet;
    });
  }, []);

  //Whenever the urlRef changes, update the url
  useEffect(() => {
    if (window.location.href !== urlRef.current) {
      const url = new URL(urlRef.current);
      const path = url.pathname + url.search + url.hash;

      if (
        serverKeys.size > 0 &&
        Array.from(serverKeys).some((key) => url.searchParams.has(key))
      ) {
        router.push(path, { scroll: false });
      } else {
        window.history.pushState(null, "", path);
      }
    }
  }, [urlRef, forceRerender, router, serverKeys]);

  //Keep the urlRef up to date with the current url
  useEffect(() => {
    if (window.location.href !== urlRef.current) {
      urlRef.current = window.location.href;
    }
  }, [searchParams]);

  return (
    <QueryStateContext.Provider
      value={{
        url: urlRef.current,
        setSearchParam,
        deleteSearchParam,
        searchParams,
        addServerKey,
      }}
    >
      {children}
    </QueryStateContext.Provider>
  );
};

export const encodeState = <T,>(state: T): string => {
  if (typeof state === "string") {
    return state;
  } else if (state instanceof Date) {
    return JSON.stringify({ value: state.toISOString(), type: "date" });
  }

  return JSON.stringify(state);
};

const dateSchema = z.object({
  value: z.string(),
  type: z.literal("date"),
});
export const decodeState = <T,>(state: string): T => {
  try {
    const parsed = JSON.parse(state) as T;
    const dateResult = dateSchema.safeParse(parsed);
    if (dateResult.success) {
      return new Date(dateResult.data.value) as T;
    }

    return parsed;
  } catch {
    //If it fails to parse, then it is probably a string
    return state as T;
  }
};
