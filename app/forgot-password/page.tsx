"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Wallet, Loader2, Mail, ArrowLeft, CheckCircle } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/components/ui/toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const forgotPasswordSchema = z.object({
  email: z
    .string()
    .min(1, "Email address is required")
    .email("Please enter a valid email address"),
});

type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>;

export default function ForgotPasswordPage() {
  const { forgotPassword } = useAuth();
  const toast = useToast();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSent, setIsSent] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: "",
    },
  });

  const onSubmit = async (data: ForgotPasswordFormValues) => {
    setIsSubmitting(true);
    setServerError(null);

    const { error } = await forgotPassword(data.email.trim());

    setIsSubmitting(false);

    if (error) {
      setServerError(error.message);
      toast.error(error.message, "Reset Failed");
      return;
    }

    setIsSent(true);
    toast.success("Password reset instructions have been sent to your email.", "Email Sent");
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
            Account Recovery
          </span>
          <h1 className="text-4xl font-bold leading-tight tracking-tight text-white">
            Reset your password securely.
          </h1>
          <p className="text-base text-[#9CA3AF] leading-relaxed">
            We will send you a secure link to reset your account password and restore access to your financial dashboard.
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
            <h2 className="text-2xl font-bold tracking-tight text-[#14181C]">Forgot your password?</h2>
            <p className="mt-2 text-sm text-muted">
              Enter the email address associated with your account and we will send you a reset link.
            </p>
          </div>

          {serverError && (
            <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-600">
              {serverError}
            </div>
          )}

          {isSent ? (
            <div className="rounded-card border border-emerald-200 bg-emerald-50 p-6 text-center space-y-4">
              <CheckCircle className="mx-auto h-12 w-12 text-emerald-600" />
              <div className="space-y-1">
                <h3 className="text-lg font-semibold text-emerald-900">Check your email</h3>
                <p className="text-xs text-emerald-700 leading-relaxed">
                  We have sent password reset instructions to your email address. Please check your inbox and click the reset link.
                </p>
              </div>
              <Button
                variant="secondary"
                onClick={() => setIsSent(false)}
                className="w-full text-xs"
              >
                Resend Reset Link
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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

              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full h-11 text-sm font-medium mt-2 gap-2"
                variant="primary"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Sending link...
                  </>
                ) : (
                  <>
                    <Mail className="h-4 w-4" />
                    Send Reset Link
                  </>
                )}
              </Button>
            </form>
          )}

          <div className="text-center text-sm text-muted pt-2">
            <Link
              href="/login"
              className="inline-flex items-center gap-1.5 font-medium text-primary hover:underline"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
