"use client";
import {
  Escenario, ResultadoConsolidado, Unidad, NOMBRE_UNIDAD, Flujo, TarifaEscalonada,
} from "@/lib/model/types";
import { mm, num, pct, usd } from "@/lib/formato";
import { Bloque, CampoNumero, CampoOpciones, CampoSwitch } from "./campos";

interface Props {
  un: Unidad; esc: Escenario; c: ResultadoConsolidado;
  actualizar: (fn: (b: Escenario) => void) => void; soloLectura?: boolean;
}

const CONCEPTOS: { campo: keyof TarifaEscalonada; texto: string }[] = [
  { campo: "embarque", texto: "Embarque" },
  { campo: "descarga", texto: "Descarga" },
  { campo: "calada", texto: "Calada" },
  { campo: "usoMuelle", texto: "Uso de muelle" },
  { campo: "habilitaciones", texto: "Habilitaciones" },
  { campo: "fumigacionTransile", texto: "Fumigación y transile" },
];
const TRAMOS: { campo: "base" | "tramo1" | "tramo2" | "tramo3" | "tramo4"; texto: string }[] = [
  { campo: "base", texto: "Base" },
  { campo: "tramo1", texto: "Tramo 1" },
  { campo: "tramo2", texto: "Tramo 2" },
  { campo: "tramo3", texto: "Tramo 3" },
  { campo: "tramo4", texto: "Tramo 4" },
];

