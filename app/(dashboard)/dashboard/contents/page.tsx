import { Metadata } from "next";
import { SiteContentsClient } from "./contents-client";

export const metadata: Metadata = {
  title: "Contents Management | Mongolian National Caterer",
  description: "Manage site banners, social links, and partners.",
};

export default async function ContentsPage() {
  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">
          Contents Management
        </h2>
      </div>
      <SiteContentsClient />
    </div>
  );
}
