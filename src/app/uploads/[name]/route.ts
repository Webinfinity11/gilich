import { readFile } from "node:fs/promises";
import path from "node:path";
import { uploadDir } from "@/lib/storage";

const TYPES: Record<string, string> = {
  jpg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
  gif: "image/gif",
  avif: "image/avif",
};

// Serves images uploaded through the admin panel (files added after build are not in public/)
export async function GET(_request: Request, { params }: { params: Promise<{ name: string }> }) {
  const { name } = await params;
  const type = TYPES[name.split(".").pop()?.toLowerCase() ?? ""];
  if (!type || name !== path.basename(name)) return new Response("Not found", { status: 404 });

  try {
    const file = await readFile(path.join(uploadDir(), name));
    return new Response(file, {
      headers: { "Content-Type": type, "Cache-Control": "public, max-age=31536000, immutable" },
    });
  } catch {
    return new Response("Not found", { status: 404 });
  }
}
