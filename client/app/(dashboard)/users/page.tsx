"use client";

import { useUsers } from "@/lib/hooks/useUsers";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle, Users as UsersIcon, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useState } from "react";

export default function UsersPage() {
  const [search, setSearch] = useState("");
  const { data, isLoading, error } = useUsers({
    search: search || undefined,
    isActive: "true",
  });

  const formatDate = (dateString?: string) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Users</h1>
        <p className="mt-2 text-muted-foreground">
          View and manage all users in the system
        </p>
      </div>

      {/* Search Bar */}
      <Card>
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search users by name or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Loading State */}
      {isLoading && (
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-32" />
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-center gap-4">
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-48" />
                    <Skeleton className="h-3 w-64" />
                  </div>
                  <Skeleton className="h-6 w-20" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Error State */}
      {error && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col items-center justify-center py-12">
              <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">
                Failed to load users
              </h3>
              <p className="text-muted-foreground text-center max-w-md">
                {error instanceof Error
                  ? error.message
                  : "An error occurred while fetching users"}
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Users Table */}
      {!isLoading && !error && data && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <UsersIcon className="h-5 w-5" />
                All Users
              </CardTitle>
              <Badge variant="secondary">{data.users.length} users</Badge>
            </div>
          </CardHeader>
          <CardContent>
            {data.users.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12">
                <UsersIcon className="h-12 w-12 text-muted-foreground/50 mb-3" />
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  No users found
                </h3>
                <p className="text-muted-foreground text-center max-w-md">
                  {search
                    ? "Try adjusting your search criteria"
                    : "No users are registered in the system yet"}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4 font-semibold text-sm text-muted-foreground">
                        Name
                      </th>
                      <th className="text-left py-3 px-4 font-semibold text-sm text-muted-foreground">
                        Email
                      </th>
                      <th className="text-left py-3 px-4 font-semibold text-sm text-muted-foreground">
                        Role
                      </th>
                      <th className="text-left py-3 px-4 font-semibold text-sm text-muted-foreground">
                        Joined At
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.users.map((user) => (
                      <tr
                        key={user._id}
                        className="border-b hover:bg-accent/50 transition-colors"
                      >
                        <td className="py-4 px-4">
                          <p className="font-medium text-sm text-foreground">
                            {user.name}
                          </p>
                        </td>
                        <td className="py-4 px-4">
                          <p className="text-sm text-muted-foreground">
                            {user.email}
                          </p>
                        </td>
                        <td className="py-4 px-4">
                          <Badge
                            variant={
                              user.role === "admin" ? "default" : "secondary"
                            }
                            className={
                              user.role === "admin"
                                ? "bg-purple-500 text-white"
                                : ""
                            }
                          >
                            {user.role}
                          </Badge>
                        </td>
                        <td className="py-4 px-4">
                          <p className="text-sm text-muted-foreground">
                            {formatDate(user.createdAt as string)}
                          </p>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
