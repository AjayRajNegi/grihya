import React, { useState } from "react";
import { Link } from "react-router-dom";
import { MailIcon, AlertCircleIcon, CheckCircleIcon } from "lucide-react";
import AuthLayout from "../../components/auth/AuthLayout";
import { ScrollToTop } from "@/utils/import";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      setError("Please enter your email address");
      return;
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
      setError("Please enter a valid email address");
      return;
    }
    setError("");
    setIsLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setIsSubmitted(true);
    } catch (err) {
      setError("Failed to send reset link. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <>
      <ScrollToTop />
      <AuthLayout
        title="Forgot Password"
        subtitle={
          isSubmitted
            ? "We've sent you an email"
            : "Enter your email to reset your password"
        }
      >
        {isSubmitted ? (
          <div className="text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
              <CheckCircleIcon className="h-6 w-6 text-green-600" />
            </div>
            <h3 className="mb-2 text-lg font-medium text-gray-900">
              Check your email
            </h3>
            <p className="mb-6 text-sm text-gray-600">
              We've sent a password reset link to{" "}
              <span className="font-medium">{email}</span>
            </p>
            <p className="mb-6 text-sm text-gray-600">
              Didn't receive the email? Check your spam folder or{" "}
              <button
                onClick={() => setIsSubmitted(false)}
                className="font-medium text-blue-600 hover:text-blue-500"
              >
                try again
              </button>
            </p>
            <Link
              to="/auth/login"
              className="flex w-full justify-center rounded-md border border-transparent px-4 py-2 text-sm font-medium text-[#2DB8D1] shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              Back to Login
            </Link>
          </div>
        ) : (
          <>
            {error && (
              <div className="mb-6 rounded border-l-4 border-red-500 bg-red-50 p-4">
                <div className="flex items-center">
                  <AlertCircleIcon className="mr-2 h-5 w-5 text-red-500" />
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              </div>
            )}
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label
                  htmlFor="email"
                  className="mb-1 block text-sm font-medium text-gray-700"
                >
                  Email Address
                </label>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                    <MailIcon className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full rounded-md border border-gray-300 px-3 py-2 pl-10 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter your email address"
                  />
                </div>
              </div>
              <div>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex w-full justify-center rounded-md border border-transparent px-4 py-2 text-sm font-medium text-[#2DB8D1] shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isLoading ? "Sending..." : "Send Reset Link"}
                </button>
              </div>
            </form>
            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                Remember your password?{" "}
                <Link
                  to="/auth/login"
                  className="font-medium text-blue-600 hover:text-blue-500"
                >
                  Back to login
                </Link>
              </p>
            </div>
          </>
        )}
      </AuthLayout>
    </>
  );
};
export default ForgotPassword;
