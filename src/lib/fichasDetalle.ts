/**
 * Explicación ampliada de cada campo, pensada para quien no es de finanzas.
 *
 * Se suma a la ficha de `fichas.ts` sin reemplazarla. Cada campo puede tener:
 *   - simple:  el dato contado con palabras de todos los días, con una comparación.
 *   - cuenta:  cómo entra en el cálculo, con números de ejemplo.
 *   - quien:   qué área conoce o define el dato.
 *   - cuidado: el error más común al cargarlo o al leerlo.
 *
 * Las claves son las mismas de FICHAS. Una clave que no exista en FICHAS se
 * ignora (y la detecta el control de `fichas.ts`).
 */
export interface DetalleFicha {
  simple?: string;
  cuenta?: string;
  quien?: string;
  cuidado?: string;
}

export const DETALLE: Record<string, DetalleFicha> = {
  // ------------------------------------------------ horizonte y calendario --
  anioBase: {
    simple: "Es el «día uno» del proyecto: el primer año en que se empieza a poner plata en la obra. Todo el calendario del modelo se cuenta a partir de acá.",
    cuenta: "Si el año base es 2025 y el horizonte 30 años, el modelo arma columnas de 2025 a 2055. Lo que se invierte en el año base no se descuenta al calcular el VAN, porque ya es «hoy».",
    quien: "Dirección del proyecto, según el cronograma de obra.",
    cuidado: "No es el año en que se empieza a facturar. Ese es el año de inicio de operación de cada unidad.",
  },
  horizonte: {
    simple: "Cuántos años hacia adelante se mira el negocio. Es como decidir si un alquiler se evalúa a 5 o a 30 años: cuanto más largo, más años de cobro entran en la cuenta.",
    cuenta: "Con 30 años de horizonte, el modelo suma los ingresos y gastos de 31 columnas (año 0 más 30).",
    quien: "Dirección y Legales, según el plazo de la concesión o del contrato de uso del predio.",
    cuidado: "Alargarlo más allá del contrato real hace que el proyecto parezca más rentable de lo que es.",
  },
  anioInicioOpProyecto: {
    simple: "El año en que el puerto empieza a trabajar con barcos y carga por primera vez.",
    quien: "Ingeniería y Operaciones, según cuándo termina la obra.",
    cuidado: "Es un dato de referencia. Lo que realmente prende cada negocio es el año de inicio que se carga dentro de cada unidad.",
  },

  // ---------------------------------------------------------- operación ----
  diasOperativos: {
    simple: "Cuántos días al año el muelle está disponible para trabajar. Es como los días hábiles de una oficina: no se cuentan los días en que no se puede operar.",
    cuenta: "365 días − 52 domingos − feriados − días de lluvia o viento fuerte ≈ 308 días.",
    quien: "Operaciones, con el historial de días perdidos por clima y el convenio laboral.",
    cuidado: "Si se cargan 365 días, el muelle parece tener mucha más capacidad de la real y la ocupación queda subestimada.",
  },
  sitiosAtraque: {
    simple: "Cuántos barcos pueden estar amarrados trabajando al mismo tiempo. Es como la cantidad de cajas abiertas en un supermercado: con más cajas, más clientes se atienden a la vez.",
    cuenta: "La ocupación se divide por esta cantidad. Si los barcos usan 462 días de muelle en el año y hay 3 sitios de 308 días cada uno (924 días-sitio), la ocupación es 462 ÷ 924 = 50%.",
    quien: "Ingeniería, según el diseño del muelle.",
    cuidado: "Un sitio que existe pero no tiene grúa o profundidad para ese tipo de barco no cuenta como capacidad real.",
  },
  umbralOcupacion: {
    simple: "Es la luz amarilla del tablero. Cuando el muelle está ocupado más de este porcentaje del tiempo, empiezan las colas de barcos esperando.",
    cuenta: "Si la ocupación calculada supera el 70%, la solapa Validación muestra una alerta.",
    quien: "Operaciones, según la experiencia en terminales similares.",
    cuidado: "Cambiarlo no mejora ni empeora ningún número: solo mueve el aviso. Subirlo para que desaparezca la alerta esconde un problema real.",
  },

  // -------------------------------------------------------- fiscal general --
  tasaImpuestoGeneral: {
    simple: "Qué parte de la ganancia se lleva el Estado si el proyecto no entra en el régimen especial RIGI. De cada 100 dólares ganados, se pagan 35.",
    cuenta: "Ganancia del año 10 millones × 35% = 3,5 millones de impuesto.",
    quien: "Impuestos / asesor impositivo.",
    cuidado: "Se paga sobre la ganancia, no sobre lo facturado. Si el año da pérdida, no se paga.",
  },
  vidaUtilDepreciacion: {
    simple: "En cuántos años se «reparte» lo que costó la obra. Es como pagar un auto en cuotas en los papeles: la plata salió toda junta, pero contablemente se reconoce un pedacito por año.",
    cuenta: "Obra de 30 millones ÷ 30 años = 1 millón por año de depreciación. Ese millón se resta de la ganancia antes de calcular el impuesto.",
    quien: "Contaduría / Impuestos, según el tipo de bien y la normativa.",
    cuidado: "La depreciación no es plata que sale: solo baja el impuesto. Por eso al final se vuelve a sumar en el flujo de caja.",
  },
  tasasEnFCFF: {
    simple: "Decide si las tasas municipales y el impuesto al cheque se restan de la plata disponible (como pasa en la realidad) o solo se muestran como información.",
    quien: "Finanzas.",
    cuidado: "Dejarlo en «No» hace que el proyecto parezca más rentable porque se ignoran pagos que sí se hacen.",
  },

  // ------------------------------------------------------- financiamiento --
  montoDeudaMM: {
    simple: "Cuánta plata se pide prestada al banco para construir. El resto lo ponen los socios.",
    cuenta: "Si la obra cuesta 100 millones y se piden 40, los socios ponen 60.",
    quien: "Finanzas, según la oferta de los bancos.",
    cuidado: "En 0 el modelo evalúa el proyecto como si los socios pusieran toda la plata, y no muestra los indicadores de deuda.",
  },
  tasaDeuda: {
    simple: "El interés que cobra el banco por año, como la tasa de un préstamo personal pero en dólares.",
    cuenta: "Deuda de 40 millones al 8% = 3,2 millones de interés el primer año. Baja a medida que se devuelve el capital.",
    quien: "Finanzas, con la propuesta del banco.",
    cuidado: "Es una tasa anual en dólares; no comparar con tasas en pesos.",
  },
  plazoDeuda: {
    simple: "En cuántos años se devuelve el préstamo. Más años, cuotas más chicas.",
    cuenta: "40 millones en 10 años = 4 millones de capital por año, más los intereses.",
    quien: "Finanzas, según lo que ofrezca el banco.",
    cuidado: "Un plazo corto puede hacer que en algún año la cuota sea más grande que lo que genera el puerto.",
  },

  // --------------------------------------------------------------- RIGI ----
  rigiActivo: {
    simple: "El RIGI es un régimen del Estado que da beneficios impositivos a las grandes inversiones: se paga menos impuesto y algunos impuestos provinciales y municipales no se pagan por varios años. Este interruptor lo prende o lo apaga.",
    cuenta: "Con RIGI la tasa de Ganancias baja de 35% a 25%, la obra se deprecia más rápido y hay 10 años sin Ingresos Brutos ni tasa municipal.",
    quien: "Dirección e Impuestos, según la aprobación del proyecto en el régimen.",
    cuidado: "Conviene mirar siempre los dos escenarios (con y sin RIGI): la diferencia entre ambos es lo que vale el beneficio.",
  },
  rigiAnioInicio: {
    simple: "Desde qué año el proyecto empieza a gozar de los beneficios del RIGI.",
    cuenta: "Si empieza en 2027 y la exención es de 10 años, cubre de 2027 a 2036.",
    quien: "Impuestos, según la fecha de aprobación del régimen.",
    cuidado: "Si se carga un año en que el puerto todavía no factura, parte de los años de exención se «pierden» sin aprovecharse.",
  },
  rigiTasaImpuesto: {
    simple: "Qué parte de la ganancia se paga de impuesto estando dentro del RIGI. De cada 100 dólares ganados, se pagan 25 en lugar de 35.",
    cuenta: "Ganancia de 10 millones: sin RIGI se pagan 3,5 millones; con RIGI, 2,5. La diferencia, 1 millón por año, queda en el proyecto.",
    quien: "Impuestos / asesor impositivo.",
  },
  rigiAmortAcelerada: {
    simple: "Permite «descontar» el costo de la obra en menos años de lo normal. No se paga menos impuesto en total, pero se paga más tarde, y tener la plata antes vale más.",
    cuenta: "Una obra de 30 millones con 30 años de vida descuenta 1 millón por año; con aceleración al 60%, la descuenta en 18 años: 1,67 millones por año.",
    quien: "Impuestos.",
  },
  rigiPctVidaUtil: {
    simple: "Qué tan rápido se descuenta la obra con el beneficio, como porcentaje de los años normales.",
    cuenta: "30 años × 60% = 18 años.",
    quien: "Impuestos, según lo que permite la ley.",
    cuidado: "Un número más bajo significa depreciar más rápido (más beneficio), no menos.",
  },
  rigiIIBBAnios: {
    simple: "Cuántos años el proyecto no paga Ingresos Brutos, el impuesto provincial que se cobra sobre todo lo que se factura.",
    quien: "Impuestos, según el convenio con la provincia de Santa Fe.",
    cuidado: "En el modelo aparece como un ahorro informativo: es plata que no se paga, no plata que entra.",
  },
  rigiIIBBPct: {
    simple: "El porcentaje de Ingresos Brutos que se pagaría sin el régimen. Sirve para medir cuánto se ahorra.",
    cuenta: "Facturación de 24 millones × 5% = 1,2 millones por año que no se pagan durante la exención.",
    quien: "Impuestos.",
  },
  rigiMunicipalAnios: {
    simple: "Cuántos años no se paga la tasa municipal de Timbúes (la que cobra el municipio por tener la actividad habilitada).",
    quien: "Impuestos, según el convenio con el municipio.",
    cuidado: "Cuando termina la exención, esa tasa pasa a ser un pago de todos los años.",
  },
  rigiMunicipalPorMil: {
    simple: "Lo que cobra el municipio sobre lo facturado cuando termina la exención. Se expresa «por mil»: 5,5 por mil son 5,50 dólares cada 1.000 facturados.",
    cuenta: "Facturación de 24 millones × 5,5 ‰ = 132.000 dólares por año.",
    quien: "Impuestos, según la ordenanza tributaria de Timbúes.",
    cuidado: "Es por mil, no por ciento: 5,5 ‰ equivale a 0,55%.",
  },
  rigiDebCredActivo: {
    simple: "Permite usar lo que se pagó de «impuesto al cheque» como parte de pago del Impuesto a las Ganancias.",
    cuenta: "Si se pagaron 300.000 de impuesto al cheque y el impuesto a las ganancias es 2 millones, se pagan 1,7 millones.",
    quien: "Impuestos.",
    cuidado: "Nunca puede descontarse más que el impuesto del año: si el año da pérdida, no hay de dónde descontar.",
  },
  rigiDebCredPct: {
    simple: "El porcentaje que se usa para estimar cuánto impuesto al cheque se va a poder descontar.",
    cuenta: "1,2% = 0,6% cuando sale plata de la cuenta + 0,6% cuando entra.",
    quien: "Impuestos.",
  },
  rigiCertivaActivo: {
    simple: "Muestra el IVA que se paga al comprar la obra y los equipos. Ese IVA después se recupera, así que no es un costo.",
    cuenta: "Compra de 100 millones + 21 millones de IVA. Los 21 se recuperan más adelante.",
    quien: "Impuestos.",
    cuidado: "Tratar el IVA como un costo es el error más común en evaluaciones de inversión: hace que un proyecto bueno parezca malo.",
  },

  // --------------------------------------------------- otros tributos -----
  idycbAlicuota: {
    simple: "El conocido «impuesto al cheque»: cada vez que entra o sale plata de una cuenta bancaria se paga un pequeño porcentaje.",
    cuenta: "Pagar 34 millones a un proveedor genera unos 408.000 dólares de impuesto (1,2%).",
    quien: "Impuestos.",
  },
  idycbPrescripcion: {
    simple: "El plazo máximo para usar lo pagado de impuesto al cheque como descuento de Ganancias. Pasado ese tiempo, se pierde.",
    quien: "Impuestos.",
  },
  dreiTipoCambio: {
    simple: "El valor del dólar que se usa para convertir a dólares el mínimo de la tasa municipal, que está en pesos.",
    cuenta: "Mínimo de 3.000.000 de pesos por mes × 12 ÷ 1.000 pesos por dólar = 36.000 dólares por año.",
    quien: "Finanzas / Impuestos, con la cotización oficial al 30 de abril.",
    cuidado: "Si queda en 0, el modelo ignora el mínimo y la tasa municipal queda más baja de lo real.",
  },
  dreiMinimoMensualARS: {
    simple: "Lo mínimo que cobra el municipio por mes, aunque se facture poco.",
    cuenta: "El municipio cobra el mayor entre este mínimo y el porcentaje sobre lo facturado.",
    quien: "Impuestos, según la ordenanza de Timbúes.",
    cuidado: "Falta completarlo. Pesa sobre todo en los primeros años, cuando la facturación es baja.",
  },
  tasaEdifPrimeros5: {
    simple: "Lo que cobra el municipio por construir, calculado sobre lo que se gasta en obra cada año.",
    cuenta: "Obra de 34 millones × 3 ‰ = 102.000 dólares.",
    quien: "Impuestos, según la ordenanza municipal.",
    cuidado: "Es por mil, no por ciento.",
  },
  tasaEdifPost5: {
    simple: "La misma tasa de construcción, pero para obras que se hagan a partir del sexto año (ampliaciones).",
    quien: "Impuestos, según la ordenanza municipal.",
    cuidado: "Es por mil, no por ciento.",
  },

  // --------------------------------------------------------- transacción --
  structuringFeeUSD: {
    simple: "Un honorario que cobra el socio que armó el negocio (buscó socios, armó el financiamiento, tramitó el RIGI). Lo pagan los otros socios.",
    cuenta: "10 millones: TyS los cobra y AFA, AMAGI y Unión Agrícola pagan un tercio cada uno.",
    quien: "Dirección, según el acuerdo entre socios.",
    cuidado: "No cambia la rentabilidad del proyecto: solo reparte plata entre los socios.",
  },
  anioCobroFee: {
    simple: "En qué año se cobra ese honorario.",
    quien: "Dirección, según el acuerdo entre socios.",
  },
  costoEstructuracionARS: {
    simple: "Lo que cuesta armar la presentación al RIGI (asesores, estudios, trámites). Se resta del honorario de quien lo cobra.",
    quien: "Impuestos / Legales, con el presupuesto del asesor.",
    cuidado: "Va en pesos; el modelo lo pasa a dólares con el tipo de cambio de abajo.",
  },
  tipoCambioPromedio: {
    simple: "El valor del dólar para convertir a dólares el costo de armar el RIGI.",
    quien: "Finanzas.",
    cuidado: "Si queda en 0, ese costo no se descuenta.",
  },

  // ---------------------------------------------- unidad: identidad ------
  metodoTarifa: {
    simple: "Elige cómo se calcula lo que factura este negocio. Opción «flujos»: se arma una lista de cada tipo de carga con su precio, como un menú. Opción «escalonada»: un único volumen con precios que bajan cuando se mueve más, como un descuento por cantidad.",
    cuenta: "Flujos: toneladas de cada carga × su tarifa, y se suman. Escalonada: las primeras toneladas pagan un precio, las siguientes uno más bajo, etc.",
    quien: "Comercial, según cómo se negocian los contratos de ese negocio.",
    cuidado: "Al cambiar de opción cambian de dónde salen las toneladas y los precios: revisar que la opción elegida tenga sus datos cargados.",
  },
  anioInicioOp: {
    simple: "El año en que este negocio empieza a trabajar y a facturar.",
    quien: "Ingeniería y Comercial, según el fin de obra y los primeros contratos.",
    cuidado: "Un año de atraso corre todos los ingresos un año, pero las inversiones ya se hicieron: baja mucho la rentabilidad.",
  },
  capacidadMax: {
    simple: "Lo máximo que las instalaciones de este negocio pueden mover en un año, aunque haya más clientes. Es el «techo físico».",
    cuenta: "Si la demanda proyectada es 2.500.000 tn y la capacidad 2.000.000, se facturan 2.000.000.",
    quien: "Ingeniería y Operaciones.",
    cuidado: "Si se carga 0, el modelo no pone techo y podría suponer volúmenes que las instalaciones no pueden mover.",
  },
  takeOrPay: {
    simple: "Un volumen que el cliente se compromete a pagar aunque no lo use. Es como un abono: se paga igual aunque no se use todo.",
    cuenta: "Compromiso de 500.000 tn: si el cliente manda 400.000, se facturan 500.000.",
    quien: "Comercial / Legales, según los contratos firmados.",
    cuidado: "Hoy solo funciona cuando el negocio usa la tarifa escalonada. Cargar solo lo que esté firmado o muy avanzado.",
  },

  // -------------------------------------------- unidad: inversión y costos --
  capexNoDepreciable: {
    simple: "La parte de la inversión que no se gasta con el uso, típicamente el terreno. Un galpón se desgasta; la tierra no.",
    cuenta: "Inversión de 80 millones con 6 de terreno: se deprecian 74.",
    quien: "Contaduría / Ingeniería, según el presupuesto.",
    cuidado: "No se suma aparte: es una parte de la inversión ya cargada en las obras.",
  },
  opexFijoMM: {
    simple: "Lo que cuesta tener el negocio abierto todo el año, haya mucha o poca carga: sueldos del personal fijo, mantenimiento, seguros, energía mínima. Como el alquiler y los sueldos de un comercio.",
    cuenta: "4 millones por año se restan todos los años desde que el negocio arranca, se muevan 100.000 o 2.000.000 de toneladas.",
    quien: "Operaciones y RRHH (dotación × turnos), más Mantenimiento.",
    cuidado: "No cargar acá costos compartidos con otros negocios (dragado, vigilancia, estructura): esos van en Costos comunes, si no se cuentan dos veces.",
  },
  opexInicialMM: {
    simple: "Gastos de arranque que se pagan una sola vez: pruebas de equipos, capacitación, habilitaciones.",
    quien: "Operaciones e Ingeniería.",
    cuidado: "Solo se cargan una vez; no repetirlos en el costo fijo.",
  },
  opexVariable: {
    simple: "Lo que cuesta mover cada tonelada: combustible, energía de las cintas, horas extra, repuestos. Si se mueve el doble, se gasta el doble.",
    cuenta: "2.000.000 tn × 2,50 USD/tn = 5 millones por año.",
    quien: "Operaciones / Costos.",
    cuidado: "Comparar siempre contra la tarifa: si cuesta más mover una tonelada de lo que se cobra, ese negocio pierde plata con cada tonelada.",
  },
  otrosIngresos: {
    simple: "Cobros extra por tonelada que no son ninguno de los cinco servicios principales: pesaje, análisis, servicios al buque.",
    cuenta: "3.000.000 tn × 0,50 USD/tn = 1,5 millones por año.",
    quien: "Comercial.",
  },

  // ------------------------------------------------------- unidad: canon --
  canonFijoActivo: {
    simple: "Indica si hay que pagarle un monto fijo por año al dueño del terreno o de la concesión, como un alquiler.",
    quien: "Legales / Dirección, según el contrato de concesión.",
  },
  canonFijoMM: {
    simple: "El monto de ese «alquiler» fijo anual.",
    cuenta: "1,5 millones por año, se mueva o no carga.",
    quien: "Legales, según el contrato.",
    cuidado: "Va en millones: 1,5 son 1.500.000 dólares.",
  },
  canonVariableActivo: {
    simple: "Indica si hay que pagar un monto por cada tonelada que pasa por el puerto.",
    quien: "Legales, según el contrato.",
  },
  canonVariable: {
    simple: "Cuánto se paga al concedente por cada tonelada movida.",
    cuenta: "3.000.000 tn × 0,30 USD/tn = 900.000 dólares por año.",
    quien: "Legales, según el contrato.",
  },
  canonPctActivo: {
    simple: "Indica si hay que pagar un porcentaje de lo facturado al concedente.",
    quien: "Legales, según el contrato.",
  },
  canonPct: {
    simple: "Qué porcentaje de lo facturado se paga al concedente.",
    cuenta: "Facturación de 50 millones × 2% = 1 millón.",
    quien: "Legales, según el contrato.",
  },

  // ------------------------------------------------- unidad: ocupación ----
  parcelaMedia: {
    simple: "Cuánta carga trae o se lleva, en promedio, cada barco. El muelle es como un estacionamiento: si los barcos son chicos, hacen falta más viajes para mover lo mismo, y el muelle está ocupado más tiempo.",
    cuenta: "3.000.000 tn ÷ 27.000 tn por barco = 111 barcos por año.",
    quien: "Comercial y Operaciones, según el tipo de buque de cada cliente.",
    cuidado: "No usar la capacidad máxima del barco sino lo que efectivamente carga o descarga en este puerto.",
  },
  rendimientoDia: {
    simple: "Cuántas toneladas por día se cargan o descargan cuando se trabaja sin parar. Es la velocidad del puerto.",
    cuenta: "Barco de 27.000 tn a 20.000 tn/día = 1,35 días de trabajo (antes de sumar pérdidas y maniobras).",
    quien: "Operaciones e Ingeniería, según el equipamiento (grúas, cintas, bombas).",
    cuidado: "Es el rendimiento real de operación, no el de catálogo del equipo.",
  },
  tiempoNoOperativo: {
    simple: "La parte del tiempo en que el barco está amarrado pero no se mueve carga: lluvia, cambio de bodega, roturas, esperas.",
    cuenta: "Con 15% perdido, de 20.000 tn/día se trabajan efectivamente 17.000.",
    quien: "Operaciones, con estadísticas propias o de terminales vecinas.",
    cuidado: "Se carga como porcentaje: 15 significa 15%.",
  },
  diasFijosRecalada: {
    simple: "El tiempo que el barco ocupa el muelle aunque no mueva carga: amarrar, inspección, papeles y zarpar.",
    cuenta: "Barco de AGRO: 27.000 ÷ (20.000 × 0,85) + 0,5 = 2,09 días de muelle por barco.",
    quien: "Operaciones / Agencia marítima.",
    cuidado: "Pesa mucho cuando los barcos son chicos: diez barcos de 2.000 tn suman 5 días solo en maniobras.",
  },

  // ----------------------------------------- unidad: proyección de volumen --
  volumenObjetivo: {
    simple: "Con cuántas toneladas arranca el negocio el primer año.",
    quien: "Comercial.",
    cuidado: "Solo se usa con la tarifa escalonada. Con la grilla de flujos, el volumen sale de cada flujo.",
  },
  incrementoAnual: {
    simple: "Cuántas toneladas más se suman cada año. Es una cantidad fija, no un porcentaje.",
    cuenta: "Arranca en 300.000 y suma 300.000 por año: 600.000, 900.000, 1.200.000...",
    quien: "Comercial.",
    cuidado: "Es uno de los datos que más mueven el resultado: un error acá se repite 30 años.",
  },
  anioInicioIncremento: {
    simple: "Desde qué año empieza a crecer el volumen.",
    quien: "Comercial.",
  },
  topeVolumen: {
    simple: "El máximo al que puede llegar el volumen proyectado. Al alcanzarlo, deja de crecer.",
    quien: "Comercial, según el tamaño del mercado.",
    cuidado: "En 0 no hay techo y el volumen podría crecer sin límite.",
  },
  volumenDuenio: {
    simple: "Hasta cuántas toneladas opera el propio dueño del puerto con precios por escalón. Lo que excede ese volumen se cobra a precio de lista, como carga de terceros.",
    cuenta: "Con 2.500.000 tn del dueño y 3.000.000 totales: 2.500.000 pagan por tramos y 500.000 pagan tarifa base.",
    quien: "Comercial / Dirección.",
    cuidado: "En 0, todo se cobra a tarifa base (como si operara un tercero).",
  },
  limiteTramo: {
    simple: "Dónde termina cada escalón de precio. Como la luz por escalones: las primeras toneladas pagan un precio y las siguientes otro.",
    cuenta: "Tramo 1 hasta 1.500.000 tn: esas pagan la tarifa del tramo 1. De 1.500.001 a 2.250.000 pagan la del tramo 2.",
    quien: "Comercial, según el acuerdo de tarifas.",
    cuidado: "Los límites tienen que ir de menor a mayor.",
  },
  metodoCalada: {
    simple: "Elige cómo se cobra la calada (el control de calidad de la carga): como un precio fijo por tonelada o como un porcentaje del valor de la mercadería.",
    quien: "Comercial.",
  },
  caladaPct: {
    simple: "El porcentaje del precio de la mercadería que se cobra por la calada.",
    cuenta: "Grano a 233 USD/tn × 1,2% = 2,80 USD por tonelada.",
    quien: "Comercial.",
  },
  valorCarga: {
    simple: "Cuánto vale en el mercado una tonelada de la mercadería. Se usa para calcular la calada cuando se cobra como porcentaje.",
    quien: "Comercial, con precios de mercado.",
    cuidado: "Si el precio del grano cambia mucho, este ingreso cambia con él.",
  },
  capexAnual: {
    simple: "La plata que se pone cada año para construir o comprar equipos de este negocio: silos, galpones, tanques, grúas.",
    cuenta: "Se resta del flujo el año en que se paga y después se descuenta de a poco como depreciación.",
    quien: "Ingeniería, con el presupuesto y el cronograma de obra.",
    cuidado: "Se carga en millones y en positivo; el modelo le pone el signo negativo.",
  },
  volumenManual: {
    simple: "Permite escribir a mano las toneladas de un año puntual, cuando se las conoce mejor que la proyección automática.",
    quien: "Comercial.",
    cuidado: "En 0 se usa la proyección automática. Un valor mayor a 0 la reemplaza ese año.",
  },
  opexVarOverride: {
    simple: "Permite usar un costo por tonelada distinto en un año puntual, por ejemplo cuando mejora la eficiencia o cambia un contrato de energía.",
    quien: "Operaciones / Costos.",
    cuidado: "En 0 se usa el costo general.",
  },

  // ------------------------------------------- unidad: obras propias -------
  obraNombre: {
    simple: "El nombre de la obra o equipo, para saber qué es cada renglón de la inversión.",
    quien: "Ingeniería.",
  },
  obraAnio: {
    simple: "En qué año se paga esa obra.",
    quien: "Ingeniería, según el cronograma.",
    cuidado: "Si una obra se paga en varios años, va un renglón por año.",
  },
  obraMonto: {
    simple: "Cuánto se paga por esa obra en ese año.",
    quien: "Ingeniería, con el presupuesto.",
    cuidado: "En millones de dólares: 18,81 son 18.810.000.",
  },

  // ----------------------------------------------------- costos comunes ---
  costoComunLinea: {
    simple: "El nombre de un gasto que comparten los tres negocios, como las expensas de un edificio.",
    quien: "Control de Gestión.",
  },
  costoComunDriver: {
    simple: "El criterio con el que se decidió cómo repartir ese gasto. Es una nota explicativa.",
    quien: "Control de Gestión.",
    cuidado: "No calcula nada: los porcentajes se cargan a mano. Si cambian los volúmenes, hay que revisarlos.",
  },
  costoComunMonto: {
    simple: "Cuánto cuesta por año ese gasto compartido.",
    cuenta: "Dragado de 500.000 por año, repartido 60/20/20: agrograneles paga 300.000 y los otros dos 100.000 cada uno.",
    quien: "Operaciones / Administración.",
  },
  pctUnidadComun: {
    simple: "Qué parte del gasto compartido paga cada negocio. Como dividir las expensas según los metros de cada departamento.",
    cuenta: "60% + 20% + 20% = 100%.",
    quien: "Control de Gestión.",
    cuidado: "Lo que depende del muelle se reparte por el tiempo que cada negocio lo ocupa, no por toneladas.",
  },
  sumaLineaComun: {
    simple: "Control: suma los tres porcentajes de la línea. Tiene que dar 100%.",
    cuidado: "Si da menos, una parte del gasto no la paga nadie y el puerto parece más barato de lo que es.",
  },
  asignacionCapexComun: {
    simple: "Qué parte de las obras compartidas (muelle, dragado, accesos) se le asigna a cada negocio.",
    quien: "Control de Gestión / Dirección.",
    cuidado: "Tiene que sumar 100%. Cambia la rentabilidad de cada negocio, no la del proyecto completo.",
  },

  // ------------------------------------------------- flujos comerciales ----
  flujoGate: {
    simple: "Si la carga entra al puerto, sale del puerto o pasa directo de un barco a otro.",
    quien: "Comercial.",
  },
  flujoCarga: {
    simple: "Qué producto es.",
    quien: "Comercial.",
  },
  flujoModo: {
    simple: "En qué medio de transporte llega o se va: barco, barcaza, camión o trasbordo.",
    quien: "Comercial.",
  },
  flujoForma: {
    simple: "Cómo viene la carga: suelta a granel (como el grano), líquida (como el UAN) o en piezas (como bobinas de acero).",
    quien: "Comercial.",
  },
  flujoAlmacenaje: {
    simple: "Dónde se guarda la carga mientras espera: galpón, plazoleta al aire libre, tanque, elevador, o directo al barco sin guardarse.",
    quien: "Operaciones.",
  },
  flujoAnioInicio: {
    simple: "El año en que empieza a moverse esta carga.",
    quien: "Comercial.",
  },
  flujoVolAnio1: {
    simple: "Cuántas toneladas de esta carga se mueven el primer año.",
    quien: "Comercial.",
  },
  flujoCrecimiento: {
    simple: "Cuánto crece esta carga cada año, en porcentaje sobre el año anterior.",
    cuenta: "700.000 tn creciendo 20%: 840.000 el año 2, 1.008.000 el año 3...",
    quien: "Comercial.",
    cuidado: "Un crecimiento alto sostenido muchos años da volúmenes enormes: siempre ponerle un techo.",
  },
  flujoTope: {
    simple: "Hasta dónde puede crecer esta carga. Al llegar, deja de crecer. Es un límite de toneladas, no un precio.",
    quien: "Comercial / Operaciones.",
  },
  flujoTarifaMuelle: {
    simple: "Lo que se cobra por usar el muelle, pasado a cada tonelada. En realidad se vende tiempo de muelle: un barco que tarda más debería pagar más.",
    cuenta: "1.000.000 tn × 0,666 USD/tn = 666.000 dólares por año.",
    quien: "Comercial.",
  },
  flujoTarifaEstibaje: {
    simple: "Lo que se cobra por sacar o poner la carga en el barco. Es el servicio más caro porque usa grúas, cintas o bombas y cuadrillas.",
    cuenta: "1.000.000 tn × 12 USD/tn = 12 millones por año.",
    quien: "Comercial, con el costo de Operaciones como referencia.",
    cuidado: "Varía mucho según el producto: un líquido se bombea; un sólido necesita grúa y personal en bodega.",
  },
  flujoTarifaManipuleo: {
    simple: "Lo que se cobra por mover la carga dentro del puerto: recibirla, trasladarla y cargarla en camiones.",
    cuenta: "1.000.000 tn × 7 USD/tn = 7 millones por año.",
    quien: "Comercial.",
  },
  flujoTarifaAlmacenaje: {
    simple: "Lo que se cobra por guardar la carga. Se calcula con un precio por mes y cuántos meses se queda en promedio.",
    cuenta: "2,5 USD por mes × 4 meses (3 rotaciones al año) = 10 USD/tn.",
    quien: "Comercial.",
    cuidado: "Si la carga va directo al barco sin guardarse, va 0.",
  },
  flujoTarifaCalada: {
    simple: "Lo que se cobra por sacar muestras para controlar la calidad de la carga y otros derechos menores.",
    quien: "Comercial.",
  },

  // --------------------------------------------- tarifas por tramo ---------
  tarifaConcepto: {
    simple: "Cada uno de los servicios que se cobran por tonelada en la tarifa escalonada.",
    quien: "Comercial.",
  },
  tarifaTramoBase: {
    simple: "El precio de lista, sin descuento. Lo pagan los clientes terceros y las toneladas que exceden lo que opera el dueño.",
    quien: "Comercial.",
  },
  tarifaTramo: {
    simple: "El precio de cada escalón. Cuanto más volumen, más barato el escalón siguiente, como un descuento por cantidad.",
    cuenta: "Cada escalón cobra solo las toneladas que caen dentro de él, con su propio precio.",
    quien: "Comercial.",
  },

  // ------------------------------------------- detalle por ejercicio -------
  anioFila: {
    simple: "El año al que corresponde esa fila.",
  },
  calcToneladas: {
    simple: "Las toneladas que realmente mueve el negocio ese año, después de aplicar los techos de capacidad.",
    cuidado: "Lo calcula el modelo: no se escribe acá.",
  },
  calcFacturacion: {
    simple: "Todo lo que factura el negocio ese año, antes de restar gastos.",
    cuenta: "Toneladas × precio por tonelada.",
    cuidado: "Conviene compararla con lo que estima Comercial: si no se parecen, revisar volúmenes o tarifas.",
  },
  calcResultadoOperativo: {
    simple: "Lo que gana el negocio con la operación ese año: lo facturado menos lo que cuesta operar. No incluye la inversión ni los impuestos.",
    cuenta: "Facturación 24 − costos 10 − canon 1 = 13 millones.",
    cuidado: "Si da negativo, el negocio pierde plata operando, y ningún beneficio impositivo lo arregla.",
  },

  // ------------------------------------------------- tabla del resumen -----
  resumenNegocio: {
    simple: "El negocio al que corresponde la fila.",
  },
  resumenInversion: {
    simple: "Toda la plata que hay que poner en este negocio a lo largo del proyecto, incluida su parte del muelle y obras compartidas.",
  },
  resumenFacturacion: {
    simple: "Todo lo que factura el negocio sumando todos los años.",
  },
  resumenResultado: {
    simple: "Lo que gana el negocio operando, sumando todos los años, antes de inversiones e impuestos.",
  },
  resumenMargen: {
    simple: "De cada 100 dólares que se facturan, cuántos quedan después de pagar los costos de operar.",
    cuenta: "Ganancia operativa 13 ÷ facturación 24 = 54%.",
    cuidado: "Un margen alto no alcanza si la inversión es muy grande: hay que mirarlo junto con la TIR.",
  },
  resumenToneladas: {
    simple: "Todas las toneladas que mueve el negocio sumando todos los años.",
  },
  resumenTarifaMedia: {
    simple: "Cuánto se cobra en promedio por cada tonelada movida.",
    cuenta: "Facturación total ÷ toneladas totales.",
    cuidado: "Sirve para comparar con lo que cobra la competencia.",
  },
  resumenOcupacion: {
    simple: "Qué parte del tiempo está ocupado el muelle por este negocio en su año de más trabajo.",
    cuidado: "Se suma con los otros negocios: si el total pasa el umbral, el volumen proyectado no entra físicamente en el muelle.",
  },
  resumenTIR: {
    simple: "La «tasa de interés» que rinde la plata invertida en este negocio, como si fuera un plazo fijo en dólares. Una TIR de 12% significa que la inversión rinde 12% por año.",
    cuidado: "Es la rentabilidad del negocio solo. Para decidir si conviene sumarlo, mirar su aporte al proyecto completo.",
  },
  resumenAporte: {
    simple: "Cuánto mejora o empeora la rentabilidad del proyecto completo por tener este negocio.",
    cuenta: "Si el proyecto rinde 14% con este negocio y 11% sin él, el aporte es +3 puntos.",
    cuidado: "Un negocio con rentabilidad propia positiva puede igual bajar la rentabilidad del conjunto si rinde menos que el resto.",
  },

  // ---------------------------------------------------------- inversores --
  inversorNombre: {
    simple: "El nombre del socio.",
  },
  participacionUnidad: {
    simple: "Qué parte del negocio es de cada socio. Pone plata y cobra en esa misma proporción.",
    cuenta: "TyS con 55%: pone 55 de cada 100 dólares invertidos y recibe 55 de cada 100 que el negocio reparte.",
    quien: "Dirección, según el acuerdo de socios.",
    cuidado: "Los socios de cada negocio tienen que sumar 100%.",
  },
  pctFeeRecibe: {
    simple: "Qué parte del honorario de estructuración cobra cada socio.",
    quien: "Dirección, según el acuerdo de socios.",
    cuidado: "Tiene que sumar 100% entre todos.",
  },
  pctFeeDesembolsa: {
    simple: "Qué parte del honorario de estructuración paga cada socio.",
    quien: "Dirección, según el acuerdo de socios.",
  },
  inversorAportes: {
    simple: "Toda la plata que pone este socio a lo largo del proyecto.",
  },
  inversorDistribuciones: {
    simple: "Toda la plata que recibe este socio a lo largo del proyecto.",
    cuidado: "No alcanza con que reciba más de lo que puso: importa cuándo. Recibir antes vale más; eso lo mide la TIR del socio.",
  },
};
