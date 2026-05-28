export { dynamic, fetchCache } from "@/lib/db/api-route-config";

import { NextResponse } from "next/server";
import { getActiveAd } from "@/lib/db/ads";

export async function GET() {
  try {
    const ad = await getActiveAd();
    return NextResponse.json(ad);
  } catch {
    return NextResponse.json(null);
  }
}
