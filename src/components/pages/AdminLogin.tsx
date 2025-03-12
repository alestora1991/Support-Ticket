import { useState, useEffect } from "react";
import { useAuth } from "../../../supabase/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useNavigate, Link } from "react-router-dom";
import AuthLayout from "../auth/AuthLayout";
import { motion } from "framer-motion";
import { Mail, Lock, ArrowRight, ShieldAlert } from "lucide-react";

export default function AdminLogin() {
  const [email, setEmail] = useState("it@sos.com.om");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { signIn, user } = useAuth();
  const navigate = useNavigate();

  // Use useEffect to handle navigation after render
  useEffect(() => {
    if (user && user.email === "it@sos.com.om") {
      navigate("/admin", { replace: true });
    }
  }, [user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      await signIn(email, password);
      // Navigation will happen in useEffect
    } catch (error) {
      setError("Invalid admin credentials");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="w-full bg-white rounded-xl shadow-lg p-8 max-w-md mx-auto"
      >
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="h-16 w-16 bg-red-50 rounded-full flex items-center justify-center">
              <ShieldAlert className="h-8 w-8 text-red-600" />
            </div>
          </div>
          <h2 className="text-2xl font-bold text-gray-800">
            Admin Access Only
          </h2>
          <p className="text-gray-600 mt-2">
            Sign in with your administrator credentials
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <Label
              htmlFor="email"
              className="text-gray-700 font-medium flex items-center gap-2"
            >
              <Mail className="h-4 w-4" /> Admin Email
            </Label>
            <div className="relative">
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 pl-4"
                disabled={true}
                autoComplete="email"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label
              htmlFor="password"
              className="text-gray-700 font-medium flex items-center gap-2"
            >
              <Lock className="h-4 w-4" /> Password
            </Label>
            <div className="relative">
              <Input
                id="password"
                type="password"
                placeholder="Enter admin password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 pl-4"
                disabled={isLoading}
                autoComplete="current-password"
              />
            </div>
          </div>

          {error && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="p-3 bg-red-50 border border-red-200 rounded-lg"
            >
              <p className="text-sm text-red-600 font-medium">{error}</p>
            </motion.div>
          )}

          <Button
            type="submit"
            className="w-full bg-red-600 hover:bg-red-700 text-white py-3 rounded-lg transition-colors flex items-center justify-center gap-2 text-base font-medium"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <span className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent"></span>
                <span>Authenticating...</span>
              </>
            ) : (
              <>
                <span>Admin Login</span>
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </Button>
        </form>

        <div className="mt-8 text-center">
          <p className="text-sm text-gray-600">
            Not an administrator?{" "}
            <Link to="/" className="text-blue-600 hover:underline font-medium">
              Regular Login
            </Link>
          </p>
        </div>
      </motion.div>
    </AuthLayout>
  );
}
