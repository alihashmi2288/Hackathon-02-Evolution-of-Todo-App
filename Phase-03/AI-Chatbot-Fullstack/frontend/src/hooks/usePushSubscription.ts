/**
 * Push subscription management hook.
 *
 * Task Reference: T129 [US12] - Create usePushSubscription hook
 * Task Reference: T130 [US12] - Implement permission request flow
 * Task Reference: T132 [US12] - Register service worker conditionally
 * Feature: 006-recurring-reminders
 *
 * Provides functionality for:
 * - Checking push notification support
 * - Requesting notification permission
 * - Subscribing/unsubscribing from push notifications
 * - Service worker registration
 */

"use client";

import { useState, useEffect, useCallback } from "react";
import { api } from "@/services/api";

/**
 * Push subscription state.
 */
export interface PushState {
  /** Whether push notifications are supported by the browser */
  isSupported: boolean;
  /** Whether push is configured on the server (has VAPID keys) */
  isConfigured: boolean;
  /** Current permission state: granted, denied, or default */
  permission: NotificationPermission | "unsupported";
  /** Whether the user is currently subscribed */
  isSubscribed: boolean;
  /** Whether an operation is in progress */
  isLoading: boolean;
  /** Error message if any operation failed */
  error: string | null;
}

/**
 * VAPID key response from the server.
 */
interface VapidKeyResponse {
  public_key: string;
  configured: boolean;
}

/**
 * Convert a URL-safe base64 string to a Uint8Array.
 * Required for applicationServerKey in PushManager.subscribe().
 */
function urlBase64ToUint8Array(base64String: string): BufferSource {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding)
    .replace(/-/g, "+")
    .replace(/_/g, "/");

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray.buffer;
}

/**
 * Hook for managing push notification subscriptions.
 *
 * Task Reference: T129 [US12]
 */
