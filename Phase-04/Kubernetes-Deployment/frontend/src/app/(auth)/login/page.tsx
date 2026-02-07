/**
 * Login page with Better Auth integration.
 *
 * Task Reference: T027 - Update login/page.tsx to use LoginForm component
 * Task Reference: T031 - Redirect to home page on successful sign-in
 * Task Reference: T032 - Add "Create account" link pointing to /register
 * Task Reference: T049 [US6] - Display session expired message
 * Task Reference: T050 [US6] - Add return URL handling
 * Feature: 002-auth-identity, 004-frontend-todo-ui
 *
 * Implements US2: Existing User Sign In
 */

"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { LoginForm } from "@/components/auth/LoginForm";

function LoginPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // T049 [US6] - Check for session expired error
  const error = searchParams.get("error");
  const returnUrl = searchParams.get("returnUrl");
  const isSessionExpired = error === "session_expired";

  /**
   * Handle successful sign-in.
   * Task Reference: T031 - Redirect to home page on successful sign-in
   * Task Reference: T050 [US6] - Redirect to returnUrl if provided
   */
  const handleLoginSuccess = () => {
    // Redirect to returnUrl if provided, otherwise home page
    const destination = returnUrl ? decodeURIComponent(returnUrl) : "/";
    router.push(destination);
  };

  return (
    <main className="relative min-h-screen flex flex-col items-center justify-center p-6 overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-accent-200/20 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-primary-200/30 rounded-full blur-3xl" />
      </div>

      {/* Logo and branding */}
      <Link
        href="/"
        className="flex items-center gap-2 mb-8 group animate-fade-in"
      >
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-800 to-primary-950 flex items-center justify-center shadow-soft group-hover:shadow-soft-lg transition-shadow">
          <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <span className="font-display text-2xl font-semibold text-white">ClearDay</span>
      </Link>

      {/* Login Card */}
      <div className="w-full max-w-md animate-fade-in-up">
        <div className="glass-card rounded-3xl p-8 sm:p-10 border border-white/50 shadow-soft-lg">
          <div className="text-center mb-8">
            <h1 className="font-display text-3xl font-bold text-white mb-2">
              Welcome back
            </h1>
            <p className="text-primary-300">
              Sign in to continue to your tasks
            </p>
          </div>

          {/* T049 [US6] - Session expired message */}
          {isSessionExpired && (
            <div className="mb-6 p-4 rounded-xl bg-accent-50 border border-accent-200 animate-fade-in-down">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-accent-100 flex items-center justify-center">
                  <svg className="w-4 h-4 text-accent-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <p className="text-accent-800 text-sm font-medium">
                  Your session has expired. Please sign in again.
                </p>
              </div>
            </div>
          )}

          <LoginForm onSuccess={handleLoginSuccess} />

          {/* Divider */}
          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-primary-200" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white text-primary-500 rounded-full text-xs font-semibold py-1">New to ClearDay?</span>
            </div>
          </div>

          {/* Create account link (T032) */}
          <Link
            href="/register"
            className="block w-full py-3 px-4 text-center font-medium text-primary-700 bg-primary-50 hover:bg-primary-100 rounded-xl transition-colors"
          >
            Create an account
          </Link>
        </div>

        <div className="mt-6 text-center animate-fade-in stagger-2">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-primary-400 hover:text-white transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Home
          </Link>
        </div>
      </div>
    </main>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <main className="relative min-h-screen flex flex-col items-center justify-center p-6">
        <div className="w-full max-w-md">
          <div className="glass-card rounded-3xl p-8 sm:p-10 border border-white/50 shadow-soft-lg">
            <div className="text-center mb-8">
              <div className="h-10 w-48 mx-auto skeleton mb-4" />
              <div className="h-5 w-64 mx-auto skeleton" />
            </div>
            <div className="space-y-4">
              <div className="h-12 skeleton" />
              <div className="h-12 skeleton" />
              <div className="h-12 skeleton" />
            </div>
          </div>
        </div>
      </main>
    }>
      <LoginPageContent />
    </Suspense>
  );
}
