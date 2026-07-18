import { APP_CONFIG } from "../config.js";

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export async function sendProductPdf(request) {
  if (APP_CONFIG.email.mode === "mock") {
    await sleep(1100);
    return { ok: true, mocked: true };
  }

  if (!APP_CONFIG.email.functionUrl) {
    throw new Error("Chybí URL Supabase Edge Function pro odeslání PDF.");
  }

  const headers = { "Content-Type": "application/json" };
  if (APP_CONFIG.supabase.anonKey) {
    headers.apikey = APP_CONFIG.supabase.anonKey;
    headers.Authorization = `Bearer ${APP_CONFIG.supabase.anonKey}`;
  }

  const response = await fetch(APP_CONFIG.email.functionUrl, {
    method: "POST",
    headers,
    body: JSON.stringify(request)
  });

  if (!response.ok) {
    const detail = await response.text().catch(() => "");
    throw new Error(`Odeslání prezentace selhalo (${response.status}). ${detail}`.trim());
  }

  return response.json().catch(() => ({ ok: true }));
}
