import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useNavigate, Link } from "react-router-dom";
import AuthLayout from "./AuthLayout";
import { motion } from "framer-motion";
import { supabase } from "../../../supabase/supabase";
import { Mail, KeyRound, ArrowRight, CheckCircle } from "lucide-react";
import { useAuth } from "../../../supabase/auth";

export default function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();

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
    } catch (error: any) {
      setError(error.message || "An error occurred");
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
        <div className="text-center mb-6">
          <div className="flex justify-center mb-4">
            <div className="h-16 w-16 bg-blue-50 rounded-full flex items-center justify-center">
              <KeyRound className="h-8 w-8 text-blue-600" />
            </div>
          </div>
          <h2 className="text-2xl font-bold text-gray-800">
            Password Recovery
          </h2>
          <p className="text-gray-600 mt-2">
            Enter your email to receive a password reset link
          </p>
        </div>

        <div className="flex justify-center space-x-4 mb-8">
          <Link
            to="/"
            className="px-6 py-2.5 text-sm font-medium text-gray-600 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
          >
            Sign In
          </Link>
          <Link
            to="/signup"
            className="px-6 py-2.5 text-sm font-medium text-gray-600 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
          >
            Sign Up
          </Link>
          <button className="px-6 py-2.5 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors">
            Recovery
          </button>
        </div>

        {!isSuccess ? (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label
                htmlFor="email"
                className="text-gray-700 font-medium flex items-center gap-2"
              >
                <Mail className="h-4 w-4" /> Email Address
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 pl-4"
                disabled={isLoading}
              />
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
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg transition-colors flex items-center justify-center gap-2 text-base font-medium"
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
          </form>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center space-y-4 py-4"
          >
            <div className="flex justify-center">
              <div className="rounded-full bg-green-100 p-4">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
            </div>
            <h3 className="text-xl font-medium mt-4">Check your email</h3>
            <p className="text-sm text-gray-600 max-w-sm mx-auto">
              We've sent a password reset link to{" "}
              <span className="font-medium">{email}</span>. Please check your
              inbox and follow the instructions.
            </p>
            <Button
              className="mt-6 bg-blue-600 hover:bg-blue-700 text-white py-3 px-6 rounded-lg transition-colors"
              onClick={() => navigate("/", { replace: true })}
            >
              Return to Login
            </Button>
          </motion.div>
        )}

        <div className="text-center text-xs text-gray-500 mt-8 pt-4 border-t border-gray-100">
          © 2023 Hamed Al-Ghaithi. All rights reserved.
        </div>
      </motion.div>
    </AuthLayout>
  );
}
