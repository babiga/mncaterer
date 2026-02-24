"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SiteContentTable } from "./contents-table";

export function SiteContentsClient() {
  const [activeTab, setActiveTab] = useState<
    "BANNER" | "SOCIAL_LINK" | "PARTNER"
  >("BANNER");

  return (
    <div className="space-y-4">
      <Tabs
        value={activeTab}
        onValueChange={(val) => setActiveTab(val as any)}
        className="w-full"
      >
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="BANNER">{"Banners"}</TabsTrigger>
          <TabsTrigger value="SOCIAL_LINK">{"Social Links"}</TabsTrigger>
          <TabsTrigger value="PARTNER">{"Partners"}</TabsTrigger>
        </TabsList>
        <TabsContent value="BANNER" className="mt-6">
          <SiteContentTable type="BANNER" />
        </TabsContent>
        <TabsContent value="SOCIAL_LINK" className="mt-6">
          <SiteContentTable type="SOCIAL_LINK" />
        </TabsContent>
        <TabsContent value="PARTNER" className="mt-6">
          <SiteContentTable type="PARTNER" />
        </TabsContent>
      </Tabs>
    </div>
  );
}
