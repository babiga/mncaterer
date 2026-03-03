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
    },
    {
      title: "Bookings",
      url: "/dashboard/bookings",
      icon: CalendarIcon,
    },
    {
      title: "Events",
      url: "/dashboard/events",
      icon: PartyPopperIcon,
    },
    {
      title: "Contents",
      url: "/dashboard/contents",
      icon: LayoutDashboardIcon,
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
      name: "Menus",
      url: "/dashboard/menus",
      icon: UtensilsIcon,
    },
    {
      name: "Chefs",
      url: "/dashboard/chefs",
      icon: UsersIcon,
    },
    {
      name: "Users",
      url: "/dashboard/users",
      icon: UsersIcon,
    },
    {
      name: "Inquiries",
      url: "/dashboard/inquiries",
      icon: MessageSquareIcon,
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
    },
    // {
    //   title: "Memberships",
    //   url: "/dashboard/memberships",
    //   icon: CrownIcon,
    // },
    {
      title: "Settings",
      url: "/dashboard/settings",
      icon: SettingsIcon,
    },
  ],
};

interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {
  user: DashboardUserWithProfile;
}

export function AppSidebar({ user, ...props }: AppSidebarProps) {
  const navUser = {
    name: user.name,
    email: user.email,
    avatar: user.avatar || "/avatars/default.png",
  };

  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarContent>
        <NavUser user={navUser} />
        <NavMain items={data.navMain} />
        <NavDocuments items={data.navManagement} />
        <NavSecondary items={data.navSecondary} />
      </SidebarContent>
    </Sidebar>
  );
}
