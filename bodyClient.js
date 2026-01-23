const BODY_URL = process.env.ALIVE_BODY_URL ?? "http://localhost:3333";

export async function consultBody(text) {
  const consultationId = globalThis.crypto?.randomUUID
    ? globalThis.crypto.randomUUID()
    : `consult-${Date.now()}-${Math.random().toString(16).slice(2)}`;

  const res = await fetch(`${BODY_URL}/consult`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      consultationId,
      observations: [{ type: "cli-input", value: text }],
      environment: { source: "cli" },
      timestamp: new Date().toISOString(),
    }),
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(
      `Body consult failed: ${res.status} ${res.statusText}${body ? ` - ${body}` : ""}`
    );
  }

  return res.json();
}

