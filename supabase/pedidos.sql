-- =============================================================================
-- Coluna "Preparando" (pedido novo entra como em preparação)
-- Rode no SQL Editor se a tabela já existir sem essa coluna:
-- =============================================================================
alter table public.pedidos
	add column if not exists "Preparando" boolean not null default true;

-- =============================================================================
-- CORRIGIR: "new row violates row-level security policy for table 'pedidos'"
-- No Supabase: SQL Editor → New query → cole tudo → Run
-- =============================================================================

alter table public.pedidos enable row level security;

-- Garante que o papel da chave pública do site possa inserir
grant usage on schema public to anon;
grant insert on table public.pedidos to anon;

-- Remove política antiga com o mesmo nome (se existir) e recria
drop policy if exists "Permitir insert anônimo em pedidos" on public.pedidos;

create policy "Permitir insert anônimo em pedidos"
	on public.pedidos
	as permissive
	for insert
	to anon
	with check (true);

-- (Opcional) quem usa login no futuro pode inserir também
-- drop policy if exists "Permitir insert autenticado em pedidos" on public.pedidos;
-- create policy "Permitir insert autenticado em pedidos"
-- 	on public.pedidos for insert to authenticated with check (true);
-- grant insert on table public.pedidos to authenticated;
