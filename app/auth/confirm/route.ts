import { type EmailOtpType } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);

  const tokenHash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;

  const next = searchParams.get("next");

  const safeNext =
    next && next.startsWith("/") && !next.startsWith("//")
      ? next
      : "/";

  const redirectUrl = request.nextUrl.clone();

  redirectUrl.pathname = safeNext;
  redirectUrl.search = "";

  if (!tokenHash || !type) {
    redirectUrl.pathname = "/";
    redirectUrl.searchParams.set("auth", "error");

    return NextResponse.redirect(redirectUrl);
  }

  const supabase = createClient();

  const { error } = await supabase.auth.verifyOtp({
    type,
    token_hash: tokenHash,
  });

  if (error) {
    console.error("Magic-link verification failed:", error);

    redirectUrl.pathname = "/";
    redirectUrl.search = "";
    redirectUrl.searchParams.set("auth", "error");

    return NextResponse.redirect(redirectUrl);
  }

  return NextResponse.redirect(redirectUrl);
}
