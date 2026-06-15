// ─── Image upload via ImgBB (free, permanent hosting) ───────────────
// Works on Vercel (no local disk needed). Requires IMGBB_API_KEY.
// Used by both user avatars and admin card images.
import { requireUser, ok, fail, rateLimit } from "@/lib/server/api";

export async function POST(req: Request) {
  const u = await requireUser();
  if ("error" in u) return u.error;

  const rl = rateLimit(`${u.userId}:upload`, 20, 60_000);
  if (!rl.ok) return fail(`Too many uploads. Try again in ${rl.retryAfter}s`, 429);

  const key = process.env.IMGBB_API_KEY;
  if (!key) return fail("Image uploads aren't configured yet (missing IMGBB_API_KEY).", 503);

  const form = await req.formData().catch(() => null);
  if (!form) return fail("Expected multipart form data");
  const file = form.get("file");
  if (!(file instanceof File)) return fail("No file provided");
  if (file.size > 8 * 1024 * 1024) return fail("Image too large (max 8MB).");
  if (!/^image\//.test(file.type)) return fail("Only image files are allowed.");

  // ImgBB wants base64 in a form field.
  const base64 = Buffer.from(await file.arrayBuffer()).toString("base64");
  const body = new FormData();
  body.append("image", base64);

  try {
    const res = await fetch(`https://api.imgbb.com/1/upload?key=${key}`, { method: "POST", body });
    const json = await res.json().catch(() => null);
    if (!res.ok || !json?.success) {
      return fail(json?.error?.message ?? "Upload failed. Please try again.");
    }
    // Return the permanent direct image URL.
    return ok({ url: json.data.url as string, thumb: json.data.thumb?.url ?? json.data.url });
  } catch (e) {
    return fail(e instanceof Error ? e.message : "Upload failed");
  }
}
