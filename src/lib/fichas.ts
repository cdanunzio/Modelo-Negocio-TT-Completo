import type { Ficha } from "@/components/editor/campos";

/**
 * Las fichas explicativas de cada campo, todas juntas.
 *
 * Están acá y no desparramadas por los paneles para que se puedan leer de
 * corrido, corregir en un solo lugar y reutilizar en el manual. El texto está
 * escrito para alguien que no trabaja en finanzas.
 */
export const FICHAS: Record<string, Ficha> = {
  // ------------------------------------------------ horizonte y calendario --
  anioBase: {
    que: "El primer año del modelo. Todo lo demás se cuenta a partir de acá.",
    paraQue: "Fija el punto de partida del flujo de fondos y de la primera columna de todas las tablas.",
    caracteristica: "Un año, cuatro dígitos. Suele ser el año en que empieza la obra, no el de la primera facturación.",
    impacta: "Corre el modelo entero en el tiempo: cambian los años de todas las columnas y la rampa de puesta en marcha.",
  },
  horizonte: {
    que: "Cuántos años se proyectan después del año base.",
    paraQue: "Define hasta dónde llega el análisis. Con 30, el modelo va del año base hasta 30 años más tarde.",
    caracteristica: "Un número entero de años. En concesiones portuarias se usa el plazo de la concesión, típicamente 25 a 30 años.",
    impacta: "Un horizonte más largo suma años de flujo positivo y mejora el rendimiento. Alargarlo sin respaldo contractual infla el resultado.",
  },
  anioInicioOpProyecto: {
    que: "El año en que el puerto empieza a operar como proyecto.",
    paraQue: "Es una referencia general para la lectura del modelo.",
    caracteristica: "Un año. Cada negocio tiene además su propio año de arranque, que es el que manda en el cálculo.",
    impacta: "No cambia números por sí solo: los años que mandan son los de cada unidad de negocio.",
  },

  // ---------------------------------------------------------- operación ----
  diasOperativos: {
    que: "Cuántos días al año se puede operar realmente.",
    paraQue: "Es el denominador de la ocupación del muelle: sobre cuántos días se reparte el trabajo del año.",
    caracteristica: "365 menos domingos, feriados, bajantes y días perdidos por lluvia o viento. En el Paraná suele quedar entre 300 y 330.",
    impacta: "Menos días operativos concentran el mismo tonelaje en menos tiempo y suben la ocupación del muelle.",
  },
  sitiosAtraque: {
    que: "Cuántos buques pueden estar operando al mismo tiempo.",
    paraQue: "Determina la capacidad física del puerto para atender barcos.",
    caracteristica: "Un número entero. Con dos sitios, el mismo tráfico ocupa la mitad del tiempo de muelle.",
    impacta: "Divide la ocupación. Es la variable que decide si hay que construir más muelle o rechazar carga.",
  },
  umbralOcupacion: {
    que: "A partir de qué nivel de ocupación el modelo enciende una alarma.",
    paraQue: "Avisar cuando el volumen prometido empieza a no entrar físicamente.",
    caracteristica: "Un porcentaje. Por encima del 70% ya aparecen colas y esperas de buques; por encima del 85% el puerto está saturado.",
    impacta: "No mueve ningún resultado económico. Es solo una alarma de la solapa Validación.",
  },

  // -------------------------------------------------------- fiscal general --
  tasaImpuestoGeneral: {
    que: "El porcentaje de la ganancia que se lleva el impuesto en el régimen común.",
    paraQue: "Se aplica cuando el RIGI está apagado, y sirve de referencia para medir cuánto vale el beneficio del régimen.",
    caracteristica: "Un porcentaje. En Argentina la escala del impuesto a las ganancias societario llega al 35%.",
    impacta: "Baja la ganancia después de impuestos y, con ella, el flujo de fondos y el rendimiento.",
    termino: "Impuesto a las Ganancias",
  },
  vidaUtilDepreciacion: {
    que: "En cuántos años se va descontando contablemente lo invertido en obra y equipos.",
    paraQue: "La depreciación no es una salida de plata, pero reduce la ganancia sobre la que se paga impuesto.",
    caracteristica: "Años. Obra civil portuaria: 20 a 50 años. Equipos de movimiento: 10 a 15.",
    impacta: "Más años de vida útil significan menos descuento por año, más ganancia gravada y más impuesto en los primeros años.",
    termino: "Depreciación o amortización",
  },
  tasasEnFCFF: {
    que: "Si las tasas municipales y el impuesto al cheque se restan del flujo de caja o se muestran solo como dato.",
    paraQue: "Son plata que sale de la caja todos los años, así que lo correcto es incluirlas.",
    caracteristica: "Encendido es el criterio recomendado. Apagado replica cómo estaba armada la planilla anterior.",
    impacta: "Apagarlo mejora artificialmente el rendimiento: el proyecto parece rendir más de lo que rinde.",
  },

  // ------------------------------------------------------- financiamiento --
  montoDeudaMM: {
    que: "Cuánta plata se toma prestada para financiar la obra.",
    paraQue: "Separar lo que ponen los socios de lo que presta un banco.",
    caracteristica: "En millones de dólares. En 0, el proyecto se evalúa como si se financiara todo con capital propio.",
    impacta: "Habilita el cálculo del rendimiento del accionista y de la capacidad de pago de la deuda.",
  },
  tasaDeuda: {
    que: "El interés anual que cobra el banco.",
    paraQue: "Calcular los intereses de cada año.",
    caracteristica: "Porcentaje anual, en la misma moneda del modelo (dólares).",
    impacta: "Más tasa, más intereses, menos flujo para los socios y menos capacidad de pago.",
  },
  plazoDeuda: {
    que: "En cuántos años se devuelve el préstamo.",
    paraQue: "Determinar el tamaño de la cuota anual.",
    caracteristica: "Años. En infraestructura suele ir de 7 a 15.",
    impacta: "Plazo más corto, cuota más alta y menos margen entre lo que genera el proyecto y lo que hay que pagarle al banco.",
  },

  // --------------------------------------------------------------- RIGI ----
  rigiActivo: {
    que: "El interruptor del régimen promocional de grandes inversiones.",
    paraQue: "Comparar el proyecto con y sin los beneficios del régimen.",
    caracteristica: "Encendido aplica alícuota reducida, amortización acelerada y las exenciones cargadas más abajo.",
    impacta: "Es el cambio más grande del modelo. Conviene correrlo prendido y apagado: la diferencia de rendimiento es cuánto vale el régimen para este proyecto.",
    termino: "RIGI, Ley 27.742",
  },
  rigiAnioInicio: {
    que: "El año desde el cual corren los beneficios del régimen.",
    paraQue: "Ubicar en el tiempo las exenciones, que duran una cantidad fija de años.",
    caracteristica: "Un año. Normalmente el de la aprobación del proyecto en el régimen.",
    impacta: "Corre toda la ventana de beneficios. Un año más tarde puede dejar afuera un año de exención.",
  },
  rigiTasaImpuesto: {
    que: "La alícuota reducida del impuesto a las ganancias dentro del régimen.",
    paraQue: "Es el beneficio económico más importante del RIGI.",
    caracteristica: "Un porcentaje, menor que el del régimen general.",
    impacta: "La diferencia contra la tasa general se traduce directamente en más flujo todos los años rentables.",
  },
  rigiAmortAcelerada: {
    que: "Permite descontar la inversión en menos años de los que dura físicamente.",
    paraQue: "Adelantar el escudo fiscal: se paga menos impuesto al principio y más al final.",
    caracteristica: "Art. 183 b) de la ley. Se combina con el porcentaje de vida útil del campo siguiente.",
    impacta: "No cambia el impuesto total de toda la vida del proyecto, pero lo corre hacia adelante, y eso mejora el rendimiento.",
  },
  rigiPctVidaUtil: {
    que: "Qué porcentaje de la vida útil normal se usa para depreciar dentro del régimen.",
    paraQue: "Cuantificar la aceleración.",
    caracteristica: "Un porcentaje. 60% significa que una inversión de 30 años se descuenta en 18.",
    impacta: "Cuanto más bajo, más rápido el escudo fiscal y mejor el rendimiento.",
  },
  rigiIIBBAnios: {
    que: "Cuántos años dura la exención del impuesto provincial sobre la facturación.",
    paraQue: "Medir el ahorro provincial del régimen.",
    caracteristica: "Años contados desde el inicio de beneficios. Santa Fe.",
    impacta: "Solo se informa como ahorro: es plata que no se paga, no plata que entra.",
    termino: "Ingresos Brutos (IIBB)",
  },
  rigiIIBBPct: {
    que: "Qué alícuota se pagaría de Ingresos Brutos sin el régimen.",
    paraQue: "Poner número al ahorro de la exención.",
    caracteristica: "Un porcentaje sobre la facturación.",
    impacta: "No toca el flujo de fondos: alimenta el renglón informativo de ahorro.",
  },
  rigiMunicipalAnios: {
    que: "Cuántos años dura la exención de la tasa municipal de Timbúes.",
    paraQue: "Ubicar desde cuándo se empieza a pagar el DREI.",
    caracteristica: "Años desde el inicio de beneficios.",
    impacta: "Terminada la exención, el DREI empieza a salir de la caja todos los años.",
  },
  rigiMunicipalPorMil: {
    que: "La alícuota municipal sobre la facturación una vez terminada la exención.",
    paraQue: "Calcular el DREI a pagar.",
    caracteristica: "Expresada por mil, no por ciento. 4 por mil = 0,4%.",
    impacta: "Sale de la caja todos los años posteriores a la exención.",
    termino: "DREI (Derecho de Registro e Inspección)",
  },
  rigiDebCredActivo: {
    que: "Si el impuesto al cheque se puede tomar a cuenta del impuesto a las ganancias.",
    paraQue: "Evitar pagar dos veces por lo mismo.",
    caracteristica: "Beneficio del régimen. El cómputo nunca puede superar el impuesto determinado del año.",
    impacta: "Reduce el impuesto a pagar, con tope en el propio impuesto del año.",
  },
  rigiDebCredPct: {
    que: "Qué porcentaje del impuesto al cheque se puede computar a cuenta.",
    paraQue: "Cuantificar ese beneficio.",
    caracteristica: "Un porcentaje.",
    impacta: "Baja el impuesto neto del año, con tope en el impuesto determinado.",
  },
  rigiCertivaActivo: {
    que: "Si se informa el IVA de las inversiones como dato.",
    paraQue: "Dimensionar cuánto capital de trabajo hay que financiar mientras se recupera ese IVA.",
    caracteristica: "Es crédito fiscal, no un costo: se recupera.",
    impacta: "No afecta el flujo de fondos. Es un renglón informativo.",
    termino: "CERTIVA",
  },

  // --------------------------------------------------- otros tributos -----
  idycbAlicuota: {
    que: "El impuesto que se cobra sobre los movimientos de la cuenta bancaria.",
    paraQue: "Reflejar un costo real que muchos modelos se olvidan.",
    caracteristica: "0,6% al debitar más 0,6% al acreditar, Ley 25.413.",
    impacta: "Sale de la caja en los años de inversión fuerte, cuando hay más movimientos.",
    termino: "IDyCB, impuesto al cheque",
  },
  idycbPrescripcion: {
    que: "Cuántos años se puede seguir usando el crédito acumulado del impuesto al cheque.",
    paraQue: "Evitar computar créditos que ya vencieron.",
    caracteristica: "Años.",
    impacta: "Acota cuánto crédito se puede recuperar contra el impuesto a las ganancias.",
  },
  dreiTipoCambio: {
    que: "El tipo de cambio con el que se convierte a dólares el mínimo municipal.",
    paraQue: "El DREI mínimo está fijado en pesos y el modelo trabaja en dólares.",
    caracteristica: "Pesos por dólar. FALTA CONFIRMAR con la Municipalidad de Timbúes.",
    impacta: "Sin este dato el DREI se calcula solo por alícuota y queda subestimado.",
  },
  dreiMinimoMensualARS: {
    que: "El piso mensual de la tasa municipal, cualquiera sea la facturación.",
    paraQue: "El municipio cobra el mayor entre el mínimo y la alícuota sobre la facturación.",
    caracteristica: "En pesos por mes. Se anualiza y se pasa a dólares. FALTA CONFIRMAR.",
    impacta: "En los años de poca facturación, este mínimo es lo que efectivamente se paga.",
  },
  tasaEdifPrimeros5: {
    que: "La tasa municipal sobre la obra durante los primeros cinco años.",
    paraQue: "Costear los permisos y derechos de construcción.",
    caracteristica: "Por mil sobre el monto invertido.",
    impacta: "Sale de la caja junto con la inversión.",
  },
  tasaEdifPost5: {
    que: "La misma tasa de edificación, a partir del año 6.",
    paraQue: "Costear las ampliaciones posteriores.",
    caracteristica: "Por mil sobre el monto invertido.",
    impacta: "Sale de la caja junto con las inversiones tardías.",
  },

  // --------------------------------------------------------- transacción --
  structuringFeeUSD: {
    que: "La comisión por armar la operación y conseguir el financiamiento.",
    paraQue: "Repartirla entre los socios: unos la cobran y otros la desembolsan.",
    caracteristica: "En dólares, por única vez.",
    impacta: "No cambia el rendimiento del proyecto, solo cómo se reparte entre los socios.",
    termino: "Structuring fee",
  },
  anioCobroFee: {
    que: "En qué año se cobra y se paga esa comisión.",
    paraQue: "Ubicarla en el flujo de cada socio.",
    caracteristica: "Un año dentro del horizonte.",
    impacta: "Cuanto antes se cobre, más pesa en el rendimiento de quien la cobra.",
  },
  costoEstructuracionARS: {
    que: "Lo que cuesta armar la presentación del proyecto al régimen.",
    paraQue: "Descontarlo de la comisión de quien se hace cargo.",
    caracteristica: "En pesos. Se convierte con el tipo de cambio promedio.",
    impacta: "Reduce la comisión neta del socio que la cobra.",
  },
  tipoCambioPromedio: {
    que: "El tipo de cambio con el que se pasan a dólares los montos en pesos.",
    paraQue: "Todo el modelo trabaja en dólares.",
    caracteristica: "Pesos por dólar.",
    impacta: "Mueve el valor en dólares del costo de estructuración.",
  },

  // ---------------------------------------------- unidad: identidad ------
  metodoTarifa: {
    que: "Cómo se calcula lo que factura este negocio.",
    paraQue: "Hay dos formas de mirar el mismo ingreso.",
    caracteristica: "Por flujos comerciales: se carga cada carga con sus cinco tarifas. Por tarifa escalonada: un precio por tonelada que baja al superar ciertos volúmenes.",
    impacta: "Cambia por completo de dónde salen las toneladas y el precio por tonelada de esta unidad.",
  },
  anioInicioOp: {
    que: "El primer año en que este negocio factura.",
    paraQue: "Antes de ese año la unidad no genera toneladas ni ingresos, aunque ya esté invirtiendo.",
    caracteristica: "Un año dentro del horizonte.",
    impacta: "Adelantar el arranque adelanta todo el flujo positivo y mejora bastante el rendimiento.",
  },
  capacidadMax: {
    que: "El tope físico de toneladas que este negocio puede mover en un año.",
    paraQue: "Impedir que el modelo proyecte más carga de la que la instalación aguanta.",
    caracteristica: "Toneladas por año. En 0 no se aplica tope.",
    impacta: "Recorta las toneladas por encima del tope y, con ellas, la facturación.",
  },
  takeOrPay: {
    que: "El volumen mínimo que el cliente paga aunque no lo use.",
    paraQue: "Poner un piso al ingreso, que es lo que un banco mira para prestar.",
    caracteristica: "Toneladas por año. Tiene que estar respaldado por contrato firmado.",
    impacta: "Es un piso: si el volumen proyectado queda por debajo, igual se factura este mínimo.",
    termino: "Take-or-pay",
  },

  // -------------------------------------------- unidad: inversión y costos --
  capexNoDepreciable: {
    que: "Lo que se invierte pero no se desgasta, típicamente el terreno.",
    paraQue: "Separarlo de lo que sí se deprecia.",
    caracteristica: "En millones de dólares.",
    impacta: "Sale de la caja pero no genera escudo fiscal: no reduce el impuesto.",
  },
  opexFijoMM: {
    que: "Lo que cuesta tener el negocio abierto, mueva o no mueva carga.",
    paraQue: "Sueldos, seguros, mantenimiento, vigilancia, administración.",
    caracteristica: "En millones de dólares por año. Es el costo que no desaparece en un año malo.",
    impacta: "Se resta todos los años desde que arranca la operación y define cuánto volumen hace falta para no perder plata.",
    termino: "OPEX fijo",
  },
  opexInicialMM: {
    que: "El gasto de arranque: puesta en marcha, pruebas, habilitaciones, primer equipo.",
    paraQue: "No confundirlo con el costo anual ni con la inversión en obra.",
    caracteristica: "En millones de dólares, por única vez, en el año de inicio.",
    impacta: "Golpea una sola vez, en el primer año de operación.",
  },
  opexVariable: {
    que: "Lo que cuesta mover cada tonelada.",
    paraQue: "Energía, combustible, personal por turno, insumos, mantenimiento por uso.",
    caracteristica: "En dólares por tonelada.",
    impacta: "Crece con el volumen. Junto con la tarifa define el margen de cada tonelada.",
    termino: "OPEX variable",
  },
  otrosIngresos: {
    que: "Ingresos adicionales que acompañan a cada tonelada movida.",
    paraQue: "Servicios accesorios: pesaje, análisis de calidad, servicios a buques.",
    caracteristica: "En dólares por tonelada.",
    impacta: "Suma directamente a la facturación de esta unidad.",
  },

  // ------------------------------------------------------- unidad: canon --
  canonFijoActivo: {
    que: "Si hay un alquiler o canon fijo a pagar por usar las instalaciones.",
    paraQue: "Muchas terminales pagan un canon al concedente del predio.",
    caracteristica: "Encendido o apagado.",
    impacta: "Se resta de la ganancia operativa todos los años.",
  },
  canonFijoMM: {
    que: "Cuánto es ese canon fijo por año.",
    paraQue: "Costear el derecho de uso.",
    caracteristica: "En millones de dólares por año.",
    impacta: "Baja la ganancia operativa aunque no se mueva carga.",
  },
  canonVariableActivo: {
    que: "Si además se paga un canon por tonelada movida.",
    paraQue: "Es la forma habitual de que el concedente participe del negocio.",
    caracteristica: "Encendido o apagado.",
    impacta: "Se resta de la ganancia operativa en proporción al volumen.",
  },
  canonVariable: {
    que: "Cuánto se paga de canon por cada tonelada.",
    paraQue: "Costear el derecho de uso en función del movimiento.",
    caracteristica: "En dólares por tonelada.",
    impacta: "Reduce el margen de cada tonelada.",
  },
  canonPctActivo: {
    que: "Si se paga además un porcentaje de la facturación.",
    paraQue: "Otra modalidad de canon, atada al ingreso y no al volumen.",
    caracteristica: "Encendido o apagado.",
    impacta: "Se resta de la ganancia operativa como porcentaje de lo facturado.",
  },
  canonPct: {
    que: "Qué porcentaje de la facturación se paga de canon.",
    paraQue: "Cuantificar esa modalidad.",
    caracteristica: "Un porcentaje sobre la facturación bruta de la unidad.",
    impacta: "Reduce la ganancia operativa proporcionalmente a lo facturado.",
  },

  // ------------------------------------------------- unidad: ocupación ----
  parcelaMedia: {
    que: "Cuántas toneladas trae o se lleva un buque promedio.",
    paraQue: "Convertir toneladas del año en cantidad de barcos.",
    caracteristica: "Toneladas por recalada. Un Panamax de granos ronda las 45.000 a 60.000 toneladas.",
    impacta: "Parcelas más chicas significan más barcos para el mismo tonelaje, y más ocupación de muelle.",
    termino: "Parcela media por recalada",
  },
  rendimientoDia: {
    que: "Cuántas toneladas se cargan o descargan por día de operación.",
    paraQue: "Calcular cuántos días ocupa el muelle cada barco.",
    caracteristica: "Toneladas por día. Depende del equipamiento: una cinta de granos rinde mucho más que una grúa de bolsas.",
    impacta: "Más rendimiento libera el muelle antes y baja la ocupación. Es la variable que justifica invertir en equipamiento.",
  },
  tiempoNoOperativo: {
    que: "Qué porcentaje del tiempo de muelle se pierde sin operar.",
    paraQue: "Esperas, cambios de bodega, lluvia, paradas de turno, trámites.",
    caracteristica: "Un porcentaje sobre el tiempo de operación. En terminales reales suele estar entre 10% y 25%.",
    impacta: "Estira la estadía de cada barco y sube la ocupación del muelle.",
  },
  diasFijosRecalada: {
    que: "Los días que ocupa cada barco aunque no se cargue nada: amarre, inspecciones, zarpada.",
    paraQue: "Contar el tiempo de muelle que no depende del tonelaje.",
    caracteristica: "Días por recalada, habitualmente entre 0,5 y 1,5.",
    impacta: "Suma tiempo de muelle por cada barco, sin importar cuánto mueva.",
  },

  // ----------------------------------------- unidad: proyección de volumen --
  volumenObjetivo: {
    que: "El volumen anual del que se parte antes de empezar a crecer.",
    paraQue: "Punto de arranque de la proyección cuando se usa el método de tarifa escalonada.",
    caracteristica: "Toneladas por año.",
    impacta: "Define la facturación de los primeros años de este negocio.",
  },
  incrementoAnual: {
    que: "Cuántas toneladas más se suman cada año.",
    paraQue: "Proyectar la captación de carga año a año.",
    caracteristica: "Toneladas por año, en valor absoluto y no en porcentaje.",
    impacta: "Marca la pendiente del crecimiento. Es uno de los supuestos más sensibles del modelo.",
  },
  anioInicioIncremento: {
    que: "Desde qué año empieza a aplicarse ese crecimiento.",
    paraQue: "Dar tiempo de maduración antes de crecer.",
    caracteristica: "Un año dentro del horizonte.",
    impacta: "Retrasarlo achata la curva de toneladas de los primeros años.",
  },
  topeVolumen: {
    que: "El techo de la proyección de volumen.",
    paraQue: "Evitar que el crecimiento anual se extienda indefinidamente.",
    caracteristica: "Toneladas por año. En 0 no hay techo.",
    impacta: "A partir de ese nivel, las toneladas dejan de crecer.",
  },
  volumenDuenio: {
    que: "La parte del volumen que es carga propia de los dueños.",
    paraQue: "Distinguirla de la carga de terceros, que puede tener otra tarifa.",
    caracteristica: "Toneladas por año.",
    impacta: "Afecta cómo se aplica la tarifa escalonada.",
  },
  limiteTramo: {
    que: "El volumen a partir del cual cambia el precio por tonelada.",
    paraQue: "Las tarifas escalonadas bajan el precio a medida que sube el volumen contratado.",
    caracteristica: "Toneladas por año. Los tramos tienen que ir de menor a mayor.",
    impacta: "Superar un tramo baja el precio de la tonelada y achata la facturación por unidad de volumen.",
  },
  metodoCalada: {
    que: "Cómo se cobra el servicio de calado del buque.",
    paraQue: "Hay dos criterios en uso: por tonelada, o como porcentaje del valor de la carga.",
    caracteristica: "Se elige uno de los dos.",
    impacta: "Cambia el ingreso por calada de esta unidad.",
    termino: "Calada",
  },
  caladaPct: {
    que: "Qué porcentaje del valor de la carga se cobra por la calada.",
    paraQue: "Aplica cuando se cobra sobre valor y no por tonelada.",
    caracteristica: "Un porcentaje.",
    impacta: "Junto con el valor de la carga define el ingreso por calada.",
  },
  valorCarga: {
    que: "Cuánto vale una tonelada de la mercadería que se mueve.",
    paraQue: "Base para cobrar la calada como porcentaje del valor.",
    caracteristica: "En dólares por tonelada.",
    impacta: "Solo tiene efecto si la calada se cobra como porcentaje del valor.",
  },
  capexAnual: {
    que: "Cuánto se invierte en obra y equipos cada año.",
    paraQue: "Es la plata que hay que conseguir antes de que el negocio produzca.",
    caracteristica: "En millones de dólares, año por año. Conviene cargarla siguiendo el cronograma real de obra.",
    impacta: "Sale de la caja en el año en que se carga y se deprecia en los años siguientes. Es lo que más mueve el rendimiento del proyecto.",
    termino: "CAPEX",
  },
  volumenManual: {
    que: "Volumen cargado a mano para un año puntual, en lugar del proyectado.",
    paraQue: "Reflejar un contrato firmado o un dato conocido que no sigue la curva general.",
    caracteristica: "Toneladas. En 0 se usa la proyección automática. El crecimiento de los años siguientes arranca desde el último valor cargado a mano.",
    impacta: "Pisa la proyección de ese año y corre el punto de partida del crecimiento posterior.",
  },

  // ----------------------------------------------------- costos comunes ---
  costoComunLinea: {
    que: "El nombre del costo compartido entre los tres negocios.",
    paraQue: "Identificarlo: vigilancia, administración, seguros del predio, dragado.",
    caracteristica: "Texto libre, lo más específico posible.",
    impacta: "Solo identifica la línea.",
  },
  costoComunDriver: {
    que: "El criterio con el que se reparte ese costo entre los negocios.",
    paraQue: "Dejar por escrito por qué a cada uno le toca lo que le toca.",
    caracteristica: "Texto. Lo habitual es repartir por ocupación de muelle o por superficie usada, no por toneladas: una tonelada de fertilizante en bolsa ocupa mucho más que una de granos.",
    impacta: "No calcula nada por sí solo: documenta el criterio detrás de los porcentajes.",
  },
  costoComunMonto: {
    que: "Cuánto cuesta esa línea por año.",
    paraQue: "Es el total a repartir entre los tres negocios.",
    caracteristica: "En dólares por año.",
    impacta: "Se reparte según los porcentajes y se suma al costo operativo de cada unidad.",
  },
  asignacionCapexComun: {
    que: "Cómo se reparte entre los negocios la obra compartida.",
    paraQue: "El muelle, los accesos y la playa de camiones sirven a los tres.",
    caracteristica: "Porcentajes que tienen que sumar 100%.",
    impacta: "Define cuánta inversión y cuánta depreciación carga cada negocio, y con eso su rentabilidad individual.",
  },

  // ---------------------------------------------------------- inversores --
  participacionUnidad: {
    que: "Qué porcentaje de un negocio le pertenece a este socio.",
    paraQue: "Repartir tanto los aportes como las distribuciones de ese negocio.",
    caracteristica: "En tanto por uno: 0,55 es 55%. En 0, el socio no participa de ese negocio. Los socios de cada negocio tienen que sumar 100%.",
    impacta: "Define cuánto pone y cuánto cobra ese socio del flujo de ese negocio.",
  },
  pctFeeRecibe: {
    que: "Qué parte de la comisión de estructuración cobra este socio.",
    paraQue: "La comisión se reparte aparte de las participaciones.",
    caracteristica: "En tanto por uno. Entre todos los socios tiene que sumar 100%.",
    impacta: "Mejora el rendimiento de quien la cobra, sin cambiar el del proyecto.",
  },
  pctFeeDesembolsa: {
    que: "Qué parte de esa comisión paga este socio.",
    paraQue: "Alguien la cobra y alguien la paga.",
    caracteristica: "En tanto por uno.",
    impacta: "Baja el rendimiento de quien la desembolsa, sin cambiar el del proyecto.",
  },
};
