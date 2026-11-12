-- ═══════════════════════════════════════════════════════════════════════════
-- Base de données complète du catalogue (état final des 5 migrations appliquées
-- sur le projet Supabase). À exécuter UNE fois sur un projet Supabase neuf.
-- Comptes clients par téléphone, commandes (clients et visiteurs), bons de
-- commande en image, administration, anti-abus. RLS activé partout.
-- ═══════════════════════════════════════════════════════════════════════════

-- ── Profils clients ──
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null default '',
  phone text not null default '',
  quartier text not null default '',
  is_admin boolean not null default false,
  blocked boolean not null default false,
  created_at timestamptz not null default now()
);

-- ── Commandes (user_id vide = commande d'un visiteur sans compte) ──
create table public.orders (
  id bigint generated always as identity primary key,
  user_id uuid default auth.uid() references auth.users(id) on delete set null,
  customer_name text not null default '',
  phone text not null default '',
  quartier text not null default '',
  delivery text not null default 'livraison',
  note text not null default '',
  items jsonb not null default '[]'::jsonb,
  total integer not null default 0 check (total >= 0),
  status text not null default 'nouvelle' check (status in ('nouvelle','confirmee','preparation','livree','annulee')),
  bon_url text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index orders_user_idx on public.orders(user_id, created_at desc);
create index orders_created_idx on public.orders(created_at desc);

-- ── Anti-abus (lus et écrits seulement par la fonction serveur « compte ») ──
create table public.signup_attempts (
  id bigint generated always as identity primary key,
  ip text not null default '',
  email text not null,
  created_at timestamptz not null default now()
);
create index signup_attempts_idx on public.signup_attempts(created_at desc);
create table public.order_attempts (
  id bigint generated always as identity primary key,
  ip text not null default '',
  created_at timestamptz not null default now()
);
create index order_attempts_idx on public.order_attempts(created_at desc);

-- ── L'utilisateur courant est-il administrateur ? ──
create or replace function public.is_admin() returns boolean
language sql stable security definer set search_path = public as $$
  select coalesce((select is_admin from public.profiles where id = auth.uid()), false);
$$;
revoke execute on function public.is_admin() from anon;

-- ── Sécurité par lignes (RLS) ──
alter table public.profiles enable row level security;
alter table public.orders enable row level security;
alter table public.signup_attempts enable row level security;
alter table public.order_attempts enable row level security;

create policy "profil: lecture" on public.profiles for select to authenticated
  using (id = (select auth.uid()) or (select public.is_admin()));
create policy "profil: modification" on public.profiles for update to authenticated
  using (id = (select auth.uid())) with check (id = (select auth.uid()));

create policy "commande: lecture" on public.orders for select to authenticated
  using (user_id = (select auth.uid()) or (select public.is_admin()));
create policy "commande: creation" on public.orders for insert to authenticated
  with check (user_id = (select auth.uid()) and status = 'nouvelle'
              and not exists (select 1 from public.profiles where id = (select auth.uid()) and blocked));
create policy "commande: statut admin" on public.orders for update to authenticated
  using ((select public.is_admin())) with check ((select public.is_admin()));

-- ── Droits par colonne : un client ne peut jamais se rendre admin ni changer son numéro ──
revoke all on public.profiles from anon, authenticated;
grant select on public.profiles to authenticated;
grant update (full_name, quartier) on public.profiles to authenticated;
revoke all on public.orders from anon, authenticated;
grant select, insert on public.orders to authenticated;
grant update (status) on public.orders to authenticated;
revoke all on public.signup_attempts from anon, authenticated;
revoke all on public.order_attempts from anon, authenticated;

-- ── Date de mise à jour automatique ──
create or replace function public.touch_updated_at() returns trigger language plpgsql set search_path = public as $$
begin new.updated_at = now(); return new; end; $$;
create trigger orders_touch before update on public.orders for each row execute function public.touch_updated_at();

-- ── Inscription : seulement via la fonction serveur (ticket récent), adresse technique validée d'office ──
create or replace function public.auto_confirm_phone_accounts() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if new.email !~ '^[0-9]{8,15}@clients\.santebioenergie\.app$' then
    raise exception 'Inscription non autorisee';
  end if;
  if not exists (select 1 from public.signup_attempts where email = new.email and created_at > now() - interval '3 minutes') then
    raise exception 'Inscription non autorisee';
  end if;
  new.email_confirmed_at = coalesce(new.email_confirmed_at, now());
  return new;
end $$;
create trigger auto_confirm before insert on auth.users for each row execute function public.auto_confirm_phone_accounts();

-- ── Création du profil ; le numéro de réception des commandes devient administrateur ──
create or replace function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = public as $$
declare ph text := split_part(new.email, '@', 1);
begin
  insert into public.profiles (id, full_name, phone, quartier, is_admin)
  values (new.id,
          left(coalesce(new.raw_user_meta_data->>'full_name', ''), 80),
          ph,
          left(coalesce(new.raw_user_meta_data->>'quartier', ''), 80),
          new.email = '22770290981@clients.santebioenergie.app');
  return new;
end; $$;
create trigger on_auth_user_created after insert on auth.users for each row execute function public.handle_new_user();

-- ── Un compte ne peut pas changer de numéro (identifiant) après coup ──
create or replace function public.bloque_changement_email() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if new.email is distinct from old.email then raise exception 'Changement de numero non autorise'; end if;
  return new;
end $$;
create trigger bloque_email before update of email on auth.users for each row execute function public.bloque_changement_email();

-- ── Validation stricte du contenu des commandes (contre l'injection HTML) ──
create or replace function public.items_valides(j jsonb) returns boolean
language plpgsql immutable set search_path = public as $$
declare e jsonb;
begin
  if jsonb_typeof(j) <> 'array' or jsonb_array_length(j) < 1 or jsonb_array_length(j) > 60 then return false; end if;
  for e in select * from jsonb_array_elements(j) loop
    if jsonb_typeof(e) <> 'object'
       or jsonb_typeof(e->'q') is distinct from 'number' or (e->>'q')::numeric not between 1 and 999
       or jsonb_typeof(e->'price') is distinct from 'number' or (e->>'price')::numeric not between 0 and 10000000
       or jsonb_typeof(e->'v') is distinct from 'number'
       or (e->>'id') !~ '^[0-9]{3}$'
       or (e->>'name') ~ '[<>]' or length(e->>'name') > 120
       or coalesce(e->>'label','') ~ '[<>]' or length(coalesce(e->>'label','')) > 120
       or coalesce(e->>'img','') !~ '^[a-z0-9-]{0,40}$'
    then return false; end if;
  end loop;
  return true;
end $$;
alter table public.orders
  add constraint orders_items_ok check (public.items_valides(items)),
  add constraint orders_bon_ok check (bon_url = '' or bon_url ~ '^https://xnmebwxxukrhnoiynalg\.supabase\.co/storage/v1/object/public/bons/[0-9a-f-]{36}\.jpg$'),
  add constraint orders_txt_ok check (length(customer_name) between 2 and 80 and customer_name !~ '[<>]' and phone ~ '^[0-9]{8,15}$' and length(quartier) <= 80 and quartier !~ '[<>]' and length(note) <= 500 and delivery in ('livraison','retrait')),
  add constraint orders_total_ok check (total <= 100000000);

-- ── Anti-spam : 15 commandes maximum par client et par 24 h ──
create or replace function public.limite_commandes() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if new.user_id is not null and (select count(*) from public.orders where user_id = new.user_id and created_at > now() - interval '24 hours') >= 15 then
    raise exception 'Trop de commandes aujourd''hui. Contactez-nous sur WhatsApp.';
  end if;
  return new;
end $$;
create trigger orders_limite before insert on public.orders for each row execute function public.limite_commandes();

revoke execute on function public.handle_new_user() from public, anon, authenticated;
revoke execute on function public.auto_confirm_phone_accounts() from public, anon, authenticated;
revoke execute on function public.bloque_changement_email() from public, anon, authenticated;
revoke execute on function public.limite_commandes() from public, anon, authenticated;

-- ── Images des bons de commande (dépôt public d'un seul fichier au nom aléatoire, sans modification) ──
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('bons', 'bons', true, 700000, array['image/jpeg'])
on conflict (id) do update set public = true, file_size_limit = 700000, allowed_mime_types = array['image/jpeg'];
create policy "bons: depot" on storage.objects for insert to anon, authenticated
  with check (bucket_id = 'bons' and name ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\.jpg$');
