import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const DOMAIN = "__ACCOUNT_DOMAIN__";
const ORIGINS = ["https://__SITE_HOST__"];
const BON_PREFIX = "https://__SUPABASE_REF__.supabase.co/storage/v1/object/public/bons/";
const corsFor = (req: Request) => {
  const o = req.headers.get("origin") ?? "";
  return {
    "Access-Control-Allow-Origin": ORIGINS.includes(o) ? o : ORIGINS[0],
    "Vary": "Origin",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
  };
};
function normPhone(p: unknown): string | null {
  let d = String(p ?? "").replace(/\D/g, "");
  if (d.startsWith("00")) d = d.slice(2);
  if (d.length === __LOCAL_DIGITS__) d = "__CC__" + d;
  return d.length >= 8 && d.length <= 15 ? d : null;
}
const clean = (s: unknown, n = 80) => String(s ?? "").replace(/[<>]/g, "").trim().slice(0, n);
const isUuid = (s: unknown) => typeof s === "string" && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/.test(s);

Deno.serve(async (req) => {
  const cors = corsFor(req);
  const json = (body: unknown, status = 200) =>
    new Response(JSON.stringify(body), { status, headers: { ...cors, "Content-Type": "application/json" } });
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  if (req.method !== "POST") return json({ error: "Méthode non autorisée" }, 405);
  const admin = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  let body: Record<string, unknown> = {};
  try { body = await req.json(); } catch { return json({ error: "Requête invalide" }, 400); }
  const ip = (req.headers.get("x-forwarded-for") ?? "").split(",")[0].trim().slice(0, 60) || "inconnue";
  const hourAgo = new Date(Date.now() - 3600_000).toISOString();

  // ---------- Inscription ----------
  if (body.action === "signup") {
    const phone = normPhone(body.phone);
    const password = String(body.password ?? "");
    const full_name = clean(body.full_name);
    if (!phone) return json({ error: "Numéro de téléphone invalide." }, 400);
    if (password.length < 6 || password.length > 72) return json({ error: "Le mot de passe doit contenir entre 6 et 72 caractères." }, 400);
    if (full_name.length < 2) return json({ error: "Indiquez votre nom." }, 400);
    const { count: perIp } = await admin.from("signup_attempts").select("id", { count: "exact", head: true }).eq("ip", ip).gte("created_at", hourAgo);
    const { count: total } = await admin.from("signup_attempts").select("id", { count: "exact", head: true }).gte("created_at", hourAgo);
    if ((perIp ?? 0) >= 5 || (total ?? 0) >= 60) return json({ error: "Trop de tentatives. Réessayez dans une heure ou écrivez-nous sur WhatsApp." }, 429);
    const email = `${phone}@${DOMAIN}`;
    const { error: tErr } = await admin.from("signup_attempts").insert({ ip, email });
    if (tErr) return json({ error: "Inscription impossible pour le moment." }, 500);
    const { error } = await admin.auth.admin.createUser({ email, password, email_confirm: true, user_metadata: { full_name, quartier: clean(body.quartier) } });
    if (error) {
      const exists = /already|registered|exists/i.test(error.message);
      return json({ error: exists ? "Un compte existe déjà avec ce numéro. Connectez-vous." : "Inscription impossible pour le moment." }, exists ? 409 : 500);
    }
    return json({ ok: true, phone });
  }

  // ---------- Commande d'un visiteur sans compte ----------
  if (body.action === "guest_order") {
    const o = (body.order ?? {}) as Record<string, unknown>;
    const { count: perIp } = await admin.from("order_attempts").select("id", { count: "exact", head: true }).eq("ip", ip).gte("created_at", hourAgo);
    const { count: total } = await admin.from("order_attempts").select("id", { count: "exact", head: true }).gte("created_at", hourAgo);
    if ((perIp ?? 0) >= 8 || (total ?? 0) >= 200) return json({ error: "Trop de commandes. Contactez-nous sur WhatsApp." }, 429);
    await admin.from("order_attempts").insert({ ip });
    const phone = normPhone(o.phone);
    const bon = typeof o.bon_url === "string" && o.bon_url.startsWith(BON_PREFIX) ? o.bon_url : "";
    if (!phone) return json({ error: "Numéro invalide." }, 400);
    const items = Array.isArray(o.items) ? o.items.slice(0, 60) : [];
    const total = Math.round(Number(o.total) || 0);
    const { data, error } = await admin.from("orders").insert({
      user_id: null, customer_name: clean(o.customer_name), phone, quartier: clean(o.quartier),
      delivery: o.delivery === "retrait" ? "retrait" : "livraison", note: clean(o.note, 500),
      items, total, bon_url: bon, status: "nouvelle",
    }).select("id").single();
    if (error || !data) return json({ error: "Commande non enregistrée." }, 400);
    return json({ ok: true, id: data.id });
  }

  // ---------- Actions réservées à l'administrateur ----------
  const token = (req.headers.get("Authorization") ?? "").replace(/^Bearer\s+/i, "");
  const { data: u } = await admin.auth.getUser(token);
  if (!u?.user) return json({ error: "Non connecté." }, 401);
  const { data: me } = await admin.from("profiles").select("is_admin").eq("id", u.user.id).single();
  if (!me?.is_admin) return json({ error: "Accès réservé à l'administrateur." }, 403);

  const target = async (): Promise<{ id: string; is_admin: boolean } | null> => {
    if (isUuid(body.id)) { const { data } = await admin.from("profiles").select("id, is_admin").eq("id", body.id as string).single(); return data; }
    const phone = normPhone(body.phone); if (!phone) return null;
    const { data } = await admin.from("profiles").select("id, is_admin").eq("phone", phone).single(); return data;
  };

  if (body.action === "list_clients") {
    const { data: profs } = await admin.from("profiles").select("id, full_name, phone, quartier, is_admin, blocked, created_at").order("created_at", { ascending: false }).limit(2000);
    const { data: users } = await admin.auth.admin.listUsers({ page: 1, perPage: 1000 });
    const last = new Map((users?.users ?? []).map((x) => [x.id, x.last_sign_in_at]));
    const { data: ords } = await admin.from("orders").select("user_id, total, status").not("user_id", "is", null).limit(10000);
    const stats = new Map<string, { n: number; t: number }>();
    for (const r of ords ?? []) { const s = stats.get(r.user_id) ?? { n: 0, t: 0 }; s.n++; if (r.status !== "annulee") s.t += r.total; stats.set(r.user_id, s); }
    return json({ ok: true, clients: (profs ?? []).map((p) => ({ ...p, last_sign_in_at: last.get(p.id) ?? null, orders: stats.get(p.id)?.n ?? 0, spent: stats.get(p.id)?.t ?? 0 })) });
  }

  if (["reset_password", "block", "unblock", "delete_client"].includes(String(body.action))) {
    const t = await target();
    if (!t) return json({ error: "Client introuvable." }, 404);
    if (t.is_admin && body.action !== "reset_password") return json({ error: "Impossible sur un compte administrateur." }, 403);
    if (t.is_admin && t.id !== u.user.id) return json({ error: "Action non autorisée." }, 403);

    if (body.action === "reset_password") {
      const password = String(body.password ?? "");
      if (password.length < 6 || password.length > 72) return json({ error: "Mot de passe : 6 à 72 caractères." }, 400);
      const { error } = await admin.auth.admin.updateUserById(t.id, { password });
      return error ? json({ error: "Réinitialisation impossible." }, 500) : json({ ok: true });
    }
    if (body.action === "block" || body.action === "unblock") {
      const block = body.action === "block";
      const { error } = await admin.auth.admin.updateUserById(t.id, { ban_duration: block ? "876000h" : "none" });
      if (error) return json({ error: "Opération impossible." }, 500);
      await admin.from("profiles").update({ blocked: block }).eq("id", t.id);
      return json({ ok: true });
    }
    if (body.action === "delete_client") {
      const { error } = await admin.auth.admin.deleteUser(t.id);
      return error ? json({ error: "Suppression impossible." }, 500) : json({ ok: true });
    }
  }
  return json({ error: "Action inconnue" }, 400);
});
