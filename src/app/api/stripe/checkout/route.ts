import { requireUser, ok, fail } from "@/lib/server/api";
import { z } from "zod";

// ─── Stripe checkout scaffold (NO live charges yet) ─────────────────
// Structure is in place; wiring real Stripe requires STRIPE_SECRET_KEY and
// the `stripe` package. Until configured, this returns a clear 501 so the
// closed-economy rules are never bypassed by an unfinished payment path.
const schema = z.object({ bundleId: z.string() });

export async function POST(req: Request) {
  const u = await requireUser();
  if ("error" in u) return u.error;
  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return fail("Invalid request");

  if (!process.env.STRIPE_SECRET_KEY) {
    return fail("Payments are not enabled in this environment.", 501);
  }
  // TODO: create a Stripe Checkout Session here and return its URL.
  // const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
  // const session = await stripe.checkout.sessions.create({ ... });
  // return ok({ url: session.url });
  return fail("Stripe checkout not yet implemented.", 501);
}
