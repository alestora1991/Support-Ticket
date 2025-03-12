import { useState, useEffect } from "react";
import { useAuth } from "../../../supabase/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useNavigate, Link } from "react-router-dom";
import AuthLayout from "./AuthLayout";
import { Check, X, Mail, User, Lock, ArrowRight, UserPlus } from "lucide-react";
import { motion } from "framer-motion";
import { Progress } from "@/components/ui/progress";
import { Checkbox } from "@/components/ui/checkbox";

export default function SignUpForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [acceptTerms, setAcceptTerms] = useState(false);
  const { signUp, user } = useAuth();
  const navigate = useNavigate();

  // If user is already logged in, redirect to tickets page
  if (user) {
    navigate("/tickets", { replace: true });
    return null;
  }

  // Password strength checker
  useEffect(() => {
    if (!password) {
      setPasswordStrength(0);
      return;
    }

    let strength = 0;
    // Length check
    if (password.length >= 8) strength += 25;
    // Contains number
    if (/\d/.test(password)) strength += 25;
    // Contains lowercase
    if (/[a-z]/.test(password)) strength += 25;
    // Contains uppercase or special char
    if (/[A-Z]/.test(password) || /[^A-Za-z0-9]/.test(password)) strength += 25;

    setPasswordStrength(strength);
  }, [password]);

  const getStrengthColor = () => {
    if (passwordStrength <= 25) return "bg-red-500";
    if (passwordStrength <= 50) return "bg-orange-500";
    if (passwordStrength <= 75) return "bg-yellow-500";
    return "bg-green-500";
  };

  const getStrengthText = () => {
    if (passwordStrength <= 25) return "Weak";
    if (passwordStrength <= 50) return "Fair";
    if (passwordStrength <= 75) return "Good";
    return "Strong";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!acceptTerms) {
      setError("You must accept the terms and conditions");
      return;
    }

    if (passwordStrength < 50) {
      setError("Please choose a stronger password");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setIsLoading(true);

    try {
      await signUp(email, password, fullName);
      navigate("/", { replace: true });
    } catch (error: any) {
      setError(error.message || "Error creating account");
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
              <UserPlus className="h-8 w-8 text-blue-600" />
            </div>
          </div>
          <h2 className="text-2xl font-bold text-gray-800">
            Create Your Account
          </h2>
          <p className="text-gray-600 mt-2">
            Join SOS IT Support to manage your support tickets
          </p>
        </div>

        <div className="flex justify-center space-x-4 mb-8">
          <Link
            to="/"
            className="px-6 py-2.5 text-sm font-medium text-gray-600 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
          >
            Sign In
          </Link>
          <button className="px-6 py-2.5 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors">
            Sign Up
          </button>
          <Link
            to="/forgot-password"
            className="px-6 py-2.5 text-sm font-medium text-gray-600 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
          >
            Recovery
          </Link>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <Label
              htmlFor="fullName"
              className="text-gray-700 font-medium flex items-center gap-2"
            >
              <User className="h-4 w-4" /> Full Name
            </Label>
            <Input
              id="fullName"
              placeholder="John Doe"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 pl-4"
              disabled={isLoading}
              autoComplete="name"
            />
          </div>

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
              autoComplete="email"
            />
          </div>

          <div className="space-y-2">
            <Label
              htmlFor="password"
              className="text-gray-700 font-medium flex items-center gap-2"
            >
              <Lock className="h-4 w-4" /> Password
            </Label>
            <Input
              id="password"
              type="password"
              placeholder="Create a password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 pl-4"
              disabled={isLoading}
              autoComplete="new-password"
            />
            {password && (
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span>Password strength:</span>
                  <span
                    className={`font-medium ${passwordStrength > 75 ? "text-green-500" : passwordStrength > 50 ? "text-yellow-500" : passwordStrength > 25 ? "text-orange-500" : "text-red-500"}`}
                  >
                    {getStrengthText()}
                  </span>
                </div>
                <Progress
                  value={passwordStrength}
                  className="h-1"
                  indicatorClassName={getStrengthColor()}
                />
                <div className="grid grid-cols-2 gap-2 text-xs mt-2">
                  <div className="flex items-center gap-1">
                    {password.length >= 8 ? (
                      <Check className="h-3 w-3 text-green-500" />
                    ) : (
                      <X className="h-3 w-3 text-red-500" />
                    )}
                    <span>At least 8 characters</span>
                  </div>
                  <div className="flex items-center gap-1">
                    {/\d/.test(password) ? (
                      <Check className="h-3 w-3 text-green-500" />
                    ) : (
                      <X className="h-3 w-3 text-red-500" />
                    )}
                    <span>Contains number</span>
                  </div>
                  <div className="flex items-center gap-1">
                    {/[a-z]/.test(password) ? (
                      <Check className="h-3 w-3 text-green-500" />
                    ) : (
                      <X className="h-3 w-3 text-red-500" />
                    )}
                    <span>Contains lowercase</span>
                  </div>
                  <div className="flex items-center gap-1">
                    {/[A-Z]/.test(password) || /[^A-Za-z0-9]/.test(password) ? (
                      <Check className="h-3 w-3 text-green-500" />
                    ) : (
                      <X className="h-3 w-3 text-red-500" />
                    )}
                    <span>Contains uppercase/symbol</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label
              htmlFor="confirmPassword"
              className="text-gray-700 font-medium flex items-center gap-2"
            >
              <Lock className="h-4 w-4" /> Confirm Password
            </Label>
            <Input
              id="confirmPassword"
              type="password"
              placeholder="Confirm your password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 pl-4"
              disabled={isLoading}
              autoComplete="new-password"
            />
            {confirmPassword && (
              <div className="flex items-center gap-1 text-xs mt-1">
                {password === confirmPassword ? (
                  <>
                    <Check className="h-3 w-3 text-green-500" />
                    <span className="text-green-500">Passwords match</span>
                  </>
                ) : (
                  <>
                    <X className="h-3 w-3 text-red-500" />
                    <span className="text-red-500">Passwords don't match</span>
                  </>
                )}
              </div>
            )}
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="terms"
              checked={acceptTerms}
              onCheckedChange={(checked) => setAcceptTerms(checked as boolean)}
              required
            />
            <label htmlFor="terms" className="text-sm text-gray-600">
              I accept the{" "}
              <a href="#" className="text-blue-600 hover:underline">
                terms and conditions
              </a>
            </label>
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
                <span>Creating account...</span>
              </>
            ) : (
              <>
                <span>Create Account</span>
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </Button>
        </form>

        <div className="mt-8 text-center">
          <p className="text-sm text-gray-600">
            Already have an account?{" "}
            <Link to="/" className="text-blue-600 hover:underline font-medium">
              Sign in
            </Link>
          </p>
        </div>

        <div className="text-center text-xs text-gray-500 mt-8 pt-4 border-t border-gray-100">
          © 2023 Hamed Al-Ghaithi. All rights reserved.
        </div>
      </motion.div>
    </AuthLayout>
  );
}
