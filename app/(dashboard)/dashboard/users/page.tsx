"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";

import { UsersDataTable } from "@/components/users/users-data-table";
import {
  getCustomersColumns,
  type Customer,
} from "@/components/users/customers-columns";
import {
  getDashboardUsersColumns,
  type DashboardUser,
} from "@/components/users/dashboard-users-columns";
import { CustomerFormSheet } from "@/components/users/customer-form-sheet";
import { DashboardUserFormSheet } from "@/components/users/dashboard-user-form-sheet";
import { DeleteUserDialog } from "@/components/users/delete-user-dialog";

export default function UsersPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  // State for data
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [dashboardUsers, setDashboardUsers] = useState<DashboardUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // State for customer sheet
  const [customerSheetOpen, setCustomerSheetOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(
    null
  );
  const [customerSheetMode, setCustomerSheetMode] = useState<"view" | "edit">(
    "view"
  );

  // State for dashboard user sheet
  const [dashboardUserSheetOpen, setDashboardUserSheetOpen] = useState(false);
  const [selectedDashboardUser, setSelectedDashboardUser] =
    useState<DashboardUser | null>(null);
  const [dashboardUserSheetMode, setDashboardUserSheetMode] = useState<
    "create" | "edit" | "view"
  >("view");

  // State for delete dialog
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<{
    id: string;
    name: string;
    email: string;
    type: "customer" | "dashboard";
  } | null>(null);

  const isAdmin = user?.role === "ADMIN";

  // Fetch data
  useEffect(() => {
    async function fetchData() {
      try {
        const [sessionRes, customersRes, dashboardUsersRes] = await Promise.all([
          fetch("/api/auth/me"),
          fetch("/api/users?limit=100"),
          fetch("/api/dashboard-users?limit=100"),
        ]);

        const sessionData = await sessionRes.json();
        const customersData = await customersRes.json();
        const dashboardUsersData = await dashboardUsersRes.json();

        if (sessionData.success) {
          setUser(sessionData.data);
        }
        if (customersData.success) {
          setCustomers(customersData.data);
        }
        if (dashboardUsersData.success) {
          setDashboardUsers(dashboardUsersData.data);
        }
      } catch {
        toast.error("Failed to load users");
      } finally {
        setIsLoading(false);
      }
    }

    fetchData();
  }, []);

  // Customer handlers
  const handleViewCustomer = useCallback((customer: Customer) => {
    router.push(`/dashboard/users/customer/${customer.id}`);
  }, [router]);

  const handleEditCustomer = useCallback((customer: Customer) => {
    setSelectedCustomer(customer);
    setCustomerSheetMode("edit");
    setCustomerSheetOpen(true);
  }, []);

  const handleDeleteCustomer = useCallback((customer: Customer) => {
    setUserToDelete({
      id: customer.id,
      name: customer.name,
      email: customer.email,
      type: "customer",
    });
    setDeleteDialogOpen(true);
  }, []);

  const handleCustomerSuccess = useCallback((updatedCustomer: Customer) => {
    setCustomers((prev) =>
      prev.map((c) => (c.id === updatedCustomer.id ? updatedCustomer : c))
    );
  }, []);

  // Dashboard user handlers
  const handleViewDashboardUser = useCallback((user: DashboardUser) => {
    router.push(`/dashboard/users/dashboard/${user.id}`);
  }, [router]);

  const handleEditDashboardUser = useCallback((user: DashboardUser) => {
    setSelectedDashboardUser(user);
    setDashboardUserSheetMode("edit");
    setDashboardUserSheetOpen(true);
  }, []);

  const handleDeleteDashboardUser = useCallback((user: DashboardUser) => {
    setUserToDelete({
      id: user.id,
      name: user.name,
      email: user.email,
      type: "dashboard",
    });
    setDeleteDialogOpen(true);
  }, []);

  const handleToggleActive = useCallback(async (user: DashboardUser) => {
    try {
      const response = await fetch(`/api/dashboard-users/${user.id}/activate`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !user.isActive }),
      });

      const result = await response.json();

      if (!result.success) {
        toast.error(result.error || "Failed to update status");
        return;
      }

      setDashboardUsers((prev) =>
        prev.map((u) => (u.id === user.id ? result.data : u))
      );
      toast.success(
        result.data.isActive
          ? "User activated successfully"
          : "User deactivated successfully"
      );
    } catch {
      toast.error("Something went wrong");
    }
  }, []);

  const handleToggleVerify = useCallback(async (user: DashboardUser) => {
    try {
      const response = await fetch(`/api/dashboard-users/${user.id}/verify`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isVerified: !user.isVerified }),
      });

      const result = await response.json();

      if (!result.success) {
        toast.error(result.error || "Failed to update verification");
        return;
      }

      setDashboardUsers((prev) =>
        prev.map((u) => (u.id === user.id ? result.data : u))
      );
      toast.success(
        result.data.isVerified
          ? "User verified successfully"
          : "User unverified successfully"
      );
    } catch {
      toast.error("Something went wrong");
    }
  }, []);

  const handleAddDashboardUser = useCallback(() => {
    setSelectedDashboardUser(null);
    setDashboardUserSheetMode("create");
    setDashboardUserSheetOpen(true);
  }, []);

  const handleDashboardUserSuccess = useCallback((user: DashboardUser) => {
    if (dashboardUserSheetMode === "create") {
      setDashboardUsers((prev) => [user, ...prev]);
    } else {
      setDashboardUsers((prev) =>
        prev.map((u) => (u.id === user.id ? user : u))
      );
    }
  }, [dashboardUserSheetMode]);

  // Delete handler
  const handleDeleteConfirmed = useCallback(() => {
    if (!userToDelete) return;

    if (userToDelete.type === "customer") {
      setCustomers((prev) => prev.filter((c) => c.id !== userToDelete.id));
    } else {
      setDashboardUsers((prev) => prev.filter((u) => u.id !== userToDelete.id));
    }
    setUserToDelete(null);
  }, [userToDelete]);

  // Memoized columns
  const customersColumns = useMemo(
    () =>
      getCustomersColumns({
        onView: handleViewCustomer,
        onEdit: handleEditCustomer,
        onDelete: handleDeleteCustomer,
        role: user?.role,
      }),
    [handleViewCustomer, handleEditCustomer, handleDeleteCustomer, user?.role]
  );

  const dashboardUsersColumns = useMemo(
    () =>
      getDashboardUsersColumns({
        onView: handleViewDashboardUser,
        onEdit: handleEditDashboardUser,
        onDelete: handleDeleteDashboardUser,
        onToggleActive: handleToggleActive,
        onToggleVerify: handleToggleVerify,
        role: user?.role,
      }),
    [
      handleViewDashboardUser,
      handleEditDashboardUser,
      handleDeleteDashboardUser,
      handleToggleActive,
      handleToggleVerify,
      user?.role,
    ]
  );

  if (isLoading) {
    return (
      <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
        <div className="px-4 lg:px-6">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="mt-2 h-4 w-64" />
        </div>
        <div className="px-4 lg:px-6">
          <Skeleton className="h-10 w-64 mb-4" />
          <div className="space-y-2">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
      {/* Header */}
      <div className="px-4 lg:px-6">
        <h1 className="text-2xl font-bold">Users Management</h1>
        <p className="text-muted-foreground">
          Manage customers and dashboard users
        </p>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="customers" className="px-4 lg:px-6">
        <TabsList>
          <TabsTrigger value="customers" className="gap-2">
            Customers
            <Badge variant="secondary" className="ml-1">
              {customers.length}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="dashboard-users" className="gap-2">
            Dashboard Users
            <Badge variant="secondary" className="ml-1">
              {dashboardUsers.length}
            </Badge>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="customers" className="mt-4">
          <UsersDataTable
            columns={customersColumns}
            data={customers}
            searchPlaceholder="Search customers..."
            filterColumn="userType"
            filterOptions={[
              { label: "Individual", value: "INDIVIDUAL" },
              { label: "Corporate", value: "CORPORATE" },
            ]}
          />
        </TabsContent>

        <TabsContent value="dashboard-users" className="mt-4">
          <UsersDataTable
            columns={dashboardUsersColumns}
            data={dashboardUsers}
            searchPlaceholder="Search dashboard users..."
            filterColumn="role"
            filterOptions={[
              { label: "Admin", value: "ADMIN" },
              { label: "Chef", value: "CHEF" },
              { label: "Company", value: "COMPANY" },
            ]}
            showAddButton={isAdmin}
            addButtonLabel={isAdmin ? "Add User" : undefined}
            onAddUser={isAdmin ? handleAddDashboardUser : undefined}
          />
        </TabsContent>
      </Tabs>

      {/* Customer Sheet */}
      <CustomerFormSheet
        open={customerSheetOpen}
        onOpenChange={setCustomerSheetOpen}
        customer={selectedCustomer}
        mode={customerSheetMode}
        onSuccess={handleCustomerSuccess}
      />

      {/* Dashboard User Sheet */}
      <DashboardUserFormSheet
        open={dashboardUserSheetOpen}
        onOpenChange={setDashboardUserSheetOpen}
        user={selectedDashboardUser}
        mode={dashboardUserSheetMode}
        onSuccess={handleDashboardUserSuccess}
      />

      {/* Delete Dialog */}
      {userToDelete && (
        <DeleteUserDialog
          open={deleteDialogOpen}
          onOpenChange={setDeleteDialogOpen}
          user={userToDelete}
          userType={userToDelete.type}
          onDeleted={handleDeleteConfirmed}
        />
      )}
    </div>
  );
}
