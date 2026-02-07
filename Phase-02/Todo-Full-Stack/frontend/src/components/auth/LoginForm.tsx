"use client";

/**
 * Login form component.
 *
 * Task Reference: T026 - Create LoginForm.tsx with email, password fields
 * Task Reference: T028 - Add form validation with generic error message for invalid credentials
 * Task Reference: T029 - Add loading state during sign-in submission
 * Task Reference: T030 - Handle 401 error response with generic "Invalid credentials" message
 * Feature: 002-auth-identity
 *
 * Implements US2: Existing User Sign In
 */

import { useState, useCallback } from "react";
import { signInWithEmail, type SignInCredentials } from "@/lib/auth";

interface LoginFormProps {
  onSuccess?: () => void;
}

interface FormErrors {
  email?: string;
  password?: string;
  general?: string;
}

/**
 * Email validation regex - RFC 5322 compliant
 */
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function LoginForm({ onSuccess }: LoginFormProps) {
  // Form state
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // UI state
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});

  /**
   * Validate form fields.
   * Task Reference: T028 - Form validation
   */
  const validateForm = useCallback((): boolean => {
    const newErrors: FormErrors = {};

    // Email validation
    if (!email.trim()) {
      newErrors.email = "Email is required";
    } else if (!EMAIL_REGEX.test(email)) {
      newErrors.email = "Please enter a valid email address";
    }

    // Password validation
    if (!password) {
      newErrors.password = "Password is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [email, password]);

  /**
   * Handle form submission.
   * Task Reference: T029 - Loading state during submission
   * Task Reference: T030 - Handle 401 error with generic message
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Clear previous errors
    setErrors({});

    // Validate form
    if (!validateForm()) {
      return;
    }

    // Set loading state (T029)
    setIsLoading(true);

    try {
      const credentials: SignInCredentials = {
        email: email.trim(),
        password,
      };

      const result = await signInWithEmail(credentials);

      if (result.error) {
        // Handle 401 error with generic message (T030)
        // Security: Don't reveal whether email exists or password is wrong
        if (result.error.status === 401 || result.error.code === "INVALID_CREDENTIALS") {
          setErrors({
            general: "Invalid email or password. Please try again.",
          });
        } else if (result.error.status === 429) {
          setErrors({
            general: "Too many login attempts. Please try again later.",
          });
        } else {
          // Generic error handling
          setErrors({
            general: "Sign in failed. Please try again.",
          });
        }
        return;
      }

      // Success - call callback for redirect (T031 handled by parent)
      onSuccess?.();
    } catch (error) {
      setErrors({
        general: "An unexpected error occurred. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* General error message */}
      {errors.general && (
        <div className="p-4 rounded-xl bg-danger-50 border border-danger-200 animate-fade-in-down">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-danger-100 flex items-center justify-center shrink-0">
              <svg className="w-4 h-4 text-danger-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p className="text-sm text-danger-700 font-medium">{errors.general}</p>
          </div>
        </div>
      )}

      {/* Email field */}
      <div>
        <label
          htmlFor="email"
          className="block text-sm font-medium text-primary-200 mb-2"
        >
          Email address
        </label>
        <input
          type="email"
          id="email"
          name="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          disabled={isLoading}
          autoComplete="email"
          className={`w-full px-4 py-3 bg-white border-2 rounded-xl text-primary-900 placeholder:text-primary-400 transition-all duration-200 focus:outline-none focus:ring-4 hover:border-primary-300 disabled:bg-primary-50 disabled:text-primary-500 disabled:cursor-not-allowed ${errors.email
              ? "border-danger-400 focus:border-danger-500 focus:ring-danger-100"
              : "border-primary-200 focus:border-accent-400 focus:ring-accent-100"
            }`}
          aria-invalid={!!errors.email}
          aria-describedby={errors.email ? "email-error" : undefined}
        />
        {errors.email && (
          <p id="email-error" className="mt-2 text-sm text-danger-600 flex items-center gap-1.5">
            <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {errors.email}
          </p>
        )}
      </div>

      {/* Password field */}
      <div>
        <label
          htmlFor="password"
          className="block text-sm font-medium text-primary-200 mb-2"
        >
          Password
        </label>
        <input
          type="password"
          id="password"
          name="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Enter your password"
          disabled={isLoading}
          autoComplete="current-password"
          className={`w-full px-4 py-3 bg-white border-2 rounded-xl text-primary-900 placeholder:text-primary-400 transition-all duration-200 focus:outline-none focus:ring-4 hover:border-primary-300 disabled:bg-primary-50 disabled:text-primary-500 disabled:cursor-not-allowed ${errors.password
              ? "border-danger-400 focus:border-danger-500 focus:ring-danger-100"
              : "border-primary-200 focus:border-accent-400 focus:ring-accent-100"
            }`}
          aria-invalid={!!errors.password}
          aria-describedby={errors.password ? "password-error" : undefined}
        />
        {errors.password && (
          <p id="password-error" className="mt-2 text-sm text-danger-600 flex items-center gap-1.5">
            <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {errors.password}
          </p>
        )}
      </div>

      {/* Submit button with loading state (T029) */}
      <button
        type="submit"
        disabled={isLoading}
        className="w-full py-3.5 px-4 bg-gradient-to-r from-primary-800 to-primary-950 text-white font-semibold rounded-xl transition-all duration-200 shadow-soft hover:shadow-soft-lg hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2"
      >
        {isLoading ? (
          <>
            <svg
              className="animate-spin h-5 w-5 text-white"
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
            <span>Signing in...</span>
          </>
        ) : (
          <>
            <span>Sign In</span>
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </>
        )}
      </button>
    </form>
  );
}

export default LoginForm;
