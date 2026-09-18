# Modelo de Negocio — Terminal Portuaria Timbúes

Simulador económico-financiero del puerto, con tres unidades de negocio (agrograneles,
fertilizantes y cargas generales) más la vista consolidada. Reemplaza al Excel: los números se
recalculan solos y **cada cambio queda guardado con su versión, su autor y el detalle de qué se
modificó**.

El acceso está cerrado con un usuario compartido por el equipo. Quien tiene el link y la
contraseña entra, edita y guarda; quien no, no ve nada.

---

## Qué hace

- **Escenarios**: cada uno es una variante completa del modelo (volúmenes, tarifas, inversión,
  costos, impuestos, financiamiento). Se crean, se editan y se comparan.
- **Historial**: cada vez que alguien guarda, se registra una versión nueva con la lista de campos
  que cambiaron y sus valores anterior/nuevo. Nada se pisa ni se borra.
- **Resultados en vivo**: EBITDA, EBIT, flujo de fondos libre, TIR, payback, DSCR, ocupación de
  sitios de atraque, ingresos por rubro, todo recalculado mientras se escribe.
- **Validaciones**: controles automáticos (ocupación por encima del umbral, capacidad excedida,
  volumen mínimo incoherente, participaciones que no suman 100% en algún negocio, etc.).
- **Socios por negocio**: cada socio puede participar de una o de varias unidades, con un
  porcentaje distinto en cada una. El flujo del proyecto se reparte entre los negocios y de ahí
  sale lo que le toca a cada uno.
- **Borrador**: un escenario nuevo no se crea en la base hasta que se guarda, y si se intenta
  salir con cambios sin guardar aparece un aviso. Así la lista no se llena de escenarios vacíos.
- **Administrador**: un usuario con permiso para archivar escenarios. Archivar no borra: el
  escenario y su historial quedan en la base y se pueden restaurar.
- **Exportación a Excel**: un botón baja un archivo con una hoja por módulo (resumen, parámetros,
  costos compartidos, cada negocio, flujo consolidado y socios), con los números como números.
- **Ayuda por campo**: el signo de pregunta al lado de cada dato abre una ficha que explica qué
  es, para qué sirve, cómo se carga y sobre qué resultado impacta.
- **Se instala en el celular**: en Android y en iPhone se puede agregar a la pantalla de inicio y
  queda como una aplicación más, con su ícono y sin la barra del navegador.
- **Manual y glosario**: explicación en castellano llano de CAPEX, OPEX, EBITDA, TIR, payback,
  DSCR, RIGI y cada campo del modelo.
- **Demo**: `/demo` muestra el escenario base de solo lectura, para mirar el modelo sin tocar
  ningún escenario guardado.

> La TIR no incluye VAN ni tasa de descuento: fue una decisión explícita del modelo.

---

## Puesta en marcha (tres pasos)

### 1. Base de datos (Supabase)

