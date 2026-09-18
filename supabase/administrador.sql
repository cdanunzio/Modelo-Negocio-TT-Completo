-- ============================================================================
-- Modelo de Negocio - Terminal Portuaria Timbues
-- ADMINISTRADOR Y ARCHIVADO DE ESCENARIOS
--
-- Ejecutar una sola vez en: Supabase > SQL Editor > New query > pegar > Run
-- Volver a ejecutarlo es seguro: no borra ni pisa datos.
--
-- QUE HACE
--   1. Agrega una columna para archivar escenarios. Archivar NO borra: el
--      escenario y todo su historial quedan en la base, solo dejan de
--      aparecer en la lista. Siempre se puede restaurar.
--   2. Crea la lista de administradores. Solo quien este en esa lista puede
--      archivar y restaurar.
--   3. Deja las politicas de modo que el resto del equipo pueda leer y
--      editar, pero no archivar.
--
-- ORDEN
--   Primero hay que crear el usuario administrador en el panel
--   (Authentication > Users > Add user > Create new user, con "Auto confirm
--   user" tildado) y despues correr esto, para que el email exista.
-- ============================================================================

-- ------------------------------------------------------- columna archivado --
alter table public.escenarios
  add column if not exists archivado_en timestamptz,
  add column if not exists archivado_por text;

create index if not exists idx_escenarios_archivado
  on public.escenarios (archivado_en);

-- ---------------------------------------------------- lista de administradores --
create table if not exists public.administradores (
  email      text primary key,
  nota       text,
  creado_en  timestamptz not null default now()
);

alter table public.administradores enable row level security;

-- Cualquiera autenticado puede LEER la lista: la aplicacion necesita saber si
-- mostrar o no el boton de archivar. Nadie puede modificarla desde la
-- aplicacion: se administra desde este editor SQL.
drop policy if exists administradores_leer on public.administradores;
create policy administradores_leer on public.administradores
  for select using (auth.uid() is not null);

-- --------------------------------------------------------- quien es admin --
-- security definer para que la funcion pueda leer la tabla sin depender de
-- las politicas del que pregunta, y evitar recursion.
create or replace function public.es_administrador()
returns boolean
language sql
stable
security definer set search_path = public
as $$
  select exists (
    select 1 from public.administradores
     where lower(email) = lower(coalesce(auth.jwt() ->> 'email', ''))
  );
$$;

grant execute on function public.es_administrador() to authenticated;

-- ------------------------------------------------- archivar y restaurar ----
create or replace function public.archivar_escenario(
  p_escenario_id uuid,
  p_archivar     boolean,
  p_autor        text default null
)
returns void
language plpgsql
security definer set search_path = public
as $$
begin
  if not public.es_administrador() then
    raise exception 'Solo un administrador puede archivar o restaurar escenarios';
  end if;

  update public.escenarios
     set archivado_en  = case when p_archivar then now() else null end,
         archivado_por = case when p_archivar then nullif(p_autor, '') else null end
   where id = p_escenario_id;

  if not found then
    raise exception 'El escenario % no existe', p_escenario_id;
  end if;
end;
$$;

revoke execute on function public.archivar_escenario(uuid, boolean, text) from anon;
grant   execute on function public.archivar_escenario(uuid, boolean, text) to authenticated;

-- ------------------------------------------------------------- candado ----
-- Editar un escenario sigue permitido para cualquiera con sesion, pero el
-- estado de archivado solo lo puede cambiar un administrador. Esto se hace con
-- un disparador y no con una politica, porque tiene que valer para cualquier
-- via: la aplicacion, la API o una consulta suelta.
create or replace function public.solo_admin_archiva()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  if new.archivado_en is distinct from old.archivado_en
     and not public.es_administrador() then
    raise exception 'Solo un administrador puede archivar o restaurar escenarios';
  end if;
  return new;
end;
$$;

drop trigger if exists tg_solo_admin_archiva on public.escenarios;
create trigger tg_solo_admin_archiva
  before update on public.escenarios
  for each row execute function public.solo_admin_archiva();

-- ------------------------------------------------ cargar al administrador --
-- Reemplazar el correo por el del usuario administrador que se creo en el
-- panel. Se pueden agregar varios repitiendo la linea.
insert into public.administradores (email, nota)
values ('admin@timbues.local', 'Administrador del modelo')
on conflict (email) do nothing;

-- ---------------------------------------------------------------- control --
-- Para ver quienes son administradores:
--   select * from public.administradores;
--
-- Para sacar a alguien:
--   delete from public.administradores where email = 'admin@timbues.local';
--
-- Para ver los escenarios archivados:
--   select nombre, archivado_en, archivado_por from public.escenarios
--    where archivado_en is not null;
