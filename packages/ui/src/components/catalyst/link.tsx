/* eslint-disable jsx-a11y/anchor-has-content -- ok*/
import * as Headless from "@headlessui/react";
import React, { forwardRef } from "react";

export const Link = forwardRef(function Link(
  props: React.ComponentPropsWithoutRef<"a">,
  ref: React.ForwardedRef<HTMLAnchorElement>,
) {
  return (
    <Headless.DataInteractive>
      <a {...props} ref={ref} />
    </Headless.DataInteractive>
  );
});
