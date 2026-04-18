import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServer } from "@/lib/supabase-server";
import { createCheckoutSession } from "@/lib/lemon-squeezy";

export async function POST(request: NextRequest) {
  // Authenticate via server session (cookies) — never trust client-supplied user_id
  const supabase = await createSupabaseServer();
  const { data: { user }, error } = await supabase.auth.getUser();

  if (error || !user) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  const userId = user.id;
  const userEmail = user.email ?? "";

  // Consume body to avoid request errors, but ignore user_id from client
  await request.json().catch(() => {});

  try {
    const session = await createCheckoutSession({ userId, userEmail });
    return NextResponse.json({ url: session.url });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("[billing/checkout]", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
