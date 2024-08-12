"use client";

import { api } from "next-utils/src/utils/api";
import { useRouter } from "next/navigation";
import { createContext, useContext, useEffect, useRef, useState } from "react";
import { usePlaidLink } from "react-plaid-link";
import { Button } from "ui/src/components/catalyst/button";

interface PlaidContextState {
  accessToken: string | null;
  linkToken: string | null;
  setAccessToken: (accessToken: string) => void;
}
const PlaidContext = createContext<PlaidContextState>({
  accessToken: null,
  setAccessToken: () => undefined,
  linkToken: null,
});
export const usePlaid = () => {
  return useContext(PlaidContext);
};

export const PlaidProvider: React.FunctionComponent<{
  children: React.ReactNode;
}> = ({ children }) => {
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const { linkToken } = usePlaidLinkToken();

  return (
    <PlaidContext.Provider value={{ accessToken, setAccessToken, linkToken }}>
      {children}
    </PlaidContext.Provider>
  );
};

export const PlaidLink: React.FunctionComponent = () => {
  const { linkToken, setAccessToken } = usePlaid();
  const { mutate: updateAccessToken } = api.plaid.setAccessToken.useMutation();
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const { open } = usePlaidLink({
    onSuccess: (publicToken) => {
      updateAccessToken(
        { publicToken },
        {
          onSuccess(item) {
            setLoading(false);
            setAccessToken(item.accessToken);
            localStorage.removeItem("linkToken");
            router.refresh();
          },
        },
      );
    },
    token: linkToken,
  });

  const onClick = () => {
    setLoading(true);
    open();
  };

  return (
    <Button onClick={onClick} loading={loading || linkToken === null}>
      Add Account
    </Button>
  );
};

const usePlaidLinkToken = () => {
  const [linkToken, setLinkToken] = useState<string | null>(null);
  const { mutate: createLinkToken } = api.plaid.createLinkToken.useMutation();

  useEffect(() => {
    if (linkToken === null) {
      const storageLinkToken = localStorage.getItem("linkToken");
      if (storageLinkToken) {
        setLinkToken(storageLinkToken);
      } else {
        createLinkToken(undefined, {
          onSuccess(linkToken) {
            setLinkToken(linkToken);
            localStorage.setItem("linkToken", linkToken);
          },
        });
      }
    }
  }, [linkToken, createLinkToken]);

  return { linkToken };
};
