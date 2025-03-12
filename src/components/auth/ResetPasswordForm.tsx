import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useNavigate, Link } from "react-router-dom";
import AuthLayout from "./AuthLayout";
import { KeyRound, ArrowLeft, Check, X } from "lucide-react";
import { motion } from "framer-motion";
import { supabase } from "../../../supabase/supabase";
import { Progress } from "@/components/ui/progress";

export default function ResetPasswordForm() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const navigate = useNavigate();

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

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (passwordStrength < 50) {
      setError("Please choose a stronger password");
      return;
    }

    setIsLoading(true);

    try {
      const { error } = await supabase.auth.updateUser({
        password,
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
        className="w-full"
      >
        <Card className="w-full">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl text-center flex items-center justify-center gap-2">
              <KeyRound className="h-5 w-5" /> Create New Password
            </CardTitle>
          </CardHeader>
          <CardContent>
            {!isSuccess ? (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="password">New Password</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Enter your new password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="transition-all duration-200 focus:ring-2 focus:ring-primary/20"
                    disabled={isLoading}
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
                          {/[A-Z]/.test(password) ||
                          /[^A-Za-z0-9]/.test(password) ? (
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
                  <Label htmlFor="confirmPassword">Confirm Password</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="Confirm your new password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    className="transition-all duration-200 focus:ring-2 focus:ring-primary/20"
                    disabled={isLoading}
                  />
                  {password && confirmPassword && (
                    <div className="flex items-center gap-1 text-xs">
                      {password === confirmPassword ? (
                        <>
                          <Check className="h-3 w-3 text-green-500" />
                          <span className="text-green-500">
                            Passwords match
                          </span>
                        </>
                      ) : (
                        <>
                          <X className="h-3 w-3 text-red-500" />
                          <span className="text-red-500">
                            Passwords don't match
                          </span>
                        </>
                      )}
                    </div>
                  )}
                </div>
                {error && (
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-sm text-red-500"
                  >
                    {error}
                  </motion.p>
                )}
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-background border-t-transparent"></span>
                      Updating...
                    </>
                  ) : (
                    "Reset Password"
                  )}
                </Button>
              </form>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center space-y-4"
              >
                <div className="flex justify-center">
                  <div className="rounded-full bg-green-100 p-3">
                    <svg
                      className="h-6 w-6 text-green-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M5 13l4 4L19 7"
                      ></path>
                    </svg>
                  </div>
                </div>
                <h3 className="text-lg font-medium">
                  Password Reset Successful
                </h3>
                <p className="text-sm text-gray-600">
                  Your password has been reset successfully. You can now log in
                  with your new password.
                </p>
                <Button className="mt-4" onClick={() => navigate("/login")}>
                  Go to Login
                </Button>
              </motion.div>
            )}
          </CardContent>
          {!isSuccess && (
            <CardFooter className="flex flex-col space-y-4">
              <div className="text-sm text-center text-slate-600">
                <Link
                  to="/login"
                  className="text-primary hover:underline flex items-center justify-center gap-1"
                >
                  <ArrowLeft className="h-4 w-4" /> Back to login
                </Link>
              </div>
            </CardFooter>
          )}
        </Card>
      </motion.div>
    </AuthLayout>
  );
}
