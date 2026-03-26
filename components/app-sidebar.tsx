"use client";
import * as React from "react";
import {
  ArrowUpCircleIcon,
  BriefcaseIcon,
  CalendarIcon,
  CrownIcon,
  LayoutDashboardIcon,
  PartyPopperIcon,
  MessageSquareIcon,
  SettingsIcon,
  StarIcon,
  UsersIcon,
  UtensilsIcon,
  WalletIcon,
  UserCircleIcon,
} from "lucide-react";

import { NavDocuments } from "@/components/nav-documents";
import { NavMain } from "@/components/nav-main";
import { NavSecondary } from "@/components/nav-secondary";
import { NavUser } from "@/components/nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import type { DashboardUserWithProfile } from "@/lib/auth";

const data = {
  navMain: [
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: LayoutDashboardIcon,
      hiddenFrom: [],
    },
    {
      title: "Bookings",
      url: "/dashboard/bookings",
      icon: CalendarIcon,
      hiddenFrom: ["CHEF"],
    },
    {
      title: "Events",
      url: "/dashboard/events",
      icon: PartyPopperIcon,
      hiddenFrom: ["CHEF"],
    },
    {
      title: "Contents",
      url: "/dashboard/contents",
      icon: LayoutDashboardIcon,
      hiddenFrom: ["CHEF", "COMPANY"],
    },
    // {
    //   title: "Jobs",
    //   url: "/dashboard/jobs",
    //   icon: BriefcaseIcon,
    // },
    // {
    //   title: "Profile",
    //   url: "/dashboard/profile",
    //   icon: UserCircleIcon,
    // },
  ],
  navManagement: [
    {
      name: "Food Items",
      url: "/dashboard/menu-items",
      icon: UtensilsIcon,
      hiddenFrom: ["CHEF"],
    },
    {
      name: "Menus",
      url: "/dashboard/menus",
      icon: UtensilsIcon,
      hiddenFrom: ["CHEF"],
    },
    {
      name: "Chefs",
      url: "/dashboard/chefs",
      icon: UsersIcon,
      hiddenFrom: ["CHEF"],
    },
    {
      name: "Users",
      url: "/dashboard/users",
      icon: UsersIcon,
      hiddenFrom: ["CHEF"],
    },
    {
      name: "Inquiries",
      url: "/dashboard/inquiries",
      icon: MessageSquareIcon,
      hiddenFrom: ["CHEF"],
    },
    // {
    //   name: "Finance",
    //   url: "/dashboard/finance",
    //   icon: WalletIcon,
    // },
  ],
  navSecondary: [
    {
      title: "Reviews",
      url: "/dashboard/reviews",
      icon: StarIcon,
      hiddenFrom: ["CHEF"],
    },
    // {
    //   title: "Memberships",
    //   url: "/dashboard/memberships",
    //   icon: CrownIcon,
    // },
    {
      title: "Profile",
      url: "/dashboard/profile",
      icon: UserCircleIcon,
      hiddenFrom: [],
    },
    {
      title: "Settings",
      url: "/dashboard/settings",
      icon: SettingsIcon,
      hiddenFrom: ["CHEF", "COMPANY"],
    },
  ],
};

interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {
  user: DashboardUserWithProfile;
}

import { LanguageToggler } from "@/components/language-toggler";

export function AppSidebar({ user, ...props }: AppSidebarProps) {
  const navUser = {
    name: user.name,
    email: user.email,
    avatar: user.avatar || "/avatars/default.png",
  };

  const navMainItems = data.navMain.filter((item) => !(item.hiddenFrom as string[])?.includes(user.role));
  const navManagementItems = data.navManagement.filter((item) => !(item.hiddenFrom as string[])?.includes(user.role));
  const navSecondaryItems = data.navSecondary.filter((item) => !(item.hiddenFrom as string[])?.includes(user.role));

  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarContent>
        <NavUser user={navUser} />
        {navMainItems.length > 0 && <NavMain items={navMainItems} />}
        {navManagementItems.length > 0 && <NavDocuments items={navManagementItems} />}
        {navSecondaryItems.length > 0 && <NavSecondary items={navSecondaryItems} />}
      </SidebarContent>
    </Sidebar>
  );
}
