"use client";

/**
 * Registration form component.
 *
 * Task Reference: T018 - Create RegisterForm.tsx with email, password, name fields
 * Task Reference: T020 - Add password requirements display (min 8 chars)
 * Task Reference: T021 - Add form validation with error messages for invalid email
 * Task Reference: T022 - Add loading state during registration submission
 * Task Reference: T023 - Handle duplicate email error (409) with user-friendly message
 * Feature: 002-auth-identity
 *
 * Implements US1: New User Registration
 */

import { useState, useCallback } from "react";
import { signUpWithEmail, type SignUpCredentials } from "@/lib/auth";

interface RegisterFormProps {
  onSuccess?: () => void;
}

interface FormErrors {
  name?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
  general?: string;
}

/**
 * Email validation regex - RFC 5322 compliant
 */
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Minimum password length per Better Auth configuration
 */
const MIN_PASSWORD_LENGTH = 8;

export function RegisterForm({ onSuccess }: RegisterFormProps) {
  // Form state
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // UI state
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});

  /**
   * Validate form fields.
   * Task Reference: T021 - Form validation with error messages
   */
  const validateForm = useCallback((): boolean => {
    const newErrors: FormErrors = {};

    // Name validation
    if (!name.trim()) {
      newErrors.name = "Name is required";
    } else if (name.trim().length < 2) {
      newErrors.name = "Name must be at least 2 characters";
    }

    // Email validation (T021)
    if (!email.trim()) {
      newErrors.email = "Email is required";
    } else if (!EMAIL_REGEX.test(email)) {
      newErrors.email = "Please enter a valid email address";
    }

    // Password validation (T020)
    if (!password) {
      newErrors.password = "Password is required";
    } else if (password.length < MIN_PASSWORD_LENGTH) {
      newErrors.password = `Password must be at least ${MIN_PASSWORD_LENGTH} characters`;
    }

    // Confirm password validation
    if (!confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password";
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [name, email, password, confirmPassword]);

  /**
   * Handle form submission.
   * Task Reference: T022 - Loading state during submission
   * Task Reference: T023 - Handle duplicate email error (409)
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Clear previous errors
    setErrors({});

    // Validate form
    if (!validateForm()) {
      return;
    }

    // Set loading state (T022)
    setIsLoading(true);

    try {
      const credentials: SignUpCredentials = {
        email: email.trim(),
        password,
        name: name.trim(),
      };

      const result = await signUpWithEmail(credentials);

      if (result.error) {
        // Handle duplicate email error (T023)
        if (result.error.status === 409 || result.error.code === "USER_ALREADY_EXISTS") {
          setErrors({
            email: "An account with this email already exists. Please sign in instead.",
          });
        } else {
          // Generic error handling
          setErrors({
            general: result.error.message || "Registration failed. Please try again.",
          });
        }
        return;
      }

      // Success - call callback for redirect (T024 handled by parent)
      onSuccess?.();
    } catch (error) {
      setErrors({
        general: "An unexpected error occurred. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const inputBaseStyles = "w-full px-4 py-3 bg-white border-2 rounded-xl text-primary-900 placeholder:text-primary-400 transition-all duration-200 focus:outline-none focus:ring-4 hover:border-primary-300 disabled:bg-primary-50 disabled:text-primary-500 disabled:cursor-not-allowed";
  const inputErrorStyles = "border-danger-400 focus:border-danger-500 focus:ring-danger-100";
  const inputNormalStyles = "border-primary-200 focus:border-accent-400 focus:ring-accent-100";

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

      {/* Name field */}
      <div>
        <label
          htmlFor="name"
          className="block text-sm font-medium text-primary-200 mb-2"
        >
          Full name
        </label>
        <input
          type="text"
          id="name"
          name="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="John Doe"
          disabled={isLoading}
          className={`${inputBaseStyles} ${errors.name ? inputErrorStyles : inputNormalStyles}`}
          aria-invalid={!!errors.name}
          aria-describedby={errors.name ? "name-error" : undefined}
        />
        {errors.name && (
          <p id="name-error" className="mt-2 text-sm text-danger-600 flex items-center gap-1.5">
            <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {errors.name}
          </p>
        )}
      </div>

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
          className={`${inputBaseStyles} ${errors.email ? inputErrorStyles : inputNormalStyles}`}
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
          placeholder="Create a strong password"
          disabled={isLoading}
          autoComplete="new-password"
          className={`${inputBaseStyles} ${errors.password ? inputErrorStyles : inputNormalStyles}`}
          aria-invalid={!!errors.password}
          aria-describedby="password-requirements"
        />
        {/* Password requirements display (T020) */}
        <p
          id="password-requirements"
          className={`mt-2 text-sm flex items-center gap-1.5 ${errors.password ? "text-danger-600" : "text-primary-500"
            }`}
        >
          {errors.password ? (
            <>
              <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {errors.password}
            </>
          ) : (
            <>
              <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {`Must be at least ${MIN_PASSWORD_LENGTH} characters`}
            </>
          )}
        </p>
      </div>

      {/* Confirm Password field */}
      <div>
        <label
          htmlFor="confirmPassword"
          className="block text-sm font-medium text-primary-200 mb-2"
        >
          Confirm password
        </label>
        <input
          type="password"
          id="confirmPassword"
          name="confirmPassword"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          placeholder="Confirm your password"
          disabled={isLoading}
          autoComplete="new-password"
          className={`${inputBaseStyles} ${errors.confirmPassword ? inputErrorStyles : inputNormalStyles}`}
          aria-invalid={!!errors.confirmPassword}
          aria-describedby={errors.confirmPassword ? "confirm-error" : undefined}
        />
        {errors.confirmPassword && (
          <p id="confirm-error" className="mt-2 text-sm text-danger-600 flex items-center gap-1.5">
            <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {errors.confirmPassword}
          </p>
        )}
      </div>

      {/* Submit button with loading state (T022) */}
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
            <span>Creating account...</span>
          </>
        ) : (
          <>
            <span>Create Account</span>
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </>
        )}
      </button>
    </form>
  );
}

export default RegisterForm;
