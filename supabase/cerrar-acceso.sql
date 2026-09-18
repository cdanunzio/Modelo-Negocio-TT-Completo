-- ============================================================================
-- Modelo de Negocio - Terminal Portuaria Timbues
-- CERRAR EL ACCESO: pasar de "cualquiera con el link" a "hace falta usuario"
--
-- Ejecutar una sola vez en: Supabase > SQL Editor > New query > pegar > Run
--
-- Esto NO toca los datos: no borra ni modifica ningun escenario ni ninguna
-- version del historial. Solo cambia quien tiene permiso para leerlos.
--
-- IMPORTANTE: antes o despues de correr esto hay que hacer dos cosas mas en el
-- panel de Supabase, porque no se pueden hacer desde SQL:
--   1) Crear el usuario del equipo en Authentication > Users > Add user,
--      con "Auto Confirm User" tildado.
--   2) Apagar el alta publica en Authentication > Sign In / Providers > Email:
--      la opcion "Allow new users to sign up" tiene que quedar DESACTIVADA.
--      Sin eso, cualquiera con el link puede crearse una cuenta y entrar igual,
--      porque estas politicas solo piden "estar autenticado".
-- ============================================================================

-- Escenarios: solo usuarios autenticados leen, crean y editan. Nadie borra.
drop policy if exists escenarios_leer on public.escenarios;
create policy escenarios_leer on public.escenarios
  for select using (auth.uid() is not null);

drop policy if exists escenarios_crear on public.escenarios;
create policy escenarios_crear on public.escenarios
  for insert with check (auth.uid() is not null);

drop policy if exists escenarios_editar on public.escenarios;
create policy escenarios_editar on public.escenarios
  for update using (auth.uid() is not null) with check (auth.uid() is not null);

-- Historial: se lee y se agrega estando autenticado. Nadie modifica ni borra
-- lo ya escrito.
drop policy if exists versiones_leer on public.escenario_versiones;
create policy versiones_leer on public.escenario_versiones
  for select using (auth.uid() is not null);

drop policy if exists versiones_crear on public.escenario_versiones;
create policy versiones_crear on public.escenario_versiones
  for insert with check (auth.uid() is not null);

-- La funcion de guardado solo la puede ejecutar quien inicio sesion.
revoke execute on function public.guardar_escenario(uuid, jsonb, jsonb, text, jsonb, text)
  from anon;
grant execute on function public.guardar_escenario(uuid, jsonb, jsonb, text, jsonb, text)
  to authenticated;

-- ---------------------------------------------------------------- control --
-- Despues de correrlo, esta consulta tiene que devolver las cinco politicas
-- con la condicion "auth.uid() IS NOT NULL":
--
--   select tablename, policyname, qual, with_check
--   from pg_policies
--   where schemaname = 'public'
--     and tablename in ('escenarios', 'escenario_versiones');
--
-- Y la prueba de verdad es abrir el link en una ventana de incognito: tiene
-- que pedir usuario y contrasena, y sin eso no se tiene que ver ningun dato.
