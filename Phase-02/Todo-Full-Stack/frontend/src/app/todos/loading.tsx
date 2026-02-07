import { Spinner } from "@/components/ui/Spinner";

/**
 * Loading state for todos page.
 *
 * Task Reference: T016 [US1] - Create loading.tsx for suspense fallback
 * Feature: 004-frontend-todo-ui
 */
export default function TodosLoading() {
  return (
    <main className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="h-8 w-32 bg-gray-200 rounded animate-pulse" />
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col items-center justify-center py-12">
          <Spinner size="lg" />
          <p className="mt-4 text-gray-600">Loading your todos...</p>
        </div>
      </div>
    </main>
  );
}
