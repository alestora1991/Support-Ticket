import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { useNavigate, Link } from "react-router-dom";
import AuthLayout from "./AuthLayout";
import { ArrowLeft, ShieldCheck } from "lucide-react";
import { motion } from "framer-motion";

interface OTPVerificationProps {
  email?: string;
  onVerify?: () => void;
  onResend?: () => Promise<void>;
  redirectTo?: string;
}

export default function OTPVerification({
  email = "your email",
  onVerify = () => {},
  onResend = async () => {},
  redirectTo = "/login",
}: OTPVerificationProps) {
  const [otp, setOtp] = useState<string[]>(["", "", "", "", "", ""]);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [resendDisabled, setResendDisabled] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else if (countdown === 0 && resendDisabled) {
      setResendDisabled(false);
    }
  }, [countdown, resendDisabled]);

  const handleChange = (index: number, value: string) => {
    // Only allow numbers
    if (value && !/^\d+$/.test(value)) return;

    const newOtp = [...otp];
    // Take only the last character if multiple are pasted
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (
    index: number,
    e: React.KeyboardEvent<HTMLInputElement>,
  ) => {
    // Move to previous input on backspace if current input is empty
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text/plain").trim();

    // Check if pasted content is a 6-digit number
    if (/^\d{6}$/.test(pastedData)) {
      const newOtp = pastedData.split("");
      setOtp(newOtp);
      // Focus the last input
      inputRefs.current[5]?.focus();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const otpValue = otp.join("");
    if (otpValue.length !== 6) {
      setError("Please enter all 6 digits");
      return;
    }

    setIsLoading(true);

    try {
      // In a real implementation, you would verify the OTP with your backend
      // For this demo, we'll simulate a successful verification after a delay
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Call the onVerify callback
      onVerify();
      setIsSuccess(true);
    } catch (error: any) {
      setError(error.message || "Invalid verification code");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    setResendDisabled(true);
    setCountdown(60); // 60 second cooldown

    try {
      await onResend();
    } catch (error: any) {
      setError(error.message || "Failed to resend code");
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
              <ShieldCheck className="h-5 w-5" /> Verification Code
            </CardTitle>
          </CardHeader>
          <CardContent>
            {!isSuccess ? (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="text-center mb-4">
                  <p className="text-sm text-gray-600">
                    We've sent a 6-digit verification code to{" "}
                    <span className="font-medium">{email}</span>
                  </p>
                </div>

                <div className="flex justify-center gap-2">
                  {otp.map((digit, index) => (
                    <input
                      key={index}
                      type="text"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleChange(index, e.target.value)}
                      onKeyDown={(e) => handleKeyDown(index, e)}
                      onPaste={index === 0 ? handlePaste : undefined}
                      ref={(el) => (inputRefs.current[index] = el)}
                      className="w-12 h-12 text-center text-lg font-semibold border rounded-md focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-200"
                      disabled={isLoading}
                    />
                  ))}
                </div>

                {error && (
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-sm text-red-500 text-center"
                  >
                    {error}
                  </motion.p>
                )}

                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-background border-t-transparent"></span>
                      Verifying...
                    </>
                  ) : (
                    "Verify Code"
                  )}
                </Button>

                <div className="text-center">
                  <Button
                    type="button"
                    variant="link"
                    className="text-sm"
                    onClick={handleResend}
                    disabled={resendDisabled}
                  >
                    {resendDisabled
                      ? `Resend code in ${countdown}s`
                      : "Didn't receive a code? Resend"}
                  </Button>
                </div>
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
                <h3 className="text-lg font-medium">Verification Successful</h3>
                <p className="text-sm text-gray-600">
                  Your account has been verified successfully.
                </p>
                <Button className="mt-4" onClick={() => navigate(redirectTo)}>
                  Continue
                </Button>
              </motion.div>
            )}
          </CardContent>
          {!isSuccess && (
            <CardFooter className="flex flex-col space-y-4">
              <div className="text-sm text-center text-slate-600">
                <Link
                  to={redirectTo}
                  className="text-primary hover:underline flex items-center justify-center gap-1"
                >
                  <ArrowLeft className="h-4 w-4" /> Back
                </Link>
              </div>
            </CardFooter>
          )}
        </Card>
      </motion.div>
    </AuthLayout>
  );
}
