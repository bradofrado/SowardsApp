"use client";

import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { TrpcProvider } from "next-utils/src/utils/trpc-provider";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <TrpcProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        {children}
      </TooltipProvider>
    </TrpcProvider>
  );
}
