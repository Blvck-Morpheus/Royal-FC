import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useAuth } from "@/contexts/AuthContext";

const loginSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
  loginType: z.enum(["admin", "exco"]),
});

type LoginFormValues = z.infer<typeof loginSchema>;

const AdminLoginForm = () => {
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const { login } = useAuth();

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
      loginType: "admin", // Default to admin login
    },
  });

  const onSubmit = async (data: LoginFormValues) => {
    try {
      setIsLoggingIn(true);
      await login(data.username, data.password, data.loginType);
    } catch (error) {
      console.error("Login error in form:", error);
    } finally {
      setIsLoggingIn(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-xl w-full p-6">
      <div className="mb-6">
        <h3 className="font-montserrat font-bold text-xl text-royal-blue mb-2">Admin Login</h3>
        <p className="text-sm text-gray-600 mb-4">Please enter your credentials to access the admin panel</p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="username"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Username</FormLabel>
                <FormControl>
                  <Input placeholder="Enter your username" {...field} />
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
                  <Input type="password" placeholder="Enter your password" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="loginType"
            render={({ field }) => (
              <FormItem className="space-y-3">
                <FormLabel>Login as</FormLabel>
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
                      <FormLabel className="font-normal cursor-pointer">Main Admin</FormLabel>
                    </FormItem>
                    <FormItem className="flex items-center space-x-2 space-y-0">
                      <FormControl>
                        <RadioGroupItem value="exco" />
                      </FormControl>
                      <FormLabel className="font-normal cursor-pointer">Exco Member</FormLabel>
                    </FormItem>
                  </RadioGroup>
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
          
          <div className="text-xs text-gray-500 mt-4">
            <p>Default admin credentials:</p>
            <p>Username: admin</p>
            <p>Password: password123</p>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default AdminLoginForm;