1. Crear una cuenta gratuita en [supabase.com](https://supabase.com) y un proyecto nuevo.
2. Entrar a **SQL Editor** → **New query**.
3. Pegar el contenido completo de `supabase/schema.sql` y ejecutar (**Run**).
4. Ir a **Project Settings → API** y copiar dos valores:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
5. Crear el usuario del equipo en **Authentication → Users → Add user**, con *Auto Confirm User*
   tildado.
6. Desactivar **Allow new users to sign up** en **Authentication → Sign In / Providers → Email**.
7. Ejecutar `supabase/cerrar-acceso.sql` para que haga falta sesión.
8. Crear el usuario administrador y ejecutar `supabase/administrador.sql`.

Los pasos 5 a 8 están explicados con más detalle en *Cómo funciona el acceso*, más abajo.

La clave `anon` es pública por diseño: va en el navegador y no es un secreto. Lo que protege los
datos son las políticas RLS del esquema. La clave `service_role` **no se usa en ningún lado** de
este proyecto; no la copies ni la subas.

### 2. GitHub

```bash
cd puerto-tt
git init
git add .
git commit -m "Modelo de negocio Terminal Portuaria Timbúes"
git branch -M main
git remote add origin https://github.com/<tu-usuario>/<tu-repo>.git
git push -u origin main
```

`.gitignore` ya excluye `node_modules`, `.next` y `.env.local`, así que no se sube nada pesado ni
ninguna credencial.

### 3. Vercel

1. Entrar a [vercel.com](https://vercel.com) con la cuenta de GitHub.
2. **Add New → Project** → elegir el repo → **Import**.
3. En **Environment Variables** cargar las dos variables del paso 1
   (`NEXT_PUBLIC_SUPABASE_URL` y `NEXT_PUBLIC_SUPABASE_ANON_KEY`).
4. **Deploy**. En un minuto queda la URL pública, del estilo
   `https://<tu-repo>.vercel.app`.

Ese link es todo lo que hay que compartir con el equipo.

Si se despliega sin cargar las variables, la aplicación igual abre y muestra un cartel explicando
qué falta; la demo sigue funcionando.

---

## Uso diario

1. Abrir el link e ingresar con el usuario y la contraseña del equipo.
2. Escribir el nombre propio en el campo **Tu nombre** (queda guardado en ese navegador y firma
   cada versión). Es opcional, y es distinto del usuario: sirve para saber quién hizo cada cambio
   cuando varias personas comparten la misma cuenta.
3. **Nuevo escenario** arranca con el escenario base ya cargado.
4. Editar en las solapas: Parámetros generales, Costos comunes, Agrograneles, Fertilizantes,
   Cargas generales, Inversores, Validación.
5. **Guardar**: pide un comentario y crea la versión siguiente.
6. **Historial**: muestra todas las versiones, quién las guardó y qué campos cambiaron.
7. **Salir** cierra la sesión en ese navegador.

La sesión queda guardada en el navegador, así que no hay que escribir la contraseña cada vez.

Como la cuenta es compartida, el esquema **no permite borrar**: ni escenarios ni versiones. Lo
peor que puede pasar es que alguien guarde un cambio equivocado, y el historial deja volver al
valor anterior.

---

## Cómo funciona el acceso

No hay ninguna contraseña escrita en el código: la verifica Supabase. Lo que protege los datos
son las políticas de la base, que exigen una sesión válida (`auth.uid() is not null`) para leer,
crear o modificar. Sin sesión, la clave pública que viaja en el navegador no sirve para nada.

### Crear o cambiar el usuario

En el panel de Supabase, **Authentication → Users**:

- **Add user → Create new user**, con *Auto Confirm User* tildado. El correo es interno y no
  recibe nada: para el usuario `TT`, el correo es `tt@timbues.local`. En la pantalla de ingreso
  se escribe solamente `TT`.
- Para cambiar la contraseña, en esa misma lista: los tres puntos del usuario → *Reset password*
  o edición directa.

### Algo que hay que dejar apagado

En **Authentication → Sign In / Providers → Email**, la opción **Allow new users to sign up**
tiene que quedar **desactivada**. Si está activa, cualquiera con el link puede crearse una cuenta
propia y entrar igual, porque las políticas solo piden "estar autenticado".

### El administrador

Hay dos niveles: el usuario del equipo, que lee y edita, y el administrador, que además puede
**archivar** escenarios. Archivar no borra nada — el escenario y todas sus versiones quedan en la
base, solo dejan de aparecer en la lista — y el propio administrador puede restaurarlos desde la
pestaña *Archivados*.

Para darle ese permiso a alguien:

1. Crear su usuario en **Authentication → Users**, igual que el del equipo.
2. Ejecutar `supabase/administrador.sql`, cambiando el correo del `insert` del final por el suyo.

Quién puede archivar no depende de la aplicación sino de la base: un disparador rechaza cualquier
intento de cambiar el estado de archivado que no venga de un administrador, venga de donde venga.
Para sumar o sacar administradores después, alcanza con un `insert` o un `delete` en la tabla
`administradores` desde el SQL Editor.

### Si querés volver al acceso abierto

Al final de `supabase/schema.sql` está explicado: se reemplaza `auth.uid() is not null` por
`true` en las políticas y se le devuelve el permiso de ejecución a `anon`.

---

## Instalarla en el celular

No hay que publicarla en ninguna tienda: la aplicación se instala desde el propio navegador.

**Android (Chrome)**: abrir el link, tocar los tres puntos y elegir *Instalar aplicación* o
*Agregar a la pantalla principal*. Si el menú no la ofrece, recargar una vez y volver a probar.

**iPhone (Safari)**: abrir el link **en Safari** — no en Chrome, que en iOS no puede instalar—,
tocar el botón de compartir y elegir *Agregar a pantalla de inicio*.

Queda con el ícono de Terminal Timbúes y abre a pantalla completa. Es la misma aplicación: los
escenarios y el historial son los mismos que en la computadora. La sesión se guarda en el
teléfono, así que la contraseña se escribe una sola vez.

Lo que hace falta del lado del código ya está: `public/manifest.webmanifest` con los íconos,
`public/sw.js` para que Android ofrezca instalarla, y las etiquetas de iOS en `src/app/layout.tsx`.

> El service worker pide **siempre primero a la red** y solo usa la copia guardada cuando no hay
> señal. Es deliberado: un modelo financiero compartido no puede mostrar números viejos porque el
> navegador guardó una copia.

---

## Desarrollo local

```bash
npm install
cp .env.example .env.local   # completar con los valores de Supabase
npm run dev                  # http://localhost:3000
```

Otros comandos:

```bash
npm run build             # compilación de producción
npm run check             # verifica el motor de cálculo contra los valores esperados
npx tsc --noEmit          # chequeo de tipos
npx tsx scripts/probar-excel.ts   # genera un Excel de prueba y lo escribe en disco
```

---

## Cómo está armado

| Carpeta | Qué hay |
|---|---|
| `src/lib/model/types.ts` | Tipos del escenario (unidades, flujos, tarifas, inversores). |
| `src/lib/model/engine.ts` | Motor de cálculo puro, sin dependencias: volúmenes, ingresos, costos, impuestos, flujo de fondos, TIR, payback, DSCR. |
| `src/lib/model/defaults.ts` | Escenario base con los valores preliminares del proyecto. |
| `src/lib/escenarios.ts` | Comparador que arma el detalle legible de cada cambio. |
| `src/lib/contenido.ts` | Manual (8 secciones) y glosario (42 términos). |
| `src/components/editor/` | Paneles de carga y validación. |
| `src/components/Graficos.tsx` | Gráficos (paleta verificada para daltonismo). |
| `src/lib/fichas.ts` | El texto de la ficha explicativa de cada campo, todo junto. |
| `src/lib/filas.ts` | Las filas del flujo de fondos, definidas una sola vez y usadas por la pantalla y por el Excel. |
| `src/lib/excel.ts` | Armado del libro de Excel. |
| `src/lib/model/migracion.ts` | Adapta los escenarios guardados con versiones anteriores del modelo. |
| `supabase/schema.sql` | Tablas, políticas RLS y función `guardar_escenario`. |
| `supabase/cerrar-acceso.sql` | Pasa el acceso de abierto a "hace falta usuario". |
| `supabase/administrador.sql` | Archivado de escenarios y lista de administradores. |
| `src/components/Confirmar.tsx` | Ventana de confirmación de las acciones que no se deshacen. |
| `src/components/EnlaceSeguro.tsx` | Enlace que avisa antes de salir con cambios sin guardar. |
| `public/` | Logo, íconos de la aplicación, manifiesto y service worker. |
| `scripts/verificar-modelo.ts` | Prueba de regresión del motor. |

### Cómo se reparte el flujo entre los negocios

Los socios participan por unidad de negocio, así que hace falta saber cuánto genera cada una. El
flujo consolidado se reparte así: cada negocio se lleva lo suyo —facturación, costos, inversión,
depreciación— y lo que solo existe a nivel proyecto se prorratea. El impuesto a las ganancias, por
el resultado operativo de cada negocio; las tasas ligadas a la obra, por la inversión; la tasa
municipal, por la facturación. La suma de los tres negocios da exactamente el flujo consolidado, y
eso lo verifica `npm run check`.

### Una diferencia contra el Excel

El Excel arrastraba un defecto: cuando un año tenía volumen cargado a mano, el crecimiento
posterior se recalculaba desde el volumen objetivo original y el tonelaje **caía** (por ejemplo,
2.500.000 tn en 2032 y 600.000 tn en 2033). Acá el crecimiento arranca desde el último volumen
cargado a mano. Por eso la TIR da **16,55%** en lugar del 15,01% de la planilla: la planilla estaba
subestimando los años finales.

---

## Advertencia sobre los números

Los valores cargados por defecto son **preliminares** (volúmenes, tarifas, CAPEX, plazos).
Sirven para que la herramienta arranque con algo coherente, no como cifras validadas. Antes de
presentar resultados hay que revisarlos con las áreas de operaciones, comercial e impuestos.

Este material es una herramienta de análisis, no asesoramiento financiero ni impositivo. El
tratamiento del RIGI, Ganancias, IIBB, DREI e IVA está modelado según el entendimiento del régimen
vigente y debe confirmarse con los asesores del proyecto.
