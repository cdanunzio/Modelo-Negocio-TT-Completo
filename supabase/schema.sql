-- ============================================================================
-- Modelo de Negocio - Terminal Portuaria Timbues
-- Esquema de base de datos (Supabase / PostgreSQL)  --  ACCESO ABIERTO POR LINK
--
-- Ejecutar una sola vez en: Supabase > SQL Editor > New query > pegar > Run
--
-- MODO DE ACCESO
--   Cualquiera que tenga el link puede ver, editar y guardar. No hay login.
--   Para que eso no sea peligroso:
--     - nadie puede BORRAR escenarios ni versiones (no hay politica de delete)
--     - el historial es inmutable: cada guardado agrega una version y no pisa
--       las anteriores, asi que siempre se puede volver atras
--     - cada guardado registra un nombre de autor escrito a mano, para que el
--       historial siga sirviendo aunque no haya usuarios
-- ============================================================================

-- ------------------------------------------------------------- escenarios --
create table if not exists public.escenarios (
  id              uuid primary key default gen_random_uuid(),
  nombre          text not null,
  descripcion     text,
  datos           jsonb not null,
  version         integer not null default 1,
  autor           text,
  creado_en       timestamptz not null default now(),
  actualizado_en  timestamptz not null default now()
);
create index if not exists idx_escenarios_actualizado
  on public.escenarios (actualizado_en desc);

-- ------------------------------------------------------------- historial --
create table if not exists public.escenario_versiones (
  id           bigserial primary key,
  escenario_id uuid not null references public.escenarios(id) on delete cascade,
  version      integer not null,
  datos        jsonb not null,
  cambios      jsonb,          -- [{campo, etiqueta, antes, despues}]
  comentario   text,
  autor        text,
  kpis         jsonb,          -- indicadores de esa version
  creado_en    timestamptz not null default now(),
  unique (escenario_id, version)
);
create index if not exists idx_versiones_escenario
  on public.escenario_versiones (escenario_id, version desc);

-- ------------------------------------------------ guardado transaccional --
-- Guarda el escenario y su version en una sola operacion atomica: nunca puede
-- quedar un escenario guardado sin su registro en el historial.
create or replace function public.guardar_escenario(
  p_escenario_id uuid,
  p_datos        jsonb,
  p_cambios      jsonb default null,
  p_comentario   text  default null,
  p_kpis         jsonb default null,
  p_autor        text  default null
)
returns integer
language plpgsql
security definer set search_path = public
as $$
declare
  v_nueva integer;
begin
  update public.escenarios
     set datos = p_datos,
         version = version + 1,
         autor = coalesce(nullif(p_autor, ''), autor),
         actualizado_en = now()
   where id = p_escenario_id
  returning version into v_nueva;

  if v_nueva is null then
    raise exception 'El escenario % no existe', p_escenario_id;
  end if;

  insert into public.escenario_versiones
    (escenario_id, version, datos, cambios, comentario, kpis, autor)
  values
    (p_escenario_id, v_nueva, p_datos, p_cambios, p_comentario, p_kpis,
     nullif(p_autor, ''));

  return v_nueva;
end;
$$;

-- ------------------------------------------------------------------- RLS --
alter table public.escenarios          enable row level security;
alter table public.escenario_versiones enable row level security;

-- Escenarios: cualquiera lee, crea y edita. Nadie borra.
drop policy if exists escenarios_leer on public.escenarios;
create policy escenarios_leer on public.escenarios
  for select using (true);

drop policy if exists escenarios_crear on public.escenarios;
create policy escenarios_crear on public.escenarios
  for insert with check (true);

drop policy if exists escenarios_editar on public.escenarios;
create policy escenarios_editar on public.escenarios
  for update using (true) with check (true);

-- Historial: cualquiera lee y agrega. Nadie modifica ni borra lo ya escrito.
drop policy if exists versiones_leer on public.escenario_versiones;
create policy versiones_leer on public.escenario_versiones
  for select using (true);

drop policy if exists versiones_crear on public.escenario_versiones;
create policy versiones_crear on public.escenario_versiones
  for insert with check (true);

grant execute on function public.guardar_escenario(uuid, jsonb, jsonb, text, jsonb, text)
  to anon, authenticated;

-- ------------------------------------------------------------------ nota --
-- Si mas adelante queres cerrar el acceso, reemplaza en las politicas
--   using (true)        por   using (auth.uid() is not null)
--   with check (true)   por   with check (auth.uid() is not null)
-- y agrega login. El resto de la aplicacion no cambia.
