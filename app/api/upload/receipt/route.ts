export { dynamic, fetchCache } from "@/lib/db/api-route-config";

import { NextResponse } from "next/server";
import { withAuth } from "@/lib/auth/guard";
import { GUARD } from "@/lib/auth/guard-presets";
import { uploadReceiptFile } from "@/lib/storage/receipt-upload";

export const POST = withAuth(async (req, auth) => {
  try {
    const formData = await req.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "Dekont dosyası gerekli." }, { status: 400 });
    }

    const url = await uploadReceiptFile(file, auth.userId);
    return NextResponse.json({ url }, { status: 201 });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Dekont yüklenemedi.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}, GUARD.panel.receiptUpload);
