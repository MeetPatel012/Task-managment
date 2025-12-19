"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useAddMember, Project } from "@/lib/hooks/useProjects";
import { useUsers } from "@/lib/hooks/useUsers";
import { UserPlus } from "lucide-react";

const memberSchema = z.object({
  userId: z.string().min(1, "Please select a user"),
  role: z.enum(["manager", "member", "viewer"]),
});

type MemberFormValues = z.infer<typeof memberSchema>;

interface AddMemberDialogProps {
  projectId: string;
  project?: Project;
}

export function AddMemberDialog({ projectId, project }: AddMemberDialogProps) {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string>("");
  const addMember = useAddMember();
  const { data: usersData, isLoading: isLoadingUsers } = useUsers(
    { isActive: "true" },
    { enabled: open }
  );

  // Filter out users who are already members
  const availableUsers = usersData?.users?.filter((user) => {
    if (!project) return true;
    const isOwner = project.owner._id === user._id;
    const isMember = project.members.some(
      (member) => member.user._id === user._id
    );
    return !isOwner && !isMember;
  });

  const form = useForm<MemberFormValues>({
    resolver: zodResolver(memberSchema),
    defaultValues: {
      userId: "",
      role: "member",
    },
  });

  const onSubmit = async (data: MemberFormValues) => {
    try {
      setError("");
      const payload = {
        projectId,
        userId: data.userId,
        role: data.role,
      };
      await addMember.mutateAsync(payload);
      setOpen(false);
      form.reset();
    } catch (err: any) {
      const message =
        err.response?.data?.message ||
        "Failed to add member. Please try again.";
      setError(message);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <UserPlus className="mr-2 h-4 w-4" />
          Add Member
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[450px]">
        <DialogHeader>
          <DialogTitle>Add Project Member</DialogTitle>
          <DialogDescription>
            Select a user from the list to add them as a member to this project.
          </DialogDescription>
        </DialogHeader>

        {error && (
          <div className="rounded-lg bg-red-50 border border-red-200 p-3">
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="userId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>User *</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    disabled={isLoadingUsers}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a user" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {isLoadingUsers ? (
                        <SelectItem value="loading" disabled>
                          Loading users...
                        </SelectItem>
                      ) : availableUsers?.length === 0 ? (
                        <SelectItem value="no-users" disabled>
                          No available users to add
                        </SelectItem>
                      ) : (
                        availableUsers?.map((user) => (
                          <SelectItem key={user._id} value={user._id}>
                            {user.name} ({user.email})
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="role"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Role</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select role" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="manager">Manager</SelectItem>
                      <SelectItem value="member">Member</SelectItem>
                      <SelectItem value="viewer">Viewer</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={addMember.isPending}>
                {addMember.isPending ? "Adding..." : "Add Member"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
