"use client";
import { Escenario } from "@/lib/model/types";
import { Bloque, CampoNumero, CampoSwitch } from "./campos";
import { FICHAS } from "@/lib/fichas";

interface Props {
  esc: Escenario;
  actualizar: (fn: (b: Escenario) => void) => void;
  soloLectura?: boolean;
}

export default function PanelBase({ esc, actualizar, soloLectura }: Props) {
  const b = esc.base;
  const set = <K extends keyof typeof b>(campo: K) => (v: (typeof b)[K]) =>
    actualizar((d) => { (d.base[campo] as typeof v) = v; });

  return (
    <div className="grid gap-4 xl:grid-cols-2">
      <Bloque titulo="Horizonte y calendario">
        <CampoNumero etiqueta="Año base del modelo" valor={b.anioBase} decimales={0}
          onChange={set("anioBase")} unidad="año" soloLectura={soloLectura}
          ficha={FICHAS.anioBase} />
        <CampoNumero etiqueta="Horizonte de proyección" valor={b.horizonte} decimales={0}
          onChange={set("horizonte")} unidad="años" soloLectura={soloLectura}
          ficha={FICHAS.horizonte} />
        <CampoNumero etiqueta="Año de inicio de operación del proyecto" valor={b.anioInicioOpProyecto}
          decimales={0} onChange={set("anioInicioOpProyecto")} unidad="año" soloLectura={soloLectura}
          ficha={FICHAS.anioInicioOpProyecto} />
      </Bloque>

      <Bloque titulo="Operación de la terminal">
        <CampoNumero etiqueta="Días operativos del año" valor={b.diasOperativos} decimales={0}
          onChange={set("diasOperativos")} unidad="días" soloLectura={soloLectura}
          ficha={FICHAS.diasOperativos} />
        <CampoNumero etiqueta="Sitios de atraque disponibles" valor={b.sitiosAtraque} decimales={0}
          min={1} onChange={set("sitiosAtraque")} unidad="sitios" soloLectura={soloLectura}
          ficha={FICHAS.sitiosAtraque} />
        <CampoNumero etiqueta="Umbral de alerta de ocupación" valor={b.umbralOcupacion} decimales={0}
          onChange={set("umbralOcupacion")} unidad="%" soloLectura={soloLectura}
          ficha={FICHAS.umbralOcupacion} />
      </Bloque>

      <Bloque titulo="Impuestos del régimen general">
        <CampoNumero etiqueta="Impuesto a las Ganancias, régimen general" valor={b.tasaImpuestoGeneral}
          decimales={1} onChange={set("tasaImpuestoGeneral")} unidad="%" soloLectura={soloLectura}
          ficha={FICHAS.tasaImpuestoGeneral} />
        <CampoNumero etiqueta="Vida útil de depreciación de la inversión"
          valor={b.vidaUtilDepreciacion} decimales={0}
          onChange={set("vidaUtilDepreciacion")} unidad="años" soloLectura={soloLectura}
          ficha={FICHAS.vidaUtilDepreciacion} />
        <CampoSwitch etiqueta="Deducir tasas e impuesto al cheque del flujo de caja"
          valor={b.tasasEnFCFF}
          onChange={set("tasasEnFCFF")} textoSi="Sí, se erogan" textoNo="No, solo informativos"
          ficha={FICHAS.tasasEnFCFF} />
      </Bloque>

      <Bloque titulo="Financiamiento con deuda">
        <CampoNumero etiqueta="Monto de deuda" valor={b.montoDeudaMM} decimales={2}
          onChange={set("montoDeudaMM")} unidad="USD MM" soloLectura={soloLectura}
          ficha={FICHAS.montoDeudaMM} />
        <CampoNumero etiqueta="Tasa de interés" valor={b.tasaDeuda} decimales={2}
          onChange={set("tasaDeuda")} unidad="% anual" soloLectura={soloLectura}
          ficha={FICHAS.tasaDeuda} />
        <CampoNumero etiqueta="Plazo de amortización" valor={b.plazoDeuda} decimales={0}
          onChange={set("plazoDeuda")} unidad="años" soloLectura={soloLectura}
          ficha={FICHAS.plazoDeuda} />
      </Bloque>

      <Bloque titulo="Régimen de grandes inversiones (RIGI — Ley 27.742)">
        <CampoSwitch etiqueta="Aplicar el régimen RIGI" valor={b.rigiActivo} onChange={set("rigiActivo")}
          textoSi="Activo" textoNo="Régimen general"
          ficha={FICHAS.rigiActivo} />
        <CampoNumero etiqueta="Año de inicio de los beneficios" valor={b.rigiAnioInicio} decimales={0}
          onChange={set("rigiAnioInicio")} unidad="año" soloLectura={soloLectura}
          ficha={FICHAS.rigiAnioInicio} />
        <CampoNumero etiqueta="Impuesto a las Ganancias dentro del RIGI" valor={b.rigiTasaImpuesto}
          decimales={1} onChange={set("rigiTasaImpuesto")} unidad="%" soloLectura={soloLectura}
          ficha={FICHAS.rigiTasaImpuesto} />
        <CampoSwitch etiqueta="Amortización acelerada de la inversión"
          valor={b.rigiAmortAcelerada} onChange={set("rigiAmortAcelerada")}
          ficha={FICHAS.rigiAmortAcelerada} />
        <CampoNumero etiqueta="% de la vida útil aplicable con aceleración" valor={b.rigiPctVidaUtil}
          decimales={0} onChange={set("rigiPctVidaUtil")} unidad="%" soloLectura={soloLectura}
          ficha={FICHAS.rigiPctVidaUtil} />
        <CampoNumero etiqueta="Años de exención de Ingresos Brutos (Santa Fe)" valor={b.rigiIIBBAnios}
          decimales={0} onChange={set("rigiIIBBAnios")} unidad="años" soloLectura={soloLectura}
          ficha={FICHAS.rigiIIBBAnios} />
        <CampoNumero etiqueta="Alícuota de Ingresos Brutos sin el régimen" valor={b.rigiIIBBPct}
          decimales={2} onChange={set("rigiIIBBPct")} unidad="%" soloLectura={soloLectura}
          ficha={FICHAS.rigiIIBBPct} />
        <CampoNumero etiqueta="Años de exención de la tasa municipal (Timbúes)" valor={b.rigiMunicipalAnios}
          decimales={0} onChange={set("rigiMunicipalAnios")} unidad="años" soloLectura={soloLectura}
          ficha={FICHAS.rigiMunicipalAnios} />
        <CampoNumero etiqueta="Tasa municipal una vez terminada la exención"
          valor={b.rigiMunicipalPorMil}
          decimales={2} onChange={set("rigiMunicipalPorMil")} unidad="por mil" soloLectura={soloLectura}
          ficha={FICHAS.rigiMunicipalPorMil} />
        <CampoSwitch etiqueta="Computar el impuesto al cheque a cuenta de Ganancias"
          valor={b.rigiDebCredActivo} onChange={set("rigiDebCredActivo")}
          ficha={FICHAS.rigiDebCredActivo} />
        <CampoNumero etiqueta="% del impuesto al cheque computable a cuenta" valor={b.rigiDebCredPct}
          decimales={2} onChange={set("rigiDebCredPct")} unidad="%" soloLectura={soloLectura}
          ficha={FICHAS.rigiDebCredPct} />
        <CampoSwitch etiqueta="Informar el IVA de las inversiones (CERTIVA)"
          valor={b.rigiCertivaActivo}
          onChange={set("rigiCertivaActivo")} textoSi="Informar" textoNo="No informar"
          ficha={FICHAS.rigiCertivaActivo} />
      </Bloque>

      <Bloque titulo="Otros impuestos y tasas">
        <CampoNumero etiqueta="Impuesto al cheque (IDyCB)" valor={b.idycbAlicuota}
          decimales={2} onChange={set("idycbAlicuota")} unidad="%" soloLectura={soloLectura}
          ficha={FICHAS.idycbAlicuota} />
        <CampoNumero etiqueta="Años para usar el crédito del impuesto al cheque"
          valor={b.idycbPrescripcion}
          decimales={0} onChange={set("idycbPrescripcion")} unidad="años" soloLectura={soloLectura}
          ficha={FICHAS.idycbPrescripcion} />
        <CampoNumero etiqueta="Tipo de cambio para la tasa municipal" valor={b.dreiTipoCambio}
          decimales={2} onChange={set("dreiTipoCambio")} unidad="ARS/USD" soloLectura={soloLectura}
          ficha={FICHAS.dreiTipoCambio} />
        <CampoNumero etiqueta="Tasa municipal mínima por mes" valor={b.dreiMinimoMensualARS}
          decimales={0} onChange={set("dreiMinimoMensualARS")} unidad="ARS" soloLectura={soloLectura}
          ficha={FICHAS.dreiMinimoMensualARS} />
        <CampoNumero etiqueta="Tasa de edificación, primeros 5 años" valor={b.tasaEdifPrimeros5}
          decimales={2} onChange={set("tasaEdifPrimeros5")} unidad="por mil" soloLectura={soloLectura}
          ficha={FICHAS.tasaEdifPrimeros5} />
        <CampoNumero etiqueta="Tasa de edificación, a partir del año 6" valor={b.tasaEdifPost5}
          decimales={2} onChange={set("tasaEdifPost5")} unidad="por mil" soloLectura={soloLectura}
          ficha={FICHAS.tasaEdifPost5} />
      </Bloque>

      <Bloque titulo="Armado de la operación">
        <CampoNumero etiqueta="Comisión de estructuración" valor={b.structuringFeeUSD} decimales={0}
          onChange={set("structuringFeeUSD")} unidad="USD" soloLectura={soloLectura}
          ficha={FICHAS.structuringFeeUSD} />
        <CampoNumero etiqueta="Año en que se cobra la comisión" valor={b.anioCobroFee} decimales={0}
          onChange={set("anioCobroFee")} unidad="año" soloLectura={soloLectura}
          ficha={FICHAS.anioCobroFee} />
        <CampoNumero etiqueta="Costo de armar la presentación al RIGI"
          valor={b.costoEstructuracionARS}
          decimales={0} onChange={set("costoEstructuracionARS")} unidad="ARS" soloLectura={soloLectura}
          ficha={FICHAS.costoEstructuracionARS} />
        <CampoNumero etiqueta="Tipo de cambio promedio" valor={b.tipoCambioPromedio} decimales={2}
          onChange={set("tipoCambioPromedio")} unidad="ARS/USD" soloLectura={soloLectura}
          ficha={FICHAS.tipoCambioPromedio} />
      </Bloque>

      <Bloque titulo="Curva de maduración por ejercicio">
        <p className="mb-3 text-xs leading-relaxed text-slate-500">
          Porcentaje de la capacidad que se alcanza en cada ejercicio mientras se ajustan los
          procesos y se capta la cartera de clientes. 1,00 equivale a plena capacidad. Afecta las
          toneladas de las tres unidades.
        </p>
        <div className="grid max-h-80 grid-cols-2 gap-x-4 overflow-auto sm:grid-cols-3">
          {b.rampUp.map((v, i) => (
            <label key={i} className="flex items-center gap-2 py-1 text-sm">
              <span className="w-12 text-slate-500 tabular-nums">{b.anioBase + i}</span>
              <input type="number" step={0.05} min={0} max={1} value={v} readOnly={soloLectura}
                onChange={(e) =>
                  actualizar((d) => { d.base.rampUp[i] = parseFloat(e.target.value) || 0; })}
                className="campo w-20" />
            </label>
          ))}
        </div>
      </Bloque>
    </div>
  );
}