export default function PanelUnidad({ un, esc, c, actualizar, soloLectura }: Props) {
  const u = esc.unidades[un];
  const r = c.porUnidad[un];
  const set = <K extends keyof typeof u>(campo: K) => (v: (typeof u)[K]) =>
    actualizar((d) => { (d.unidades[un][campo] as typeof v) = v; });
  const suma = (s: number[]) => s.reduce((a, v) => a + v, 0);

  function nuevoFlujo() {
    actualizar((d) => {
      d.unidades[un].flujos.push({
        id: `${un.toLowerCase()}-${Date.now()}`, gate: "inbound", carga: "nueva carga",
        modo: "buque", forma: "solido granel", almacenaje: "warehouse",
        anioInicio: u.anioInicioOp, volAnio1: 0, tasaCrecimiento: 0, tope: 0,
        tarifaMuelle: 0, tarifaEstibaje: 0, tarifaManipuleo: 0, tarifaAlmacenaje: 0, tarifaCalada: 0,
      });
    });
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-slate-900">{NOMBRE_UNIDAD[un]}</h2>
          <p className="text-xs text-slate-500">
            {suma(r.toneladasEfectivas) > 0
              ? `${usd(suma(r.toneladasEfectivas))} tn acumuladas · ${mm(suma(r.ingresosBrutos))} de ingresos · ` +
                `EBITDA ${mm(suma(r.ebitda))} · ocupación máx. ${pct(Math.max(...r.ocupacionMuelle))}`
              : "Sin volumen cargado."}
          </p>
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <Bloque titulo="Parámetros de la unidad">
          <CampoOpciones etiqueta="Método de tarifa" valor={u.metodoTarifa}
            opciones={[{ valor: 1 as const, texto: "1 · Grilla de flujos" },
                       { valor: 2 as const, texto: "2 · Escalonado por volumen" }]}
            onChange={(v) => set("metodoTarifa")(v)}
            ayuda="Método 1: se enumera cada corriente comercial con su volumen y sus cinco tarifas. Método 2: un volumen único para la unidad y tarifas que bajan por escalones. Cambiar esto cambia por completo los ingresos." />
          <CampoNumero etiqueta="Año de inicio de operación" valor={u.anioInicioOp} decimales={0}
            onChange={set("anioInicioOp")} unidad="año" soloLectura={soloLectura}
            ayuda="Antes de este año la unidad no factura, no tiene OPEX y no deprecia." />
          <CampoNumero etiqueta="Capacidad máxima" valor={u.capacidadMax} decimales={0}
            onChange={set("capacidadMax")} unidad="tn/año" soloLectura={soloLectura}
            ayuda="Tope físico de la instalación. 0 = sin tope. Si el factor de utilización baja de 1, la capacidad está quedando chica." />
          <CampoNumero etiqueta="Volumen mínimo Take-or-Pay" valor={u.takeOrPay} decimales={0}
            onChange={set("takeOrPay")} unidad="tn/año" soloLectura={soloLectura}
            ayuda="Piso garantizado por contrato: el cliente paga aunque no use el servicio. Solo aplica con método 2." />
          <CampoNumero etiqueta="CAPEX no depreciable (terreno)" valor={u.capexNoDepreciable}
            decimales={2} onChange={set("capexNoDepreciable")} unidad="USD MM" soloLectura={soloLectura}
            ayuda="La parte de la inversión que no se desgasta. Se descuenta de la base depreciable, así que sube el impuesto a pagar." />
          <CampoNumero etiqueta="OPEX fijo directo" valor={u.opexFijoMM} decimales={2}
            onChange={set("opexFijoMM")} unidad="USD MM/año" soloLectura={soloLectura}
            ayuda="Costo anual que no depende del volumen. Debería derivarse de dotación por mano y turno, mantenimiento como % del CAPEX de cada activo, y energía." />
          <CampoNumero etiqueta="OPEX inicial por única vez" valor={u.opexInicialMM} decimales={2}
            onChange={set("opexInicialMM")} unidad="USD MM" soloLectura={soloLectura}
            ayuda="Puesta en marcha. Impacta solo el primer año de operación." />
          <CampoNumero etiqueta="OPEX variable" valor={u.opexVariable} decimales={3}
            onChange={set("opexVariable")} unidad="USD/tn" soloLectura={soloLectura}
            ayuda="Costo por cada tonelada movida. Se puede pisar año por año en la tabla anual." />
          <CampoNumero etiqueta="Otros ingresos" valor={u.otrosIngresos} decimales={3}
            onChange={set("otrosIngresos")} unidad="USD/tn" soloLectura={soloLectura}
            ayuda="Conceptos que no entran en los cinco rubros. Suma directo a la facturación." />
        </Bloque>

        <Bloque titulo="Muelle — parámetros de ocupación">
          <p className="mb-3 text-xs leading-relaxed text-slate-600">
            Estadía por buque = parcela ÷ (rendimiento × (1 − tiempo no operativo)) + días fijos.
            Ocupación = recaladas × estadía ÷ días operativos ÷ sitios de atraque.
          </p>
          <CampoNumero etiqueta="Parcela media por buque" valor={u.parcelaMedia} decimales={0}
            onChange={set("parcelaMedia")} unidad="tn" soloLectura={soloLectura}
            ayuda="Cuántas toneladas trae o lleva cada barco. Parcela más chica = más barcos para el mismo volumen = más ocupación." />
          <CampoNumero etiqueta="Rendimiento operativo" valor={u.rendimientoDia} decimales={0}
            onChange={set("rendimientoDia")} unidad="tn/día" soloLectura={soloLectura}
            ayuda="Más rendimiento = menos días de barco amarrado = menos ocupación de muelle." />
          <CampoNumero etiqueta="Tiempo no operativo" valor={u.tiempoNoOperativo} decimales={1}
            onChange={set("tiempoNoOperativo")} unidad="%" soloLectura={soloLectura}
            ayuda="Horas perdidas por lluvia, cambio de bodega o espera. Referencia: 15-20%." />
          <CampoNumero etiqueta="Días fijos por recalada" valor={u.diasFijosRecalada} decimales={2}
            onChange={set("diasFijosRecalada")} unidad="días" soloLectura={soloLectura}
            ayuda="Amarre, zarpada y documentación: ocupan muelle sin mover carga." />
          <div className="mt-3 rounded bg-slate-50 p-3 text-xs text-slate-600">
            Con estos parámetros: <strong>{num(Math.max(...r.recaladas), 0)}</strong> recaladas en el
            año pico y una ocupación máxima de <strong>{pct(Math.max(...r.ocupacionMuelle))}</strong>.
          </div>
        </Bloque>

        <Bloque titulo="Canon">
          <CampoSwitch etiqueta="Canon fijo activo" valor={u.canonFijoActivo}
            onChange={set("canonFijoActivo")} />
          <CampoNumero etiqueta="Canon fijo" valor={u.canonFijoMM} decimales={2}
            onChange={set("canonFijoMM")} unidad="USD MM/año" soloLectura={soloLectura} />
          <CampoSwitch etiqueta="Canon variable activo" valor={u.canonVariableActivo}
            onChange={set("canonVariableActivo")} />
          <CampoNumero etiqueta="Canon variable" valor={u.canonVariable} decimales={3}
            onChange={set("canonVariable")} unidad="USD/tn" soloLectura={soloLectura} />
          <CampoSwitch etiqueta="Canon % sobre ingresos activo" valor={u.canonPctActivo}
            onChange={set("canonPctActivo")} />
          <CampoNumero etiqueta="Canon % sobre ingresos" valor={u.canonPct} decimales={2}
            onChange={set("canonPct")} unidad="%" soloLectura={soloLectura} />
        </Bloque>

        {u.metodoTarifa === 2 && (
          <Bloque titulo="Método 2 — proyección de volumen y tramos">
            <CampoNumero etiqueta="Volumen objetivo del año inicial" valor={u.volumenObjetivo}
              decimales={0} onChange={set("volumenObjetivo")} unidad="tn/año" soloLectura={soloLectura} />
            <CampoNumero etiqueta="Incremento anual" valor={u.incrementoAnual} decimales={0}
              onChange={set("incrementoAnual")} unidad="tn/año" soloLectura={soloLectura} />
            <CampoNumero etiqueta="Año desde el que aplica el incremento" valor={u.anioInicioIncremento}
              decimales={0} onChange={set("anioInicioIncremento")} unidad="año" soloLectura={soloLectura} />
            <CampoNumero etiqueta="Tope de volumen" valor={u.topeVolumen} decimales={0}
              onChange={set("topeVolumen")} unidad="tn/año" soloLectura={soloLectura} />
            <CampoNumero etiqueta="Volumen total a operar del dueño" valor={u.volumenDuenio}
              decimales={0} onChange={set("volumenDuenio")} unidad="tn/año" soloLectura={soloLectura}
              ayuda="En 0 todo se factura a tarifa base porque opera un tercero. Mayor a 0, el dueño opera hasta ese volumen con tarifas por tramo y el excedente vuelve a tarifa base." />
            <CampoNumero etiqueta="Límite del tramo 1" valor={u.limiteTramo1} decimales={0}
              onChange={set("limiteTramo1")} unidad="tn/año" soloLectura={soloLectura} />
            <CampoNumero etiqueta="Límite del tramo 2" valor={u.limiteTramo2} decimales={0}
              onChange={set("limiteTramo2")} unidad="tn/año" soloLectura={soloLectura} />
            <CampoNumero etiqueta="Límite del tramo 3" valor={u.limiteTramo3} decimales={0}
              onChange={set("limiteTramo3")} unidad="tn/año" soloLectura={soloLectura} />
            <CampoOpciones etiqueta="Método de calada" valor={u.metodoCalada}
              opciones={[{ valor: 1 as const, texto: "Tarifa escalonada" },
                         { valor: 2 as const, texto: "% sobre valor de la carga" }]}
              onChange={(v) => set("metodoCalada")(v)} />
            <CampoNumero etiqueta="Calada como % del valor" valor={u.caladaPct} decimales={3}
              onChange={set("caladaPct")} unidad="%" soloLectura={soloLectura} />
            <CampoNumero etiqueta="Valor de la carga embarcada" valor={u.valorCarga} decimales={2}
              onChange={set("valorCarga")} unidad="USD/tn" soloLectura={soloLectura} />
          </Bloque>
        )}
      </div>

      {u.metodoTarifa === 1 && (
        <Bloque titulo="Grilla de flujos comerciales">
          <p className="mb-3 text-xs leading-relaxed text-slate-600">
            Cada renglón es una corriente comercial: una carga que entra o sale, por buque o barcaza,
            que se guarda en algún lado. Las cinco columnas de USD/tn son lo que se le cobra al
            cliente por cada servicio sobre esa carga; su suma, por las toneladas, es la facturación.
          </p>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr>
                  <th className="th">Gate</th><th className="th">Carga</th><th className="th">Modo</th>
                  <th className="th">Forma</th><th className="th">Almacenaje</th>
                  <th className="th text-right">Año</th><th className="th text-right">Vol. año 1</th>
                  <th className="th text-right">Crec. %</th><th className="th text-right">Tope</th>
                  <th className="th text-right">Muelle</th><th className="th text-right">Estibaje</th>
                  <th className="th text-right">Manipuleo</th><th className="th text-right">Almacenaje</th>
                  <th className="th text-right">Calada</th><th className="th" />
                </tr>
              </thead>
              <tbody>
                {u.flujos.map((f, i) => {
                  const campo = <K extends keyof Flujo>(k: K, ancho: string, tipo: "number" | "text" = "number", paso = 1) => (
                    <td className="td">
                      <input type={tipo} step={paso} value={f[k] as string | number} readOnly={soloLectura}
                        onChange={(e) => actualizar((d) => {
                          const val = tipo === "number" ? (parseFloat(e.target.value) || 0) : e.target.value;
                          (d.unidades[un].flujos[i][k] as unknown) = val;
                        })}
                        className={`campo ${ancho} ${tipo === "text" ? "campo-texto" : ""}`} />
                    </td>
                  );
                  const selector = <K extends keyof Flujo>(k: K, opciones: string[], ancho: string) => (
                    <td className="td">
                      <select value={f[k] as string} disabled={soloLectura}
                        onChange={(e) => actualizar((d) => {
                          (d.unidades[un].flujos[i][k] as unknown) = e.target.value; })}
                        className={`campo campo-texto ${ancho}`}>
                        {opciones.map((o) => <option key={o} value={o}>{o}</option>)}
                      </select>
                    </td>
                  );
                  return (
                    <tr key={f.id} className="border-t border-slate-100">
                      {selector("gate", ["inbound", "outbound", "tranship"], "w-28")}
                      {campo("carga", "w-40", "text")}
                      {selector("modo", ["buque", "barcaza", "camion", "trasbordo"], "w-28")}
                      {selector("forma", ["solido granel", "break bulk", "liquido"], "w-32")}
                      {selector("almacenaje", ["warehouse", "plazoleta", "tanque", "elevador", "directo"], "w-28")}
                      {campo("anioInicio", "w-20")}
                      {campo("volAnio1", "w-28")}
                      {campo("tasaCrecimiento", "w-20", "number", 0.5)}
                      {campo("tope", "w-28")}
                      {campo("tarifaMuelle", "w-20", "number", 0.001)}
                      {campo("tarifaEstibaje", "w-20", "number", 0.01)}
                      {campo("tarifaManipuleo", "w-20", "number", 0.01)}
                      {campo("tarifaAlmacenaje", "w-20", "number", 0.01)}
                      {campo("tarifaCalada", "w-20", "number", 0.01)}
                      <td className="td">
                        {!soloLectura && (
                          <button onClick={() => actualizar((d) => { d.unidades[un].flujos.splice(i, 1); })}
                            className="text-xs text-red-600 hover:underline">quitar</button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          {!soloLectura && (
            <button onClick={nuevoFlujo} className="btn-secundario mt-3">+ Agregar flujo</button>
          )}
        </Bloque>
      )}

      {u.metodoTarifa === 2 && (
        <Bloque titulo="Tarifas escalonadas por volumen">
          <p className="mb-3 text-xs leading-relaxed text-slate-600">
            El volumen que opera el dueño se valoriza por tramos marginales; el excedente vuelve a
            tarifa base. Mapeo a los rubros del flujo: muelle = uso de muelle · estibaje = embarque +
            descarga · manipuleo = habilitaciones + fumigación y transile · calada = calada.
          </p>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr>
                  <th className="th">Concepto (USD/tn)</th>
                  {TRAMOS.map((t) => <th key={t.campo} className="th text-right">{t.texto}</th>)}
                </tr>
              </thead>
              <tbody>
                {CONCEPTOS.map((cn) => (
                  <tr key={cn.campo} className="border-t border-slate-100">
                    <td className="td font-medium text-slate-700">{cn.texto}</td>
                    {TRAMOS.map((t) => (
                      <td key={t.campo} className="td">
                        <input type="number" step={0.01} readOnly={soloLectura}
                          value={u.tarifas[t.campo][cn.campo]}
                          onChange={(e) => actualizar((d) => {
                            d.unidades[un].tarifas[t.campo][cn.campo] = parseFloat(e.target.value) || 0; })}
                          className="campo w-24" />
                      </td>
                    ))}
                  </tr>
                ))}
                <tr className="border-t-2 border-puerto-200 bg-puerto-50 font-semibold">
                  <td className="td">Total</td>
                  {TRAMOS.map((t) => {
                    const total = CONCEPTOS.reduce((a, cn) => a + u.tarifas[t.campo][cn.campo], 0);
                    return <td key={t.campo} className="td text-right">{num(total)}</td>;
                  })}
                </tr>
              </tbody>
            </table>
          </div>
        </Bloque>
      )}

      <Bloque titulo="Tabla anual — CAPEX, volumen manual y OPEX variable">
        <p className="mb-3 text-xs text-slate-600">
          CAPEX total de la unidad: <strong>{mm(-suma(r.capexTotal))}</strong> (incluye la parte
          asignada del CAPEX común).
        </p>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr>
                <th className="th">Año</th>
                <th className="th text-right">CAPEX directo (USD MM)</th>
                <th className="th text-right">Volumen manual (tn)</th>
                <th className="th text-right">OPEX var. override (USD/tn)</th>
                <th className="th text-right">Toneladas efectivas</th>
                <th className="th text-right">Ingresos</th>
                <th className="th text-right">EBITDA</th>
              </tr>
            </thead>
            <tbody>
              {c.anios.map((a, i) => (
                <tr key={a} className="border-t border-slate-100">
                  <td className="td font-medium">{a}</td>
                  {(["capexAnual", "volumenManual", "opexVarOverride"] as const).map((campo) => (
                    <td key={campo} className="td">
                      <input type="number" readOnly={soloLectura}
                        step={campo === "capexAnual" ? 0.1 : campo === "opexVarOverride" ? 0.01 : 1000}
                        value={u[campo][i] ?? 0}
                        onChange={(e) => actualizar((d) => {
                          d.unidades[un][campo][i] = parseFloat(e.target.value) || 0; })}
                        className="campo w-28" />
                    </td>
                  ))}
                  <td className="td celda-calc text-right">{usd(r.toneladasEfectivas[i])}</td>
                  <td className="td celda-calc text-right">{usd(r.ingresosBrutos[i])}</td>
                  <td className="td celda-calc text-right">{usd(r.ebitda[i])}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Bloque>
    </div>
  );
}
