# Modelo de Negocio — Terminal Portuaria Timbúes

Simulador económico-financiero del puerto, con tres unidades de negocio (agrograneles,
fertilizantes y cargas generales) más la vista consolidada. Reemplaza al Excel: los números se
recalculan solos y **cada cambio queda guardado con su versión, su autor y el detalle de qué se
modificó**.

Cualquier persona con el link puede abrir la aplicación, editar un escenario y guardarlo.
No hay usuarios ni contraseñas.

---

## Qué hace

- **Escenarios**: cada uno es una variante completa del modelo (volúmenes, tarifas, CAPEX, OPEX,
  impuestos, financiamiento). Se crean, se editan y se comparan.
- **Historial**: cada vez que alguien guarda, se registra una versión nueva con la lista de campos
  que cambiaron y sus valores anterior/nuevo. Nada se pisa ni se borra.
- **Resultados en vivo**: EBITDA, EBIT, flujo de fondos libre, TIR, payback, DSCR, ocupación de
  sitios de atraque, ingresos por rubro, todo recalculado mientras se escribe.
- **Validaciones**: 12 controles automáticos (ocupación mayor al 100%, capacidad excedida,
  take-or-pay incoherente, CAPEX sin financiamiento, etc.).
- **Manual y glosario**: explicación en castellano llano de CAPEX, OPEX, EBITDA, TIR, payback,
  DSCR, RIGI y cada campo del modelo.
- **Demo**: `/demo` muestra el escenario base sin necesidad de base de datos.

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

1. Abrir el link.
2. Escribir el nombre propio en el campo **Tu nombre** (queda guardado en ese navegador y firma
   cada versión). Es opcional.
3. **Nuevo escenario** arranca con el escenario base ya cargado.
4. Editar en las solapas: Base, Costos comunes, Agrograneles, Fertilizantes, Cargas generales,
   Inversores, Validación.
5. **Guardar**: pide un comentario y crea la versión siguiente.
6. **Historial**: muestra todas las versiones, quién las guardó y qué campos cambiaron.

Como el acceso es abierto, cualquiera con el link puede guardar. Por eso el esquema **no permite
borrar**: ni escenarios ni versiones. Lo peor que puede pasar es que alguien guarde un cambio
equivocado, y el historial deja volver al valor anterior.

### Si más adelante querés cerrar el acceso

Al final de `supabase/schema.sql` está explicado: se reemplaza `using (true)` por
`using (auth.uid() is not null)` en las políticas y se activa el login de Supabase.

---

## Desarrollo local

```bash
npm install
cp .env.example .env.local   # completar con los valores de Supabase
npm run dev                  # http://localhost:3000
```

Otros comandos:

```bash
npm run build     # compilación de producción
npm run check     # verifica el motor de cálculo contra los valores esperados
npx tsc --noEmit  # chequeo de tipos
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
| `supabase/schema.sql` | Tablas, políticas RLS y función `guardar_escenario`. |
| `scripts/verificar-modelo.ts` | Prueba de regresión del motor. |

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
