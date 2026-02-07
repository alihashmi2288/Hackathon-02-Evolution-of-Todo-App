/**
 * Service Worker for Push Notifications.
 *
 * Task Reference: T128 [US12] - Create service worker for push events
 * Task Reference: T131 [US12] - Handle notification click to open app
 * Feature: 006-recurring-reminders
 *
 * Handles push events and notification clicks.
 */

// Cache version for service worker updates
const CACHE_VERSION = "v1";

/**
 * Handle push notifications from the server.
 * T128 [US12]
 */
self.addEventListener("push", (event) => {
  console.log("[SW] Push event received");

  if (!event.data) {
    console.log("[SW] Push event has no data");
    return;
  }

  let data;
  try {
    data = event.data.json();
  } catch (e) {
    console.error("[SW] Failed to parse push data:", e);
    data = {
      title: "Todo Reminder",
      body: event.data.text(),
    };
  }

  const options = {
    body: data.body || "You have a reminder",
    icon: "/icon-192x192.png",
    badge: "/badge-72x72.png",
    tag: data.tag || "todo-notification",
    renotify: true,
    requireInteraction: data.requireInteraction || false,
    data: {
      url: data.url || "/",
      todoId: data.todoId,
      reminderId: data.reminderId,
    },
    actions: data.actions || [],
  };

  // Show the notification
  event.waitUntil(
    self.registration.showNotification(data.title || "Todo App", options)
  );
});

/**
 * Handle notification clicks.
 * T131 [US12] - Navigate to the appropriate page when clicked.
 */
self.addEventListener("notificationclick", (event) => {
  console.log("[SW] Notification click received");

  event.notification.close();

  const data = event.notification.data || {};
  let urlToOpen = data.url || "/";

  // Handle action buttons if present
  if (event.action) {
    switch (event.action) {
      case "snooze":
        // Snooze action - could open a snooze dialog
        urlToOpen = `/todos?snooze=${data.reminderId}`;
        break;
      case "complete":
        // Complete action - could mark todo as complete
        urlToOpen = `/todos?complete=${data.todoId}`;
        break;
      case "view":
      default:
        // Default: navigate to the todo
        if (data.todoId) {
          urlToOpen = `/todos?highlight=${data.todoId}`;
        }
        break;
    }
  } else if (data.todoId) {
    // No action, but has todoId - highlight the todo
    urlToOpen = `/todos?highlight=${data.todoId}`;
  }

  // Open or focus the app window
  event.waitUntil(
    clients
      .matchAll({
        type: "window",
        includeUncontrolled: true,
      })
      .then((windowClients) => {
        // Check if there's already a window open
        for (const client of windowClients) {
          // If we found a matching window, focus it
          if (client.url.includes(self.location.origin) && "focus" in client) {
            client.navigate(urlToOpen);
            return client.focus();
          }
        }

        // No existing window, open a new one
        if (clients.openWindow) {
          return clients.openWindow(urlToOpen);
        }
      })
  );
});

/**
 * Handle notification close (dismissed without clicking).
 */
self.addEventListener("notificationclose", (event) => {
  console.log("[SW] Notification closed:", event.notification.tag);
});

/**
 * Service worker install event.
 */
self.addEventListener("install", (event) => {
  console.log("[SW] Service Worker installing...");
  // Take over immediately
  self.skipWaiting();
});

/**
 * Service worker activate event.
 */
self.addEventListener("activate", (event) => {
  console.log("[SW] Service Worker activating...");
  // Claim all clients immediately
  event.waitUntil(clients.claim());
});

/**
 * Handle messages from the main app.
 */
self.addEventListener("message", (event) => {
  console.log("[SW] Message received:", event.data);

  if (event.data && event.data.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
});
