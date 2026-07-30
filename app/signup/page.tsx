"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Wallet, Eye, EyeOff, Loader2, CheckCircle, ArrowRight } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/components/ui/toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const signupSchema = z
  .object({
    fullName: z
      .string()
      .min(2, "Full name must be at least 2 characters")
      .max(100, "Full name is too long"),
    email: z
      .string()
      .min(1, "Email address is required")
      .email("Please enter a valid email address"),
    password: z
      .string()
      .min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type SignupFormValues = z.infer<typeof signupSchema>;

export default function SignupPage() {
  const router = useRouter();
  const { signUp, user, isLoading: authLoading } = useAuth();
  const toast = useToast();

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
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
  } = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      fullName: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async (data: SignupFormValues) => {
    setIsSubmitting(true);
    setServerError(null);

    const { user: createdUser, error } = await signUp(
      data.fullName.trim(),
      data.email.trim(),
      data.password
    );

    setIsSubmitting(false);

    if (error) {
      let friendlyMsg = error.message;
      if (error.message.includes("User already registered")) {
        friendlyMsg = "An account with this email already exists. Please log in.";
      } else if (error.message.includes("Password should be at least")) {
        friendlyMsg = "Password must be at least 6 characters long.";
      }
      setServerError(friendlyMsg);
      toast.error(friendlyMsg, "Signup Failed");
      return;
    }

    if (createdUser) {
      setIsSuccess(true);
      toast.success("Your account has been created successfully!", "Welcome to FinancialOS");
      setTimeout(() => {
        router.push("/dashboard");
      }, 1200);
    }
  };

  return (
    <div className="flex min-h-screen flex-col lg:flex-row bg-surface">
      {/* Left Banner */}
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
            AI-Powered Wealth & Financial Planning
          </span>
          <h1 className="text-4xl font-bold leading-tight tracking-tight text-white">
            Take Control of Your Personal Finances with Intelligence.
          </h1>
          <p className="text-base text-[#9CA3AF] leading-relaxed">
            Join FinancialOS to streamline investments, monitor budgets, analyze portfolio risks, and optimize your wealth journey automatically.
          </p>
        </div>

        <div className="relative z-10 text-xs text-[#9CA3AF]">
          © {new Date().getFullYear()} FinancialOS. All rights reserved.
        </div>
      </div>

      {/* Right Form Container */}
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
            <h2 className="text-2xl font-bold tracking-tight text-[#14181C]">Create your account</h2>
            <p className="mt-2 text-sm text-muted">
              Start managing your personal finances with AI-driven insights.
            </p>
          </div>

          {serverError && (
            <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-600">
              {serverError}
            </div>
          )}

          {isSuccess ? (
            <div className="rounded-card border border-emerald-200 bg-emerald-50 p-6 text-center space-y-3">
              <CheckCircle className="mx-auto h-12 w-12 text-emerald-600" />
              <h3 className="text-lg font-semibold text-emerald-900">Account Created!</h3>
              <p className="text-sm text-emerald-700">Redirecting to your dashboard...</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {/* Full Name */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[#14181C] uppercase tracking-wider">
                  Full Name
                </label>
                <Input
                  {...register("fullName")}
                  placeholder="e.g. Tanzir Rahman"
                  disabled={isSubmitting}
                  aria-invalid={!!errors.fullName}
                />
                {errors.fullName && (
                  <p className="text-xs text-red-500">{errors.fullName.message}</p>
                )}
              </div>

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
                <label className="text-xs font-semibold text-[#14181C] uppercase tracking-wider">
                  Password
                </label>
                <div className="relative">
                  <Input
                    {...register("password")}
                    type={showPassword ? "text" : "password"}
                    placeholder="At least 6 characters"
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

              {/* Confirm Password */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[#14181C] uppercase tracking-wider">
                  Confirm Password
                </label>
                <div className="relative">
                  <Input
                    {...register("confirmPassword")}
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Repeat your password"
                    disabled={isSubmitting}
                    className="pr-10"
                    aria-invalid={!!errors.confirmPassword}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword((prev) => !prev)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-[#14181C]"
                    tabIndex={-1}
                  >
                    {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <p className="text-xs text-red-500">{errors.confirmPassword.message}</p>
                )}
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
                    Creating account...
                  </>
                ) : (
                  <>
                    Create Account
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </Button>
            </form>
          )}

          <div className="text-center text-sm text-muted pt-2">
            Already have an account?{" "}
            <Link
              href="/login"
              className="font-medium text-primary hover:underline"
            >
              Sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
