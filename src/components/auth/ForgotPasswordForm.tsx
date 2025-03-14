import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useNavigate, Link } from "react-router-dom";
import AuthLayout from "./AuthLayout";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "../../../supabase/supabase";
import { Mail, ArrowRight, CheckCircle, KeyRound } from "lucide-react";
import { useAuth } from "../../../supabase/auth";
import { useAuthNotifications } from "./AuthNotifications";
import { FormInput } from "@/components/ui/form-input";

export default function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showSuccess, showError } = useAuthNotifications();

  // If user is already logged in, redirect to tickets page
  if (user) {
    navigate("/tickets", { replace: true });
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) throw error;
      setIsSuccess(true);
      showSuccess(
        "Reset Link Sent",
        `We've sent a password reset link to ${email}. Please check your inbox.`,
      );
    } catch (error: any) {
      const errorMessage = error.message || "An error occurred";
      setError(errorMessage);
      showError("Reset Failed", errorMessage);
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
          <div className="flex justify-center mb-4">
            <motion.div
              className="rounded-full bg-indigo-100 p-4"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
            >
              <KeyRound className="h-8 w-8 text-indigo-600" />
            </motion.div>
          </div>
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600">
            Forgot password?
          </h1>
          <p className="text-gray-600 mt-2">
            Enter your email to receive a password reset link
          </p>
        </motion.div>

        {!isSuccess ? (
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
              icon={Mail}
              error={error}
            />
            <AnimatePresence>
              {error && (
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
              transition={{ delay: 0.4, duration: 0.3 }}
            >
              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white py-3 rounded-lg transition-all flex items-center justify-center gap-2 text-base font-medium shadow-md hover:shadow-lg"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <span className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent"></span>
                    <span>Sending...</span>
                  </>
                ) : (
                  <>
                    <span>Send Reset Link</span>
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </Button>
            </motion.div>
          </form>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center space-y-4 py-4"
          >
            <motion.div
              className="flex justify-center"
              initial={{ scale: 0 }}
              animate={{ scale: 1, rotate: [0, 10, -10, 0] }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            >
              <div className="rounded-full bg-green-100 p-4 shadow-md">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
            </motion.div>
            <motion.h3
              className="text-xl font-medium mt-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              Check your email
            </motion.h3>
            <motion.p
              className="text-sm text-gray-600 max-w-sm mx-auto"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              We've sent a password reset link to{" "}
              <span className="font-medium text-indigo-600">{email}</span>.
              Please check your inbox and follow the instructions.
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
            >
              <Button
                className="mt-6 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white py-3 px-6 rounded-lg transition-all shadow-md hover:shadow-lg"
                onClick={() => navigate("/", { replace: true })}
              >
                Return to Login
              </Button>
            </motion.div>
          </motion.div>
        )}

        <motion.div
          className="mt-6 text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.3 }}
        >
          <p className="text-sm text-gray-600">
            Remember your password?{" "}
            <Link
              to="/"
              className="text-indigo-600 hover:text-indigo-800 hover:underline font-medium transition-colors"
            >
              Back to login
            </Link>
          </p>
        </motion.div>
      </motion.div>
    </AuthLayout>
  );
}
