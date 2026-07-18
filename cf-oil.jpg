import { APP_CONFIG } from "../config.js";

function normalizeCatalogPayload(payload) {
  const products = Array.isArray(payload) ? payload : payload?.products;
  if (!Array.isArray(products)) {
    throw new Error("Katalog nevrátil platné pole produktů.");
  }
  return products;
}

async function fetchJson(url, options = {}) {
  const response = await fetch(url, {
    cache: "no-store",
    ...options
  });

  if (!response.ok) {
    const detail = await response.text().catch(() => "");
    throw new Error(`Načtení katalogu selhalo (${response.status}). ${detail}`.trim());
  }

  return response.json();
}

export async function loadProducts() {
  if (APP_CONFIG.catalog.mode === "supabase") {
    if (!APP_CONFIG.catalog.functionUrl) {
      throw new Error("Chybí URL Supabase Edge Function pro katalog.");
    }

    const headers = { Accept: "application/json" };
    if (APP_CONFIG.supabase.anonKey) {
      headers.apikey = APP_CONFIG.supabase.anonKey;
      headers.Authorization = `Bearer ${APP_CONFIG.supabase.anonKey}`;
    }

    const payload = await fetchJson(APP_CONFIG.catalog.functionUrl, { headers });
    return normalizeCatalogPayload(payload);
  }

  const payload = await fetchJson(APP_CONFIG.catalog.localUrl);
  return normalizeCatalogPayload(payload);
}
