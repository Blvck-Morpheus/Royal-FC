import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { User } from "@shared/schema";
import { Plus, Trash2, Shield, UserCheck } from "lucide-react";
import { format } from "date-fns";

const userSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  role: z.enum(["admin", "exco"]),
});

type UserFormData = z.infer<typeof userSchema>;

const UserManagement = () => {
  const [isCreating, setIsCreating] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch users
  const { data: users = [], isLoading } = useQuery<User[]>({
    queryKey: ["/api/users"],
  });

  // Form setup
  const form = useForm<UserFormData>({
    resolver: zodResolver(userSchema),
    defaultValues: {
      username: "",
      password: "",
      role: "exco",
    },
  });

  // Create user mutation
  const createUser = useMutation({
    mutationFn: async (data: UserFormData) => {
      const response = await apiRequest("POST", "/api/users", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/users"] });
      toast({ title: "Success", description: "User created successfully" });
      form.reset();
      setIsCreating(false);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create user",
        variant: "destructive",
      });
    },
  });

  // Delete user mutation
  const deleteUser = useMutation({
    mutationFn: async (id: number) => {
      const response = await apiRequest("DELETE", `/api/users/${id}`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/users"] });
      toast({ title: "Success", description: "User deleted successfully" });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to delete user",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: UserFormData) => {
    createUser.mutate(data);
  };

  const getRoleIcon = (role: string) => {
    return role === "admin" ? <Shield className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />;
  };

  const getRoleBadge = (role: string) => {
    return role === "admin" ? 
      <Badge variant="default">Admin</Badge> : 
      <Badge variant="secondary">Exco</Badge>;
  };

  if (isLoading) {
    return <div className="flex justify-center p-8">Loading users...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">User Management</h2>
          <p className="text-gray-600">Manage system users and their roles</p>
        </div>
        <Button onClick={() => setIsCreating(true)} disabled={isCreating}>
          <Plus className="w-4 h-4 mr-2" />
          Add User
        </Button>
      </div>

      {/* Create Form */}
      {isCreating && (
        <Card>
          <CardHeader>
            <CardTitle>Create New User</CardTitle>
            <CardDescription>Add a new admin or exco user to the system</CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="username"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Username</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter username" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <Input type="password" placeholder="Enter password" {...field} />
                      </FormControl>
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
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select role" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="exco">Exco</SelectItem>
                          <SelectItem value="admin">Admin</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex gap-2">
                  <Button type="submit" disabled={createUser.isPending}>
                    Create User
                  </Button>
                  <Button type="button" variant="outline" onClick={() => setIsCreating(false)}>
                    Cancel
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      )}

      {/* Users List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {users.map((user) => (
          <Card key={user.id}>
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg flex items-center gap-2">
                    {getRoleIcon(user.role)}
                    {user.username}
                  </CardTitle>
                  <div className="mt-2">
                    {getRoleBadge(user.role)}
                  </div>
                </div>
                <Button 
                  size="sm" 
                  variant="outline" 
                  onClick={() => deleteUser.mutate(user.id)}
                  disabled={deleteUser.isPending}
                >
                  <Trash2 className="w-3 h-3" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-sm text-gray-600">
                <div>Created: {format(new Date(user.createdAt), "MMM d, yyyy")}</div>
                <div className="mt-1">
                  Permissions: {user.role === "admin" ? "Full Access" : "Tournament Management"}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {users.length === 0 && (
        <Card>
          <CardContent className="text-center py-8">
            <Shield className="w-12 h-12 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold mb-2">No users found</h3>
            <p className="text-gray-600 mb-4">Add users to manage system access</p>
            <Button onClick={() => setIsCreating(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Add First User
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default UserManagement;
