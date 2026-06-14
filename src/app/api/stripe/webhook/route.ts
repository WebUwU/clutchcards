// ─── Stripe webhook scaffold ────────────────────────────────────────
// On a verified `checkout.session.completed`, this is where premium coins
// would be granted server-side (the only legitimate way to mint premium
// currency). Signature verification with STRIPE_WEBHOOK_SECRET is required
// before trusting any event. Not active until Stripe is configured.
import { fail } from "@/lib/server/api";

export async function POST() {
  if (!process.env.STRIPE_WEBHOOK_SECRET) {
    return fail("Webhook not configured.", 501);
  }
  // TODO: verify signature, parse event, grant premium coins via adjustBalance.
  return fail("Webhook handler not yet implemented.", 501);
}
