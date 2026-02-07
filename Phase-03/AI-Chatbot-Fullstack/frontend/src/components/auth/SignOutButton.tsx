"use client";

/**
 * Sign out button component.
 *
 * Task Reference: T042 - Create SignOutButton.tsx component
 * Task Reference: T046 - Redirect to login page after successful sign out
 * Feature: 002-auth-identity
 *
 * Implements US4: User Sign Out
 */

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signOutUser } from "@/lib/auth";

interface SignOutButtonProps {
  className?: string;
  variant?: "primary" | "secondary" | "ghost" | "text";
  size?: "sm" | "md";
}

export function SignOutButton({
  className = "",
  variant = "ghost",
  size = "md",
}: SignOutButtonProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  /**
   * Handle sign out.
   * Task Reference: T046 - Redirect to login page after successful sign out
   */
  const handleSignOut = async () => {
    setIsLoading(true);

    try {
      const result = await signOutUser();

      if (result.success) {
        // Redirect to login page after successful sign out (T046)
        router.push("/login");
      } else {
        // Handle error - still redirect as session may be partially cleared
        console.error("Sign out error:", result.error?.message);
        router.push("/login");
      }
    } catch (error) {
      console.error("Unexpected sign out error:", error);
      // Still redirect on error
      router.push("/login");
    } finally {
      setIsLoading(false);
    }
  };

  // Base styles
  const baseStyles =
    "inline-flex items-center justify-center font-medium rounded-xl transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-50";

  // Variant styles
  const variantStyles = {
    primary:
      "bg-gradient-to-r from-danger-500 to-danger-600 text-white shadow-sm hover:from-danger-600 hover:to-danger-700",
    secondary:
      "bg-white text-primary-700 border border-primary-200 hover:bg-primary-50 hover:border-primary-300",
    ghost:
      "bg-transparent text-primary-200 hover:bg-white/10 hover:text-white",
    text:
      "text-primary-500 hover:text-primary-700",
  };

  // Size styles
  const sizeStyles = {
    sm: "px-3 py-1.5 text-sm gap-1.5",
    md: "px-4 py-2 text-sm gap-2",
  };

  return (
    <button
      onClick={handleSignOut}
      disabled={isLoading}
      className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
    >
      {isLoading ? (
        <>
          <svg
            className="animate-spin h-4 w-4"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
          <span>Signing out...</span>
        </>
      ) : (
        <>
          <svg
            className="w-4 h-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
            />
          </svg>
          <span>Sign Out</span>
        </>
      )}
    </button>
  );
}

export default SignOutButton;
