"use client";

import { api } from "next-utils/src/utils/api";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { usePlaidLink } from "react-plaid-link";
import { Button } from "ui/src/components/catalyst/button";
import { Alert } from "ui/src/components/core/alert";

export const PlaidLink: React.FunctionComponent<{ accessToken?: string }> = ({
  accessToken,
}) => {
  const { linkToken } = usePlaidLinkToken({ accessToken });
  const { mutate: updateAccessToken } = api.plaid.setAccessToken.useMutation();
  const [loading, setLoading] = useState(false);
  const [label, setLabel] = useState<string | undefined>();
  const router = useRouter();

  const { open } = usePlaidLink({
    onSuccess: (publicToken) => {
      //Only do public token exchange if we don't already have an access token
      if (!accessToken) {
        updateAccessToken(
          { publicToken },
          {
            onSuccess(item) {
              setLoading(false);
              router.refresh();
              setLabel("Account added successfully");
            },
          },
        );
      } else {
        router.refresh();
      }
    },
    token: linkToken,
  });

  const onClick = () => {
    setLoading(true);
    open();
  };

  return (
    <>
      <Button onClick={onClick} loading={loading || linkToken === null}>
        Add Account
      </Button>
      <Alert label={label} setLabel={setLabel} type="info" />
    </>
  );
};

const usePlaidLinkToken = ({ accessToken }: { accessToken?: string }) => {
  const [linkToken, setLinkToken] = useState<string | null>(null);
  const { mutate: createLinkToken } = api.plaid.createLinkToken.useMutation();

  useEffect(() => {
    if (linkToken === null) {
      createLinkToken(
        { accessToken },
        {
          onSuccess(linkToken) {
            setLinkToken(linkToken);
          },
        },
      );
    }
  }, [linkToken, createLinkToken, accessToken]);

  return { linkToken };
};
