/**
 * Register page with Better Auth integration.
 *
 * Task Reference: T019 - Update register/page.tsx to use RegisterForm component
 * Task Reference: T024 - Redirect to home page on successful registration
 * Feature: 002-auth-identity
 *
 * Implements US1: New User Registration
 */

"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { RegisterForm } from "@/components/auth/RegisterForm";

export default function RegisterPage() {
  const router = useRouter();

  /**
   * Handle successful registration.
   * Task Reference: T024 - Redirect to home page on successful registration
   */
  const handleRegistrationSuccess = () => {
    // Redirect to home page after successful registration
    router.push("/");
  };

  return (
    <main className="relative min-h-screen flex flex-col items-center justify-center p-6 overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-accent-200/20 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 left-1/4 w-80 h-80 bg-primary-200/30 rounded-full blur-3xl" />
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

      {/* Register Card */}
      <div className="w-full max-w-md animate-fade-in-up">
        <div className="glass-card rounded-3xl p-8 sm:p-10 border border-white/50 shadow-soft-lg">
          <div className="text-center mb-8">
            <h1 className="font-display text-3xl font-bold text-white mb-2">
              Create account
            </h1>
            <p className="text-primary-300">
              Join ClearDay and start organizing your life
            </p>
          </div>

          <RegisterForm onSuccess={handleRegistrationSuccess} />

          {/* Divider */}
          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-primary-200" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white text-primary-500">Already have an account?</span>
            </div>
          </div>

          {/* Sign in link */}
          <Link
            href="/login"
            className="block w-full py-3 px-4 text-center font-medium text-primary-700 bg-primary-50 hover:bg-primary-100 rounded-xl transition-colors"
          >
            Sign in instead
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
