"use client";
import {
  Escenario, ResultadoConsolidado, Unidad, NOMBRE_UNIDAD, Flujo, TarifaEscalonada,
} from "@/lib/model/types";
import { mm, num, pct, usd } from "@/lib/formato";
import { Bloque, CampoNumero, CampoOpciones, CampoSwitch } from "./campos";
import { FICHAS } from "@/lib/fichas";

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
/**
 * Los valores guardados quedan en inglés porque así están en los escenarios ya
 * grabados; lo que cambia es cómo se muestran en pantalla.
 */
const ETIQUETAS: Record<string, string> = {
  inbound: "Entra al puerto",
  outbound: "Sale del puerto",
  tranship: "Trasbordo",
  buque: "Buque",
  barcaza: "Barcaza",
  camion: "Camión",
  trasbordo: "Trasbordo",
  "solido granel": "Sólido a granel",
  "break bulk": "Bultos sueltos",
  liquido: "Líquido",
  warehouse: "Galpón",
  plazoleta: "Plazoleta",
  tanque: "Tanque",
  elevador: "Elevador",
  directo: "Directo a buque",
};

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
              ? `${usd(suma(r.toneladasEfectivas))} tn acumuladas · ${mm(suma(r.ingresosBrutos))} facturados · ` +
                `ganancia operativa ${mm(suma(r.ebitda))} · ocupación máx. ${pct(Math.max(...r.ocupacionMuelle))}`
              : "Sin volumen cargado."}
          </p>
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <Bloque titulo="Datos del negocio">
          <CampoOpciones etiqueta="Cómo se calcula lo que factura" valor={u.metodoTarifa}
            opciones={[{ valor: 1 as const, texto: "Por flujos comerciales" },
                       { valor: 2 as const, texto: "Por tarifa escalonada" }]}
            onChange={(v) => set("metodoTarifa")(v)}
            ficha={FICHAS.metodoTarifa} />
          <CampoNumero etiqueta="Año de inicio de operación" valor={u.anioInicioOp} decimales={0}
            onChange={set("anioInicioOp")} unidad="año" soloLectura={soloLectura}
            ficha={FICHAS.anioInicioOp} />
          <CampoNumero etiqueta="Capacidad máxima de la instalación" valor={u.capacidadMax} decimales={0}
            onChange={set("capacidadMax")} unidad="tn/año" soloLectura={soloLectura}
            ficha={FICHAS.capacidadMax} />
          <CampoNumero etiqueta="Volumen mínimo garantizado por contrato (take-or-pay)"
            valor={u.takeOrPay} decimales={0}
            onChange={set("takeOrPay")} unidad="tn/año" soloLectura={soloLectura}
            ficha={FICHAS.takeOrPay} />
          <CampoNumero etiqueta="Inversión que no se deprecia, como el terreno"
            valor={u.capexNoDepreciable}
            decimales={2} onChange={set("capexNoDepreciable")} unidad="USD MM" soloLectura={soloLectura}
            ficha={FICHAS.capexNoDepreciable} />
          <CampoNumero etiqueta="Costo fijo anual (OPEX fijo)" valor={u.opexFijoMM} decimales={2}
            onChange={set("opexFijoMM")} unidad="USD MM/año" soloLectura={soloLectura}
            ficha={FICHAS.opexFijoMM} />
          <CampoNumero etiqueta="Gasto de arranque, por única vez" valor={u.opexInicialMM} decimales={2}
            onChange={set("opexInicialMM")} unidad="USD MM" soloLectura={soloLectura}
            ficha={FICHAS.opexInicialMM} />
          <CampoNumero etiqueta="Costo por tonelada movida (OPEX variable)" valor={u.opexVariable}
            decimales={3}
            onChange={set("opexVariable")} unidad="USD/tn" soloLectura={soloLectura}
            ficha={FICHAS.opexVariable} />
          <CampoNumero etiqueta="Otros ingresos por tonelada" valor={u.otrosIngresos} decimales={3}
            onChange={set("otrosIngresos")} unidad="USD/tn" soloLectura={soloLectura}
            ficha={FICHAS.otrosIngresos} />
        </Bloque>

        <Bloque titulo="Ocupación del muelle">
          <p className="mb-3 text-xs leading-relaxed text-slate-600">
            Días que ocupa cada buque = toneladas del buque ÷ (toneladas por día × (1 − tiempo
            perdido)) + días fijos. Ocupación = buques del año × días por buque ÷ días operativos ÷
            sitios de atraque.
          </p>
          <CampoNumero etiqueta="Toneladas por buque (parcela media)" valor={u.parcelaMedia}
            decimales={0}
            onChange={set("parcelaMedia")} unidad="tn" soloLectura={soloLectura}
            ficha={FICHAS.parcelaMedia} />
          <CampoNumero etiqueta="Toneladas que se cargan por día" valor={u.rendimientoDia} decimales={0}
            onChange={set("rendimientoDia")} unidad="tn/día" soloLectura={soloLectura}
            ficha={FICHAS.rendimientoDia} />
          <CampoNumero etiqueta="Tiempo perdido sin operar" valor={u.tiempoNoOperativo} decimales={1}
            onChange={set("tiempoNoOperativo")} unidad="%" soloLectura={soloLectura}
            ficha={FICHAS.tiempoNoOperativo} />
          <CampoNumero etiqueta="Días de muelle por buque que no dependen de la carga"
            valor={u.diasFijosRecalada} decimales={2}
            onChange={set("diasFijosRecalada")} unidad="días" soloLectura={soloLectura}
            ficha={FICHAS.diasFijosRecalada} />
          <div className="mt-3 rounded bg-slate-50 p-3 text-xs text-slate-600">
            Con estos datos: <strong>{num(Math.max(...r.recaladas), 0)}</strong> buques en el año
            pico y una ocupación máxima de <strong>{pct(Math.max(...r.ocupacionMuelle))}</strong>.
          </div>
        </Bloque>

        <Bloque titulo="Canon a pagar por usar las instalaciones">
          <CampoSwitch etiqueta="Se paga un canon fijo" valor={u.canonFijoActivo}
            onChange={set("canonFijoActivo")} ficha={FICHAS.canonFijoActivo} />
          <CampoNumero etiqueta="Canon fijo por año" valor={u.canonFijoMM} decimales={2}
            onChange={set("canonFijoMM")} unidad="USD MM/año" soloLectura={soloLectura}
            ficha={FICHAS.canonFijoMM} />
          <CampoSwitch etiqueta="Se paga un canon por tonelada" valor={u.canonVariableActivo}
            onChange={set("canonVariableActivo")} ficha={FICHAS.canonVariableActivo} />
          <CampoNumero etiqueta="Canon por tonelada" valor={u.canonVariable} decimales={3}
            onChange={set("canonVariable")} unidad="USD/tn" soloLectura={soloLectura}
            ficha={FICHAS.canonVariable} />
          <CampoSwitch etiqueta="Se paga un canon sobre la facturación" valor={u.canonPctActivo}
            onChange={set("canonPctActivo")} ficha={FICHAS.canonPctActivo} />
          <CampoNumero etiqueta="Canon como % de la facturación" valor={u.canonPct} decimales={2}
            onChange={set("canonPct")} unidad="%" soloLectura={soloLectura}
            ficha={FICHAS.canonPct} />
        </Bloque>

        {u.metodoTarifa === 2 && (
          <Bloque titulo="Proyección de volumen y tramos de tarifa">
            <CampoNumero etiqueta="Volumen del que se parte" valor={u.volumenObjetivo}
              decimales={0} onChange={set("volumenObjetivo")} unidad="tn/año" soloLectura={soloLectura}
              ficha={FICHAS.volumenObjetivo} />
            <CampoNumero etiqueta="Toneladas que se suman por año" valor={u.incrementoAnual} decimales={0}
              onChange={set("incrementoAnual")} unidad="tn/año" soloLectura={soloLectura}
              ficha={FICHAS.incrementoAnual} />
            <CampoNumero etiqueta="Año desde el que empieza a crecer" valor={u.anioInicioIncremento}
              decimales={0} onChange={set("anioInicioIncremento")} unidad="año" soloLectura={soloLectura}
              ficha={FICHAS.anioInicioIncremento} />
            <CampoNumero etiqueta="Techo de la proyección" valor={u.topeVolumen} decimales={0}
              onChange={set("topeVolumen")} unidad="tn/año" soloLectura={soloLectura}
              ficha={FICHAS.topeVolumen} />
            <CampoNumero etiqueta="Volumen que opera el dueño" valor={u.volumenDuenio}
              decimales={0} onChange={set("volumenDuenio")} unidad="tn/año" soloLectura={soloLectura}
              ficha={FICHAS.volumenDuenio} />
            <CampoNumero etiqueta="Límite del tramo 1" valor={u.limiteTramo1} decimales={0}
              onChange={set("limiteTramo1")} unidad="tn/año" soloLectura={soloLectura}
              ficha={FICHAS.limiteTramo} />
            <CampoNumero etiqueta="Límite del tramo 2" valor={u.limiteTramo2} decimales={0}
              onChange={set("limiteTramo2")} unidad="tn/año" soloLectura={soloLectura}
              ficha={FICHAS.limiteTramo} />
            <CampoNumero etiqueta="Límite del tramo 3" valor={u.limiteTramo3} decimales={0}
              onChange={set("limiteTramo3")} unidad="tn/año" soloLectura={soloLectura}
              ficha={FICHAS.limiteTramo} />
            <CampoOpciones etiqueta="Cómo se cobra la calada" valor={u.metodoCalada}
              opciones={[{ valor: 1 as const, texto: "Por tonelada" },
                         { valor: 2 as const, texto: "% del valor de la carga" }]}
              onChange={(v) => set("metodoCalada")(v)} ficha={FICHAS.metodoCalada} />
            <CampoNumero etiqueta="Calada como % del valor" valor={u.caladaPct} decimales={3}
              onChange={set("caladaPct")} unidad="%" soloLectura={soloLectura}
              ficha={FICHAS.caladaPct} />
            <CampoNumero etiqueta="Valor de la carga embarcada" valor={u.valorCarga} decimales={2}
              onChange={set("valorCarga")} unidad="USD/tn" soloLectura={soloLectura}
              ficha={FICHAS.valorCarga} />
          </Bloque>
        )}
      </div>

      {u.metodoTarifa === 1 && (
        <Bloque titulo="Flujos comerciales">
          <p className="mb-3 text-xs leading-relaxed text-slate-600">
            Cada renglón es una corriente comercial: una carga que entra o sale, por buque o barcaza,
            y que se guarda en algún lado. Las cinco últimas columnas son lo que se le cobra al
            cliente por cada servicio sobre esa carga, en dólares por tonelada. La suma de las cinco,
            multiplicada por las toneladas, es la facturación.
          </p>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr>
                  <th className="th">Sentido</th><th className="th">Carga</th>
                  <th className="th">Cómo llega</th>
                  <th className="th">Forma</th><th className="th">Dónde se guarda</th>
                  <th className="th text-right">Año de inicio</th>
                  <th className="th text-right">Toneladas año 1</th>
                  <th className="th text-right">Crecimiento %</th>
                  <th className="th text-right">Techo</th>
                  <th className="th text-right">Muelle</th><th className="th text-right">Carga y descarga</th>
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
                        {opciones.map((o) => (
                          <option key={o} value={o}>{ETIQUETAS[o] ?? o}</option>
                        ))}
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
            <button onClick={nuevoFlujo} className="btn-secundario mt-3">+ Agregar flujo comercial</button>
          )}
        </Bloque>
      )}

      {u.metodoTarifa === 2 && (
        <Bloque titulo="Tarifas por tramo de volumen">
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

      <Bloque titulo="Año por año: inversión, volumen y costo variable">
        <p className="mb-3 text-xs text-slate-600">
          Inversión total del negocio: <strong>{mm(-suma(r.capexTotal))}</strong>, incluida la parte
          que le toca de las obras compartidas.
        </p>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr>
                <th className="th">Año</th>
                <th className="th text-right">Inversión propia (USD MM)</th>
                <th className="th text-right">Volumen manual (tn)</th>
                <th className="th text-right">Costo por tonelada de ese año (USD/tn)</th>
                <th className="th text-right">Toneladas efectivas</th>
                <th className="th text-right">Facturación</th>
                <th className="th text-right">Ganancia operativa</th>
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
