"""
Push notification service for Web Push API.

Task Reference: T026 - Create PushService for sending web push notifications
Feature: 006-recurring-reminders

Provides functionality for:
- Registering push subscriptions
- Sending push notifications
- Managing subscriptions
"""

import json
import logging
from datetime import datetime, timezone
from typing import List, Optional

from pywebpush import WebPushException, webpush
from sqlmodel import Session, select

from app.config import settings
from app.models.push_subscription import PushSubscription

logger = logging.getLogger(__name__)


class PushService:
    """
    Service for Web Push notifications.

    Task Reference: T026
    """

    def __init__(self):
        """Initialize push service with VAPID credentials."""
        self.vapid_public_key = getattr(settings, "VAPID_PUBLIC_KEY", None)
        self.vapid_private_key = getattr(settings, "VAPID_PRIVATE_KEY", None)
        self.vapid_claims_email = getattr(settings, "VAPID_CLAIMS_EMAIL", None)

    @property
    def is_configured(self) -> bool:
        """Check if VAPID credentials are configured."""
        return all([
            self.vapid_public_key,
            self.vapid_private_key,
            self.vapid_claims_email,
        ])

    async def register_subscription(
        self,
        session: Session,
        user_id: str,
        endpoint: str,
        p256dh_key: str,
        auth_key: str,
        user_agent: Optional[str] = None,
    ) -> PushSubscription:
        """
        Register a new push subscription for a user.

        Args:
            session: Database session
            user_id: User to register subscription for
            endpoint: Push service endpoint URL
            p256dh_key: P-256 public key
            auth_key: Authentication secret
            user_agent: Optional browser user agent

        Returns:
            Created or existing subscription
        """
        # Check if subscription already exists (by endpoint)
        existing = session.exec(
            select(PushSubscription).where(PushSubscription.endpoint == endpoint)
        ).first()

        if existing:
            # Update user_id if different (device changed users)
            if existing.user_id != user_id:
                existing.user_id = user_id
                session.add(existing)
                session.commit()
                session.refresh(existing)
            return existing

        # Create new subscription
        subscription = PushSubscription(
            user_id=user_id,
            endpoint=endpoint,
            p256dh_key=p256dh_key,
            auth_key=auth_key,
            user_agent=user_agent,
        )
        session.add(subscription)
        session.commit()
        session.refresh(subscription)
        return subscription

    async def unregister_subscription(
        self,
        session: Session,
        user_id: str,
        subscription_id: str,
    ) -> bool:
        """
        Remove a push subscription.

        Args:
            session: Database session
            user_id: User who owns the subscription
            subscription_id: Subscription to remove

        Returns:
            True if removed, False if not found
        """
        subscription = session.exec(
            select(PushSubscription).where(
                PushSubscription.id == subscription_id,
                PushSubscription.user_id == user_id,
            )
        ).first()

        if subscription:
            session.delete(subscription)
            session.commit()
            return True
        return False

    async def get_user_subscriptions(
        self,
        session: Session,
        user_id: str,
    ) -> List[PushSubscription]:
        """
        Get all push subscriptions for a user.

        Args:
            session: Database session
            user_id: User whose subscriptions to fetch

        Returns:
            List of subscriptions
        """
        return list(session.exec(
            select(PushSubscription).where(PushSubscription.user_id == user_id)
        ).all())

    async def send_push_notification(
        self,
        session: Session,
        subscription: PushSubscription,
        title: str,
        body: str,
        url: Optional[str] = None,
        tag: Optional[str] = None,
    ) -> bool:
        """
        Send a push notification to a specific subscription.

        Args:
            session: Database session
            subscription: The subscription to send to
            title: Notification title
            body: Notification body
            url: Optional URL to open on click
            tag: Optional tag for notification grouping

        Returns:
            True if sent successfully, False otherwise
        """
        if not self.is_configured:
            logger.warning("Push notifications not configured (VAPID keys missing)")
            return False

        payload = {
            "title": title,
            "body": body,
        }
        if url:
            payload["url"] = url
        if tag:
            payload["tag"] = tag

        subscription_info = {
            "endpoint": subscription.endpoint,
            "keys": {
                "p256dh": subscription.p256dh_key,
                "auth": subscription.auth_key,
            },
        }

        try:
            webpush(
                subscription_info=subscription_info,
                data=json.dumps(payload),
                vapid_private_key=self.vapid_private_key,
                vapid_claims={"sub": self.vapid_claims_email},
            )

            # Update last_used_at
            subscription.last_used_at = datetime.now(timezone.utc)
            session.add(subscription)
            session.commit()

            return True

        except WebPushException as e:
            logger.error(f"Push notification failed: {e}")

            # If subscription is invalid (410 Gone), remove it
            if e.response and e.response.status_code == 410:
                logger.info(f"Removing invalid subscription: {subscription.id}")
                session.delete(subscription)
                session.commit()

            return False
        except Exception as e:
            logger.error(f"Unexpected error sending push: {e}")
            return False

    async def send_to_user(
        self,
        session: Session,
        user_id: str,
        title: str,
        body: str,
        url: Optional[str] = None,
        tag: Optional[str] = None,
    ) -> int:
        """
        Send a push notification to all of a user's subscriptions.

        Args:
            session: Database session
            user_id: User to notify
            title: Notification title
            body: Notification body
            url: Optional URL to open on click
            tag: Optional tag for notification grouping

        Returns:
            Number of successful sends
        """
        subscriptions = await self.get_user_subscriptions(session, user_id)
        success_count = 0

        for subscription in subscriptions:
            if await self.send_push_notification(
                session=session,
                subscription=subscription,
                title=title,
                body=body,
                url=url,
                tag=tag,
            ):
                success_count += 1

        return success_count


# Singleton instance for easy import
push_service = PushService()
