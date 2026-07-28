import { NextRequest, NextResponse } from "next/server";

/**
 * GET /api/payment/test
 * Tests ALL Phajay combinations based on official ReactJS example code.
 * Key findings from Phajay docs:
 *   - secretKey might be a literal "Key_test" for sandbox
 *   - Content-Type might need to be x-www-form-urlencoded
 *   - Socket.io is used for payment callbacks
 */
export async function GET(_request: NextRequest) {
  const userKey = process.env.PHAJAY_SECRET_KEY ?? "";

  const formBody = new URLSearchParams({
    amount: "1",
    description: "test-payment",
  }).toString();

  const jsonBody = JSON.stringify({ amount: 1, description: "test-payment" });

  const attempts = [
    // ✅ From official ReactJS example: secretKey = "Key_test" (shared sandbox key)
    {
      label: "SANDBOX + Key_test (form-encoded) ← from Phajay official ReactJS example",
      url: "https://payment-gateway.phajay.co/v1/api/test/payment/generate-bcel-qr",
      headers: { secretKey: "Key_test", "Content-Type": "application/x-www-form-urlencoded" },
      body: formBody,
    },
    // Official example actually uses production URL with Key_test
    {
      label: "PRODUCTION URL + Key_test (form-encoded) ← from Phajay official ReactJS example",
      url: "https://payment-gateway.phajay.co/v1/api/payment/generate-bcel-qr",
      headers: { secretKey: "Key_test", "Content-Type": "application/x-www-form-urlencoded" },
      body: formBody,
    },
    // User's actual key with form-encoded body (Content-Type fix)
    {
      label: "SANDBOX + user_key (form-encoded) ← Content-Type fix",
      url: "https://payment-gateway.phajay.co/v1/api/test/payment/generate-bcel-qr",
      headers: { secretKey: userKey, "Content-Type": "application/x-www-form-urlencoded" },
      body: formBody,
    },
    // User's actual key with JSON (original approach)
    {
      label: "SANDBOX + user_key (json)",
      url: "https://payment-gateway.phajay.co/v1/api/test/payment/generate-bcel-qr",
      headers: { secretKey: userKey, "Content-Type": "application/json" },
      body: jsonBody,
    },
    // Key_test with JSON
    {
      label: "SANDBOX + Key_test (json)",
      url: "https://payment-gateway.phajay.co/v1/api/test/payment/generate-bcel-qr",
      headers: { secretKey: "Key_test", "Content-Type": "application/json" },
      body: jsonBody,
    },
  ];

  const results: Record<string, any> = {};

  for (const attempt of attempts) {
    try {
      const res = await fetch(attempt.url, {
        method: "POST",
        headers: attempt.headers as Record<string, string>,
        body: attempt.body,
      });
      const rawText = await res.text();
      let data: any;
      try { data = JSON.parse(rawText); } catch { data = rawText; }
      results[attempt.label] = { httpStatus: res.status, ok: res.ok, data };
    } catch (err: any) {
      results[attempt.label] = { ok: false, error: err?.message };
    }
  }

  const winner = Object.entries(results).find(([, v]) => v.ok);

  return NextResponse.json(
    {
      userKeyPreview: userKey
        ? `${userKey.substring(0, 8)}...${userKey.slice(-6)}`
        : "(not set)",
      winner: winner ? winner[0] : null,
      summary: winner
        ? `✅ Working: ${winner[0]}`
        : "❌ All failed — see results for details",
      // Socket.io info from Phajay docs (for payment callbacks)
      socketInfo: {
        server: "https://payment-gateway.phajay.co",
        transport: "websocket",
        eventFormat: "join::<YOUR_HASHED_KEY>",
        note: "Listen on this event to receive payment confirmations in real-time",
      },
      results,
    },
    { status: winner ? 200 : 502 }
  );
}
