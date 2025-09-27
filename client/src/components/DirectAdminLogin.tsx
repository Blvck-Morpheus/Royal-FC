import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { User } from "@shared/schema";

interface DirectAdminLoginProps {
  onLoginSuccess: (user: User) => void;
}

const DirectAdminLogin = ({ onLoginSuccess }: DirectAdminLoginProps) => {
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const { toast } = useToast();

  const handleDirectLogin = async () => {
    try {
      setIsLoggingIn(true);
      
      console.log("Attempting direct admin login");
      
      // Use direct fetch for maximum compatibility
      const response = await fetch("/api/admin/direct-login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      });
      
      // Get the response text first
      const responseText = await response.text();
      console.log("Raw response text:", responseText);
      
      // Try to parse the response as JSON
      let userData;
      try {
        userData = responseText ? JSON.parse(responseText) : {};
        console.log("Parsed login response:", userData);
      } catch (e) {
        console.error("Error parsing response:", e);
        toast({
          title: "Login error",
          description: "Could not parse server response",
          variant: "destructive",
        });
        return;
      }
      
      // Check if the response was successful
      if (!response.ok) {
        toast({
          title: "Login failed",
          description: userData.message || "Invalid credentials",
          variant: "destructive",
        });
        return;
      }
      
      toast({
        title: "Login successful",
        description: "You are now logged in as admin",
      });
      
      onLoginSuccess(userData);
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
        <p className="text-sm text-gray-600 mb-4">Use the direct admin login for immediate access</p>
        
        <Button 
          onClick={handleDirectLogin}
          className="w-full bg-royal-blue hover:bg-royal-blue/90"
          disabled={isLoggingIn}
        >
          {isLoggingIn ? "Logging in..." : "Login as Admin"}
        </Button>
        
        <p className="text-xs text-gray-500 mt-4">
          This button logs you in directly as the admin user without requiring credentials.
          Use this if you're having trouble with the regular login form.
        </p>
      </div>
    </div>
  );
};

export default DirectAdminLogin;
