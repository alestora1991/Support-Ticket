import { useState, useEffect } from "react";
import { useAuth } from "../../../supabase/auth";
import { Button } from "@/components/ui/button";
import { useNavigate, Link } from "react-router-dom";
import AuthLayout from "./AuthLayout";
import { motion, AnimatePresence } from "framer-motion";
import { Checkbox } from "@/components/ui/checkbox";
import { Mail, Lock, ArrowRight, ShieldAlert } from "lucide-react";
import { useAuthNotifications } from "./AuthNotifications";
import { FormInput } from "@/components/ui/form-input";

export default function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loginAsAdmin, setLoginAsAdmin] = useState(false);
  const { signIn, user } = useAuth();
  const navigate = useNavigate();
  const { showSuccess, showError } = useAuthNotifications();

  // Use useEffect to handle navigation after render
  useEffect(() => {
    if (user) {
      if (loginAsAdmin && user.email === "it@sos.com.om") {
        navigate("/admin", { replace: true });
      } else {
        navigate("/tickets", { replace: true });
      }
    }
  }, [user, navigate, loginAsAdmin]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      await signIn(email, password, rememberMe);
      // Navigation will happen in useEffect
      showSuccess("Login Successful", "You have been successfully logged in.");
    } catch (error) {
      setError("Invalid email or password");
      showError("Login Failed", "Invalid email or password. Please try again.");
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
        className="w-full bg-white rounded-xl shadow-xl p-8 max-w-md mx-auto backdrop-blur-sm bg-white/90"
      >
        <motion.div
          className="text-center mb-6"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.3 }}
        >
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600">
            Welcome Back
          </h1>
          <p className="text-gray-600 mt-2">Access your support dashboard</p>
        </motion.div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <FormInput
            id="email"
            label="Email Address"
            type="email"
            placeholder="name@company.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={isLoading}
            autoComplete="email"
            icon={Mail}
            error={error && error.includes("email") ? error : ""}
          />

          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <Link
                to="/forgot-password"
                className="text-sm text-indigo-600 hover:text-indigo-800 hover:underline font-medium transition-colors ml-auto"
              >
                Forgot password?
              </Link>
            </div>
            <FormInput
              id="password"
              label="Password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={isLoading}
              autoComplete="current-password"
              icon={Lock}
              error={error && error.includes("password") ? error : ""}
            />
          </div>

          <motion.div
            className="flex items-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.3 }}
            whileHover={{ scale: 1.01 }}
          >
            <div className="flex items-center space-x-2">
              <Checkbox
                id="remember"
                checked={rememberMe}
                onCheckedChange={(checked) => setRememberMe(checked as boolean)}
                className="text-indigo-600 border-indigo-400 focus:ring-indigo-500"
              />
              <label
                htmlFor="remember"
                className="text-sm text-gray-600 group cursor-pointer"
                onClick={() => setRememberMe(!rememberMe)}
              >
                <span className="group-hover:text-indigo-600 transition-colors">
                  Remember me
                </span>
                <span className="ml-1 text-xs text-gray-400 group-hover:text-indigo-400 transition-colors">
                  (keeps you logged in)
                </span>
              </label>
            </div>
          </motion.div>

          <motion.div
            className="flex items-center space-x-2 p-3 bg-red-50/50 border border-red-200 rounded-lg"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5, duration: 0.3 }}
            whileHover={{ backgroundColor: "rgba(254, 226, 226, 0.7)" }}
          >
            <Checkbox
              id="adminLogin"
              checked={loginAsAdmin}
              onCheckedChange={(checked) => setLoginAsAdmin(checked as boolean)}
              className="text-red-600 border-red-400 focus:ring-red-500"
            />
            <div className="flex items-center gap-1.5">
              <ShieldAlert className="h-4 w-4 text-red-600" />
              <label
                htmlFor="adminLogin"
                className="text-sm text-red-700 font-medium"
              >
                Login as admin
              </label>
            </div>
          </motion.div>

          <AnimatePresence>
            {error &&
              !error.includes("email") &&
              !error.includes("password") && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="p-3 bg-red-50 border border-red-200 rounded-lg overflow-hidden"
                >
                  <p className="text-sm text-red-600 font-medium">{error}</p>
                </motion.div>
              )}
          </AnimatePresence>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.3 }}
          >
            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white py-3 rounded-lg transition-all flex items-center justify-center gap-2 text-base font-medium shadow-md hover:shadow-lg"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <span className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent"></span>
                  <span>Signing in...</span>
                </>
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </Button>
          </motion.div>
        </form>

        <motion.div
          className="mt-6 text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7, duration: 0.3 }}
        >
          <p className="text-sm text-gray-600">
            New to our platform?{" "}
            <Link
              to="/signup"
              className="text-indigo-600 hover:text-indigo-800 hover:underline font-medium transition-colors"
            >
              Create an account
            </Link>
          </p>
        </motion.div>
      </motion.div>
    </AuthLayout>
  );
}
