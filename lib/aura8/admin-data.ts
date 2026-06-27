import { getAdminClient } from "@/lib/supabase/admin";

export type WebhookEventRow = {
  id: string;
  created_at: string | null;
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
};

export type SubscriberRow = {
  id: string;
  updated_at: string | null;
  email: string | null;
  subscription_id: string | null;
  customer_id: string | null;
  status: string | null;
  affiliate: string | null;
  subaccount: string | null;
  campaign: string | null;
  tracking_id: string | null;
  last_payment_at: string | null;
};

export type AdminDebugData = {
  fetchedAt: string;
  recentEvents: WebhookEventRow[];
  recentSubscribers: SubscriberRow[];
  errorEvents: WebhookEventRow[];
  errors: string[];
};

export async function fetchAdminData(): Promise<AdminDebugData> {
  const supabase = getAdminClient();
  const errors: string[] = [];

  const [
    recentEventsResult,
    recentSubscribersResult,
    errorEventsResult,
  ] = await Promise.all([
    supabase
      .from("ccbill_webhook_events")
      .select(
        "id, created_at, event_type, email, subscription_id, transaction_id, status, amount, affiliate, subaccount, campaign, processed, processing_error"
      )
      .order("created_at", { ascending: false })
      .limit(25),

    supabase
      .from("aura8_subscribers")
      .select(
        "id, updated_at, email, subscription_id, customer_id, status, affiliate, subaccount, campaign, tracking_id, last_payment_at"
      )
      .order("updated_at", { ascending: false })
      .limit(25),

    supabase
      .from("ccbill_webhook_events")
      .select(
        "id, created_at, event_type, email, subscription_id, transaction_id, status, amount, affiliate, subaccount, campaign, processed, processing_error"
      )
      .or("processed.eq.false,processing_error.not.is.null")
      .order("created_at", { ascending: false })
      .limit(25),
  ]);

  if (recentEventsResult.error) {
    errors.push(`recentEvents: ${recentEventsResult.error.message}`);
  }

  if (recentSubscribersResult.error) {
    errors.push(`recentSubscribers: ${recentSubscribersResult.error.message}`);
  }

  if (errorEventsResult.error) {
    errors.push(`errorEvents: ${errorEventsResult.error.message}`);
  }

  return {
    fetchedAt: new Date().toISOString(),
    recentEvents: (recentEventsResult.data ?? []) as WebhookEventRow[],
    recentSubscribers: (recentSubscribersResult.data ?? []) as SubscriberRow[],
    errorEvents: (errorEventsResult.data ?? []) as WebhookEventRow[],
    errors,
  };
}
