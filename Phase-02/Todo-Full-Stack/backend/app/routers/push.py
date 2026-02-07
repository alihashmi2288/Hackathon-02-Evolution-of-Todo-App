"""
Push notification router for Web Push API endpoints.

Task Reference: T122-T127 [US12] - Push notification endpoints
Feature: 006-recurring-reminders

Provides endpoints for:
- Getting VAPID public key
- Subscribing to push notifications
- Unsubscribing from push notifications
- Listing user's push subscriptions
"""

from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import select

from app.dependencies import CurrentUserDep, SessionDep
from app.models.push_subscription import PushSubscription
from app.schemas.push import (
    PushSubscriptionCreate,
    PushSubscriptionListResponse,
    PushSubscriptionResponse,
    UnsubscribeRequest,
    VapidPublicKeyResponse,
)
from app.services.push import push_service

router = APIRouter(
    prefix="/push",
    tags=["push"],
    responses={401: {"description": "Not authenticated"}},
)


@router.get(
    "/vapid-public-key",
    response_model=VapidPublicKeyResponse,
    summary="Get VAPID public key",
    description="Get the VAPID public key for push subscription registration.",
)
async def get_vapid_public_key() -> VapidPublicKeyResponse:
    """
    Get the VAPID public key for push subscription.

    This key is needed by the browser to register for push notifications.
    The endpoint is public (no auth required) as it's called before subscription.

    Task Reference: T123 [US12]
    """
    if not push_service.is_configured:
        return VapidPublicKeyResponse(
            public_key="",
            configured=False,
        )

    return VapidPublicKeyResponse(
        public_key=push_service.vapid_public_key or "",
        configured=True,
    )


@router.post(
    "/subscribe",
    response_model=PushSubscriptionResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Subscribe to push notifications",
    description="Register a browser's push subscription for the current user.",
)
async def subscribe(
    data: PushSubscriptionCreate,
    current_user: CurrentUserDep,
    session: SessionDep,
) -> PushSubscriptionResponse:
    """
    Subscribe to push notifications.

    Registers the browser's push subscription to receive push notifications.
    If the endpoint already exists, it will be associated with the current user.

    Task Reference: T124 [US12]
    """
    if not push_service.is_configured:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Push notifications are not configured on the server",
        )

    subscription = await push_service.register_subscription(
        session=session,
        user_id=current_user.id,
        endpoint=data.endpoint,
        p256dh_key=data.keys.p256dh,
        auth_key=data.keys.auth,
        user_agent=data.user_agent,
    )

    return PushSubscriptionResponse.model_validate(subscription)


@router.post(
    "/unsubscribe",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Unsubscribe from push notifications",
    description="Remove a push subscription for the current user.",
)
async def unsubscribe(
    data: UnsubscribeRequest,
    current_user: CurrentUserDep,
    session: SessionDep,
) -> None:
    """
    Unsubscribe from push notifications.

    Removes the push subscription associated with the given endpoint.

    Task Reference: T125 [US12]
    """
    # Find subscription by endpoint
    subscription = session.exec(
        select(PushSubscription).where(
            PushSubscription.endpoint == data.endpoint,
            PushSubscription.user_id == current_user.id,
        )
    ).first()

    if subscription:
        session.delete(subscription)
        session.commit()


@router.get(
    "/subscriptions",
    response_model=PushSubscriptionListResponse,
    summary="List push subscriptions",
    description="Get all push subscriptions for the current user.",
)
async def list_subscriptions(
    current_user: CurrentUserDep,
    session: SessionDep,
) -> PushSubscriptionListResponse:
    """
    List all push subscriptions for the current user.

    Useful for managing subscriptions across multiple devices.

    Task Reference: T124 [US12]
    """
    subscriptions = await push_service.get_user_subscriptions(
        session=session,
        user_id=current_user.id,
    )

    return PushSubscriptionListResponse(
        items=[PushSubscriptionResponse.model_validate(s) for s in subscriptions],
        total=len(subscriptions),
    )


@router.delete(
    "/subscriptions/{subscription_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Delete a specific push subscription",
    description="Remove a specific push subscription by ID.",
)
async def delete_subscription(
    subscription_id: str,
    current_user: CurrentUserDep,
    session: SessionDep,
) -> None:
    """
    Delete a specific push subscription.

    Task Reference: T125 [US12]
    """
    removed = await push_service.unregister_subscription(
        session=session,
        user_id=current_user.id,
        subscription_id=subscription_id,
    )

    if not removed:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Push subscription not found",
        )
