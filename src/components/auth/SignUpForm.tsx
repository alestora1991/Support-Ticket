import { useState, useEffect } from "react";
import { useAuth } from "../../../supabase/auth";
import { Button } from "@/components/ui/button";
import { useNavigate, Link } from "react-router-dom";
import AuthLayout from "./AuthLayout";
import { Check, X, Mail, User, Lock, ArrowRight, Shield } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Progress } from "@/components/ui/progress";
import { Checkbox } from "@/components/ui/checkbox";
import { useAuthNotifications } from "./AuthNotifications";
import { FormInput } from "@/components/ui/form-input";

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
  const { showSuccess, showError } = useAuthNotifications();

  // If user is already logged in, redirect to tickets page
  if (user) {
    navigate("/tickets", { replace: true });
    return null;
  }

  // Password strength checker with enhanced feedback
  useEffect(() => {
    if (!password) {
      setPasswordStrength(0);
      return;
    }

    let strength = 0;
    let maxStrength = 100;

    // Length check - more granular scoring
    if (password.length >= 12) strength += 25;
    else if (password.length >= 10) strength += 20;
    else if (password.length >= 8) strength += 15;
    else if (password.length >= 6) strength += 10;
    else strength += 5;

    // Contains number - more points for multiple numbers
    const numberMatches = password.match(/\d/g);
    if (numberMatches && numberMatches.length >= 3) strength += 25;
    else if (numberMatches && numberMatches.length >= 2) strength += 20;
    else if (/\d/.test(password)) strength += 15;

    // Contains lowercase - more points for multiple lowercase
    const lowercaseMatches = password.match(/[a-z]/g);
    if (lowercaseMatches && lowercaseMatches.length >= 3) strength += 20;
    else if (/[a-z]/.test(password)) strength += 15;

    // Contains uppercase - separate from special chars
    const uppercaseMatches = password.match(/[A-Z]/g);
    if (uppercaseMatches && uppercaseMatches.length >= 2) strength += 20;
    else if (/[A-Z]/.test(password)) strength += 15;

    // Contains special characters
    const specialCharMatches = password.match(/[^A-Za-z0-9]/g);
    if (specialCharMatches && specialCharMatches.length >= 2) strength += 20;
    else if (/[^A-Za-z0-9]/.test(password)) strength += 15;

    // Penalize for common patterns
    if (/^123|abc|qwerty|password|admin|user/i.test(password)) strength -= 20;

    // Ensure strength is between 0 and 100
    strength = Math.max(0, Math.min(strength, maxStrength));

    setPasswordStrength(strength);
  }, [password]);

  const getStrengthColor = () => {
    if (passwordStrength <= 20) return "bg-red-600";
    if (passwordStrength <= 40) return "bg-red-400";
    if (passwordStrength <= 60) return "bg-orange-400";
    if (passwordStrength <= 80) return "bg-yellow-400";
    return "bg-green-500";
  };

  const getStrengthText = () => {
    if (passwordStrength <= 20) return "Very Weak";
    if (passwordStrength <= 40) return "Weak";
    if (passwordStrength <= 60) return "Fair";
    if (passwordStrength <= 80) return "Good";
    return "Strong";
  };

  const getPasswordSuggestion = () => {
    if (!password) return "";

    if (passwordStrength <= 20) {
      return "Your password is very vulnerable. Try adding more characters and mixing different types.";
    } else if (passwordStrength <= 40) {
      if (!/\d/.test(password))
        return "Add numbers to strengthen your password.";
      if (!/[A-Z]/.test(password))
        return "Add uppercase letters to strengthen your password.";
      if (!/[^A-Za-z0-9]/.test(password))
        return "Add special characters like !@#$ to strengthen your password.";
      return "Your password is still weak. Make it longer with more variety.";
    } else if (passwordStrength <= 60) {
      if (password.length < 10)
        return "Longer passwords are stronger. Try adding more characters.";
      if (!/[^A-Za-z0-9]/.test(password))
        return "Add special characters like !@#$ to strengthen your password.";
      return "Your password is decent but could be stronger with more variety.";
    } else if (passwordStrength <= 80) {
      return "Good password! For even better security, try adding more variety or length.";
    }
    return "Excellent password strength!";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!acceptTerms) {
      setError("You must accept the terms and conditions");
      return;
    }

    if (passwordStrength < 60) {
      setError(
        "Please choose a stronger password. Add more length, numbers, or special characters.",
      );
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setIsLoading(true);

    try {
      await signUp(email, password, fullName);
      showSuccess(
        "Account Created",
        "Your account has been created successfully. Please check your email for verification.",
      );
      navigate("/", { replace: true });
    } catch (error: any) {
      const errorMessage = error.message || "Error creating account";
      setError(errorMessage);
      showError("Sign Up Failed", errorMessage);
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
            Create an account
          </h1>
          <p className="text-gray-600 mt-2">
            Join our platform to manage your support tickets
          </p>
        </motion.div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <FormInput
            id="fullName"
            label="Full Name"
            placeholder="John Doe"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            required
            disabled={isLoading}
            autoComplete="name"
            icon={User}
          />

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

          <div className="space-y-2">
            <FormInput
              id="password"
              label="Password"
              type="password"
              placeholder="Create a password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={isLoading}
              autoComplete="new-password"
              icon={Lock}
              error={
                error && error.includes("password") && !error.includes("match")
                  ? error
                  : ""
              }
            />
            {password && (
              <motion.div
                className="space-y-1"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                transition={{ duration: 0.2 }}
              >
                <div className="flex justify-between text-xs">
                  <span>Password strength:</span>
                  <span
                    className={`font-medium ${passwordStrength > 80 ? "text-green-500" : passwordStrength > 60 ? "text-yellow-500" : passwordStrength > 40 ? "text-orange-500" : passwordStrength > 20 ? "text-red-400" : "text-red-600"}`}
                  >
                    {getStrengthText()}
                  </span>
                </div>
                <Progress
                  value={passwordStrength}
                  className="h-2 rounded-full"
                  indicatorClassName={`${getStrengthColor()} transition-all duration-300`}
                />

                {/* Password suggestion */}
                <div className="text-xs mt-1 italic text-gray-600">
                  {getPasswordSuggestion()}
                </div>

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
                    {/[A-Z]/.test(password) ? (
                      <Check className="h-3 w-3 text-green-500" />
                    ) : (
                      <X className="h-3 w-3 text-red-500" />
                    )}
                    <span>Contains uppercase</span>
                  </div>
                  <div className="flex items-center gap-1">
                    {/[^A-Za-z0-9]/.test(password) ? (
                      <Check className="h-3 w-3 text-green-500" />
                    ) : (
                      <X className="h-3 w-3 text-red-500" />
                    )}
                    <span>Contains special character</span>
                  </div>
                  <div className="flex items-center gap-1">
                    {password.length >= 12 ? (
                      <Check className="h-3 w-3 text-green-500" />
                    ) : (
                      <X className="h-3 w-3 text-red-500" />
                    )}
                    <span>12+ chars (recommended)</span>
                  </div>
                </div>
              </motion.div>
            )}
          </div>

          <FormInput
            id="confirmPassword"
            label="Confirm Password"
            type="password"
            placeholder="Confirm your password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            disabled={isLoading}
            autoComplete="new-password"
            icon={Shield}
            error={error && error.includes("match") ? error : ""}
            success={confirmPassword && password === confirmPassword}
          />
          {confirmPassword && (
            <motion.div
              className="flex items-center gap-1 text-xs mt-1"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.2 }}
            >
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
            </motion.div>
          )}

          <motion.div
            className="flex items-center space-x-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.3 }}
            whileHover={{ scale: 1.02 }}
          >
            <Checkbox
              id="terms"
              checked={acceptTerms}
              onCheckedChange={(checked) => setAcceptTerms(checked as boolean)}
              required
              className="text-indigo-600 border-indigo-400 focus:ring-indigo-500"
            />
            <label htmlFor="terms" className="text-sm text-gray-600">
              I accept the{" "}
              <a
                href="#"
                className="text-indigo-600 hover:text-indigo-800 hover:underline transition-colors"
              >
                terms and conditions
              </a>
            </label>
          </motion.div>

          <AnimatePresence>
            {error &&
              !error.includes("email") &&
              !error.includes("password") &&
              !error.includes("match") && (
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
            transition={{ delay: 0.7, duration: 0.3 }}
          >
            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white py-3 rounded-lg transition-all flex items-center justify-center gap-2 text-base font-medium shadow-md hover:shadow-lg"
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
          </motion.div>
        </form>

        <motion.div
          className="mt-6 text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.3 }}
        >
          <p className="text-sm text-gray-600">
            Already have an account?{" "}
            <Link
              to="/"
              className="text-indigo-600 hover:text-indigo-800 hover:underline font-medium transition-colors"
            >
              Sign in
            </Link>
          </p>
        </motion.div>
      </motion.div>
    </AuthLayout>
  );
}
