"use client";

import { useEffect, useState, use } from "react";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

import { MenuFormClient } from "@/components/menus/menu-form-client";

interface MenuPageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ mode?: "view" | "edit" }>;
}

export default function MenuDetailPage({ params, searchParams }: MenuPageProps) {
  const { id } = use(params);
  const { mode } = use(searchParams);
  const [menu, setMenu] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  const isView = mode === "view";

  useEffect(() => {
    async function fetchMenu() {
      try {
        const response = await fetch(`/api/menus/${id}`);
        const result = await response.json();

        if (result.success) {
          setMenu(result.data);
        } else {
          toast.error(result.error || "Failed to load menu");
        }
      } catch (error) {
        toast.error("An error occurred while fetching the menu");
      } finally {
        setIsLoading(false);
      }
    }

    void fetchMenu();
  }, [id]);

  if (isLoading) {
    return (
      <div className="flex h-[400px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!menu) {
    return (
      <div className="flex h-[400px] items-center justify-center flex-col gap-4">
        <p className="text-muted-foreground">Menu not found.</p>
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-4 p-4 pt-6 md:p-8">
      <MenuFormClient initialData={menu} menuId={id} isView={isView} />
    </div>
  );
}
