"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Wallet, Eye, EyeOff, Loader2, KeyRound, CheckCircle } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/components/ui/toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const resetPasswordSchema = z
  .object({
    password: z
      .string()
      .min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string().min(1, "Please confirm your new password"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>;

export default function ResetPasswordPage() {
  const router = useRouter();
  const { resetPassword } = useAuth();
  const toast = useToast();

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async (data: ResetPasswordFormValues) => {
    setIsSubmitting(true);
    setServerError(null);

    const { error } = await resetPassword(data.password);

    setIsSubmitting(false);

    if (error) {
      setServerError(error.message);
      toast.error(error.message, "Reset Failed");
      return;
    }

    setIsSuccess(true);
    toast.success("Your password has been successfully updated!", "Password Updated");

    setTimeout(() => {
      router.push("/login");
    }, 1500);
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
            Security Management
          </span>
          <h1 className="text-4xl font-bold leading-tight tracking-tight text-white">
            Create a strong new password.
          </h1>
          <p className="text-[#9CA3AF] text-base leading-relaxed">
            Ensure your account is protected with a unique, secure password before accessing your financial dashboard.
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
            <h2 className="text-2xl font-bold tracking-tight text-[#14181C]">Set new password</h2>
            <p className="mt-2 text-sm text-muted">
              Enter and confirm your new password below.
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
              <h3 className="text-lg font-semibold text-emerald-900">Password Reset Complete!</h3>
              <p className="text-xs text-emerald-700">Redirecting to login page...</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {/* New Password */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[#14181C] uppercase tracking-wider">
                  New Password
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
                  Confirm New Password
                </label>
                <div className="relative">
                  <Input
                    {...register("confirmPassword")}
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Repeat your new password"
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
                    Updating password...
                  </>
                ) : (
                  <>
                    <KeyRound className="h-4 w-4" />
                    Update Password
                  </>
                )}
              </Button>
            </form>
          )}

          <div className="text-center text-sm text-muted pt-2">
            Remembered your password?{" "}
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