export function usePushSubscription() {
  const [state, setState] = useState<PushState>({
    isSupported: false,
    isConfigured: false,
    permission: "unsupported",
    isSubscribed: false,
    isLoading: true,
    error: null,
  });

  const [vapidPublicKey, setVapidPublicKey] = useState<string | null>(null);
  const [swRegistration, setSwRegistration] =
    useState<ServiceWorkerRegistration | null>(null);

  /**
   * Check if push notifications are supported.
   */
  const checkSupport = useCallback(() => {
    const supported =
      typeof window !== "undefined" &&
      "serviceWorker" in navigator &&
      "PushManager" in window &&
      "Notification" in window;

    const permission = supported
      ? Notification.permission
      : ("unsupported" as const);

    return { supported, permission };
  }, []);

  /**
   * Register the service worker.
   * T132 [US12]
   */
  const registerServiceWorker =
    useCallback(async (): Promise<ServiceWorkerRegistration | null> => {
      if (!("serviceWorker" in navigator)) {
        return null;
      }

      try {
        const registration = await navigator.serviceWorker.register("/sw.js", {
          scope: "/",
        });
        console.log("[Push] Service worker registered:", registration);
        return registration;
      } catch (err) {
        console.error("[Push] Service worker registration failed:", err);
        return null;
      }
    }, []);

  /**
   * Get the current push subscription if any.
   */
  const getCurrentSubscription =
    useCallback(async (): Promise<PushSubscription | null> => {
      if (!swRegistration) {
        return null;
      }

      try {
        return await swRegistration.pushManager.getSubscription();
      } catch (err) {
        console.error("[Push] Failed to get subscription:", err);
        return null;
      }
    }, [swRegistration]);

  /**
   * Initialize push state on mount.
   */
  useEffect(() => {
    async function init() {
      const { supported, permission } = checkSupport();

      if (!supported) {
        setState({
          isSupported: false,
          isConfigured: false,
          permission: "unsupported",
          isSubscribed: false,
          isLoading: false,
          error: null,
        });
        return;
      }

      try {
        // Get VAPID key from server
        const vapidResponse = await api.request<VapidKeyResponse>(
          "/push/vapid-public-key"
        );

        setVapidPublicKey(vapidResponse.public_key);

        // Register service worker
        const registration = await registerServiceWorker();
        setSwRegistration(registration);

        // Check if already subscribed
        let isSubscribed = false;
        if (registration) {
          const subscription =
            await registration.pushManager.getSubscription();
          isSubscribed = subscription !== null;
        }

        setState({
          isSupported: true,
          isConfigured: vapidResponse.configured,
          permission,
          isSubscribed,
          isLoading: false,
          error: null,
        });
      } catch (err) {
        console.error("[Push] Initialization failed:", err);
        setState({
          isSupported: supported,
          isConfigured: false,
          permission,
          isSubscribed: false,
          isLoading: false,
          error: "Failed to initialize push notifications",
        });
      }
    }

    init();
  }, [checkSupport, registerServiceWorker]);

  /**
   * Request notification permission.
   * T130 [US12]
   */
  const requestPermission = useCallback(async (): Promise<boolean> => {
    if (!state.isSupported) {
      return false;
    }

    setState((prev) => ({ ...prev, isLoading: true, error: null }));

    try {
      const permission = await Notification.requestPermission();

      setState((prev) => ({
        ...prev,
        permission,
        isLoading: false,
      }));

      return permission === "granted";
    } catch (err) {
      console.error("[Push] Permission request failed:", err);
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: "Failed to request permission",
      }));
      return false;
    }
  }, [state.isSupported]);

  /**
   * Subscribe to push notifications.
   */
  const subscribe = useCallback(async (): Promise<boolean> => {
    if (!state.isSupported || !state.isConfigured || !vapidPublicKey) {
      setState((prev) => ({
        ...prev,
        error: "Push notifications not available",
      }));
      return false;
    }

    setState((prev) => ({ ...prev, isLoading: true, error: null }));

    try {
      // Request permission if not granted
      if (Notification.permission !== "granted") {
        const granted = await requestPermission();
        if (!granted) {
          setState((prev) => ({
            ...prev,
            isLoading: false,
            error: "Notification permission denied",
          }));
          return false;
        }
      }

      // Register service worker if not already
      let registration = swRegistration;
      if (!registration) {
        registration = await registerServiceWorker();
        if (!registration) {
          throw new Error("Failed to register service worker");
        }
        setSwRegistration(registration);
      }

      // Subscribe to push
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapidPublicKey),
      });

      // Send subscription to server
      const subscriptionJson = subscription.toJSON();
      await api.request("/push/subscribe", {
        method: "POST",
        body: JSON.stringify({
          endpoint: subscription.endpoint,
          keys: {
            p256dh: subscriptionJson.keys?.p256dh || "",
            auth: subscriptionJson.keys?.auth || "",
          },
          user_agent: navigator.userAgent,
        }),
      });

      setState((prev) => ({
        ...prev,
        isSubscribed: true,
        permission: "granted",
        isLoading: false,
      }));

      return true;
    } catch (err) {
      console.error("[Push] Subscribe failed:", err);
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: err instanceof Error ? err.message : "Failed to subscribe",
      }));
      return false;
    }
  }, [
    state.isSupported,
    state.isConfigured,
    vapidPublicKey,
    swRegistration,
    requestPermission,
    registerServiceWorker,
  ]);

  /**
   * Unsubscribe from push notifications.
   */
  const unsubscribe = useCallback(async (): Promise<boolean> => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }));

    try {
      const subscription = await getCurrentSubscription();

      if (subscription) {
        // Unsubscribe from browser
        await subscription.unsubscribe();

        // Notify server
        await api.request("/push/unsubscribe", {
          method: "POST",
          body: JSON.stringify({
            endpoint: subscription.endpoint,
          }),
        });
      }

      setState((prev) => ({
        ...prev,
        isSubscribed: false,
        isLoading: false,
      }));

      return true;
    } catch (err) {
      console.error("[Push] Unsubscribe failed:", err);
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: "Failed to unsubscribe",
      }));
      return false;
    }
  }, [getCurrentSubscription]);

  /**
   * Toggle subscription state.
   */
  const toggleSubscription = useCallback(async (): Promise<boolean> => {
    if (state.isSubscribed) {
      return unsubscribe();
    } else {
      return subscribe();
    }
  }, [state.isSubscribed, subscribe, unsubscribe]);

  return {
    ...state,
    requestPermission,
    subscribe,
    unsubscribe,
    toggleSubscription,
  };
}
