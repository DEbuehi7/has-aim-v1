/**
 * lib/aura8/admin-data.ts
 *
 * Server-only data fetching helpers for the internal CCBill admin debug page.
 * Never import this in client components.
 *
 * SECURITY: These functions return raw subscriber and payment data.
 * The page that calls them must be protected by authentication before
 * being exposed in production. See docs/ccbill-admin-debug.md.
 */

import { getAdminClient } from "@/lib/supabase/admin";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface WebhookEventRow {
  id: string;
  created_at: string;
  event_type: string | null;
  email: string | null;
  subscription_id: string | null;
  transaction_id: string | null;
  status: string | null;
  amount: number | null;
  affiliate: string | null;
  subaccount: string | null;
  campaign: string | null;
  processed: boolean;
  processing_error: string | null;
}

export interface SubscriberRow {
  id: string;
  updated_at: string;
  email: string | null;
  subscription_id: string | null;
  customer_id: string | null;
  status: string | null;
  affiliate: string | null;
  subaccount: string | null;
  campaign: string | null;
  tracking_id: string | null;
  last_payment_at: string | null;
}

export interface AdminData {
  recentEvents: WebhookEventRow[];
  recentSubscribers: SubscriberRow[];
  errorEvents: WebhookEventRow[];
  fetchedAt: string;
  errors: string[];
}

// ---------------------------------------------------------------------------
// Queries
// ---------------------------------------------------------------------------

const WEBHOOK_COLUMNS = [
  "id",
  "created_at",
  "event_type",
  "email",
  "subscription_id",
  "transaction_id",
  "status",
  "amount",
  "affiliate",
  "subaccount",
  "campaign",
  "processed",
  "processing_error",
].join(", ");

const SUBSCRIBER_COLUMNS = [
  "id",
  "updated_at",
  "email",
  "subscription_id",
  "customer_id",
  "status",
  "affiliate",
  "subaccount",
  "campaign",
  "tracking_id",
  "last_payment_at",
].join(", ");

/**
 * Fetch all data needed for the admin debug page in parallel.
 * Errors in individual queries are captured and returned rather than thrown,
 * so a single table failure does not blank the whole page.
 */
export async function fetchAdminData(): Promise<AdminData> {
  const supabase = getAdminClient();
  const errors: string[] = [];

  const [eventsResult, subscribersResult, errorEventsResult] =
    await Promise.allSettled([
      // Latest 25 webhook events
      supabase
        .from("ccbill_webhook_events")
        .select(WEBHOOK_COLUMNS)
        .order("created_at", { ascending: false })
        .limit(25),

      // Latest 25 subscribers
      supabase
        .from("aura8_subscribers")
        .select(SUBSCRIBER_COLUMNS)
        .order("updated_at", { ascending: false })
        .limit(25),

      // Unprocessed or errored events
      supabase
        .from("ccbill_webhook_events")
        .select(WEBHOOK_COLUMNS)
        .or("processed.eq.false,processing_error.not.is.null")
        .order("created_at", { ascending: false })
        .limit(25),
    ]);

  let recentEvents: WebhookEventRow[] = [];
  if (eventsResult.status === "fulfilled") {
    if (eventsResult.value.error) {
      errors.push(`webhook_events: ${eventsResult.value.error.message}`);
    } else {
      recentEvents = (eventsResult.value.data ?? []) as unknown as WebhookEventRow[];
    }
  } else {
    errors.push(`webhook_events: ${eventsResult.reason}`);
  }

  let recentSubscribers: SubscriberRow[] = [];
  if (subscribersResult.status === "fulfilled") {
    if (subscribersResult.value.error) {
      errors.push(`subscribers: ${subscribersResult.value.error.message}`);
    } else {
      recentSubscribers = (subscribersResult.value.data ?? []) as unknown as SubscriberRow[];
    }
  } else {
    errors.push(`subscribers: ${subscribersResult.reason}`);
  }

  let errorEvents: WebhookEventRow[] = [];
  if (errorEventsResult.status === "fulfilled") {
    if (errorEventsResult.value.error) {
      errors.push(`error_events: ${errorEventsResult.value.error.message}`);
    } else {
      errorEvents = (errorEventsResult.value.data ?? []) as unknown as WebhookEventRow[];
    }
  } else {
    errors.push(`error_events: ${errorEventsResult.reason}`);
  }

  return {
    recentEvents,
    recentSubscribers,
    errorEvents,
    fetchedAt: new Date().toISOString(),
    errors,
  };
}
