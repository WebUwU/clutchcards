import { requireAdmin, ok, fail } from "@/lib/server/api";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

// Local image upload (writes to /public/images/uploads). For production,
// swap this for an object-storage provider (S3/R2) — see README TODO.
export async function POST(req: Request) {
  const a = await requireAdmin();
  if ("error" in a) return a.error;

  const form = await req.formData().catch(() => null);
  if (!form) return fail("Expected multipart form data");
  const file = form.get("file");
  if (!(file instanceof File)) return fail("No file provided");
  if (file.size > 4 * 1024 * 1024) return fail("Max 4MB");
  if (!/^image\//.test(file.type)) return fail("Only image files allowed");

  const bytes = Buffer.from(await file.arrayBuffer());
  const dir = path.join(process.cwd(), "public", "images", "uploads");
  await mkdir(dir, { recursive: true });
  const safe = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, "_")}`;
  await writeFile(path.join(dir, safe), bytes);
  return ok({ url: `/images/uploads/${safe}` });
}
