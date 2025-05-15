import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { User } from "@shared/schema";

const loginSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
  loginType: z.enum(["admin", "exco"]),
});

type LoginFormValues = z.infer<typeof loginSchema>;

interface AdminLoginProps {
  onLoginSuccess: (user: User) => void;
}

const AdminLogin = ({ onLoginSuccess }: AdminLoginProps) => {
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const { toast } = useToast();

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  const onSubmit = async (data: LoginFormValues) => {
    try {
      setIsLoggingIn(true);

      console.log("Attempting login with:", {
        ...data,
        password: '***'
      });

      const response = await apiRequest("POST", "/api/admin/login", data);

      // Clone the response before reading it
      const responseClone = response.clone();

      if (!response.ok) {
        try {
          const errorData = await response.json();
          toast({
            title: "Login failed",
            description: errorData.message || "Invalid credentials",
            variant: "destructive",
          });
        } catch (e) {
          toast({
            title: "Login failed",
            description: "An error occurred during login",
            variant: "destructive",
          });
        }
        return;
      }

      try {
        const userData = await responseClone.json();
        console.log("Login response:", userData);

        if (userData.role !== data.loginType) {
          toast({
            title: "Access Denied",
            description: `You do not have ${data.loginType} privileges. Your role is ${userData.role}.`,
            variant: "destructive",
          });
          return;
        }

        toast({
          title: "Login successful",
          description: `You are now logged in as ${userData.role === "admin" ? "a main admin" : "an exco member"}`,
        });

        onLoginSuccess(userData);
      } catch (e) {
        console.error("Error parsing login response:", e);
        toast({
          title: "Login error",
          description: "Error processing login response",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Login error:", error);
      toast({
        title: "Login failed",
        description: error instanceof Error ? error.message : "An error occurred during login",
        variant: "destructive",
      });
    } finally {
      setIsLoggingIn(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
      <div className="mb-6">
        <h3 className="font-montserrat font-bold text-xl text-royal-blue mb-2">Admin Access</h3>
        <p className="text-sm text-gray-600">Enter your credentials to access the admin area</p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="loginType"
            render={({ field }) => (
              <FormItem className="space-y-1">
                <FormLabel>Login Type</FormLabel>
                <FormControl>
                  <RadioGroup
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    className="flex space-x-4"
                  >
                    <FormItem className="flex items-center space-x-2 space-y-0">
                      <FormControl>
                        <RadioGroupItem value="admin" />
                      </FormControl>
                      <FormLabel className="font-normal cursor-pointer">
                        Main Admin
                      </FormLabel>
                    </FormItem>
                    <FormItem className="flex items-center space-x-2 space-y-0">
                      <FormControl>
                        <RadioGroupItem value="exco" />
                      </FormControl>
                      <FormLabel className="font-normal cursor-pointer">
                        Exco Member
                      </FormLabel>
                    </FormItem>
                  </RadioGroup>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

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

          <Button
            type="submit"
            className="w-full bg-royal-blue hover:bg-royal-blue/90"
            disabled={isLoggingIn}
          >
            {isLoggingIn ? "Logging in..." : "Login"}
          </Button>
        </form>
      </Form>
    </div>
  );
};

export default AdminLogin;
