"use client";
import { Escenario } from "@/lib/model/types";
import { Bloque, CampoNumero, CampoSwitch } from "./campos";

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
          ayuda="Primer año del flujo. Cambiarlo corre todo el modelo en el tiempo." />
        <CampoNumero etiqueta="Horizonte" valor={b.horizonte} decimales={0}
          onChange={set("horizonte")} unidad="años" soloLectura={soloLectura}
          ayuda="Cuántos años se proyectan después del año base." />
        <CampoNumero etiqueta="Año de inicio de operación del proyecto" valor={b.anioInicioOpProyecto}
          decimales={0} onChange={set("anioInicioOpProyecto")} unidad="año" soloLectura={soloLectura}
          ayuda="Referencia general. Cada unidad tiene además su propio año de arranque." />
      </Bloque>

      <Bloque titulo="Operación global">
        <CampoNumero etiqueta="Días operativos del año" valor={b.diasOperativos} decimales={0}
          onChange={set("diasOperativos")} unidad="días" soloLectura={soloLectura}
          ayuda="365 menos domingos, feriados y días de lluvia. Es el denominador de la ocupación de muelle." />
        <CampoNumero etiqueta="Sitios de atraque disponibles" valor={b.sitiosAtraque} decimales={0}
          min={1} onChange={set("sitiosAtraque")} unidad="sitios" soloLectura={soloLectura}
          ayuda="Cuántos buques pueden operar a la vez. Divide la ocupación: con 2 sitios el mismo tráfico ocupa la mitad. Es la variable que decide si hay que construir más muelle." />
        <CampoNumero etiqueta="Umbral de alerta de ocupación" valor={b.umbralOcupacion} decimales={0}
          onChange={set("umbralOcupacion")} unidad="%" soloLectura={soloLectura}
          ayuda="A partir de qué ocupación el modelo avisa. No cambia ningún resultado económico: es una alarma." />
      </Bloque>

      <Bloque titulo="Fiscal general">
        <CampoNumero etiqueta="Tasa de Ganancias del régimen general" valor={b.tasaImpuestoGeneral}
          decimales={1} onChange={set("tasaImpuestoGeneral")} unidad="%" soloLectura={soloLectura}
          ayuda="Se aplica cuando el RIGI está apagado. Sirve para medir cuánto vale el beneficio." />
        <CampoNumero etiqueta="Vida útil de depreciación" valor={b.vidaUtilDepreciacion} decimales={0}
          onChange={set("vidaUtilDepreciacion")} unidad="años" soloLectura={soloLectura}
          ayuda="En cuántos años se desgasta contablemente la inversión. Más años = menos depreciación por año = más impuesto al principio." />
        <CampoSwitch etiqueta="Incluir tasas e IDyCB en el flujo de caja" valor={b.tasasEnFCFF}
          onChange={set("tasasEnFCFF")} textoSi="Sí, salen de caja" textoNo="No, solo informativos"
          ayuda="El DREI, la tasa de edificación y el impuesto al cheque son salidas de caja reales. Apagarlo replica el comportamiento del modelo viejo y sube la TIR." />
      </Bloque>

      <Bloque titulo="Financiamiento">
        <CampoNumero etiqueta="Monto de deuda" valor={b.montoDeudaMM} decimales={2}
          onChange={set("montoDeudaMM")} unidad="USD MM" soloLectura={soloLectura}
          ayuda="En 0 el proyecto se evalúa sin deuda y no se calcula la TIR del accionista." />
        <CampoNumero etiqueta="Tasa de deuda" valor={b.tasaDeuda} decimales={2}
          onChange={set("tasaDeuda")} unidad="% anual" soloLectura={soloLectura} />
        <CampoNumero etiqueta="Plazo de deuda" valor={b.plazoDeuda} decimales={0}
          onChange={set("plazoDeuda")} unidad="años" soloLectura={soloLectura}
          ayuda="Plazo más corto = cuotas más altas = DSCR más bajo." />
      </Bloque>

      <Bloque titulo="RIGI — Ley 27.742">
        <CampoSwitch etiqueta="RIGI activo" valor={b.rigiActivo} onChange={set("rigiActivo")}
          textoSi="Activo" textoNo="Régimen general"
          ayuda="Interruptor maestro. Corré el modelo prendido y apagado, y presentá las dos TIR: la diferencia es cuánto vale el régimen para este proyecto." />
        <CampoNumero etiqueta="Año de inicio de beneficios" valor={b.rigiAnioInicio} decimales={0}
          onChange={set("rigiAnioInicio")} unidad="año" soloLectura={soloLectura} />
        <CampoNumero etiqueta="Tasa de Ganancias RIGI" valor={b.rigiTasaImpuesto} decimales={1}
          onChange={set("rigiTasaImpuesto")} unidad="%" soloLectura={soloLectura}
          ayuda="Alícuota reducida del régimen. La diferencia contra la general es el principal beneficio económico." />
        <CampoSwitch etiqueta="Amortización acelerada" valor={b.rigiAmortAcelerada}
          onChange={set("rigiAmortAcelerada")}
          ayuda="Art. 183 b). No cambia el impuesto total de toda la vida del proyecto, pero lo adelanta, y eso mejora la TIR." />
        <CampoNumero etiqueta="% de vida útil acelerada" valor={b.rigiPctVidaUtil} decimales={0}
          onChange={set("rigiPctVidaUtil")} unidad="%" soloLectura={soloLectura}
          ayuda="60% significa que una inversión de 30 años se deprecia en 18." />
        <CampoNumero etiqueta="Años de exención de IIBB (Santa Fe)" valor={b.rigiIIBBAnios} decimales={0}
          onChange={set("rigiIIBBAnios")} unidad="años" soloLectura={soloLectura} />
        <CampoNumero etiqueta="Alícuota de IIBB sin RIGI" valor={b.rigiIIBBPct} decimales={2}
          onChange={set("rigiIIBBPct")} unidad="%" soloLectura={soloLectura}
          ayuda="Base para cuantificar el ahorro. La exención no suma al flujo: es plata que no se paga, no que entre." />
        <CampoNumero etiqueta="Años de exención municipal (Timbúes)" valor={b.rigiMunicipalAnios}
          decimales={0} onChange={set("rigiMunicipalAnios")} unidad="años" soloLectura={soloLectura} />
        <CampoNumero etiqueta="Alícuota municipal post-exención" valor={b.rigiMunicipalPorMil}
          decimales={2} onChange={set("rigiMunicipalPorMil")} unidad="por mil" soloLectura={soloLectura} />
        <CampoSwitch etiqueta="Débito/Crédito bancario a cuenta de Ganancias"
          valor={b.rigiDebCredActivo} onChange={set("rigiDebCredActivo")} />
        <CampoNumero etiqueta="Alícuota Débito/Crédito" valor={b.rigiDebCredPct} decimales={2}
          onChange={set("rigiDebCredPct")} unidad="%" soloLectura={soloLectura} />
        <CampoSwitch etiqueta="IVA de inversiones (CERTIVA)" valor={b.rigiCertivaActivo}
          onChange={set("rigiCertivaActivo")} textoSi="Informar" textoNo="No informar"
          ayuda="Es crédito fiscal, no costo: NO afecta el flujo de caja. Se muestra solo como referencia del capital de trabajo a financiar." />
      </Bloque>

      <Bloque titulo="Otros tributos y tasas">
        <CampoNumero etiqueta="Alícuota IDyCB (impuesto al cheque)" valor={b.idycbAlicuota}
          decimales={2} onChange={set("idycbAlicuota")} unidad="%" soloLectura={soloLectura}
          ayuda="0,6% al debitar más 0,6% al acreditar. Ley 25.413." />
        <CampoNumero etiqueta="Años de prescripción del IDyCB" valor={b.idycbPrescripcion}
          decimales={0} onChange={set("idycbPrescripcion")} unidad="años" soloLectura={soloLectura} />
        <CampoNumero etiqueta="Tipo de cambio oficial para el DREI" valor={b.dreiTipoCambio}
          decimales={2} onChange={set("dreiTipoCambio")} unidad="ARS/USD" soloLectura={soloLectura}
          ayuda="COMPLETAR. Sin este dato el DREI se calcula solo por alícuota y queda subestimado." />
        <CampoNumero etiqueta="DREI mínimo mensual" valor={b.dreiMinimoMensualARS} decimales={0}
          onChange={set("dreiMinimoMensualARS")} unidad="ARS" soloLectura={soloLectura}
          ayuda="COMPLETAR. Se anualiza y se dolariza. Se paga el mayor entre este mínimo y la alícuota sobre facturación." />
        <CampoNumero etiqueta="Tasa de edificación, primeros 5 años" valor={b.tasaEdifPrimeros5}
          decimales={2} onChange={set("tasaEdifPrimeros5")} unidad="por mil" soloLectura={soloLectura} />
        <CampoNumero etiqueta="Tasa de edificación, a partir del año 6" valor={b.tasaEdifPost5}
          decimales={2} onChange={set("tasaEdifPost5")} unidad="por mil" soloLectura={soloLectura} />
      </Bloque>

      <Bloque titulo="Estructura de la transacción">
        <CampoNumero etiqueta="Structuring Fee" valor={b.structuringFeeUSD} decimales={0}
          onChange={set("structuringFeeUSD")} unidad="USD" soloLectura={soloLectura}
          ayuda="Comisión por armar la operación. No afecta la TIR del proyecto: solo el reparto entre socios." />
        <CampoNumero etiqueta="Año de cobro del fee" valor={b.anioCobroFee} decimales={0}
          onChange={set("anioCobroFee")} unidad="año" soloLectura={soloLectura} />
        <CampoNumero etiqueta="Costo de estructuración RIGI" valor={b.costoEstructuracionARS}
          decimales={0} onChange={set("costoEstructuracionARS")} unidad="ARS" soloLectura={soloLectura} />
        <CampoNumero etiqueta="Tipo de cambio promedio" valor={b.tipoCambioPromedio} decimales={2}
          onChange={set("tipoCambioPromedio")} unidad="ARS/USD" soloLectura={soloLectura} />
      </Bloque>

      <Bloque titulo="Rampa de puesta en marcha">
        <p className="mb-3 text-xs text-slate-500">
          Qué porcentaje de la capacidad se logra usar cada año mientras se afinan los procesos y se
          consiguen clientes. 1,00 = sin restricción. Multiplica las toneladas de las tres unidades.
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
