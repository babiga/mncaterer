"use client";

import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/toaster";
import { PwaInitializer } from "@/components/pwa/pwa-initializer";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <TooltipProvider>
      <PwaInitializer />
      <Toaster />
      {children}
    </TooltipProvider>
  );
}
