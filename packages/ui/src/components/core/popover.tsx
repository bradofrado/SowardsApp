"use client";

import * as React from "react";
import * as PopoverPrimitive from "@radix-ui/react-popover";
import clsx from "clsx";
import { AllOrNothing } from "model/src/core/utils";

const PopoverBase = PopoverPrimitive.Root;

const PopoverTrigger = PopoverPrimitive.Trigger;

const PopoverContent = React.forwardRef<
  React.ElementRef<typeof PopoverPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof PopoverPrimitive.Content>
>(({ className, align = "center", sideOffset = 4, ...props }, ref) => (
  <PopoverPrimitive.Portal>
    <PopoverPrimitive.Content
      ref={ref}
      align={align}
      sideOffset={sideOffset}
      className={clsx(
        "overflow-auto border border-gray-300 rounded-md shadow-lg mt-2 z-10 bg-white text-popover-foreground outline-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
        className,
      )}
      {...props}
    />
  </PopoverPrimitive.Portal>
));
PopoverContent.displayName = PopoverPrimitive.Content.displayName;

type PopoverProps = React.PropsWithChildren<
  {
    button: React.ReactNode;
    className?: string;
  } & AllOrNothing<{ isOpen: boolean; setIsOpen: (value: boolean) => void }>
>;
export const Popover: React.FunctionComponent<PopoverProps> = ({
  button,
  className,
  children,
}) => {
  return (
    <PopoverBase>
      <PopoverTrigger asChild>
        <div className="h-fit">{button}</div>
      </PopoverTrigger>
      <PopoverContent className={className}>{children}</PopoverContent>
    </PopoverBase>
  );
};
