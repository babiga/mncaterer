"use client";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface UserStatusBadgeProps {
  type: "active" | "verified" | "role" | "userType" | "taxStatus";
  value: boolean | string;
  className?: string;
}

export function UserStatusBadge({
  type,
  value,
  className,
}: UserStatusBadgeProps) {
  if (type === "active") {
    return (
      <Badge
        variant="outline"
        className={cn(
          value
            ? "border-green-500/50 bg-green-500/10 text-green-700 dark:text-green-400"
            : "border-red-500/50 bg-red-500/10 text-red-700 dark:text-red-400",
          className
        )}
      >
        {value ? "Active" : "Inactive"}
      </Badge>
    );
  }

  if (type === "verified") {
    return (
      <Badge
        variant="outline"
        className={cn(
          value
            ? "border-blue-500/50 bg-blue-500/10 text-blue-700 dark:text-blue-400"
            : "border-gray-500/50 bg-gray-500/10 text-gray-600 dark:text-gray-400",
          className
        )}
      >
        {value ? "Verified" : "Unverified"}
      </Badge>
    );
  }

  if (type === "role") {
    const roleStyles: Record<string, string> = {
      ADMIN:
        "border-purple-500/50 bg-purple-500/10 text-purple-700 dark:text-purple-400",
      CHEF: "border-orange-500/50 bg-orange-500/10 text-orange-700 dark:text-orange-400",
      COMPANY:
        "border-cyan-500/50 bg-cyan-500/10 text-cyan-700 dark:text-cyan-400",
    };

    return (
      <Badge
        variant="outline"
        className={cn(roleStyles[value as string] || "", className)}
      >
        {value}
      </Badge>
    );
  }

  if (type === "userType") {
    const typeStyles: Record<string, string> = {
      INDIVIDUAL:
        "border-emerald-500/50 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
      CORPORATE:
        "border-indigo-500/50 bg-indigo-500/10 text-indigo-700 dark:text-indigo-400",
    };

    return (
      <Badge
        variant="outline"
        className={cn(typeStyles[value as string] || "", className)}
      >
        {value}
      </Badge>
    );
  }

  if (type === "taxStatus") {
    const taxStyles: Record<string, string> = {
      PAID: "border-green-500/50 bg-green-500/10 text-green-700 dark:text-green-400",
      PENDING: "border-amber-500/50 bg-amber-500/10 text-amber-700 dark:text-amber-400",
      WAIVED: "border-blue-500/50 bg-blue-500/10 text-blue-700 dark:text-blue-400",
    };

    return (
      <Badge
        variant="outline"
        className={cn(taxStyles[value as string] || "", className)}
      >
        {value}
      </Badge>
    );
  }

  return null;
}
