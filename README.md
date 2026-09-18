# Modelo de Negocio — Terminal Portuaria Timbúes

Aplicación web para simular el negocio del puerto: **agrograneles**, **fertilizantes y
graneles líquidos** y **cargas generales**. Calcula el flujo de fondos año por año,
los impuestos argentinos con RIGI, la ocupación de muelle y el reparto entre socios.

Todo lo que se edita queda guardado con su versión, quién lo cambió y cuándo.

---

## Puesta en marcha

Son tres pasos: base de datos, repositorio, deploy. Toma unos 20 minutos.

### 1. Supabase (base de datos y login)

1. Crear una cuenta en [supabase.com](https://supabase.com) y un proyecto nuevo.
   Elegir la región más cercana (São Paulo) y guardar la contraseña que genera.
2. Ir a **SQL Editor → New query**, pegar todo el contenido de
   [`supabase/schema.sql`](supabase/schema.sql) y apretar **Run**.
   Crea las tablas, el historial de versiones, la función de guardado y las políticas
   de seguridad por fila.
3. Ir a **Project Settings → API** y copiar dos valores:
   - `Project URL`
   - `anon public` key

> La `anon key` es pública por diseño: lo que protege los datos son las políticas RLS
> del esquema, no la clave. La `service_role` key **no** se usa en este proyecto.

### 2. GitHub

```bash
git init
git add .
git commit -m "Modelo de negocio Terminal Portuaria Timbues"
git branch -M main
git remote add origin https://github.com/TU-USUARIO/puerto-tt.git
git push -u origin main
```

### 3. Vercel

1. En [vercel.com](https://vercel.com) → **Add New → Project** → importar el repo.
2. Vercel detecta Next.js solo. No hay que tocar ninguna configuración de build.
3. En **Environment Variables**, cargar las dos variables:

   | Nombre | Valor |
   |---|---|
   | `NEXT_PUBLIC_SUPABASE_URL` | el Project URL de Supabase |
   | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | la anon public key |

4. **Deploy**.

Cada `git push` a `main` publica una versión nueva automáticamente.

### 4. Primer usuario

Entrar a la aplicación → **No tengo cuenta todavía** → crear la cuenta con el correo
de trabajo. Si Supabase pide confirmación por mail, llega un link.

Para el resto del equipo: que cada uno se registre igual. Los roles (`admin`, `editor`,
`lector`) se cambian en Supabase, tabla `perfiles`, columna `rol`.

---

## Cómo se usa

- **`/demo`** — la aplicación funcionando con el escenario base, sin login ni base de
  datos. Sirve para mostrarla antes de configurar nada.
- **Escenarios** — cada uno es una variante del modelo. Se puede tener uno con RIGI y
  otro sin RIGI y compararlos.
- **Guardar** — nada se guarda hasta que se aprieta el botón. Antes de guardar se ve
  exactamente qué campos cambiaron, con el valor anterior y el nuevo.
- **Historial** — cada guardado crea una versión con su lista de cambios, un comentario
  opcional y los indicadores de ese momento. No se pisa ni se borra nada.
- **Manual y Glosario** — explicados para alguien que no trabaja en finanzas.

### El semáforo de colores

| Color | Significa |
|---|---|
| Amarillo | Lo completa el usuario |
| Celeste | Viene de otro lado, no se edita |
| Gris | Lo calcula el modelo |
| Verde claro | Fila clave: toneladas, ingresos, EBITDA, EBIT, FCFF |

---

## Estructura

```
src/lib/model/          motor de cálculo (TypeScript puro, sin dependencias)
  types.ts              el escenario: qué se puede cargar
  engine.ts             las fórmulas: volumen, tarifas, impuestos, flujo, TIR
  defaults.ts           el escenario base (valores preliminares)
src/lib/supabase/       clientes de base de datos
src/components/         interfaz
  Graficos.tsx          gráficos (paleta validada para daltonismo)
  editor/               paneles de carga y resultados
src/app/                páginas
supabase/schema.sql     esquema de base de datos
scripts/                verificación del motor
```

El motor no depende de React ni de Supabase: se puede correr en un test, en el
navegador o en el servidor, y da siempre el mismo resultado.

### Verificar el motor

```bash
npm run check
```

Contrasta los resultados contra los valores validados y corre los mismos chequeos de
integridad que muestra la aplicación. Conviene correrlo después de tocar `engine.ts`.

### Desarrollo local

```bash
npm install
cp .env.example .env.local     # completar con los valores de Supabase
npm run dev
```

---

## Decisiones de modelo que conviene conocer

**Los impuestos se calculan una sola vez, sobre los tres negocios juntos.** Quien paga
impuestos es la empresa, no cada unidad: si un negocio pierde plata, esa pérdida
compensa la ganancia del otro. Las filas de impuesto que aparecen en cada unidad son
informativas.

**Las exenciones de IIBB y municipal son MEMO.** No suman al flujo de caja: la exención
significa que no sale plata, no que entre.

**El IVA de las inversiones no es un costo.** Es crédito fiscal que se recupera.
Tratarlo como costo es el error más común en los modelos de inversión y hace que un
proyecto bueno parezca malo.

**La ocupación de muelle es una restricción dura.** Se puede vender todo lo que se
quiera, pero si el muelle está ocupado no entra un barco más. Por eso los costos del
muelle se reparten por ocupación y no por toneladas: una tonelada de acero ocupa mucho
más muelle que una de granos.

**El RIGI es un interruptor, no un supuesto.** Hay que correr el modelo prendido y
apagado, y presentar las dos TIR.

---

## Advertencia

Los valores que trae el escenario base son **preliminares**: sirven para que la
aplicación funcione y se pueda ver la mecánica, no para decidir.

Antes de presentar cualquier resultado hay que validar las tarifas y volúmenes con
Comercial, los costos con Operaciones, las inversiones con Ingeniería, el prorrateo con
Control de Gestión, y todo el bloque impositivo y del RIGI con el asesor impositivo.

Esta aplicación hace la cuenta. No es asesoramiento fiscal ni financiero.
