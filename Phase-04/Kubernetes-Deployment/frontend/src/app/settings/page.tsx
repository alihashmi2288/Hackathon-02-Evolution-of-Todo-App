import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { auth } from "@/lib/auth-server";
import { PreferencesPage } from "@/components/settings";

/**
 * Settings page - displays user preferences.
 *
 * Task Reference: T097 [US7] - Create PreferencesPage route
 * Feature: 006-recurring-reminders
 *
 * This is a Server Component that:
 * 1. Checks if user is authenticated
 * 2. Redirects to /login if not
 * 3. Renders the PreferencesPage client component if authenticated
 */
export default async function SettingsPage() {
  // Check authentication on server
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  // Redirect to login if not authenticated
  if (!session) {
    redirect("/login");
  }

  return (
    <main className="min-h-screen">
      {/* Background decorative elements */}
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-accent-100/30 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-primary-100/40 rounded-full blur-3xl" />
      </div>
      {/* Header */}
      <header className="sticky top-0 z-40 glass border-b border-white/20">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-xl sm:text-2xl font-bold text-white font-display">
              Settings
            </h1>
            <div className="flex items-center gap-4">
              <span className="text-sm text-primary-200">
                {session.user.email}
              </span>
              <a
                href="/todos"
                className="text-sm text-primary-300 hover:text-white transition-colors"
              >
                Back to Todos
              </a>
            </div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <PreferencesPage />
    </main>
  );
}
