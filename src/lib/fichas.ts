import type { Ficha } from "@/components/editor/campos";

/**
 * Las fichas explicativas de cada campo, todas juntas.
 *
 * Están reunidas acá y no distribuidas por los paneles para poder leerlas de
 * corrido, corregirlas en un solo lugar y reutilizarlas en el manual. El texto
 * está redactado para un lector no especializado en finanzas.
 */
export const FICHAS: Record<string, Ficha> = {
  // ------------------------------------------------ horizonte y calendario --
  anioBase: {
    que: "El primer ejercicio del modelo. Todos los demás se cuentan a partir de este.",
    paraQue: "Fija el punto de partida del flujo de fondos y de la primera columna de todas las tablas.",
    caracteristica: "Un año, cuatro dígitos. Habitualmente es el año de inicio de obra, no el de la primera facturación.",
    impacta: "Desplaza el modelo completo en el tiempo: cambian los años de todas las columnas y la curva de maduración.",
  },
  horizonte: {
    que: "Cuántos años se proyectan después del año base.",
    paraQue: "Define hasta dónde llega el análisis. Con 30, el modelo va del año base hasta 30 años más tarde.",
    caracteristica: "Un número entero de años. En concesiones portuarias se usa el plazo de la concesión, típicamente 25 a 30 años.",
    impacta: "Un horizonte más extenso incorpora ejercicios de flujo positivo y mejora el rendimiento. Extenderlo sin respaldo contractual sobrestima el resultado.",
  },
  anioInicioOpProyecto: {
    que: "El ejercicio en que la terminal inicia su operación como proyecto.",
    paraQue: "Es una referencia general para la lectura del modelo.",
    caracteristica: "Un año. Cada unidad tiene además su propio año de inicio, que es el que rige en el cálculo.",
    impacta: "No modifica resultados por sí solo: rigen los años de inicio de cada unidad de negocio.",
  },

  // ---------------------------------------------------------- operación ----
  diasOperativos: {
    que: "Cuántos días al año se puede operar realmente.",
    paraQue: "Es el denominador de la ocupación del muelle: sobre cuántos días se reparte el trabajo del año.",
    caracteristica: "365 menos domingos, feriados, bajantes y días improductivos por lluvia o viento. En el Paraná suele situarse entre 300 y 330.",
    impacta: "Menos días operativos concentran el mismo tonelaje en menor tiempo y elevan la ocupación del muelle.",
  },
  sitiosAtraque: {
    que: "Cuántos buques pueden estar operando al mismo tiempo.",
    paraQue: "Determina la capacidad física de la terminal para atender buques.",
    caracteristica: "Un número entero. Con dos sitios, el mismo tráfico ocupa la mitad del tiempo de muelle.",
    impacta: "Divide la ocupación. Es la variable que define si corresponde ampliar el muelle o rechazar carga.",
  },
  umbralOcupacion: {
    que: "A partir de qué nivel de ocupación el modelo enciende una alarma.",
    paraQue: "Alertar cuando el volumen comprometido deja de ser físicamente absorbible.",
    caracteristica: "Un porcentaje. Por encima del 70% aparecen colas de espera de buques; por encima del 85% la terminal está saturada.",
    impacta: "No altera ningún resultado económico. Es únicamente una alerta de la solapa Validación.",
  },

  // -------------------------------------------------------- fiscal general --
  tasaImpuestoGeneral: {
    que: "La alícuota que se aplica sobre el resultado en el régimen general.",
    paraQue: "Se aplica cuando el RIGI está desactivado, y sirve de referencia para cuantificar el beneficio del régimen.",
    caracteristica: "Un porcentaje. En Argentina la escala del impuesto a las ganancias societario llega al 35%.",
    impacta: "Reduce el resultado después de impuestos y, con él, el flujo de fondos y el rendimiento.",
    termino: "Impuesto a las Ganancias",
  },
  vidaUtilDepreciacion: {
    que: "En cuántos años se va descontando contablemente lo invertido en obra y equipos.",
    paraQue: "La depreciación no constituye una erogación, pero reduce la base imponible del impuesto.",
    caracteristica: "Años. Obra civil portuaria: 20 a 50 años. Equipos de movimiento: 10 a 15.",
    impacta: "Una vida útil más extensa implica menor depreciación anual, mayor base imponible y mayor impuesto en los primeros ejercicios.",
    termino: "Depreciación o amortización",
  },
  tasasEnFCFF: {
    que: "Si las tasas municipales y el impuesto al cheque se restan del flujo de caja o se muestran solo como dato.",
    paraQue: "Constituyen erogaciones efectivas de todos los ejercicios, de modo que corresponde incluirlas.",
    caracteristica: "Activado es el criterio recomendado. Desactivado reproduce el tratamiento de la planilla anterior.",
    impacta: "Desactivarlo mejora artificialmente el rendimiento: el proyecto aparenta un retorno superior al real.",
  },

  // ------------------------------------------------------- financiamiento --
  montoDeudaMM: {
    que: "El monto de deuda que se toma para financiar la obra.",
    paraQue: "Distinguir el capital que aportan los socios del que provee la entidad financiera.",
    caracteristica: "En millones de dólares. En 0, el proyecto se evalúa financiado íntegramente con capital propio.",
    impacta: "Habilita el cálculo del rendimiento del accionista y de la capacidad de pago de la deuda.",
  },
  tasaDeuda: {
    que: "La tasa de interés anual que percibe la entidad financiera.",
    paraQue: "Determinar los intereses de cada ejercicio.",
    caracteristica: "Porcentaje anual, en la misma moneda del modelo (dólares).",
    impacta: "Una tasa mayor eleva los intereses, reduce el flujo para los accionistas y deteriora la capacidad de repago.",
  },
  plazoDeuda: {
    que: "El plazo de amortización del préstamo, en años.",
    paraQue: "Determinar el importe del servicio anual.",
    caracteristica: "Años. En infraestructura suele ir de 7 a 15.",
    impacta: "Un plazo más corto eleva el servicio anual y reduce el margen entre lo que genera el proyecto y lo que debe afrontar.",
  },

  // --------------------------------------------------------------- RIGI ----
  rigiActivo: {
    que: "La activación del régimen promocional de grandes inversiones.",
    paraQue: "Comparar el proyecto con y sin los beneficios del régimen.",
    caracteristica: "Activado aplica la alícuota reducida, la amortización acelerada y las exenciones cargadas más abajo.",
    impacta: "Es el parámetro de mayor incidencia del modelo. Corresponde correrlo activado y desactivado: la diferencia de rendimiento cuantifica el valor del régimen para este proyecto.",
    termino: "RIGI, Ley 27.742",
  },
  rigiAnioInicio: {
    que: "El año desde el cual corren los beneficios del régimen.",
    paraQue: "Ubicar en el tiempo las exenciones, que duran una cantidad fija de años.",
    caracteristica: "Un año. Habitualmente el de la aprobación del proyecto en el régimen.",
    impacta: "Desplaza toda la ventana de beneficios. Un año de atraso puede excluir un ejercicio de exención.",
  },
  rigiTasaImpuesto: {
    que: "La alícuota reducida del impuesto a las ganancias dentro del régimen.",
    paraQue: "Es el beneficio económico más importante del RIGI.",
    caracteristica: "Un porcentaje, menor que el del régimen general.",
    impacta: "La diferencia respecto de la alícuota general se traduce directamente en mayor flujo en todos los ejercicios con resultado positivo.",
  },
  rigiAmortAcelerada: {
    que: "Permite depreciar la inversión en menos ejercicios que su vida útil física.",
    paraQue: "Anticipar el escudo fiscal: menor impuesto en los primeros ejercicios y mayor en los últimos.",
    caracteristica: "Art. 183 b) de la ley. Se combina con el porcentaje de vida útil del campo siguiente.",
    impacta: "No modifica el impuesto total de toda la vida del proyecto, pero lo difiere, y eso mejora el rendimiento.",
  },
  rigiPctVidaUtil: {
    que: "Qué porcentaje de la vida útil normal se usa para depreciar dentro del régimen.",
    paraQue: "Cuantificar la aceleración.",
    caracteristica: "Un porcentaje. 60% implica que una inversión de 30 años se deprecia en 18.",
    impacta: "Cuanto menor es el porcentaje, antes se aprovecha el escudo fiscal y mejor resulta el rendimiento.",
  },
  rigiIIBBAnios: {
    que: "Cuántos años dura la exención del impuesto provincial sobre la facturación.",
    paraQue: "Medir el ahorro provincial del régimen.",
    caracteristica: "Años contados desde el inicio de beneficios. Santa Fe.",
    impacta: "Se expone únicamente como ahorro: es un concepto que no se eroga, no un ingreso.",
    termino: "Ingresos Brutos (IIBB)",
  },
  rigiIIBBPct: {
    que: "Qué alícuota se pagaría de Ingresos Brutos sin el régimen.",
    paraQue: "Cuantificar el ahorro que genera la exención.",
    caracteristica: "Un porcentaje sobre la facturación.",
    impacta: "No afecta el flujo de fondos: alimenta el renglón informativo de ahorro.",
  },
  rigiMunicipalAnios: {
    que: "Cuántos años dura la exención de la tasa municipal de Timbúes.",
    paraQue: "Determinar a partir de qué ejercicio comienza a abonarse el DREI.",
    caracteristica: "Años desde el inicio de beneficios.",
    impacta: "Finalizada la exención, el DREI se eroga en todos los ejercicios siguientes.",
  },
  rigiMunicipalPorMil: {
    que: "La alícuota municipal sobre la facturación una vez terminada la exención.",
    paraQue: "Determinar el DREI a abonar.",
    caracteristica: "Expresada por mil, no por ciento. 4 por mil = 0,4%.",
    impacta: "Se eroga en todos los ejercicios posteriores a la exención.",
    termino: "DREI (Derecho de Registro e Inspección)",
  },
  rigiDebCredActivo: {
    que: "Si el impuesto al cheque se puede tomar a cuenta del impuesto a las ganancias.",
    paraQue: "Evitar la doble imposición sobre el mismo concepto.",
    caracteristica: "Beneficio del régimen. El cómputo nunca puede exceder el impuesto determinado del ejercicio.",
    impacta: "Reduce el impuesto a abonar, con tope en el propio impuesto del ejercicio.",
  },
  rigiDebCredPct: {
    que: "Qué porcentaje del impuesto al cheque se puede computar a cuenta.",
    paraQue: "Cuantificar ese beneficio.",
    caracteristica: "Un porcentaje.",
    impacta: "Reduce el impuesto neto del ejercicio, con tope en el impuesto determinado.",
  },
  rigiCertivaActivo: {
    que: "Si se informa el IVA de las inversiones como dato.",
    paraQue: "Dimensionar el capital de trabajo a financiar mientras se recupera ese crédito fiscal.",
    caracteristica: "Constituye crédito fiscal, no un costo: se recupera.",
    impacta: "No afecta el flujo de fondos. Es un renglón informativo.",
    termino: "CERTIVA",
  },

  // --------------------------------------------------- otros tributos -----
  idycbAlicuota: {
    que: "El impuesto que grava los movimientos de la cuenta bancaria.",
    paraQue: "Reflejar un costo efectivo que numerosos modelos omiten.",
    caracteristica: "0,6% al debitar más 0,6% al acreditar, Ley 25.413.",
    impacta: "Se eroga en los ejercicios de mayor inversión, cuando se concentran los movimientos.",
    termino: "IDyCB, impuesto al cheque",
  },
  idycbPrescripcion: {
    que: "Cuántos años se puede seguir usando el crédito acumulado del impuesto al cheque.",
    paraQue: "Evitar el cómputo de créditos prescriptos.",
    caracteristica: "Años.",
    impacta: "Limita el crédito recuperable contra el impuesto a las ganancias.",
  },
  dreiTipoCambio: {
    que: "El tipo de cambio con el que se convierte a dólares el mínimo municipal.",
    paraQue: "El DREI mínimo está fijado en pesos y el modelo se expresa en dólares.",
    caracteristica: "Pesos por dólar. FALTA CONFIRMAR con la Municipalidad de Timbúes.",
    impacta: "Sin este dato el DREI se determina solo por alícuota y queda subestimado.",
  },
  dreiMinimoMensualARS: {
    que: "El importe mínimo mensual de la tasa municipal, cualquiera sea la facturación.",
    paraQue: "El municipio percibe el mayor importe entre el mínimo y la alícuota sobre la facturación.",
    caracteristica: "En pesos por mes. Se anualiza y se pasa a dólares. FALTA CONFIRMAR.",
    impacta: "En los ejercicios de baja facturación, este mínimo es el importe que efectivamente se abona.",
  },
  tasaEdifPrimeros5: {
    que: "La tasa municipal sobre la obra durante los primeros cinco años.",
    paraQue: "Imputar los permisos y derechos de construcción.",
    caracteristica: "Por mil sobre el monto invertido.",
    impacta: "Se eroga junto con la inversión.",
  },
  tasaEdifPost5: {
    que: "La misma tasa de edificación, a partir del año 6.",
    paraQue: "Imputar las ampliaciones posteriores.",
    caracteristica: "Por mil sobre el monto invertido.",
    impacta: "Se eroga junto con las inversiones de los ejercicios posteriores.",
  },

  // --------------------------------------------------------- transacción --
  structuringFeeUSD: {
    que: "La comisión por estructurar la operación y obtener el financiamiento.",
    paraQue: "Distribuirla entre los socios: unos la perciben y otros la desembolsan.",
    caracteristica: "En dólares, por única vez.",
    impacta: "No modifica el rendimiento del proyecto, solo su distribución entre los socios.",
    termino: "Structuring fee",
  },
  anioCobroFee: {
    que: "El ejercicio en que se percibe y se abona esa comisión.",
    paraQue: "Ubicarla en el flujo de cada socio.",
    caracteristica: "Un año dentro del horizonte.",
    impacta: "Cuanto antes se perciba, mayor es su incidencia en el rendimiento de quien la cobra.",
  },
  costoEstructuracionARS: {
    que: "El costo de elaborar la presentación del proyecto ante el régimen.",
    paraQue: "Deducirlo de la comisión del socio que lo asume.",
    caracteristica: "En pesos. Se convierte con el tipo de cambio promedio.",
    impacta: "Reduce la comisión neta del socio que la percibe.",
  },
  tipoCambioPromedio: {
    que: "El tipo de cambio con el que se convierten a dólares los importes en pesos.",
    paraQue: "El modelo completo se expresa en dólares.",
    caracteristica: "Pesos por dólar.",
    impacta: "Modifica el valor en dólares del costo de estructuración.",
  },

  // ---------------------------------------------- unidad: identidad ------
  metodoTarifa: {
    que: "El criterio con el que se determina la facturación de esta unidad.",
    paraQue: "Existen dos criterios para determinar el mismo ingreso.",
    caracteristica: "Por flujos comerciales: se detalla cada corriente con sus cinco tarifas. Por tarifa escalonada: una tarifa por tonelada que desciende al superar determinados volúmenes.",
    impacta: "Modifica por completo el origen de las toneladas y la tarifa por tonelada de esta unidad.",
  },
  anioInicioOp: {
    que: "El primer ejercicio en que esta unidad factura.",
    paraQue: "Antes de ese ejercicio la unidad no genera toneladas ni ingresos, aunque ya registre inversión.",
    caracteristica: "Un año dentro del horizonte.",
    impacta: "Anticipar el inicio anticipa todo el flujo positivo y mejora sensiblemente el rendimiento.",
  },
  capacidadMax: {
    que: "El límite físico de toneladas que esta unidad puede operar por ejercicio.",
    paraQue: "Impedir que el modelo proyecte más carga de la que la instalación admite.",
    caracteristica: "Toneladas por año. En 0 no se aplica tope.",
    impacta: "Limita las toneladas por encima del tope y, con ellas, la facturación.",
  },
  takeOrPay: {
    que: "El volumen mínimo que el cliente abona aunque no lo utilice.",
    paraQue: "Establecer un piso de ingresos, que es lo que evalúa una entidad financiera para otorgar crédito.",
    caracteristica: "Toneladas por año. Debe estar respaldado por contrato firmado.",
    impacta: "Constituye un piso: si el volumen proyectado resulta inferior, se factura igualmente este mínimo.",
    termino: "Take-or-pay",
  },

  // -------------------------------------------- unidad: inversión y costos --
  capexNoDepreciable: {
    que: "La inversión que no sufre desgaste y, por lo tanto, no se deprecia: típicamente el terreno.",
    paraQue: "Distinguirla de la inversión depreciable.",
    caracteristica: "En millones de dólares.",
    impacta: "Se eroga pero no genera escudo fiscal: no reduce el impuesto.",
  },
  opexFijoMM: {
    que: "El costo de mantener la unidad en actividad, opere o no opere carga.",
    paraQue: "Sueldos, seguros, mantenimiento, vigilancia, administración.",
    caracteristica: "En millones de dólares por año. Es el costo que subsiste en un ejercicio de baja actividad.",
    impacta: "Se deduce en todos los ejercicios desde el inicio de la operación y define el volumen necesario para alcanzar el punto de equilibrio.",
    termino: "OPEX fijo",
  },
  opexInicialMM: {
    que: "Los gastos de puesta en marcha: pruebas, habilitaciones y conformación del primer equipo.",
    paraQue: "Distinguirlos del costo anual recurrente y de la inversión en obra.",
    caracteristica: "En millones de dólares, por única vez, en el ejercicio de inicio.",
    impacta: "Incide una sola vez, en el primer ejercicio de operación.",
  },
  opexVariable: {
    que: "El costo de operar cada tonelada.",
    paraQue: "Energía, combustible, personal por turno, insumos, mantenimiento por uso.",
    caracteristica: "En dólares por tonelada.",
    impacta: "Crece con el volumen operado. Junto con la tarifa define el margen de cada tonelada.",
    termino: "OPEX variable",
  },
  otrosIngresos: {
    que: "Ingresos adicionales asociados a cada tonelada operada.",
    paraQue: "Servicios accesorios: pesaje, análisis de calidad, servicios a buques.",
    caracteristica: "En dólares por tonelada.",
    impacta: "Se adiciona directamente a la facturación de esta unidad.",
  },

  // ------------------------------------------------------- unidad: canon --
  canonFijoActivo: {
    que: "Si corresponde abonar un importe fijo anual por operar en el predio portuario.",
    paraQue: "La terminal no es titular del predio: abona al concedente por el derecho de uso.",
    caracteristica: "Activado o desactivado.",
    impacta: "Se deduce del resultado operativo en todos los ejercicios, se opere o no carga.",
    termino: "Canon de concesión fijo",
  },
  canonFijoMM: {
    que: "El importe de ese canon fijo anual.",
    paraQue: "Imputar el derecho a operar, con independencia del volumen.",
    caracteristica: "En millones de dólares por año.",
    impacta: "Reduce el resultado operativo aun con la unidad inactiva.",
  },
  canonVariableActivo: {
    que: "Si además corresponde abonar un importe por cada tonelada operada.",
    paraQue: "Es la modalidad habitual de participación del concedente en el negocio.",
    caracteristica: "Activado o desactivado.",
    impacta: "Se deduce del resultado operativo en proporción al volumen.",
    termino: "Canon variable",
  },
  canonVariable: {
    que: "El importe a abonar por cada tonelada operada en la terminal.",
    paraQue: "Imputar el derecho de uso en función del volumen efectivamente operado.",
    caracteristica: "En dólares por tonelada.",
    impacta: "Reduce el margen unitario por tonelada.",
  },
  canonPctActivo: {
    que: "Si además corresponde abonar un porcentaje de la facturación.",
    paraQue: "Otra modalidad, atada al ingreso en lugar del volumen.",
    caracteristica: "Activado o desactivado.",
    impacta: "Se resta de la ganancia operativa como porcentaje de la facturación.",
    termino: "Canon sobre facturación",
  },
  canonPct: {
    que: "Qué porcentaje de la facturación se paga por el derecho de uso.",
    paraQue: "Cuantificar esa modalidad.",
    caracteristica: "Un porcentaje sobre la facturación bruta de la unidad.",
    impacta: "Reduce el resultado operativo en proporción a la facturación.",
  },

  // ------------------------------------------------- unidad: ocupación ----
  parcelaMedia: {
    que: "Las toneladas que carga o descarga un buque promedio por recalada.",
    paraQue: "Convertir el tonelaje anual en cantidad de recaladas.",
    caracteristica: "Toneladas por recalada. Un Panamax de granos ronda las 45.000 a 60.000 toneladas.",
    impacta: "Parcelas menores implican más recaladas para el mismo tonelaje, y mayor ocupación de muelle.",
    termino: "Parcela media por recalada",
  },
  rendimientoDia: {
    que: "Cuántas toneladas se cargan o descargan por día de operación.",
    paraQue: "Determinar cuántos días de muelle demanda cada recalada.",
    caracteristica: "Toneladas por día. Depende del equipamiento: una cinta de granos rinde muy por encima de una grúa para bolsas.",
    impacta: "Un rendimiento mayor libera el muelle antes y reduce la ocupación. Es la variable que justifica la inversión en equipamiento.",
  },
  tiempoNoOperativo: {
    que: "Qué porcentaje del tiempo de muelle se pierde sin operar.",
    paraQue: "Esperas, cambios de bodega, condiciones meteorológicas, paradas de turno y trámites.",
    caracteristica: "Un porcentaje sobre el tiempo de operación. En terminales en actividad suele situarse entre 10% y 25%.",
    impacta: "Extiende la estadía de cada buque y eleva la ocupación del muelle.",
  },
  diasFijosRecalada: {
    que: "Los días de muelle que demanda cada recalada con independencia del tonelaje: amarre, inspecciones y zarpada.",
    paraQue: "Computar el tiempo de muelle que no depende del tonelaje.",
    caracteristica: "Días por recalada, habitualmente entre 0,5 y 1,5.",
    impacta: "Adiciona tiempo de muelle por cada recalada, cualquiera sea el volumen operado.",
  },

  // ----------------------------------------- unidad: proyección de volumen --
  volumenObjetivo: {
    que: "El volumen anual inicial, previo a la aplicación del crecimiento.",
    paraQue: "Punto de partida de la proyección cuando se aplica el método de tarifa escalonada.",
    caracteristica: "Toneladas por año.",
    impacta: "Define la facturación de los primeros ejercicios de esta unidad.",
  },
  incrementoAnual: {
    que: "El incremento de toneladas que se adiciona en cada ejercicio.",
    paraQue: "Proyectar la captación de carga ejercicio por ejercicio.",
    caracteristica: "Toneladas por año, en valor absoluto y no en porcentaje.",
    impacta: "Define la pendiente del crecimiento. Es uno de los supuestos de mayor sensibilidad del modelo.",
  },
  anioInicioIncremento: {
    que: "El ejercicio a partir del cual se aplica ese crecimiento.",
    paraQue: "Contemplar un período de maduración previo al crecimiento.",
    caracteristica: "Un año dentro del horizonte.",
    impacta: "Postergarlo aplana la curva de toneladas de los primeros ejercicios.",
  },
  topeVolumen: {
    que: "El límite máximo de la proyección de volumen.",
    paraQue: "Impedir que el crecimiento anual se extienda indefinidamente.",
    caracteristica: "Toneladas por año. En 0 no se aplica límite.",
    impacta: "A partir de ese nivel, las toneladas dejan de crecer.",
  },
  volumenDuenio: {
    que: "La porción del volumen que constituye carga propia del titular.",
    paraQue: "Distinguirla de la carga de terceros, que puede tener otra tarifa aplicable.",
    caracteristica: "Toneladas por año.",
    impacta: "Determina cómo se aplica la tarifa escalonada.",
  },
  limiteTramo: {
    que: "El volumen a partir del cual cambia la tarifa por tonelada.",
    paraQue: "Las tarifas escalonadas descienden a medida que se incrementa el volumen contratado.",
    caracteristica: "Toneladas por año. Los tramos deben ordenarse de menor a mayor.",
    impacta: "Superar un tramo reduce la tarifa unitaria y aplana la facturación por unidad de volumen.",
  },
  metodoCalada: {
    que: "El criterio de facturación del servicio de calada del buque.",
    paraQue: "Existen dos criterios en uso: por tonelada, o como porcentaje del valor de la carga.",
    caracteristica: "Se opta por uno de los dos.",
    impacta: "Modifica el ingreso por calada de esta unidad.",
    termino: "Calada",
  },
  caladaPct: {
    que: "El porcentaje del valor de la carga que se factura por la calada.",
    paraQue: "Se aplica cuando la calada se factura sobre valor y no por tonelada.",
    caracteristica: "Un porcentaje.",
    impacta: "Junto con el valor de la carga define el ingreso por calada.",
  },
  valorCarga: {
    que: "El valor de una tonelada de la mercadería operada.",
    paraQue: "Base de cálculo para facturar la calada como porcentaje del valor.",
    caracteristica: "En dólares por tonelada.",
    impacta: "Solo tiene efecto si la calada se factura como porcentaje del valor.",
  },
  capexAnual: {
    que: "La inversión en obra y equipos de cada ejercicio.",
    paraQue: "Es el capital que debe obtenerse antes de que la unidad genere ingresos.",
    caracteristica: "En millones de dólares, ejercicio por ejercicio. Corresponde cargarla según el cronograma efectivo de obra.",
    impacta: "Se eroga en el ejercicio en que se carga y se deprecia en los siguientes. Es la variable de mayor incidencia en el rendimiento del proyecto.",
    termino: "CAPEX",
  },
  volumenManual: {
    que: "Volumen ingresado manualmente para un ejercicio puntual, en reemplazo del proyectado.",
    paraQue: "Reflejar un contrato firmado o un dato conocido que no responde a la curva general.",
    caracteristica: "Toneladas. En 0 se aplica la proyección automática. El crecimiento de los ejercicios siguientes parte del último valor ingresado manualmente.",
    impacta: "Reemplaza la proyección de ese ejercicio y desplaza el punto de partida del crecimiento posterior.",
  },

  // ----------------------------------------------------- costos comunes ---
  costoComunLinea: {
    que: "La denominación del costo compartido entre las tres unidades.",
    paraQue: "Identificar el concepto: vigilancia, administración, seguros del predio, dragado.",
    caracteristica: "Texto libre, con el mayor grado de detalle posible.",
    impacta: "Solo identifica la línea de costo.",
  },
  costoComunDriver: {
    que: "El criterio de distribución de ese costo entre las unidades.",
    paraQue: "Documentar el fundamento de la asignación de cada unidad.",
    caracteristica: "Texto. El criterio habitual es distribuir por tiempo de uso de muelle o por superficie afectada, no por toneladas: una tonelada de fertilizante en bolsa ocupa muy por encima de una de granos.",
    impacta: "No interviene en el cálculo: documenta el criterio que sustenta los porcentajes.",
  },
  costoComunMonto: {
    que: "El costo anual de esa línea.",
    paraQue: "Es el importe total a distribuir entre las tres unidades.",
    caracteristica: "En dólares por año.",
    impacta: "Se distribuye según los porcentajes y se adiciona al costo operativo de cada unidad.",
  },
  asignacionCapexComun: {
    que: "El criterio de distribución de la obra compartida entre las unidades.",
    paraQue: "El muelle, los accesos y la playa de camiones benefician a las tres unidades.",
    caracteristica: "Porcentajes que deben totalizar 100%.",
    impacta: "Define qué inversión y qué depreciación absorbe cada unidad y, con ello, su rentabilidad individual.",
  },

  // ---------------------------------------------------------- inversores --
  participacionUnidad: {
    que: "El porcentaje de participación de este socio en la unidad.",
    paraQue: "Distribuir tanto los aportes como las distribuciones de esa unidad.",
    caracteristica: "En tanto por uno: 0,55 equivale a 55%. En 0, el socio no participa de esa unidad. Las participaciones de cada unidad deben totalizar 100%.",
    impacta: "Define cuánto aporta y cuánto percibe ese socio del flujo de esa unidad.",
  },
  pctFeeRecibe: {
    que: "La porción de la comisión de estructuración que percibe este socio.",
    paraQue: "La comisión se distribuye con independencia de las participaciones.",
    caracteristica: "En tanto por uno. El total entre todos los socios debe ser 100%.",
    impacta: "Mejora el rendimiento de quien la percibe, sin alterar el del proyecto.",
  },
  pctFeeDesembolsa: {
    que: "La porción de esa comisión que desembolsa este socio.",
    paraQue: "La comisión la percibe un socio y la desembolsa otro.",
    caracteristica: "En tanto por uno.",
    impacta: "Reduce el rendimiento de quien la desembolsa, sin alterar el del proyecto.",
  },
  obraNombre: {
    que: "Qué obra o activo es: el muelle, un silo, una cinta, la balanza.",
    paraQue: "Dejar asentado qué compone la inversión de cada ejercicio, para poder revisarla con Ingeniería renglón por renglón.",
    caracteristica: "Texto libre. Conviene el nombre con que figura en el presupuesto de obra.",
    impacta: "Solo identifica el renglón. Lo que entra al modelo es el monto y el año.",
  },
  obraAnio: {
    que: "El ejercicio en que se desembolsa esta obra.",
    paraQue: "Ubicar la erogación en el tiempo: una obra adelantada un año cambia el rendimiento del proyecto.",
    caracteristica: "Un año dentro del horizonte. Una obra que se paga en varios ejercicios se carga como varios renglones, uno por año, con el importe de cada uno.",
    impacta: "Define en qué ejercicio sale el dinero y desde cuándo empieza a depreciarse.",
  },
  obraMonto: {
    que: "Cuánto se desembolsa por esta obra en ese ejercicio.",
    paraQue: "Es el detalle de la inversión directa de la unidad.",
    caracteristica: "En millones de dólares. La suma de las obras del ejercicio es la inversión directa de ese año.",
    impacta: "Se eroga en ese ejercicio y se deprecia en los siguientes, salvo la parte cargada como no depreciable.",
  },
  inversorNombre: {
    que: "El nombre del socio o del grupo inversor.",
    paraQue: "Identificar a quién corresponde cada fila de participaciones y de flujo.",
    caracteristica: "Texto libre. Conviene la razón social o el nombre con que se lo identifica en el acuerdo.",
    impacta: "Solo identifica la fila. El reparto lo definen los porcentajes de cada unidad.",
  },
  inversorAportes: {
    que: "Todo lo que este socio pone a lo largo del horizonte.",
    paraQue: "Dimensionar el compromiso de capital de cada socio.",
    caracteristica: "Es la suma de los años con flujo negativo, más la comisión que desembolsa.",
    impacta: "Es el denominador de su rendimiento: sobre este capital se mide la TIR del socio.",
  },
  inversorDistribuciones: {
    que: "Todo lo que este socio recibe a lo largo del horizonte.",
    paraQue: "Ver el retorno nominal, antes de considerar en qué momento llega.",
    caracteristica: "Es la suma de los años con flujo positivo, más la comisión que percibe.",
    impacta: "Junto con los aportes y el momento de cada uno, define la TIR del socio.",
  },

  // ------------------------------------------------- flujos comerciales ----
  flujoGate: {
    que: "Si la carga entra al puerto, sale del puerto o solo se trasborda.",
    paraQue: "Distinguir la operación de importación, la de exportación y el trasbordo, que tienen costos y tarifas distintos.",
    caracteristica: "Entra al puerto, Sale del puerto o Trasbordo.",
    impacta: "No cambia el cálculo por sí solo: ordena la lectura y documenta qué operación es cada renglón.",
  },
  flujoCarga: {
    que: "Qué mercadería es: urea, UAN, soja, acero, mineral de hierro.",
    paraQue: "Identificar la corriente comercial con el nombre que usa Comercial.",
    caracteristica: "Texto libre. Conviene el nombre del producto, no una categoría genérica.",
    impacta: "Solo identifica el renglón.",
  },
  flujoModo: {
    que: "Por qué medio llega o se va la carga.",
    paraQue: "Separar lo que ocupa muelle de lo que no: un camión no consume tiempo de muelle, un buque sí.",
    caracteristica: "Buque, barcaza, camión o trasbordo.",
    impacta: "Documenta el medio. La ocupación de muelle se calcula con los parámetros de recalada de la unidad.",
  },
  flujoForma: {
    que: "En qué estado se manipula la mercadería.",
    paraQue: "El rendimiento de carga y el costo de operación cambian mucho según la forma.",
    caracteristica: "Sólido a granel, bultos sueltos o líquido.",
    impacta: "Documenta la condición de la carga; el rendimiento se carga en el bloque de ocupación de muelle.",
  },
  flujoAlmacenaje: {
    que: "Dónde queda la mercadería entre que llega y se despacha.",
    paraQue: "Determinar si corresponde facturar almacenaje y qué instalación se ocupa.",
    caracteristica: "Galpón, plazoleta, tanque, elevador o directo a buque. Directo a buque significa que no se almacena.",
    impacta: "Documenta la instalación afectada. La tarifa de almacenaje se carga en la columna correspondiente.",
  },
  flujoAnioInicio: {
    que: "El primer ejercicio en que esta corriente comercial opera.",
    paraQue: "Permitir que cada carga arranque en un año distinto dentro de la misma unidad.",
    caracteristica: "Un año dentro del horizonte. Si es anterior al inicio de operación de la unidad, rige el de la unidad.",
    impacta: "Antes de ese ejercicio esta corriente no aporta toneladas ni facturación.",
  },
  flujoVolAnio1: {
    que: "Las toneladas de esta corriente en su primer ejercicio.",
    paraQue: "Es la base sobre la que se aplica el crecimiento de los años siguientes.",
    caracteristica: "Toneladas por año. Debe estar respaldado por Comercial.",
    impacta: "Define el punto de partida de la facturación de esta corriente.",
  },
  flujoCrecimiento: {
    que: "Cuánto crece el volumen de esta corriente cada ejercicio.",
    paraQue: "Proyectar la captación de carga sin tener que cargar año por año.",
    caracteristica: "Un porcentaje anual, compuesto: se aplica sobre el volumen del ejercicio anterior. En 0 el volumen se mantiene constante.",
    impacta: "Es uno de los supuestos de mayor sensibilidad: un punto de crecimiento sostenido treinta años cambia sustancialmente el resultado.",
  },
  flujoTope: {
    que: "El volumen máximo que puede alcanzar esta corriente.",
    paraQue: "Impedir que el crecimiento compuesto proyecte un volumen que el mercado o la instalación no admiten.",
    caracteristica: "Toneladas por año. En 0 no se aplica límite.",
    impacta: "A partir de ese nivel las toneladas de esta corriente dejan de crecer.",
  },
  flujoTarifaMuelle: {
    que: "Lo que se factura por el uso del muelle para esta carga.",
    paraQue: "Es uno de los cinco rubros que componen la tarifa total.",
    caracteristica: "En dólares por tonelada. Referencia de la zona: 0,37 USD por tonelada de registro del buque por día de estadía.",
    impacta: "Multiplicado por las toneladas de esta corriente, da la facturación por uso de muelle.",
  },
  flujoTarifaEstibaje: {
    que: "Lo que se factura por cargar o descargar el buque.",
    paraQue: "Es el rubro de mayor peso y el que más varía entre productos.",
    caracteristica: "En dólares por tonelada. Operar bultos sueltos se factura muy por encima de operar granel.",
    impacta: "Multiplicado por las toneladas, da la facturación por carga y descarga.",
  },
  flujoTarifaManipuleo: {
    que: "Lo que se factura por mover la mercadería dentro del predio.",
    paraQue: "Cubre el movimiento entre el muelle y la instalación de almacenaje, y las habilitaciones asociadas.",
    caracteristica: "En dólares por tonelada.",
    impacta: "Multiplicado por las toneladas, da la facturación por manipuleo.",
  },
  flujoTarifaAlmacenaje: {
    que: "Lo que se factura por almacenar la mercadería.",
    paraQue: "Remunerar la ocupación del galpón, la plazoleta o el tanque.",
    caracteristica: "En dólares por tonelada. Resulta de los dólares por mes divididos por la rotación esperada. En las corrientes directas a buque es cero.",
    impacta: "Multiplicado por las toneladas, da la facturación por almacenaje.",
  },
  flujoTarifaCalada: {
    que: "Lo que se factura por la calada y demás derechos sobre el buque.",
    paraQue: "Cubre los servicios adicionales prestados a la nave.",
    caracteristica: "En dólares por tonelada. Puede facturarse también como porcentaje del valor de la carga, según el criterio elegido para la unidad.",
    impacta: "Multiplicado por las toneladas, da la facturación por calada.",
  },

  // --------------------------------------------- tarifas por tramo ---------
  tarifaConcepto: {
    que: "Cada uno de los servicios que componen la tarifa por tonelada.",
    paraQue: "Desagregar el precio para poder negociarlo y compararlo servicio por servicio.",
    caracteristica: "Los seis conceptos se agrupan después en los cinco rubros del flujo: muelle, estibaje, manipuleo, almacenaje y calada.",
    impacta: "La suma de los seis conceptos del tramo que corresponda es la tarifa aplicada a esa tonelada.",
  },
  tarifaTramoBase: {
    que: "La tarifa que se aplica a la carga que no alcanza ningún tramo preferencial.",
    paraQue: "Es el precio de lista: rige para la carga de terceros y para el excedente del volumen del titular.",
    caracteristica: "En dólares por tonelada, por concepto.",
    impacta: "Define la facturación de toda la carga no comprendida en los tramos.",
  },
  tarifaTramo: {
    que: "La tarifa preferencial que rige dentro de este tramo de volumen.",
    paraQue: "Reflejar el acuerdo comercial: a mayor volumen comprometido, menor tarifa unitaria.",
    caracteristica: "En dólares por tonelada, por concepto. Los límites de cada tramo se cargan en el bloque de proyección de volumen.",
    impacta: "Se aplica solo a las toneladas comprendidas en el tramo, de forma marginal: cada tramo se valoriza con su propia tarifa.",
  },

  // ------------------------------------------- detalle por ejercicio -------
  anioFila: {
    que: "El ejercicio al que corresponde el renglón.",
    paraQue: "Ubicar cada dato en el tiempo.",
    caracteristica: "Se genera a partir del año base y del horizonte cargados en Parámetros generales.",
    impacta: "No se edita.",
  },
  opexVarOverride: {
    que: "El costo variable por tonelada de ese ejercicio en particular.",
    paraQue: "Reflejar un costo que cambia en el tiempo: una curva de aprendizaje, un contrato de energía, un cambio de equipamiento.",
    caracteristica: "En dólares por tonelada. En 0 se aplica el costo variable general de la unidad.",
    impacta: "Reemplaza el costo variable de ese ejercicio y, con él, el margen de cada tonelada operada.",
  },
  calcToneladas: {
    que: "Las toneladas que efectivamente opera la unidad ese ejercicio.",
    paraQue: "Ver el resultado de la proyección después de aplicar la maduración y el límite de capacidad.",
    caracteristica: "Celda calculada: no se carga.",
    impacta: "Es la base de toda la facturación y del costo variable de la unidad.",
  },
  calcFacturacion: {
    que: "La facturación de la unidad en ese ejercicio.",
    paraQue: "Controlar la proyección contra lo que estima Comercial.",
    caracteristica: "Celda calculada: toneladas efectivas por la tarifa total.",
    impacta: "Es el punto de partida del resultado operativo.",
  },
  calcResultadoOperativo: {
    que: "El resultado operativo (EBITDA) de la unidad en ese ejercicio.",
    paraQue: "Ver si la unidad genera excedente con su propia operación.",
    caracteristica: "Celda calculada: facturación menos costo operativo menos derecho de uso.",
    impacta: "Es el indicador que evalúa una entidad financiera y la base del resultado consolidado.",
  },

  // ------------------------------------------------- tabla del resumen -----
  resumenNegocio: {
    que: "La unidad de negocio a la que corresponde el renglón.",
    paraQue: "Comparar las tres unidades con los mismos indicadores.",
    caracteristica: "Las tres se calculan con la misma estructura.",
    impacta: "No se edita.",
  },
  resumenInversion: {
    que: "La inversión total que absorbe la unidad en todo el horizonte.",
    paraQue: "Dimensionar cuánto capital demanda cada negocio.",
    caracteristica: "Incluye la inversión directa más la porción asignada de las obras compartidas.",
    impacta: "Es el capital sobre el que se mide el rendimiento individual de la unidad.",
  },
  resumenFacturacion: {
    que: "La facturación acumulada de la unidad en todo el horizonte.",
    paraQue: "Ver la escala comercial de cada negocio.",
    caracteristica: "Suma de todos los ejercicios, sin descontar ningún concepto.",
    impacta: "Es el denominador del margen operativo.",
  },
  resumenResultado: {
    que: "El resultado operativo (EBITDA) acumulado de la unidad.",
    paraQue: "Ver cuánto excedente genera cada negocio con su operación, antes de la inversión y los impuestos.",
    caracteristica: "Suma de todos los ejercicios.",
    impacta: "Junto con la inversión, explica el rendimiento individual de la unidad.",
  },
  resumenMargen: {
    que: "Qué porcentaje de la facturación queda como resultado operativo.",
    paraQue: "Comparar la rentabilidad de negocios de escala muy distinta.",
    caracteristica: "Resultado operativo acumulado sobre facturación acumulada.",
    impacta: "Un margen alto con inversión alta puede rendir menos que uno bajo con inversión baja: se lee junto con la TIR.",
  },
  resumenToneladas: {
    que: "Las toneladas acumuladas que opera la unidad en todo el horizonte.",
    paraQue: "Dimensionar el volumen físico de cada negocio.",
    caracteristica: "Suma de las toneladas efectivas de todos los ejercicios.",
    impacta: "Es el denominador de la tarifa media por tonelada.",
  },
  resumenTarifaMedia: {
    que: "Cuántos dólares factura la unidad por cada tonelada operada.",
    paraQue: "Comparar el precio medio de venta entre unidades y contra el mercado.",
    caracteristica: "Facturación acumulada dividida por toneladas acumuladas.",
    impacta: "Junto con el costo por tonelada, define el margen unitario de cada negocio.",
  },
  resumenOcupacion: {
    que: "La ocupación de muelle de la unidad en su ejercicio de mayor actividad.",
    paraQue: "Detectar cuál de los tres negocios consume más muelle.",
    caracteristica: "Porcentaje del año operativo. Es la restricción física del proyecto.",
    impacta: "Si la suma de las tres unidades supera el umbral, el volumen proyectado no resulta absorbible.",
  },
  resumenTIR: {
    que: "El rendimiento de la unidad evaluada en forma independiente.",
    paraQue: "Ver cuánto rinde cada negocio por sí solo, con su inversión y sus costos.",
    caracteristica: "TIR sobre el flujo de la unidad, con el impuesto calculado como si fuera una sociedad autónoma.",
    impacta: "Es una referencia, no el criterio de decisión: lo que decide si conviene incorporar la unidad es su aporte a la TIR del proyecto.",
  },
  resumenAporte: {
    que: "Cuántos puntos de TIR suma o resta la unidad al proyecto completo.",
    paraQue: "Es el criterio correcto para decidir si conviene incorporar un negocio.",
    caracteristica: "Diferencia entre la TIR del proyecto con la unidad y la TIR del proyecto sin ella, en puntos porcentuales.",
    impacta: "Un aporte negativo indica que la unidad deteriora el rendimiento del conjunto, aunque su TIR individual sea positiva.",
  },

  // --------------------------------------------- costos compartidos --------
  pctUnidadComun: {
    que: "Qué porcentaje de esta línea de costo absorbe la unidad.",
    paraQue: "Distribuir el costo compartido según el criterio documentado en la columna anterior.",
    caracteristica: "En tanto por uno. Los tres porcentajes de la línea deben totalizar 100%.",
    impacta: "Se suma al costo operativo de esa unidad y reduce su resultado operativo.",
  },
  sumaLineaComun: {
    que: "El total de los tres porcentajes de la línea.",
    paraQue: "Controlar que el costo quede íntegramente distribuido.",
    caracteristica: "Celda calculada. Tiene que dar 100%.",
    impacta: "Si no da 100%, parte del costo no queda absorbido por ninguna unidad y el consolidado subestima el costo operativo.",
  },
};
