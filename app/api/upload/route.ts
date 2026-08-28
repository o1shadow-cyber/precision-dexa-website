import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

const ALLOWED_TYPES = ["application/pdf", "image/jpeg", "image/png"];
const MAX_BYTES = 10 * 1024 * 1024;

export async function POST(request: Request) {
  const formData = await request.formData();
  const file = formData.get("file");
  const slotId = formData.get("slotId");

  if (!(file instanceof File) || typeof slotId !== "string") {
    return NextResponse.json({ error: "file and slotId are required" }, { status: 400 });
  }
  if (!ALLOWED_TYPES.includes(file.type)) {
    return NextResponse.json(
      { error: "Please upload a PDF, JPEG, or PNG file" },
      { status: 400 }
    );
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json({ error: "File must be under 10MB" }, { status: 400 });
  }

  const ext = file.name.split(".").pop() ?? "bin";
  const path = `${slotId}-${Date.now()}.${ext}`;

  const { error } = await supabaseAdmin()
    .storage.from("provider-orders")
    .upload(path, file, { contentType: file.type });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ path });
}
