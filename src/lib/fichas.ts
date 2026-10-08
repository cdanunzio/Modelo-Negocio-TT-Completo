import type { Ficha } from "@/components/editor/campos";

/**
 * Las fichas explicativas de cada campo, todas juntas.
 *
 * El texto sale del catálogo de ayudas del modelo (`textos_ayuda_simulador_
 * timbues.json`), donde cada dato tiene su descripción, su unidad y qué mueve
 * en el resultado. Acá se reparte en las cuatro partes que muestra la ventana:
 * qué es, tipo de dato, ejemplo y qué mueve. Cuando el nombre de pantalla no
 * coincide con el del catálogo, el emparejamiento es por significado: el
 * comentario lo aclara.
 *
 * Los ejemplos son valores del escenario base o referencias de la industria,
 * no inventos: así quien carga el dato sabe qué orden de magnitud esperar.
 */
export const FICHAS: Record<string, Ficha> = {
  // ------------------------------------------------ horizonte y calendario --
  anioBase: {
    que: "Primer año del flujo de fondos, cuando empiezan las inversiones. Corre todo el calendario del modelo.",
    tipo: "Año, cuatro dígitos.",
    ejemplo: "2025, el año en que arranca la obra. No es el año de la primera facturación.",
    mueve: "Desplaza el modelo completo en el tiempo: cambian los años de todas las columnas y la curva de maduración.",
  },
  horizonte: {
    que: "Cuántos años mira el modelo después del año base.",
    tipo: "Cantidad de años, número entero.",
    ejemplo: "30 años, el plazo habitual de una concesión portuaria. Con año base 2025, el modelo llega a 2055.",
    mueve: "Un horizonte más extenso incorpora ejercicios de flujo positivo y mejora el rendimiento. Extenderlo sin respaldo contractual sobrestima el resultado.",
  },
  anioInicioOpProyecto: {
    que: "Año en que la primera unidad empieza a mover carga. Cada unidad tiene además su propio año de inicio.",
    tipo: "Año, cuatro dígitos.",
    ejemplo: "2027, cuando arranca agrograneles. Fertilizantes y cargas generales arrancan en 2028.",
    mueve: "No modifica resultados por sí solo: rigen los años de inicio de cada unidad de negocio.",
  },

  // ---------------------------------------------------------- operación ----
  diasOperativos: {
    que: "Días en que el puerto puede trabajar: 365 menos domingos, feriados y lluvias.",
    tipo: "Días por año.",
    ejemplo: "308 días en el escenario base. En el Paraná suele situarse entre 300 y 330.",
    mueve: "Menos días operativos concentran el mismo tonelaje en menor tiempo y elevan la ocupación del muelle.",
  },
  sitiosAtraque: {
    que: "Cuántos buques pueden estar amarrados a la vez.",
    tipo: "Cantidad de sitios, número entero.",
    ejemplo: "3 sitios. Con las tres unidades en un solo sitio la ocupación alcanzaba 438%; con 3 desciende a 59%.",
    mueve: "Más sitios, más capacidad de muelle: divide la ocupación. Es la variable que define si corresponde ampliar el muelle o rechazar carga.",
  },
  umbralOcupacion: {
    que: "Por encima de este nivel el modelo avisa que falta muelle o sobra volumen.",
    tipo: "Porcentaje de ocupación.",
    ejemplo: "70%. Por encima del 70% aparecen colas de espera de buques; por encima del 85% la terminal está saturada.",
    mueve: "No cambia importes. Es únicamente una alerta de la solapa Validación.",
  },

  // -------------------------------------------------------- fiscal general --
  tasaImpuestoGeneral: {
    que: "Tasa de Ganancias sin RIGI. Sirve para comparar los dos escenarios.",
    tipo: "Porcentaje sobre el resultado.",
    ejemplo: "35%, la alícuota societaria del régimen general en Argentina.",
    mueve: "Reduce el resultado después de impuestos y, con él, el flujo de fondos y el rendimiento.",
    termino: "Impuesto a las Ganancias",
  },
  vidaUtilDepreciacion: {
    que: "En cuántos años se reparte el costo de la inversión como gasto.",
    tipo: "Cantidad de años.",
    ejemplo: "30 años. Obra civil portuaria: 20 a 50 años; equipos de movimiento: 10 a 15.",
    mueve: "Más años, menos depreciación por año: mayor base imponible y mayor impuesto en los primeros ejercicios.",
    termino: "Depreciación o amortización",
  },
  tasasEnFCFF: {
    que: "Si el DREI, la tasa de edificación y el impuesto al cheque restan de la caja o solo se informan.",
    tipo: "Sí / No.",
    ejemplo: "Sí, el criterio recomendado: son erogaciones efectivas. No reproduce el tratamiento de la planilla anterior.",
    mueve: "Ponerlo en No mejora artificialmente el rendimiento: el proyecto aparenta un retorno superior al real.",
  },

  // ------------------------------------------------------- financiamiento --
  montoDeudaMM: {
    que: "Cuánto se pide prestado para financiar la obra.",
    tipo: "Millones de dólares.",
    ejemplo: "0 en el escenario base: el proyecto se evalúa financiado íntegramente con capital propio.",
    mueve: "En 0 no se calculan ni el rendimiento del accionista ni la cobertura del servicio de deuda (DSCR).",
  },
  tasaDeuda: {
    que: "Interés anual del préstamo.",
    tipo: "Porcentaje anual, en dólares.",
    ejemplo: "8% anual para financiamiento de infraestructura en dólares.",
    mueve: "Una tasa mayor eleva los intereses, reduce el flujo para los accionistas y deteriora la capacidad de repago.",
  },
  plazoDeuda: {
    que: "En cuántos años se devuelve el préstamo, en cuotas iguales de capital.",
    tipo: "Cantidad de años.",
    ejemplo: "10 años. En infraestructura suele ir de 7 a 15.",
    mueve: "Un plazo más corto eleva el servicio anual y reduce el margen entre lo que genera el proyecto y lo que debe afrontar.",
  },

  // --------------------------------------------------------------- RIGI ----
  rigiActivo: {
    que: "Activa el régimen promocional de grandes inversiones (Ley 27.742).",
    tipo: "Sí / No.",
    ejemplo: "Sí en el escenario base. Corresponde correr los dos y comparar las TIR.",
    mueve: "Es el parámetro de mayor incidencia del modelo: la diferencia de rendimiento entre activado y desactivado cuantifica el valor del régimen para este proyecto.",
    termino: "RIGI, Ley 27.742",
  },
  rigiAnioInicio: {
    que: "Desde qué año corren los beneficios del RIGI.",
    tipo: "Año, cuatro dígitos.",
    ejemplo: "2027, habitualmente el año de aprobación del proyecto en el régimen.",
    mueve: "Desplaza toda la ventana de beneficios. Un año de atraso puede excluir un ejercicio de exención.",
  },
  rigiTasaImpuesto: {
    que: "Tasa de Ganancias con RIGI.",
    tipo: "Porcentaje sobre el resultado.",
    ejemplo: "25%, contra 35% del régimen general: 10 puntos menos sobre todo el resultado.",
    mueve: "La diferencia respecto de la alícuota general se traduce directamente en mayor flujo en todos los ejercicios con resultado positivo.",
  },
  rigiAmortAcelerada: {
    que: "Permite depreciar más rápido que la vida útil física, usando el porcentaje de vida útil acelerada.",
    tipo: "Sí / No.",
    ejemplo: "Sí. Es el beneficio del art. 183 b) de la ley.",
    mueve: "No modifica el impuesto total de toda la vida del proyecto, pero lo difiere, y eso mejora el rendimiento.",
  },
  rigiPctVidaUtil: {
    que: "Parte de la vida útil normal que se usa con el beneficio.",
    tipo: "Porcentaje de la vida útil.",
    ejemplo: "60% de 30 años = 18 años de depreciación.",
    mueve: "Cuanto menor es el porcentaje, antes se aprovecha el escudo fiscal y mejor resulta el rendimiento.",
  },
  rigiIIBBAnios: {
    que: "Cuántos años no se paga Ingresos Brutos provincial.",
    tipo: "Cantidad de años desde el inicio de beneficios.",
    ejemplo: "10 años, el plazo del régimen en Santa Fe.",
    mueve: "Se expone únicamente como ahorro: es un concepto que no se eroga, no un ingreso.",
    termino: "Ingresos Brutos (IIBB)",
  },
  rigiIIBBPct: {
    que: "Tasa de Ingresos Brutos que se ahorra.",
    tipo: "Porcentaje de los ingresos.",
    ejemplo: "5% sobre 24 millones de facturación = 1,2 millones anuales que no se erogan.",
    mueve: "Solo informa el ahorro; no suma a la caja ni afecta el flujo de fondos.",
  },
  rigiMunicipalAnios: {
    que: "Cuántos años no se paga la tasa municipal de Timbúes (DREI).",
    tipo: "Cantidad de años desde el inicio de beneficios.",
    ejemplo: "10 años.",
    mueve: "Finalizada la exención, el DREI se eroga en todos los ejercicios siguientes.",
  },
  rigiMunicipalPorMil: {
    que: "Tasa municipal sobre la facturación al terminar la exención.",
    tipo: "Por mil (‰) de los ingresos.",
    ejemplo: "5,5 ‰ = 0,55%. Sobre 24 millones son unos 132 mil dólares por año.",
    mueve: "Se eroga en todos los ejercicios posteriores a la exención.",
    termino: "DREI (Derecho de Registro e Inspección)",
  },
  rigiDebCredActivo: {
    que: "Permite descontar el impuesto al cheque del Impuesto a las Ganancias.",
    tipo: "Sí / No.",
    ejemplo: "Sí. Es un beneficio del régimen; el cómputo nunca puede exceder el impuesto determinado del ejercicio.",
    mueve: "Reduce el impuesto a abonar, con tope en el propio impuesto del ejercicio.",
  },
  rigiDebCredPct: {
    que: "Tasa para estimar el impuesto al cheque que se descuenta de Ganancias.",
    tipo: "Porcentaje de los ingresos.",
    ejemplo: "1,2%, que es 0,6% al debitar más 0,6% al acreditar.",
    mueve: "Reduce el impuesto neto del ejercicio, con tope en el impuesto determinado.",
  },
  rigiCertivaActivo: {
    que: "Informa el IVA de las obras, que se recupera como crédito fiscal.",
    tipo: "Sí / No.",
    ejemplo: "Sí. Una compra de 100 millones contiene 21 millones de IVA, que luego se recuperan.",
    mueve: "Es informativo: no sale de caja ni afecta el flujo de fondos. Sirve para dimensionar el capital de trabajo mientras se recupera el crédito.",
    termino: "CERTIVA",
  },

  // --------------------------------------------------- otros tributos -----
  idycbAlicuota: {
    que: "Impuesto a los débitos y créditos bancarios: 0,6% al debitar más 0,6% al acreditar. Se calcula sobre el CAPEX.",
    tipo: "Porcentaje de los movimientos bancarios.",
    ejemplo: "1,2%. Un movimiento de 34 millones genera unos 408 mil dólares de impuesto al cheque.",
    mueve: "Se eroga en los ejercicios de mayor inversión, cuando se concentran los movimientos.",
    termino: "IDyCB, impuesto al cheque",
  },
  idycbPrescripcion: {
    que: "Plazo para usar lo pagado de impuesto al cheque como crédito contra Ganancias.",
    tipo: "Cantidad de años.",
    ejemplo: "5 años.",
    mueve: "Limita el crédito recuperable contra el impuesto a las ganancias.",
  },
  dreiTipoCambio: {
    que: "Dólar oficial al 30/04 para pasar el mínimo del DREI a dólares.",
    tipo: "Pesos por dólar (ARS/USD).",
    ejemplo: "Viene en 0: FALTA COMPLETAR con la cotización oficial, a confirmar con la Municipalidad de Timbúes.",
    mueve: "Sin este dato el DREI se determina solo por alícuota y queda subestimado.",
  },
  dreiMinimoMensualARS: {
    que: "Mínimo mensual de la tasa municipal de comercio, cualquiera sea la facturación.",
    tipo: "Pesos por mes (ARS/mes).",
    ejemplo: "Viene en 0: FALTA COMPLETAR. El municipio percibe el mayor importe entre el mínimo y la alícuota.",
    mueve: "En los ejercicios de baja facturación, este mínimo es el importe que efectivamente se abona.",
  },
  tasaEdifPrimeros5: {
    que: "Tasa municipal sobre las obras del año, en los primeros 5 años.",
    tipo: "Por mil (‰) del CAPEX del ejercicio.",
    ejemplo: "3 ‰ = 0,3%. Sobre una obra de 34 millones son unos 103 mil dólares.",
    mueve: "Se eroga junto con la inversión.",
  },
  tasaEdifPost5: {
    que: "Tasa municipal sobre las obras del año, desde el sexto año.",
    tipo: "Por mil (‰) del CAPEX del ejercicio.",
    ejemplo: "5 ‰ = 0,5%, aplicable a las ampliaciones posteriores.",
    mueve: "Se eroga junto con las inversiones de los ejercicios posteriores.",
  },

  // --------------------------------------------------------- transacción --
  structuringFeeUSD: {
    que: "Honorario por estructurar el proyecto: lo cobra un socio y lo pagan los demás.",
    tipo: "Dólares, por única vez.",
    ejemplo: "10 millones: los cobra TyS y los desembolsan los otros tres socios en partes iguales.",
    mueve: "No modifica el rendimiento del proyecto, solo su distribución entre los socios.",
    termino: "Structuring fee",
  },
  anioCobroFee: {
    que: "Año en que se cobra el fee.",
    tipo: "Año dentro del horizonte.",
    ejemplo: "2025, el año base.",
    mueve: "Cuanto antes se perciba, mayor es su incidencia en el rendimiento de quien lo cobra.",
  },
  costoEstructuracionARS: {
    que: "Lo que cuesta tramitar el RIGI. Se descuenta del fee de quien lo cobra.",
    tipo: "Pesos (ARS), por única vez.",
    ejemplo: "Viene en 0: se completa con el presupuesto del asesor que arma la presentación.",
    mueve: "Reduce la comisión neta del socio que la percibe.",
  },
  tipoCambioPromedio: {
    que: "Tipo de cambio para pasar a dólares el costo de estructuración del RIGI.",
    tipo: "Pesos por dólar (ARS/USD).",
    ejemplo: "Viene en 0: se completa con el promedio esperado del año de la gestión.",
    mueve: "Modifica el valor en dólares del costo de estructuración.",
  },

  // ---------------------------------------------- unidad: identidad ------
  metodoTarifa: {
    que: "Cómo se determina la facturación: por flujos comerciales, cada uno con sus cinco tarifas, o por tarifa escalonada según el volumen.",
    tipo: "Una de las dos opciones.",
    ejemplo: "Agrograneles usa tarifa escalonada; fertilizantes y cargas generales usan la grilla de flujos.",
    mueve: "Cambia por completo el origen de las toneladas y la tarifa por tonelada de esta unidad.",
  },
  anioInicioOp: {
    que: "Año en que la unidad empieza a facturar. Antes no tiene toneladas ni costos operativos.",
    tipo: "Año dentro del horizonte.",
    ejemplo: "2027 para agrograneles, 2028 para fertilizantes y cargas generales.",
    mueve: "Anticipar el inicio anticipa todo el flujo positivo y mejora sensiblemente el rendimiento.",
  },
  capacidadMax: {
    que: "Lo máximo que las instalaciones pueden mover en un año. Si la demanda la supera, se factura hasta acá.",
    tipo: "Toneladas por año. En 0 no se aplica tope.",
    ejemplo: "6.000.000 tn en agrograneles, 1.000.000 en fertilizantes y líquidos, 500.000 en cargas generales.",
    mueve: "Limita las toneladas por encima del tope y, con ellas, la facturación.",
  },
  takeOrPay: {
    que: "Toneladas que el cliente paga por contrato aunque no las mande.",
    tipo: "Toneladas por año. Hoy solo opera con el método de tarifa escalonada.",
    ejemplo: "500.000 tn comprometidas: si el cliente despacha 400.000, se facturan 500.000.",
    mueve: "Constituye un piso de ingresos, que es lo que evalúa una entidad financiera para otorgar crédito.",
    termino: "Take-or-pay",
  },

  // -------------------------------------------- unidad: inversión y costos --
  capexNoDepreciable: {
    que: "Parte de la inversión que no se deprecia, como el terreno.",
    tipo: "Millones de dólares.",
    ejemplo: "Si de 80 millones de inversión 6 son terreno, se cargan 6.",
    mueve: "Se eroga pero no genera escudo fiscal: no reduce el impuesto.",
  },
  opexFijoMM: {
    que: "Costo de tener la unidad funcionando, se mueva mucho o poco: dotación, mantenimiento, energía base.",
    tipo: "Millones de dólares por año.",
    ejemplo: "4 MM/año en fertilizantes y líquidos, 2 en cargas generales.",
    mueve: "Se deduce en todos los ejercicios desde el inicio de la operación y define el volumen necesario para alcanzar el punto de equilibrio.",
    termino: "OPEX fijo",
  },
  opexInicialMM: {
    que: "Gastos de puesta en marcha: pruebas, habilitaciones, conformación del primer equipo.",
    tipo: "Millones de dólares, por única vez.",
    ejemplo: "1,5 MM en agrograneles, 0,5 en fertilizantes, 0,3 en cargas generales.",
    mueve: "Se suman solo en el año de inicio de la unidad.",
  },
  opexVariable: {
    que: "Costo de mover cada tonelada: energía, combustible, personal por turno, insumos.",
    tipo: "Dólares por tonelada.",
    ejemplo: "1,58 USD/tn en agrograneles, 2,50 en fertilizantes, 2,00 en cargas generales.",
    mueve: "Crece con el volumen operado. Junto con la tarifa define el margen de cada tonelada.",
    termino: "OPEX variable",
  },
  otrosIngresos: {
    que: "Cobro extra por tonelada que no entra en los cinco rubros de tarifa: pesaje, análisis de calidad, servicios a buques.",
    tipo: "Dólares por tonelada.",
    ejemplo: "0,50 USD/tn en agrograneles.",
    mueve: "Se adiciona directamente a la facturación de esta unidad.",
  },

  // ------------------------------------------------------- unidad: canon --
  canonFijoActivo: {
    que: "Si corresponde abonar un monto fijo por año al titular del terreno o de la concesión.",
    tipo: "Sí / No.",
    ejemplo: "No en el escenario base, hasta definir el esquema con el concedente.",
    mueve: "Se deduce del resultado operativo en todos los ejercicios, se opere o no carga.",
    termino: "Canon de concesión fijo",
  },
  canonFijoMM: {
    que: "El importe de ese canon fijo anual.",
    tipo: "Millones de dólares por año.",
    ejemplo: "1,5 MM/año por el derecho a operar en el predio.",
    mueve: "Reduce el resultado operativo aun con la unidad inactiva.",
  },
  canonVariableActivo: {
    que: "Si además corresponde abonar un canon por cada tonelada movida.",
    tipo: "Sí / No.",
    ejemplo: "No en el escenario base. Es la modalidad habitual de participación del concedente.",
    mueve: "Se deduce del resultado operativo en proporción al volumen.",
    termino: "Canon variable",
  },
  canonVariable: {
    que: "Canon por cada tonelada operada en la terminal.",
    tipo: "Dólares por tonelada.",
    ejemplo: "0,30 USD/tn sobre 3 millones de toneladas = 900 mil dólares por año.",
    mueve: "Reduce el margen unitario por tonelada.",
  },
  canonPctActivo: {
    que: "Si además corresponde abonar un porcentaje de lo que factura la unidad.",
    tipo: "Sí / No.",
    ejemplo: "No en el escenario base. Es otra modalidad, atada al ingreso en lugar del volumen.",
    mueve: "Se deduce del resultado operativo como porcentaje de la facturación.",
    termino: "Canon sobre facturación",
  },
  canonPct: {
    que: "Canon como porcentaje de lo que factura la unidad.",
    tipo: "Porcentaje de la facturación bruta.",
    ejemplo: "2% sobre 50 millones facturados = 1 millón de canon.",
    mueve: "Reduce el resultado operativo en proporción a la facturación.",
  },

  // ------------------------------------------------- unidad: ocupación ----
  parcelaMedia: {
    que: "Toneladas que carga o descarga en promedio cada barco.",
    tipo: "Toneladas por recalada.",
    ejemplo: "27.000 tn en agrograneles, 20.000 en fertilizantes, 15.000 en cargas generales. Un Panamax de granos ronda las 45.000 a 60.000.",
    mueve: "Más chica, más barcos para el mismo volumen y más ocupación de muelle.",
    termino: "Parcela media por recalada",
  },
  rendimientoDia: {
    que: "Toneladas por día cuando se trabaja sin parar.",
    tipo: "Toneladas por día.",
    ejemplo: "20.000 tn/día en agrograneles con cinta, 8.000 en fertilizantes, 5.000 en cargas generales.",
    mueve: "Más rendimiento, menos días de barco amarrado y menor ocupación. Es la variable que justifica la inversión en equipamiento.",
  },
  tiempoNoOperativo: {
    que: "Parte del tiempo amarrado sin mover carga: lluvia, cambio de bodega, roturas.",
    tipo: "Porcentaje sobre el tiempo de operación.",
    ejemplo: "15% en agrograneles, 20% en fertilizantes. Referencia de la industria: 15 a 20%.",
    mueve: "Extiende la estadía de cada buque y eleva la ocupación del muelle.",
  },
  diasFijosRecalada: {
    que: "Días que el barco ocupa aunque no mueva carga: amarrar, papeles, inspección y zarpar.",
    tipo: "Días por recalada.",
    ejemplo: "0,5 días en las tres unidades. Habitualmente entre 0,5 y 1,5.",
    mueve: "Adiciona tiempo de muelle por cada recalada, cualquiera sea el volumen operado.",
  },

  // ----------------------------------------- unidad: proyección de volumen --
  volumenObjetivo: {
    que: "Toneladas con que arranca la unidad. Aplica con el método de tarifa escalonada.",
    tipo: "Toneladas por año.",
    ejemplo: "300.000 tn en agrograneles.",
    mueve: "Define la facturación de los primeros ejercicios de esta unidad.",
  },
  incrementoAnual: {
    que: "Toneladas fijas que se suman cada año. No es un porcentaje.",
    tipo: "Toneladas por año, en valor absoluto.",
    ejemplo: "300.000 tn por año en agrograneles.",
    mueve: "Define la pendiente del crecimiento. Es uno de los supuestos de mayor sensibilidad del modelo.",
  },
  anioInicioIncremento: {
    que: "Desde qué año empieza a crecer el volumen.",
    tipo: "Año dentro del horizonte.",
    ejemplo: "2033 en agrograneles, después de la curva de volúmenes cargada a mano.",
    mueve: "Postergarlo aplana la curva de toneladas de los primeros ejercicios.",
  },
  topeVolumen: {
    que: "Techo de la curva de crecimiento.",
    tipo: "Toneladas por año. En 0 no se aplica techo.",
    ejemplo: "3.000.000 tn en agrograneles.",
    mueve: "A partir de ese nivel las toneladas dejan de crecer.",
  },
  volumenDuenio: {
    que: "Hasta cuántas toneladas opera el titular con tarifa escalonada. En 0, todo se factura a tarifa base porque opera un tercero.",
    tipo: "Toneladas por año.",
    ejemplo: "2.500.000 tn en agrograneles: hasta ahí rigen las tarifas por tramo y el excedente vuelve a tarifa base.",
    mueve: "Determina qué parte del volumen se valoriza por tramos y qué parte a tarifa base.",
  },
  limiteTramo: {
    que: "Dónde termina cada escalón de tarifa. Cada escalón cobra solo las toneladas que caen en él.",
    tipo: "Toneladas por año. Los tramos se ordenan de menor a mayor.",
    ejemplo: "Tramo 1 hasta 1.500.000 tn, tramo 2 hasta 2.250.000, tramo 3 hasta 3.000.000.",
    mueve: "Superar un tramo reduce la tarifa unitaria y aplana la facturación por unidad de volumen.",
  },
  metodoCalada: {
    que: "Cómo se factura la calada: como tarifa escalonada o como porcentaje del valor de la carga.",
    tipo: "Una de las dos opciones.",
    ejemplo: "Agrograneles la cobra como porcentaje del valor de la carga.",
    mueve: "Modifica el ingreso por calada de esta unidad.",
    termino: "Calada",
  },
  caladaPct: {
    que: "Porcentaje del valor de la carga que se factura por la calada. Solo con el método de calada sobre valor.",
    tipo: "Porcentaje del valor de la mercadería.",
    ejemplo: "1,2% de 233 USD/tn = 2,80 USD/tn.",
    mueve: "Junto con el valor de la carga define el ingreso por calada.",
  },
  valorCarga: {
    que: "Precio de mercado de la mercadería. Solo con el método de calada sobre valor.",
    tipo: "Dólares por tonelada.",
    ejemplo: "233 USD/tn en agrograneles.",
    mueve: "Si sube, sube el ingreso por calada. No tiene efecto con el otro método.",
  },
  capexAnual: {
    que: "Inversión del año en activos propios de la unidad. Se carga en positivo.",
    tipo: "Millones de dólares por año.",
    ejemplo: "Agrograneles: 18,81 en 2025, 34,51 en 2026, 36,76 en 2027, 20,12 en 2028 y 5,5 en 2029.",
    mueve: "Se eroga en el ejercicio en que se carga y se deprecia en los siguientes. Es la variable de mayor incidencia en el rendimiento del proyecto.",
    termino: "CAPEX",
  },
  volumenManual: {
    que: "Toneladas cargadas a mano para ese año. Si es mayor a 0, reemplaza la curva de volumen.",
    tipo: "Toneladas. En 0 se aplica la proyección automática.",
    ejemplo: "Agrograneles arranca con 300.000 tn en 2027 y llega a 2.500.000 en 2031, cargado año por año.",
    mueve: "Reemplaza la proyección de ese ejercicio y desplaza el punto de partida del crecimiento posterior.",
  },
  opexVarOverride: {
    que: "Costo variable distinto para ese año. Si es mayor a 0, reemplaza al OPEX variable general.",
    tipo: "Dólares por tonelada. En 0 se aplica el costo general.",
    ejemplo: "Sirve para reflejar una curva de aprendizaje o un contrato de energía que cambia en el tiempo.",
    mueve: "Reemplaza el costo variable de ese ejercicio y, con él, el margen de cada tonelada operada.",
  },

  // ------------------------------------------- unidad: obras propias -------
  obraNombre: {
    que: "Qué obra o activo es: el muelle, un silo, una cinta, la balanza. Es el detalle de la inversión directa.",
    tipo: "Texto libre.",
    ejemplo: "«Silo 40.000 tn», con el nombre con que figura en el presupuesto de obra.",
    mueve: "Solo identifica el renglón. Lo que entra al modelo es el monto y el año.",
  },
  obraAnio: {
    que: "El ejercicio en que se desembolsa esta obra.",
    tipo: "Año dentro del horizonte.",
    ejemplo: "Una obra que se paga en tres años se carga como tres renglones, uno por año, con el importe de cada uno.",
    mueve: "Define en qué ejercicio sale el dinero y desde cuándo empieza a depreciarse.",
  },
  obraMonto: {
    que: "Cuánto se desembolsa por esta obra en ese ejercicio.",
    tipo: "Millones de dólares.",
    ejemplo: "18,81 MM por las obras de agrograneles de 2025.",
    mueve: "La suma de las obras del ejercicio es la inversión directa de ese año: se eroga entonces y se deprecia en los siguientes.",
  },

  // ----------------------------------------------------- costos comunes ---
  costoComunLinea: {
    que: "La denominación del costo compartido entre las tres unidades.",
    tipo: "Texto libre.",
    ejemplo: "«Dragado de mantenimiento», «Vigilancia y subcontratos», «Seguros», «IT y sistemas».",
    mueve: "Solo identifica la línea de costo.",
  },
  costoComunDriver: {
    que: "El criterio de distribución de ese costo entre las unidades.",
    tipo: "Texto libre.",
    ejemplo: "«Tiempo de uso de muelle» para el dragado; «Toneladas» para la energía de áreas comunes; «% fijo» para la estructura.",
    mueve: "No interviene en el cálculo: documenta el criterio que sustenta los porcentajes de la línea.",
  },
  costoComunMonto: {
    que: "Costo anual de esta línea compartida por las tres unidades.",
    tipo: "Dólares por año.",
    ejemplo: "500.000 USD/año de dragado de mantenimiento; 125.000 de mantenimiento de muelle y amarres.",
    mueve: "Se distribuye según los porcentajes y se adiciona al costo operativo de cada unidad.",
  },
  pctUnidadComun: {
    que: "Parte del costo que paga cada unidad. Lo que depende del muelle se reparte por tiempo de uso, no por toneladas.",
    tipo: "Tanto por uno. Los tres deben totalizar 100%.",
    ejemplo: "El dragado se reparte 60% agrograneles, 20% fertilizantes y líquidos, 20% cargas generales.",
    mueve: "Se suma al costo operativo de esa unidad y reduce su resultado operativo.",
  },
  sumaLineaComun: {
    que: "El total de los tres porcentajes de la línea.",
    tipo: "Porcentaje. Celda calculada: no se carga.",
    ejemplo: "100%. Si da 95%, hay un 5% del costo sin asignar.",
    mueve: "Si no da 100%, parte del costo no queda absorbido por ninguna unidad y el consolidado subestima el costo operativo.",
  },
  asignacionCapexComun: {
    que: "Parte de las obras compartidas (muelle, dragado inicial, accesos) que le corresponde a cada unidad.",
    tipo: "Tanto por uno. Deben totalizar 100%.",
    ejemplo: "50% agrograneles, 25% fertilizantes y líquidos, 25% cargas generales.",
    mueve: "Define qué inversión y qué depreciación absorbe cada unidad y, con ello, su rentabilidad individual.",
  },

  // ------------------------------------------------- flujos comerciales ----
  flujoGate: {
    que: "Sentido de la carga: entra al puerto, sale del puerto, o pasa de un barco a otro.",
    tipo: "Una de tres opciones: Entra al puerto, Sale del puerto, Trasbordo.",
    ejemplo: "El fertilizante importado entra; el grano embarcado sale.",
    mueve: "Solo identifica: ordena la lectura y documenta qué operación es cada renglón.",
  },
  flujoCarga: {
    que: "El producto del flujo.",
    tipo: "Texto libre.",
    ejemplo: "«urea», «UAN», «soja», «acero», «mineral de hierro». Conviene el nombre del producto, no una categoría genérica.",
    mueve: "Solo identifica el renglón.",
  },
  flujoModo: {
    que: "En qué llega o se va la carga.",
    tipo: "Una de cuatro opciones: buque, barcaza, camión o trasbordo.",
    ejemplo: "El fertilizante importado llega en buque; el acopio interior llega en camión.",
    mueve: "Solo identifica. La ocupación de muelle se calcula con los parámetros de recalada de la unidad.",
  },
  flujoForma: {
    que: "En qué estado se manipula la mercadería.",
    tipo: "Una de tres opciones: sólido a granel, líquido o bultos sueltos (break bulk).",
    ejemplo: "El grano es sólido a granel; el UAN es líquido; el acero en bobinas son bultos sueltos.",
    mueve: "Solo identifica. El rendimiento de carga se carga en el bloque de ocupación de muelle.",
  },
  flujoAlmacenaje: {
    que: "Dónde se guarda la mercadería entre que llega y se despacha.",
    tipo: "Una de cinco opciones: galpón, plazoleta, tanque, elevador o directo a buque.",
    ejemplo: "El fertilizante sólido va a galpón; el UAN a tanque; «directo a buque» significa que no se almacena.",
    mueve: "Solo identifica. La tarifa de almacenaje se carga en su propia columna.",
  },
  flujoAnioInicio: {
    que: "Año en que arranca ese flujo.",
    tipo: "Año dentro del horizonte.",
    ejemplo: "2028 para los flujos de fertilizantes; 2029 para el trasbordo.",
    mueve: "Antes de ese ejercicio esta corriente no aporta toneladas ni facturación.",
  },
  flujoVolAnio1: {
    que: "Toneladas del primer año del flujo.",
    tipo: "Toneladas por año.",
    ejemplo: "700.000 tn de fertilizante sólido importado por buque a galpón.",
    mueve: "Es la base sobre la que se aplica el crecimiento y define el punto de partida de la facturación de esta corriente.",
  },
  flujoCrecimiento: {
    que: "Cuánto crece el volumen del flujo cada año, sobre el año anterior.",
    tipo: "Porcentaje anual, compuesto.",
    ejemplo: "20% anual. En 0 el volumen se mantiene constante.",
    mueve: "Es uno de los supuestos de mayor sensibilidad: un punto de crecimiento sostenido treinta años cambia sustancialmente el resultado.",
  },
  flujoTope: {
    que: "Volumen máximo del flujo. Al llegar, deja de crecer. No es una tarifa.",
    tipo: "Toneladas por año. En 0 no se aplica límite.",
    ejemplo: "1.500.000 tn de tope para el fertilizante importado.",
    mueve: "A partir de ese nivel las toneladas de esta corriente dejan de crecer.",
  },
  flujoTarifaMuelle: {
    que: "Uso de muelle: el tiempo que el barco ocupa el muelle, pasado a tonelada.",
    tipo: "Dólares por tonelada.",
    ejemplo: "0,666 USD/tn. Referencia de la zona: 0,37 USD por tonelada de registro del buque por día de estadía.",
    mueve: "Multiplicado por las toneladas, da la facturación por uso de muelle. Barcos más rápidos pagan menos por tonelada.",
  },
  flujoTarifaEstibaje: {
    que: "Sacar o poner la mercadería en el barco: grúas, almejas, bombas y cuadrillas.",
    tipo: "Dólares por tonelada.",
    ejemplo: "Sólido a granel ~12 USD/tn, líquido ~3 USD/tn.",
    mueve: "Multiplicado por las toneladas, da la facturación por carga y descarga. Es el rubro de mayor peso y el que más varía entre productos.",
  },
  flujoTarifaManipuleo: {
    que: "Mover la mercadería dentro del predio: recepción, traslados, carga de camiones.",
    tipo: "Dólares por tonelada.",
    ejemplo: "7 USD/tn en fertilizante a galpón.",
    mueve: "Multiplicado por las toneladas, da la facturación por manipuleo.",
  },
  flujoTarifaAlmacenaje: {
    que: "Guardar la mercadería: precio por mes por los meses que queda guardada.",
    tipo: "Dólares por tonelada.",
    ejemplo: "2,5 USD por mes con 3 rotaciones al año = 10 USD/tn. En las corrientes directas a buque es 0.",
    mueve: "Multiplicado por las toneladas, da la facturación por almacenaje.",
  },
  flujoTarifaCalada: {
    que: "Muestreo con calador y otros derechos menores sobre el buque.",
    tipo: "Dólares por tonelada.",
    ejemplo: "En fertilizantes y líquidos hoy es 0.",
    mueve: "Multiplicado por las toneladas, da la facturación por calada.",
  },

  // --------------------------------------------- tarifas por tramo ---------
  tarifaConcepto: {
    que: "Cada uno de los servicios que componen la tarifa por tonelada.",
    tipo: "Seis conceptos fijos, uno por fila.",
    ejemplo: "Embarque, descarga, calada, uso de muelle, habilitaciones, fumigación y transile. Se agrupan en los cinco rubros del flujo.",
    mueve: "La suma de los seis conceptos del tramo que corresponda es la tarifa aplicada a esa tonelada.",
  },
  tarifaTramoBase: {
    que: "Tarifa completa sin descuento. Se aplica a lo que no opera el titular y al excedente.",
    tipo: "Dólares por tonelada, por concepto.",
    ejemplo: "Es el precio de lista: rige para la carga de terceros.",
    mueve: "Define la facturación de toda la carga no comprendida en los tramos.",
  },
  tarifaTramo: {
    que: "Tarifa de cada escalón de volumen; baja a medida que sube el volumen operado por el titular.",
    tipo: "Dólares por tonelada, por concepto.",
    ejemplo: "Los límites de cada tramo se cargan en el bloque de proyección de volumen.",
    mueve: "Se aplica solo a las toneladas comprendidas en el tramo, de forma marginal: cada tramo se valoriza con su propia tarifa.",
  },

  // ------------------------------------------- detalle por ejercicio -------
  anioFila: {
    que: "El ejercicio al que corresponde el renglón.",
    tipo: "Año. Se genera a partir del año base y del horizonte.",
    ejemplo: "2025 a 2055 con los parámetros del escenario base.",
    mueve: "No se edita.",
  },
  calcToneladas: {
    que: "Las toneladas que efectivamente opera la unidad ese ejercicio.",
    tipo: "Toneladas. Celda calculada: no se carga.",
    ejemplo: "Es el resultado de la proyección después de aplicar la maduración y el límite de capacidad.",
    mueve: "Es la base de toda la facturación y del costo variable de la unidad.",
  },
  calcFacturacion: {
    que: "La facturación de la unidad en ese ejercicio.",
    tipo: "Dólares. Celda calculada: no se carga.",
    ejemplo: "Toneladas efectivas por la tarifa total: 3.000.000 tn a 8 USD/tn = 24 millones.",
    mueve: "Es el punto de partida del resultado operativo. Conviene controlarla contra lo que estima Comercial.",
  },
  calcResultadoOperativo: {
    que: "El resultado operativo (EBITDA) de la unidad en ese ejercicio.",
    tipo: "Dólares. Celda calculada: no se carga.",
    ejemplo: "Facturación 24 millones menos costo operativo 10 menos canon 1 = 13 millones.",
    mueve: "Es el indicador que evalúa una entidad financiera y la base del resultado consolidado.",
  },

  // ------------------------------------------------- tabla del resumen -----
  resumenNegocio: {
    que: "La unidad de negocio a la que corresponde el renglón.",
    tipo: "Nombre de la unidad. No se edita.",
    ejemplo: "Agrograneles, Fertilizantes y líquidos, Cargas generales y minerales.",
    mueve: "Nada: las tres se calculan con la misma estructura y se comparan con los mismos indicadores.",
  },
  resumenInversion: {
    que: "La inversión total que absorbe la unidad en todo el horizonte, incluida su parte de las obras compartidas.",
    tipo: "Millones de dólares. Celda calculada.",
    ejemplo: "Agrograneles concentra la mayor inversión del proyecto por el muelle y los silos.",
    mueve: "Es el capital sobre el que se mide el rendimiento individual de la unidad.",
  },
  resumenFacturacion: {
    que: "La facturación acumulada de la unidad en todo el horizonte.",
    tipo: "Millones de dólares. Celda calculada.",
    ejemplo: "Suma de los 31 ejercicios, sin descontar ningún concepto.",
    mueve: "Es el denominador del margen operativo.",
  },
  resumenResultado: {
    que: "El resultado operativo (EBITDA) acumulado de la unidad.",
    tipo: "Millones de dólares. Celda calculada.",
    ejemplo: "Suma de todos los ejercicios: cuánto excedente genera el negocio antes de la inversión y los impuestos.",
    mueve: "Junto con la inversión, explica el rendimiento individual de la unidad.",
  },
  resumenMargen: {
    que: "Qué porcentaje de la facturación queda como resultado operativo.",
    tipo: "Porcentaje. Celda calculada.",
    ejemplo: "EBITDA 13 sobre facturación 24 = 54% de margen.",
    mueve: "Permite comparar negocios de escala muy distinta. Un margen alto con inversión alta puede rendir menos que uno bajo con inversión baja: se lee junto con la TIR.",
  },
  resumenToneladas: {
    que: "Las toneladas acumuladas que opera la unidad en todo el horizonte.",
    tipo: "Toneladas. Celda calculada.",
    ejemplo: "Suma de las toneladas efectivas de los 31 ejercicios.",
    mueve: "Es el denominador de la tarifa media por tonelada.",
  },
  resumenTarifaMedia: {
    que: "Cuántos dólares factura la unidad por cada tonelada operada.",
    tipo: "Dólares por tonelada. Celda calculada.",
    ejemplo: "Agrograneles ronda los 8 USD/tn; fertilizantes y líquidos, unos 30.",
    mueve: "Junto con el costo por tonelada, define el margen unitario de cada negocio. Sirve para comparar contra el mercado.",
  },
  resumenOcupacion: {
    que: "La ocupación de muelle de la unidad en su ejercicio de mayor actividad.",
    tipo: "Porcentaje del año operativo. Celda calculada.",
    ejemplo: "La ocupación máxima consolidada del escenario base es 58,6%, contra un umbral de alerta de 70%.",
    mueve: "Si la suma de las tres unidades supera el umbral, el volumen proyectado no resulta físicamente absorbible.",
  },
  resumenTIR: {
    que: "El rendimiento de la unidad evaluada en forma independiente, con su inversión y sus costos.",
    tipo: "Porcentaje anual. Celda calculada.",
    ejemplo: "En el escenario base: agrograneles 11,95%, fertilizantes y líquidos 27,92%, cargas generales 21,46%.",
    mueve: "Es una referencia, no el criterio de decisión: lo que decide si conviene incorporar la unidad es su aporte a la TIR del proyecto.",
  },
  resumenAporte: {
    que: "Cuántos puntos de TIR suma o resta la unidad al proyecto completo.",
    tipo: "Puntos porcentuales. Celda calculada.",
    ejemplo: "En el escenario base: fertilizantes y líquidos aporta +3,45 puntos y agrograneles resta 10,56.",
    mueve: "Es el criterio correcto para decidir si conviene incorporar un negocio. Un aporte negativo indica que deteriora el rendimiento del conjunto, aunque su TIR individual sea positiva.",
  },

  // ---------------------------------------------------------- inversores --
  inversorNombre: {
    que: "El nombre del socio o del grupo inversor.",
    tipo: "Texto libre.",
    ejemplo: "TyS, AFA, AMAGI, Unión Agrícola.",
    mueve: "Solo identifica la fila. El reparto lo definen los porcentajes de cada unidad.",
  },
  participacionUnidad: {
    que: "Qué parte de la unidad tiene cada socio. Aporta y cobra en esa proporción, sin prelación: es el esquema pari passu.",
    tipo: "Tanto por uno: 0,55 es 55%. Los socios de cada unidad deben totalizar 100%.",
    ejemplo: "TyS 55% y los otros tres socios 15% cada uno, en las tres unidades.",
    mueve: "Define cuánto aporta y cuánto percibe ese socio del flujo de esa unidad.",
  },
  pctFeeRecibe: {
    que: "Qué parte del Structuring Fee cobra cada socio.",
    tipo: "Tanto por uno. Entre todos deben totalizar 100%.",
    ejemplo: "TyS cobra el 100% del fee en el escenario base.",
    mueve: "Mejora el rendimiento de quien lo percibe, sin alterar el del proyecto.",
  },
  pctFeeDesembolsa: {
    que: "Qué parte del Structuring Fee paga cada socio.",
    tipo: "Tanto por uno.",
    ejemplo: "AFA, AMAGI y Unión Agrícola desembolsan un tercio cada uno.",
    mueve: "Reduce el rendimiento de quien lo desembolsa, sin alterar el del proyecto.",
  },
  inversorAportes: {
    que: "Todo lo que este socio pone a lo largo del horizonte.",
    tipo: "Dólares. Celda calculada.",
    ejemplo: "Suma de los ejercicios con flujo negativo, más la comisión que desembolsa.",
    mueve: "Es el capital sobre el que se mide la TIR del socio.",
  },
  inversorDistribuciones: {
    que: "Todo lo que este socio recibe a lo largo del horizonte.",
    tipo: "Dólares. Celda calculada.",
    ejemplo: "Suma de los ejercicios con flujo positivo, más la comisión que percibe.",
    mueve: "Junto con los aportes y el momento de cada uno, define la TIR del socio.",
  },
};
