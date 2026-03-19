import { MenuFormClient } from "@/components/menus/menu-form-client";

export const metadata = {
  title: "Create Menu | Dashboard",
  description: "Create a new service menu and manage its food items.",
};

export default function CreateMenuPage() {
  return (
    <div className="flex-1 space-y-4 p-4 pt-6 md:p-8">
      <MenuFormClient />
    </div>
  );
}
