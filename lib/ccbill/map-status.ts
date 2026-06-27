/**
 * CCBill event-type to normalized subscriber status mapper.
 *
 * Canonical status values:
 *   active       - subscription is live and paid
 *   cancelled    - subscriber cancelled
 *   expired      - subscription period ended without renewal
 *   declined     - payment declined / failed
 *   refunded     - charge was refunded
 *   chargeback   - chargeback filed
 *   pending      - payment initiated but not yet confirmed
 *   unknown      - event type not recognized
 */

export type SubscriberStatus =
  | "active"
  | "cancelled"
  | "expired"
  | "declined"
  | "refunded"
  | "chargeback"
  | "pending"
  | "unknown";

/**
 * Returns true when the event represents a successful payment / activation.
 */
export function isPaymentSuccess(eventType: string | null | undefined): boolean {
  if (!eventType) return false;
  const et = eventType.toLowerCase();
  return (
    et.includes("newsalesuccess") ||
    et.includes("new_sale_success") ||
    et.includes("rebillsuccess") ||
    et.includes("rebill_success") ||
    et.includes("renewalsuccess") ||
    et.includes("renewal_success") ||
    et.includes("upgradesuccess") ||
    et.includes("upgrade_success")
  );
}

/**
 * Returns true when the event represents a terminal negative state.
 */
export function isNegativeEvent(eventType: string | null | undefined): boolean {
  if (!eventType) return false;
  const et = eventType.toLowerCase();
  return (
    et.includes("cancel") ||
    et.includes("expir") ||
    et.includes("decline") ||
    et.includes("chargeback") ||
    et.includes("refund") ||
    et.includes("void") ||
    et.includes("fail")
  );
}

/**
 * Map a CCBill eventType string to a canonical SubscriberStatus.
 */
export function mapCCBillEventToStatus(
  eventType: string | null | undefined
): SubscriberStatus {
  if (!eventType) return "unknown";

  const et = eventType.toLowerCase();

  if (
    et.includes("newsalesuccess") ||
    et.includes("new_sale_success") ||
    et.includes("rebillsuccess") ||
    et.includes("rebill_success") ||
    et.includes("renewalsuccess") ||
    et.includes("renewal_success") ||
    et.includes("upgradesuccess") ||
    et.includes("upgrade_success")
  ) {
    return "active";
  }

  if (et === "newsale" || et === "new_sale" || et.includes("pending") || et.includes("initiated")) {
    return "pending";
  }

  if (et.includes("cancel")) return "cancelled";

  if (et.includes("expir")) return "expired";

  if (
    et.includes("decline") ||
    et.includes("fail") ||
    et.includes("newsalefailure") ||
    et.includes("new_sale_failure") ||
    et.includes("rebillfailure") ||
    et.includes("rebill_failure")
  ) {
    return "declined";
  }

  if (et.includes("chargeback")) return "chargeback";

  if (et.includes("refund") || et.includes("void")) return "refunded";

  return "unknown";
}
