-- ============================================================================
-- Modelo de Negocio - Terminal Portuaria Timbues
-- Esquema de base de datos (Supabase / PostgreSQL)
--
-- Ejecutar una sola vez en: Supabase > SQL Editor > New query > pegar > Run
-- ============================================================================

-- ---------------------------------------------------------------- perfiles --
-- Una fila por usuario. Se crea sola cuando alguien se registra.
create table if not exists public.perfiles (
  id          uuid primary key references auth.users on delete cascade,
  email       text not null,
  nombre      text,
  rol         text not null default 'editor' check (rol in ('admin','editor','lector')),
  creado_en   timestamptz not null default now()
);

create or replace function public.crear_perfil()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.perfiles (id, email, nombre)
  values (new.id, new.email, coalesce(new.raw_user_meta_data->>'nombre', split_part(new.email,'@',1)))
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.crear_perfil();

-- -------------------------------------------------------------- escenarios --
-- Cada escenario es una variante del modelo. 'datos' guarda el objeto completo
-- de supuestos en JSON: es lo que el motor de calculo recibe.
create table if not exists public.escenarios (
  id            uuid primary key default gen_random_uuid(),
  nombre        text not null,
  descripcion   text,
  datos         jsonb not null,
  version       integer not null default 1,
  es_base       boolean not null default false,
  publico       boolean not null default false,
  token_publico uuid unique default gen_random_uuid(),
  creado_por    uuid references public.perfiles(id),
  creado_en     timestamptz not null default now(),
  actualizado_por uuid references public.perfiles(id),
  actualizado_en  timestamptz not null default now()
);
create index if not exists idx_escenarios_actualizado on public.escenarios (actualizado_en desc);

-- ----------------------------------------------------------------- version --
-- Historial completo: una fila por cada guardado. Nunca se borra ni se pisa.
create table if not exists public.escenario_versiones (
  id           bigserial primary key,
  escenario_id uuid not null references public.escenarios(id) on delete cascade,
  version      integer not null,
  datos        jsonb not null,
  cambios      jsonb,            -- lista de {campo, antes, despues}
  comentario   text,
  kpis         jsonb,            -- snapshot de los indicadores de esa version
  creado_por   uuid references public.perfiles(id),
  creado_en    timestamptz not null default now(),
  unique (escenario_id, version)
);
create index if not exists idx_versiones_escenario
  on public.escenario_versiones (escenario_id, version desc);

-- ------------------------------------------------- guardado transaccional --
-- Guarda el escenario y su version en una sola operacion atomica.
create or replace function public.guardar_escenario(
  p_escenario_id uuid,
  p_datos        jsonb,
  p_cambios      jsonb default null,
  p_comentario   text  default null,
  p_kpis         jsonb default null
)
returns integer
language plpgsql
security invoker
as $$
declare
  v_nueva integer;
begin
  update public.escenarios
     set datos = p_datos,
         version = version + 1,
         actualizado_por = auth.uid(),
         actualizado_en = now()
   where id = p_escenario_id
  returning version into v_nueva;

  if v_nueva is null then
    raise exception 'El escenario % no existe o no tenes permiso', p_escenario_id;
  end if;

  insert into public.escenario_versiones
    (escenario_id, version, datos, cambios, comentario, kpis, creado_por)
  values
    (p_escenario_id, v_nueva, p_datos, p_cambios, p_comentario, p_kpis, auth.uid());

  return v_nueva;
end;
$$;

-- ------------------------------------------------------------------- RLS --
alter table public.perfiles            enable row level security;
alter table public.escenarios          enable row level security;
alter table public.escenario_versiones enable row level security;

-- perfiles: cada uno ve a todos (para mostrar quien edito que) y edita el suyo
drop policy if exists perfiles_leer on public.perfiles;
create policy perfiles_leer on public.perfiles
  for select using (auth.uid() is not null);
drop policy if exists perfiles_editar on public.perfiles;
create policy perfiles_editar on public.perfiles
  for update using (auth.uid() = id);

-- escenarios: el equipo logueado lee y edita; los lectores solo leen
drop policy if exists escenarios_leer on public.escenarios;
create policy escenarios_leer on public.escenarios
  for select using (auth.uid() is not null);
drop policy if exists escenarios_crear on public.escenarios;
create policy escenarios_crear on public.escenarios
  for insert with check (
    exists (select 1 from public.perfiles p where p.id = auth.uid() and p.rol in ('admin','editor'))
  );
drop policy if exists escenarios_editar on public.escenarios;
create policy escenarios_editar on public.escenarios
  for update using (
    exists (select 1 from public.perfiles p where p.id = auth.uid() and p.rol in ('admin','editor'))
  );
drop policy if exists escenarios_borrar on public.escenarios;
create policy escenarios_borrar on public.escenarios
  for delete using (
    exists (select 1 from public.perfiles p where p.id = auth.uid() and p.rol = 'admin')
  );

-- versiones: solo lectura para el equipo. Se escriben por la funcion de guardado.
drop policy if exists versiones_leer on public.escenario_versiones;
create policy versiones_leer on public.escenario_versiones
  for select using (auth.uid() is not null);
drop policy if exists versiones_crear on public.escenario_versiones;
create policy versiones_crear on public.escenario_versiones
  for insert with check (
    exists (select 1 from public.perfiles p where p.id = auth.uid() and p.rol in ('admin','editor'))
  );

-- ------------------------------------------------ lectura publica por token --
-- Permite compartir un escenario en modo solo lectura sin pedir login.
create or replace function public.escenario_publico(p_token uuid)
returns table (id uuid, nombre text, descripcion text, datos jsonb,
               version integer, actualizado_en timestamptz)
language sql
security definer set search_path = public
as $$
  select e.id, e.nombre, e.descripcion, e.datos, e.version, e.actualizado_en
    from public.escenarios e
   where e.token_publico = p_token and e.publico = true;
$$;

grant execute on function public.escenario_publico(uuid) to anon, authenticated;
