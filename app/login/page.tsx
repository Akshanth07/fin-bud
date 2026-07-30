"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Wallet, Eye, EyeOff, Loader2, LogIn } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/components/ui/toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const loginSchema = z.object({
  email: z
    .string()
    .min(1, "Email address is required")
    .email("Please enter a valid email address"),
  password: z.string().min(1, "Password is required"),
  rememberMe: z.boolean().optional(),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const { signIn, user, isLoading: authLoading } = useAuth();
  const toast = useToast();

  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  useEffect(() => {
    if (user && !authLoading && !isSubmitting) {
      router.push("/dashboard");
    }
  }, [user, authLoading, isSubmitting, router]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
      rememberMe: true,
    },
  });

  const onSubmit = async (data: LoginFormValues) => {
    setIsSubmitting(true);
    setServerError(null);

    const { user: signedInUser, error } = await signIn(
      data.email.trim(),
      data.password
    );

    setIsSubmitting(false);

    if (error || !signedInUser) {
      let friendlyMsg = error?.message || "Invalid credentials.";
      if (
        friendlyMsg.includes("Invalid login credentials") ||
        friendlyMsg.includes("invalid_credentials") ||
        friendlyMsg.includes("Invalid credentials")
      ) {
        friendlyMsg = "Invalid email or password. Please check your credentials and try again.";
      } else if (friendlyMsg.includes("Email not confirmed")) {
        friendlyMsg = "Please verify your email address before logging in.";
      }

      setServerError(friendlyMsg);
      toast.error(friendlyMsg, "Login Failed");
      return;
    }

    toast.success("Logged in successfully!", "Welcome Back");
    router.push("/dashboard");
  };

  return (
    <div className="flex min-h-screen flex-col lg:flex-row bg-surface">
      {/* Left Decorative Section */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-between bg-sidebar p-12 text-white relative overflow-hidden">
        <div className="absolute -top-24 -left-24 h-96 w-96 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute -bottom-24 -right-24 h-96 w-96 rounded-full bg-primary/20 blur-3xl" />

        <div className="relative z-10 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary shadow-md">
            <Wallet className="h-5 w-5 text-white" />
          </div>
          <span className="text-xl font-bold tracking-tight text-white">FinancialOS</span>
        </div>

        <div className="relative z-10 my-auto max-w-lg space-y-6">
          <span className="inline-block rounded-full bg-white/10 px-3.5 py-1.5 text-xs font-medium text-primary-light">
            AI Financial Platform
          </span>
          <h1 className="text-4xl font-bold leading-tight tracking-tight text-white">
            Welcome back to your financial intelligence dashboard.
          </h1>
          <p className="text-base text-[#9CA3AF] leading-relaxed">
            Monitor net worth, cashflows, investment diversification, insurance coverage, and AI financial advice in real time.
          </p>
        </div>

        <div className="relative z-10 text-xs text-[#9CA3AF]">
          © {new Date().getFullYear()} FinancialOS. All rights reserved.
        </div>
      </div>

      {/* Right Form Section */}
      <div className="flex flex-1 flex-col justify-center px-6 py-12 lg:px-16 items-center">
        <div className="w-full max-w-md space-y-8">
          {/* Header Mobile Logo */}
          <div className="flex items-center gap-2.5 lg:hidden mb-6">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary">
              <Wallet className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold tracking-tight text-[#14181C]">FinancialOS</span>
          </div>

          <div>
            <h2 className="text-2xl font-bold tracking-tight text-[#14181C]">Sign in to account</h2>
            <p className="mt-2 text-sm text-muted">
              Enter your credentials to access your financial dashboard.
            </p>
          </div>

          {serverError && (
            <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-600">
              {serverError}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Email Address */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[#14181C] uppercase tracking-wider">
                Email Address
              </label>
              <Input
                {...register("email")}
                type="email"
                placeholder="name@example.com"
                disabled={isSubmitting}
                aria-invalid={!!errors.email}
              />
              {errors.email && (
                <p className="text-xs text-red-500">{errors.email.message}</p>
              )}
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-[#14181C] uppercase tracking-wider">
                  Password
                </label>
                <Link
                  href="/forgot-password"
                  className="text-xs text-primary hover:underline font-medium"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Input
                  {...register("password")}
                  type={showPassword ? "text" : "password"}
                  placeholder="Your password"
                  disabled={isSubmitting}
                  className="pr-10"
                  aria-invalid={!!errors.password}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-[#14181C]"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.password && (
                <p className="text-xs text-red-500">{errors.password.message}</p>
              )}
            </div>

            {/* Remember Me Checkbox */}
            <div className="flex items-center gap-2 pt-1">
              <input
                type="checkbox"
                id="rememberMe"
                {...register("rememberMe")}
                className="h-4 w-4 rounded border-border text-primary focus:ring-primary/30"
              />
              <label htmlFor="rememberMe" className="text-xs text-muted cursor-pointer select-none">
                Remember me on this device
              </label>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full h-11 text-sm font-medium mt-2 gap-2"
              variant="primary"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Signing in...
                </>
              ) : (
                <>
                  <LogIn className="h-4 w-4" />
                  Sign In
                </>
              )}
            </Button>
          </form>

          <div className="text-center text-sm text-muted pt-2">
            Don&apos;t have an account?{" "}
            <Link
              href="/signup"
              className="font-medium text-primary hover:underline"
            >
              Create account
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
