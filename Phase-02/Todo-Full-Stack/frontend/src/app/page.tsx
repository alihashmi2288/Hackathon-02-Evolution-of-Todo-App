/**
 * Home page for the Todo application.
 *
 * Task Reference: T022 - Create frontend/src/app/page.tsx with basic home page
 * Task Reference: T043 - Add SignOutButton for authenticated users
 * Task Reference: T044 - Implement session check to show/hide SignOutButton
 * Feature: 001-project-init-architecture, 002-auth-identity
 *
 * Built with Next.js 16.0.10 - App Router
 */

"use client";

import Link from "next/link";
import { useSession } from "@/lib/auth";
import { SignOutButton } from "@/components/auth/SignOutButton";

export default function Home() {
  // T044: Check session to determine auth state
  const { data: session, isPending } = useSession();
  const isAuthenticated = !!session?.user;

  return (
    <main className="relative min-h-screen overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-accent-200/30 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-primary-200/40 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-radial from-accent-100/20 to-transparent rounded-full" />
      </div>

      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 glass-card border-b border-white/20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2 group">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-800 to-primary-950 flex items-center justify-center shadow-soft group-hover:shadow-soft-lg transition-shadow">
                <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <span className="font-display text-xl font-semibold text-white">ClearDay</span>
            </Link>

            {/* Auth Actions */}
            <div className="flex items-center gap-3">
              {isPending ? (
                <div className="h-8 w-24 skeleton" />
              ) : isAuthenticated ? (
                <>
                  <span className="text-sm text-white hidden sm:block">
                    {session.user.email}
                  </span>
                  <SignOutButton variant="ghost" />
                </>
              ) : (
                <>
                  <Link
                    href="/login"
                    className="px-4 py-2 text-sm font-medium text-primary-200 hover:text-white transition-colors"
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/register"
                    className="px-4 py-2 text-sm font-semibold bg-white text-primary-900 rounded-xl hover:bg-primary-50 transition-all shadow-soft hover:shadow-soft-lg"
                  >
                    Get Started
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          {/* Decorative badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-accent-100/80 border border-accent-200/50 mb-8 animate-fade-in">
            <span className="w-1.5 h-1.5 rounded-full bg-accent-500 animate-pulse-soft" />
            <span className="text-sm font-medium text-accent-800">Beautifully Crafted</span>
          </div>

          {/* Main headline */}
          <h1 className="font-display text-5xl sm:text-6xl lg:text-7xl font-bold text-white mb-6 leading-[1.1] animate-fade-in-up">
            Your tasks deserve{" "}
            <span className="relative">
              <span className="gradient-text-accent">elegance</span>
              <svg className="absolute -bottom-2 left-0 w-full h-3 text-accent-400/30" viewBox="0 0 100 12" preserveAspectRatio="none">
                <path d="M0 6Q25 0,50 6T100 6" stroke="currentColor" strokeWidth="3" fill="none" />
              </svg>
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-lg sm:text-xl text-primary-300 max-w-2xl mx-auto mb-10 leading-relaxed animate-fade-in-up stagger-1">
            A refined task management experience for professionals who appreciate
            thoughtful design and seamless functionality.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-in-up stagger-2">
            {isAuthenticated ? (
              <>
                <Link
                  href="/todos"
                  className="group inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-primary-800 to-primary-950 text-white font-semibold rounded-2xl shadow-soft-lg hover:shadow-glow transition-all hover:-translate-y-0.5"
                >
                  Open My Tasks
                  <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </Link>
                <a
                  href="http://localhost:8000/docs"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-6 py-3 text-primary-200 font-medium hover:text-white transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                  API Documentation
                </a>
              </>
            ) : (
              <>
                <Link
                  href="/register"
                  className="group inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-primary-800 to-primary-950 text-white font-semibold rounded-2xl shadow-soft-lg hover:shadow-glow transition-all hover:-translate-y-0.5"
                >
                  Start for Free
                  <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </Link>
                <a
                  href="http://localhost:8000/docs"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-6 py-3 text-primary-200 font-medium hover:text-white transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                  API Documentation
                </a>
              </>
            )}
          </div>
        </div>
      </section >

      {/* Welcome message for authenticated users */}
      {
        isAuthenticated && (
          <section className="px-4 sm:px-6 lg:px-8 pb-12 animate-fade-in-up stagger-3">
            <div className="max-w-lg mx-auto">
              <div className="glass-card rounded-2xl p-6 border border-white/20 bg-white/5">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-success-400 to-success-600 flex items-center justify-center">
                    <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-white font-medium">
                      Welcome back, <span className="font-semibold">{session.user.name || session.user.email}</span>
                    </p>
                    <p className="text-primary-200 text-sm">Your tasks are waiting for you</p>
                  </div>
                </div>
              </div>
            </div>
          </section>
        )
      }

      {/* Features Section */}
      <section className="px-4 sm:px-6 lg:px-8 py-24">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12 animate-fade-in-up stagger-2">
            <h2 className="font-display text-3xl font-bold text-white mb-4">
              Built with Modern Technology
            </h2>
            <p className="text-primary-200 max-w-2xl mx-auto">
              Leveraging the latest standards for performance, security, and developer experience.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch justify-center">
            {/* Frontend Card */}
            <div className="group relative bg-white/5 backdrop-blur-xl rounded-3xl p-8 shadow-2xl ring-1 ring-white/10 hover:bg-white/10 transition-all duration-300 hover:-translate-y-1 animate-fade-in-up stagger-3">
              
              <div className="flex flex-col items-center text-center mb-6">
                <div className="w-16 h-16 rounded-2xl bg-white/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300 shadow-inner">
                  <svg className="w-8 h-8 text-accent-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <h3 className="font-display text-2xl font-bold text-white">
                  Frontend Architecture
                </h3>
              </div>
              
              <ul className="space-y-3">
                {[
                  "Next.js 16.0.10 (App Router)",
                  "React 19 with TypeScript",
                  "Tailwind CSS 3.4+",
                  "Better Auth Integration",
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 transition-colors border border-transparent hover:border-white/10">
                    <div className="w-6 h-6 rounded-full bg-accent-500/20 flex items-center justify-center shrink-0">
                      <svg className="w-3 h-3 text-accent-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <span className="text-primary-100 font-medium">{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Backend Card */}
            <div className="group relative bg-white/5 backdrop-blur-xl rounded-3xl p-8 shadow-2xl ring-1 ring-white/10 hover:bg-white/10 transition-all duration-300 hover:-translate-y-1 animate-fade-in-up stagger-4">
              
              <div className="flex flex-col items-center text-center mb-6">
                <div className="w-16 h-16 rounded-2xl bg-white/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300 shadow-inner">
                  <svg className="w-8 h-8 text-primary-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                </div>
                <h3 className="font-display text-2xl font-bold text-white">
                  Backend Architecture
                </h3>
              </div>
              
              <ul className="space-y-3">
                {[
                  "FastAPI 0.100+",
                  "SQLModel ORM",
                  "Neon PostgreSQL",
                  "JWT Authentication",
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 transition-colors border border-transparent hover:border-white/10">
                    <div className="w-6 h-6 rounded-full bg-primary-500/20 flex items-center justify-center shrink-0">
                      <svg className="w-3 h-3 text-primary-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <span className="text-primary-100 font-medium">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-primary-200/50 py-8 px-4">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-primary-800 to-primary-950 flex items-center justify-center">
              <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <span className="text-sm text-primary-500">ClearDay &copy; {new Date().getFullYear()}</span>
          </div>
          <p className="text-sm text-primary-400">
            Created by Syed Ali Hashmi
          </p>
        </div>
      </footer>
    </main >
  );
}
