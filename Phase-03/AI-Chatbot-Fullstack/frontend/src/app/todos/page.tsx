import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { auth } from "@/lib/auth-server";
import { TodoList } from "@/components/todos/TodoList";
import { TodosHeader } from "@/components/layout/TodosHeader";

/**
 * Todos page - displays the user's todo list.
 *
 * Task Reference: T015 [US1] - Create todos page route with auth check
 * Task Reference: T051 [US7] - Add responsive padding and layout
 * Task Reference: T052 [US7] - Ensure mobile-first design (320px minimum)
 * Task Reference: T072 [US3] - Add NotificationCenter to header (006-recurring-reminders)
 * Feature: 004-frontend-todo-ui, 006-recurring-reminders
 *
 * This is a Server Component that:
 * 1. Checks if user is authenticated
 * 2. Redirects to /login if not
 * 3. Renders the TodoList client component if authenticated
 */
export default async function TodosPage() {
  // Check authentication on server
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  // Redirect to login if not authenticated
  if (!session) {
    redirect("/login");
  }

  return (
    <main className="min-h-screen relative">
      {/* Background decorative elements */}
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-accent-100/30 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-primary-100/40 rounded-full blur-3xl" />
      </div>

      {/* Header with notifications - T072 [US3] */}
      <TodosHeader userEmail={session.user.email} userName={session.user.name} />

      {/* Main content - T051/T052 [US7] Mobile responsive */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <TodoList />
      </div>
    </main>
  );
}
