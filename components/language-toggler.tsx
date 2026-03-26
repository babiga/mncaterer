"use client";

import { useLanguage } from "@/components/language-context";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Globe } from "lucide-react";

export function LanguageToggler() {
  const { language, setLanguage } = useLanguage();

  return (
    <div className="flex items-center gap-1 p-2 bg-sidebar-accent/50 rounded-lg">
      <Globe className="w-4 h-4 mr-2 text-muted-foreground" />
      <Button
        type="button"
        variant="ghost"
        size="sm"
        className={cn(
          "h-7 px-2 text-xs",
          language === "en" ? "bg-primary text-white" : "text-muted-foreground"
        )}
        onClick={() => setLanguage("en")}
      >
        EN
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        className={cn(
          "h-7 px-2 text-xs",
          language === "mn" ? "bg-primary text-white" : "text-muted-foreground"
        )}
        onClick={() => setLanguage("mn")}
      >
        МН
      </Button>
    </div>
  );
}
