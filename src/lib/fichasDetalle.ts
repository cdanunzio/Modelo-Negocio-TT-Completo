/**
 * Explicación ampliada de cada campo, redactada para lectores sin formación
 * financiera, en un registro profesional.
 *
 * Se suma a la ficha de `fichas.ts` sin reemplazarla. Cada campo puede tener:
 *   - simple:  descripción del concepto en términos generales, sin tecnicismos.
 *   - cuenta:  cómo interviene en el cálculo, con valores de ejemplo.
 *   - quien:   área responsable de definir o validar el dato.
 *   - cuidado: aspecto a considerar al cargarlo o al interpretarlo.
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
    simple: "Es el año de inicio del proyecto, en el que comienzan los desembolsos de la obra. Todo el calendario del modelo se ordena a partir de este año.",
    cuenta: "Con año base 2025 y un horizonte de 30 años, el modelo proyecta de 2025 a 2055. Las inversiones del año base no se descuentan al calcular el VAN, porque se consideran a valor presente.",
    quien: "Dirección del proyecto, conforme al cronograma de obra.",
    cuidado: "No corresponde al año de inicio de la facturación, que se define por separado en cada unidad de negocio.",
  },
  horizonte: {
    simple: "Es el período durante el cual se evalúa el negocio. Cuanto más extenso, más ejercicios de ingresos se incorporan a la evaluación.",
    cuenta: "Con 30 años de horizonte, el modelo considera 31 ejercicios: el año base más 30 años de proyección.",
    quien: "Dirección y Legales, conforme al plazo de la concesión o del contrato de uso del predio.",
    cuidado: "Extenderlo más allá del plazo contractual sobrestima la rentabilidad del proyecto.",
  },
  anioInicioOpProyecto: {
    simple: "Es el año en que la terminal comienza a operar buques y carga.",
    quien: "Ingeniería y Operaciones, según la fecha prevista de finalización de obra.",
    cuidado: "Es un dato de referencia. El inicio efectivo de cada negocio se define en el año de inicio de cada unidad.",
  },

  // ---------------------------------------------------------- operación ----
  diasOperativos: {
    simple: "Es la cantidad de días al año en que el muelle está disponible para operar, descontados los días en que la operación no es posible.",
    cuenta: "365 días menos domingos, feriados y días con condiciones climáticas adversas ≈ 308 días.",
    quien: "Operaciones, con el registro histórico de días perdidos por clima y el convenio laboral vigente.",
    cuidado: "Considerar 365 días sobrestima la capacidad del muelle y subestima su ocupación.",
  },
  sitiosAtraque: {
    simple: "Es la cantidad de buques que pueden operar amarrados en forma simultánea. A mayor cantidad de sitios, mayor capacidad de atención del muelle.",
    cuenta: "La ocupación se divide por esta cantidad. Si los buques requieren 462 días de muelle en el año y hay 3 sitios de 308 días cada uno (924 días-sitio), la ocupación resulta 462 ÷ 924 = 50%.",
    quien: "Ingeniería, conforme al diseño del muelle.",
    cuidado: "Un sitio sin el equipamiento o el calado necesarios para un tipo de buque no constituye capacidad efectiva para esa carga.",
  },
  umbralOcupacion: {
    simple: "Es el nivel de ocupación del muelle a partir del cual el modelo emite una alerta, porque comienzan a generarse esperas de buques.",
    cuenta: "Si la ocupación calculada supera el 70%, la solapa Validación muestra la alerta correspondiente.",
    quien: "Operaciones, en base a la experiencia de terminales comparables.",
    cuidado: "Modificarlo no altera ningún resultado económico: solo cambia el aviso. Elevarlo para eliminar la alerta oculta una restricción real.",
  },

  // -------------------------------------------------------- fiscal general --
  tasaImpuestoGeneral: {
    simple: "Es la proporción de la ganancia que se tributa en concepto de Impuesto a las Ganancias si el proyecto no se acoge al régimen RIGI.",
    cuenta: "Ganancia del ejercicio de 10 millones × 35% = 3,5 millones de impuesto.",
    quien: "Área Impositiva / asesor impositivo.",
    cuidado: "Se aplica sobre la ganancia, no sobre la facturación. En los ejercicios con pérdida no se tributa.",
  },
  vidaUtilDepreciacion: {
    simple: "Es la cantidad de años en que se distribuye contablemente el costo de la inversión. El desembolso ocurre al construir, pero su costo se reconoce en forma gradual a lo largo de la vida útil del bien.",
    cuenta: "Obra de 30 millones ÷ 30 años = 1 millón anual de depreciación, que se deduce de la ganancia antes de calcular el impuesto.",
    quien: "Contaduría y Área Impositiva, según el tipo de bien y la normativa aplicable.",
    cuidado: "La depreciación no constituye una salida de fondos: reduce el impuesto y, por ese motivo, se reincorpora en el flujo de caja.",
  },
  tasasEnFCFF: {
    simple: "Define si las tasas municipales y el impuesto a los débitos y créditos bancarios se descuentan del flujo de fondos, como ocurre en la práctica, o si solo se exponen a título informativo.",
    quien: "Finanzas.",
    cuidado: "Desactivarlo omite erogaciones efectivas y sobrestima la rentabilidad del proyecto.",
  },

  // ------------------------------------------------------- financiamiento --
  montoDeudaMM: {
    simple: "Es el monto que se financia mediante préstamo bancario. El resto de la inversión lo aportan los socios.",
    cuenta: "Si la obra requiere 100 millones y se financian 40, los socios aportan 60.",
    quien: "Finanzas, según las propuestas de las entidades financieras.",
    cuidado: "En 0 el proyecto se evalúa financiado íntegramente con capital propio y no se calculan los indicadores de deuda.",
  },
  tasaDeuda: {
    simple: "Es el interés anual que cobra la entidad financiera sobre el préstamo, expresado en dólares.",
    cuenta: "Deuda de 40 millones al 8% = 3,2 millones de intereses el primer año; el importe disminuye a medida que se amortiza el capital.",
    quien: "Finanzas, según la propuesta de la entidad financiera.",
    cuidado: "Es una tasa anual en dólares; no es comparable con tasas en pesos.",
  },
  plazoDeuda: {
    simple: "Es la cantidad de años en que se reintegra el préstamo. A mayor plazo, menor es la cuota anual.",
    cuenta: "40 millones a 10 años = 4 millones de capital por año, más los intereses.",
    quien: "Finanzas, según las condiciones ofrecidas.",
    cuidado: "Un plazo reducido puede generar ejercicios en que la cuota supere los fondos que genera la operación.",
  },

  // --------------------------------------------------------------- RIGI ----
  rigiActivo: {
    simple: "El RIGI es un régimen nacional que otorga beneficios impositivos a las grandes inversiones: una menor alícuota de Ganancias, depreciación acelerada y exenciones provinciales y municipales por un período determinado. Este campo activa o desactiva su aplicación en el modelo.",
    cuenta: "Con RIGI, la alícuota de Ganancias desciende de 35% a 25%, la inversión se deprecia en menos años y se aplican 10 años de exención de Ingresos Brutos y tasa municipal.",
    quien: "Dirección y Área Impositiva, según la aprobación del proyecto en el régimen.",
    cuidado: "Se recomienda evaluar ambos escenarios, con y sin RIGI: la diferencia entre ellos cuantifica el valor del beneficio.",
  },
  rigiAnioInicio: {
    simple: "Es el año a partir del cual el proyecto goza de los beneficios del RIGI.",
    cuenta: "Con inicio en 2027 y 10 años de exención, el beneficio abarca de 2027 a 2036.",
    quien: "Área Impositiva, según la fecha de aprobación del régimen.",
    cuidado: "Si el beneficio comienza antes de que la terminal facture, parte del período de exención no se aprovecha.",
  },
  rigiTasaImpuesto: {
    simple: "Es la proporción de la ganancia que se tributa en concepto de Impuesto a las Ganancias dentro del RIGI.",
    cuenta: "Sobre una ganancia de 10 millones: 3,5 millones de impuesto sin RIGI y 2,5 millones con RIGI. La diferencia, 1 millón anual, permanece en el proyecto.",
    quien: "Área Impositiva / asesor impositivo.",
  },
  rigiAmortAcelerada: {
    simple: "Permite deducir el costo de la inversión en un plazo menor al habitual. El impuesto total no se reduce, pero se difiere en el tiempo, lo que mejora la rentabilidad del proyecto.",
    cuenta: "Una obra de 30 millones con 30 años de vida útil se deprecia a razón de 1 millón por año; con aceleración al 60%, en 18 años: 1,67 millones por año.",
    quien: "Área Impositiva.",
  },
  rigiPctVidaUtil: {
    simple: "Indica en qué proporción de la vida útil normal se completa la depreciación cuando se aplica el beneficio.",
    cuenta: "30 años × 60% = 18 años.",
    quien: "Área Impositiva, según lo que admite la normativa.",
    cuidado: "Un porcentaje menor implica una depreciación más rápida y, por lo tanto, un beneficio mayor.",
  },
  rigiIIBBAnios: {
    simple: "Es la cantidad de años durante los cuales el proyecto está exento de Ingresos Brutos, el impuesto provincial que grava la facturación.",
    quien: "Área Impositiva, según el acuerdo con la Provincia de Santa Fe.",
    cuidado: "En el modelo se expone como ahorro informativo: corresponde a un pago que no se realiza, no a un ingreso.",
  },
  rigiIIBBPct: {
    simple: "Es la alícuota de Ingresos Brutos que correspondería sin el régimen. Permite cuantificar el ahorro.",
    cuenta: "Facturación de 24 millones × 5% = 1,2 millones anuales que no se abonan durante la exención.",
    quien: "Área Impositiva.",
  },
  rigiMunicipalAnios: {
    simple: "Es la cantidad de años durante los cuales no se abona la tasa municipal de Timbúes que grava la actividad comercial.",
    quien: "Área Impositiva, según el acuerdo con el municipio.",
    cuidado: "Finalizada la exención, la tasa se abona en todos los ejercicios posteriores.",
  },
  rigiMunicipalPorMil: {
    simple: "Es la tasa municipal sobre la facturación que rige al finalizar la exención. Se expresa en tanto por mil: 5,5 por mil equivale a 5,50 dólares por cada 1.000 facturados.",
    cuenta: "Facturación de 24 millones × 5,5 ‰ = 132.000 dólares anuales.",
    quien: "Área Impositiva, según la ordenanza tributaria de Timbúes.",
    cuidado: "Se expresa por mil, no por ciento: 5,5 ‰ equivale a 0,55%.",
  },
  rigiDebCredActivo: {
    simple: "Permite computar lo abonado por impuesto a los débitos y créditos bancarios como pago a cuenta del Impuesto a las Ganancias.",
    cuenta: "Con 300.000 abonados por débitos y créditos y un impuesto a las ganancias de 2 millones, el saldo a pagar es 1,7 millones.",
    quien: "Área Impositiva.",
    cuidado: "El cómputo no puede superar el impuesto del ejercicio: en un ejercicio con pérdida no hay impuesto contra el cual compensar.",
  },
  rigiDebCredPct: {
    simple: "Es la alícuota que se utiliza para estimar el impuesto a los débitos y créditos bancarios computable contra Ganancias.",
    cuenta: "1,2% = 0,6% sobre los débitos más 0,6% sobre los créditos en cuenta.",
    quien: "Área Impositiva.",
  },
  rigiCertivaActivo: {
    simple: "Expone el IVA incluido en la compra de obras y equipos. Ese IVA se recupera posteriormente como crédito fiscal, por lo que no constituye un costo.",
    cuenta: "Compra de 100 millones más 21 millones de IVA; los 21 millones se recuperan en ejercicios posteriores.",
    quien: "Área Impositiva.",
    cuidado: "Considerar el IVA como costo es un error frecuente en la evaluación de inversiones y subestima la rentabilidad del proyecto.",
  },

  // --------------------------------------------------- otros tributos -----
  idycbAlicuota: {
    simple: "Es el impuesto a los débitos y créditos bancarios: grava cada ingreso y egreso de fondos en cuenta bancaria.",
    cuenta: "Un pago de 34 millones a un proveedor genera aproximadamente 408.000 dólares de impuesto (1,2%).",
    quien: "Área Impositiva.",
  },
  idycbPrescripcion: {
    simple: "Es el plazo máximo para computar lo abonado por este impuesto contra Ganancias. Vencido ese plazo, el crédito no puede utilizarse.",
    quien: "Área Impositiva.",
  },
  dreiTipoCambio: {
    simple: "Es el tipo de cambio que se utiliza para convertir a dólares el mínimo de la tasa municipal, expresado en pesos.",
    cuenta: "Mínimo de 3.000.000 de pesos mensuales × 12 ÷ 1.000 pesos por dólar = 36.000 dólares anuales.",
    quien: "Finanzas y Área Impositiva, con la cotización oficial al 30 de abril.",
    cuidado: "Si permanece en 0, el modelo omite el mínimo y la tasa municipal resulta subestimada.",
  },
  dreiMinimoMensualARS: {
    simple: "Es el importe mínimo mensual que percibe el municipio, con independencia del nivel de facturación.",
    cuenta: "El municipio percibe el mayor importe entre este mínimo y la alícuota aplicada sobre la facturación.",
    quien: "Área Impositiva, según la ordenanza de Timbúes.",
    cuidado: "Dato pendiente de completar. Tiene mayor incidencia en los primeros ejercicios, de menor facturación.",
  },
  tasaEdifPrimeros5: {
    simple: "Es la tasa municipal que grava la construcción, calculada sobre el monto de obra ejecutado en cada ejercicio.",
    cuenta: "Obra de 34 millones × 3 ‰ = 102.000 dólares.",
    quien: "Área Impositiva, según la ordenanza municipal.",
    cuidado: "Se expresa por mil, no por ciento.",
  },
  tasaEdifPost5: {
    simple: "Es la misma tasa de construcción, aplicable a las obras que se ejecuten a partir del sexto año, como las ampliaciones.",
    quien: "Área Impositiva, según la ordenanza municipal.",
    cuidado: "Se expresa por mil, no por ciento.",
  },

  // --------------------------------------------------------- transacción --
  structuringFeeUSD: {
    simple: "Es el honorario que percibe el socio que estructuró el proyecto (incorporación de socios, financiamiento y presentación al RIGI). Lo abonan los demás socios.",
    cuenta: "10 millones: los percibe TyS y los abonan AFA, AMAGI y Unión Agrícola en partes iguales.",
    quien: "Dirección, según el acuerdo de socios.",
    cuidado: "No modifica la rentabilidad del proyecto: solo redistribuye fondos entre los socios.",
  },
  anioCobroFee: {
    simple: "Es el año en que se percibe el honorario de estructuración.",
    quien: "Dirección, según el acuerdo de socios.",
  },
  costoEstructuracionARS: {
    simple: "Es el costo de preparar la presentación al RIGI (asesoramiento, estudios y trámites). Se descuenta del honorario de quien lo percibe.",
    quien: "Área Impositiva y Legales, según el presupuesto del asesor.",
    cuidado: "Se carga en pesos; el modelo lo convierte a dólares con el tipo de cambio promedio.",
  },
  tipoCambioPromedio: {
    simple: "Es el tipo de cambio que se utiliza para convertir a dólares el costo de estructuración del RIGI.",
    quien: "Finanzas.",
    cuidado: "Si permanece en 0, el costo no se descuenta.",
  },

  // ---------------------------------------------- unidad: identidad ------
  metodoTarifa: {
    simple: "Define el criterio de cálculo de la facturación del negocio. Por flujos comerciales: cada tipo de carga tiene su volumen y sus tarifas. Por tarifa escalonada: un volumen único con tarifas que disminuyen a medida que aumenta el volumen operado.",
    cuenta: "Por flujos: toneladas de cada carga × su tarifa, sumando todos los flujos. Escalonada: cada tramo de volumen se valoriza con su propia tarifa.",
    quien: "Comercial, según la modalidad de contratación del negocio.",
    cuidado: "Al cambiar el criterio cambia el origen de las toneladas y de las tarifas: verificar que la opción elegida tenga sus datos cargados.",
  },
  anioInicioOp: {
    simple: "Es el año en que el negocio comienza a operar y a facturar.",
    quien: "Ingeniería y Comercial, según la finalización de obra y los primeros contratos.",
    cuidado: "Un año de demora desplaza todos los ingresos, mientras que las inversiones ya fueron realizadas: reduce significativamente la rentabilidad.",
  },
  capacidadMax: {
    simple: "Es el volumen máximo que las instalaciones del negocio pueden operar en un año, aun cuando la demanda sea mayor.",
    cuenta: "Con una demanda proyectada de 2.500.000 tn y una capacidad de 2.000.000 tn, se facturan 2.000.000 tn.",
    quien: "Ingeniería y Operaciones.",
    cuidado: "En 0 el modelo no aplica límite y puede proyectar volúmenes que las instalaciones no pueden operar.",
  },
  takeOrPay: {
    simple: "Es el volumen mínimo que el cliente se compromete contractualmente a abonar, aunque no lo utilice en su totalidad.",
    cuenta: "Compromiso de 500.000 tn: si el cliente opera 400.000 tn, se facturan 500.000 tn.",
    quien: "Comercial y Legales, según los contratos suscriptos.",
    cuidado: "Actualmente solo aplica con el criterio de tarifa escalonada. Cargar únicamente compromisos firmados o en etapa avanzada de negociación.",
  },

  // -------------------------------------------- unidad: inversión y costos --
  capexNoDepreciable: {
    simple: "Es la parte de la inversión que no pierde valor con el uso, como el terreno. Las instalaciones se desgastan; el terreno no.",
    cuenta: "Inversión de 80 millones con 6 millones de terreno: se deprecian 74 millones.",
    quien: "Contaduría e Ingeniería, según el presupuesto.",
    cuidado: "No se suma a la inversión: es una porción de la inversión ya cargada en las obras.",
  },
  opexFijoMM: {
    simple: "Es el costo de mantener el negocio en funcionamiento durante el año, con independencia del volumen operado: dotación estable, mantenimiento, seguros y consumo energético base.",
    cuenta: "4 millones anuales se deducen en todos los ejercicios desde el inicio de la operación, cualquiera sea el volumen operado.",
    quien: "Operaciones y Recursos Humanos (dotación por turno), junto con Mantenimiento.",
    cuidado: "No incluir costos compartidos con otros negocios (dragado, vigilancia, estructura): corresponden a Costos comunes y, de lo contrario, se computan dos veces.",
  },
  opexInicialMM: {
    simple: "Son los gastos de puesta en marcha que se realizan por única vez: pruebas de equipos, capacitación y habilitaciones.",
    quien: "Operaciones e Ingeniería.",
    cuidado: "Se registran una sola vez; no deben incluirse también en el costo fijo.",
  },
  opexVariable: {
    simple: "Es el costo de operar cada tonelada: combustible, energía, horas extra y repuestos. Varía en proporción al volumen.",
    cuenta: "2.000.000 tn × 2,50 USD/tn = 5 millones anuales.",
    quien: "Operaciones y Costos.",
    cuidado: "Debe compararse con la tarifa: si el costo por tonelada supera la tarifa, cada tonelada operada genera pérdida.",
  },
  otrosIngresos: {
    simple: "Son ingresos adicionales por tonelada que no corresponden a los cinco servicios principales, como pesaje, análisis de calidad o servicios al buque.",
    cuenta: "3.000.000 tn × 0,50 USD/tn = 1,5 millones anuales.",
    quien: "Comercial.",
  },

  // ------------------------------------------------------- unidad: canon --
  canonFijoActivo: {
    simple: "Indica si corresponde abonar un importe fijo anual al titular del predio o de la concesión.",
    quien: "Legales y Dirección, según el contrato de concesión.",
  },
  canonFijoMM: {
    simple: "Es el importe del canon fijo anual.",
    cuenta: "1,5 millones anuales, con independencia del volumen operado.",
    quien: "Legales, según el contrato.",
    cuidado: "Se expresa en millones: 1,5 equivale a 1.500.000 dólares.",
  },
  canonVariableActivo: {
    simple: "Indica si corresponde abonar un canon por cada tonelada operada en la terminal.",
    quien: "Legales, según el contrato.",
  },
  canonVariable: {
    simple: "Es el importe que se abona al concedente por cada tonelada operada.",
    cuenta: "3.000.000 tn × 0,30 USD/tn = 900.000 dólares anuales.",
    quien: "Legales, según el contrato.",
  },
  canonPctActivo: {
    simple: "Indica si corresponde abonar al concedente un porcentaje de la facturación.",
    quien: "Legales, según el contrato.",
  },
  canonPct: {
    simple: "Es el porcentaje de la facturación que se abona al concedente.",
    cuenta: "Facturación de 50 millones × 2% = 1 millón.",
    quien: "Legales, según el contrato.",
  },

  // ------------------------------------------------- unidad: ocupación ----
  parcelaMedia: {
    simple: "Es el volumen promedio que carga o descarga cada buque. Con buques de menor porte se requieren más escalas para operar el mismo volumen, y el muelle permanece ocupado más tiempo.",
    cuenta: "3.000.000 tn ÷ 27.000 tn por buque = 111 buques por año.",
    quien: "Comercial y Operaciones, según el tipo de buque de cada cliente.",
    cuidado: "Debe reflejar lo que efectivamente se carga o descarga en esta terminal, no la capacidad máxima del buque.",
  },
  rendimientoDia: {
    simple: "Es el volumen diario que se carga o descarga en operación continua. Representa la velocidad de operación de la terminal.",
    cuenta: "Buque de 27.000 tn a 20.000 tn/día = 1,35 días de operación, antes de considerar tiempos improductivos y maniobras.",
    quien: "Operaciones e Ingeniería, según el equipamiento disponible.",
    cuidado: "Debe reflejar el rendimiento efectivo de operación, no el nominal informado por el fabricante del equipo.",
  },
  tiempoNoOperativo: {
    simple: "Es la proporción del tiempo en que el buque permanece amarrado sin movimiento de carga: lluvia, cambio de bodega, fallas o esperas.",
    cuenta: "Con un 15% de tiempo improductivo, un rendimiento de 20.000 tn/día equivale a 17.000 tn/día efectivas.",
    quien: "Operaciones, con estadísticas propias o de terminales comparables.",
    cuidado: "Se carga como porcentaje: 15 equivale a 15%.",
  },
  diasFijosRecalada: {
    simple: "Es el tiempo que el buque ocupa el muelle sin movimiento de carga: amarre, inspección, documentación y zarpada.",
    cuenta: "Buque de agrograneles: 27.000 ÷ (20.000 × 0,85) + 0,5 = 2,09 días de muelle por buque.",
    quien: "Operaciones y agencia marítima.",
    cuidado: "Tiene mayor incidencia con buques de menor porte: diez buques de 2.000 tn suman 5 días solo en maniobras.",
  },

  // ----------------------------------------- unidad: proyección de volumen --
  volumenObjetivo: {
    simple: "Es el volumen con el que el negocio inicia la operación.",
    quien: "Comercial.",
    cuidado: "Solo aplica con el criterio de tarifa escalonada. Con el criterio por flujos, el volumen surge de cada flujo comercial.",
  },
  incrementoAnual: {
    simple: "Es la cantidad de toneladas que se adicionan cada año. Es un valor fijo, no un porcentaje.",
    cuenta: "Inicio en 300.000 tn con un incremento de 300.000 tn anuales: 600.000, 900.000, 1.200.000, y así sucesivamente.",
    quien: "Comercial.",
    cuidado: "Es uno de los supuestos de mayor incidencia en el resultado: un desvío se repite en todo el horizonte.",
  },
  anioInicioIncremento: {
    simple: "Es el año a partir del cual el volumen comienza a crecer.",
    quien: "Comercial.",
  },
  topeVolumen: {
    simple: "Es el volumen máximo que puede alcanzar la proyección. Una vez alcanzado, el volumen se mantiene constante.",
    quien: "Comercial, según el tamaño del mercado.",
    cuidado: "En 0 no se aplica límite y el volumen puede crecer indefinidamente.",
  },
  volumenDuenio: {
    simple: "Es el volumen hasta el cual el titular de la terminal opera con tarifas escalonadas. El volumen excedente se factura a tarifa de lista, como carga de terceros.",
    cuenta: "Con 2.500.000 tn del titular sobre 3.000.000 tn totales: 2.500.000 tn se facturan por tramos y 500.000 tn a tarifa base.",
    quien: "Comercial y Dirección.",
    cuidado: "En 0, todo el volumen se factura a tarifa base, como si operara un tercero.",
  },
  limiteTramo: {
    simple: "Es el volumen en que finaliza cada tramo de tarifa. Cada tramo se valoriza con su propia tarifa.",
    cuenta: "Tramo 1 hasta 1.500.000 tn: esas toneladas se facturan con la tarifa del tramo 1; de 1.500.001 a 2.250.000 tn, con la del tramo 2.",
    quien: "Comercial, según el acuerdo tarifario.",
    cuidado: "Los límites deben cargarse en orden creciente.",
  },
  metodoCalada: {
    simple: "Define cómo se factura la calada (control de calidad de la carga): como tarifa por tonelada o como porcentaje del valor de la mercadería.",
    quien: "Comercial.",
  },
  caladaPct: {
    simple: "Es el porcentaje del valor de la mercadería que se factura en concepto de calada.",
    cuenta: "Grano valuado en 233 USD/tn × 1,2% = 2,80 USD por tonelada.",
    quien: "Comercial.",
  },
  valorCarga: {
    simple: "Es el valor de mercado de una tonelada de la mercadería. Se utiliza para calcular la calada cuando se factura como porcentaje.",
    quien: "Comercial, con precios de mercado.",
    cuidado: "Las variaciones de precio de la mercadería impactan directamente en este ingreso.",
  },
  capexAnual: {
    simple: "Es la inversión que se realiza cada año en obras y equipamiento del negocio: silos, depósitos, tanques y equipos de carga.",
    cuenta: "Se descuenta del flujo de fondos en el año del desembolso y luego se reconoce en forma gradual como depreciación.",
    quien: "Ingeniería, con el presupuesto y el cronograma de obra.",
    cuidado: "Se carga en millones y en valor positivo; el modelo le asigna el signo negativo.",
  },
  volumenManual: {
    simple: "Permite cargar el volumen de un año determinado cuando se dispone de una estimación más precisa que la proyección automática.",
    quien: "Comercial.",
    cuidado: "En 0 se aplica la proyección automática; un valor mayor a 0 la reemplaza en ese año.",
  },
  opexVarOverride: {
    simple: "Permite aplicar un costo por tonelada diferente en un año determinado, por ejemplo ante mejoras de eficiencia o cambios en contratos de energía.",
    quien: "Operaciones y Costos.",
    cuidado: "En 0 se aplica el costo variable general.",
  },

  // ------------------------------------------- unidad: obras propias -------
  obraNombre: {
    simple: "Es la denominación de la obra o del equipo, para identificar cada renglón de la inversión.",
    quien: "Ingeniería.",
  },
  obraAnio: {
    simple: "Es el año en que se realiza el desembolso de la obra.",
    quien: "Ingeniería, según el cronograma.",
    cuidado: "Una obra que se abona en varios años se carga en un renglón por año.",
  },
  obraMonto: {
    simple: "Es el importe que se desembolsa por la obra en ese año.",
    quien: "Ingeniería, según el presupuesto.",
    cuidado: "Se expresa en millones de dólares: 18,81 equivale a 18.810.000.",
  },

  // ----------------------------------------------------- costos comunes ---
  costoComunLinea: {
    simple: "Es la denominación de un costo compartido por los tres negocios.",
    quien: "Control de Gestión.",
  },
  costoComunDriver: {
    simple: "Es el criterio que sustenta la distribución del costo entre los negocios. Tiene carácter explicativo.",
    quien: "Control de Gestión.",
    cuidado: "No interviene en el cálculo: los porcentajes se cargan manualmente y deben revisarse cuando cambian los volúmenes.",
  },
  costoComunMonto: {
    simple: "Es el costo anual de la línea compartida.",
    cuenta: "Dragado de 500.000 anuales distribuido 60/20/20: agrograneles absorbe 300.000 y los otros dos negocios, 100.000 cada uno.",
    quien: "Operaciones y Administración.",
  },
  pctUnidadComun: {
    simple: "Es la proporción del costo compartido que absorbe cada negocio, según el criterio de distribución definido.",
    cuenta: "60% + 20% + 20% = 100%.",
    quien: "Control de Gestión.",
    cuidado: "Los costos vinculados al muelle se distribuyen según el tiempo de ocupación de cada negocio, no según las toneladas.",
  },
  sumaLineaComun: {
    simple: "Control que suma los tres porcentajes de la línea. Debe totalizar 100%.",
    cuidado: "Si el total es inferior, una parte del costo no queda asignada y el costo de la terminal resulta subestimado.",
  },
  asignacionCapexComun: {
    simple: "Es la proporción de las obras compartidas (muelle, dragado, accesos) que se asigna a cada negocio.",
    quien: "Control de Gestión y Dirección.",
    cuidado: "Debe totalizar 100%. Modifica la rentabilidad de cada negocio, no la del proyecto en su conjunto.",
  },

  // ------------------------------------------------- flujos comerciales ----
  flujoGate: {
    simple: "Indica si la carga ingresa a la terminal, egresa de ella o se transfiere directamente entre buques.",
    quien: "Comercial.",
  },
  flujoCarga: {
    simple: "Es el producto del flujo comercial.",
    quien: "Comercial.",
  },
  flujoModo: {
    simple: "Es el medio de transporte de ingreso o egreso: buque, barcaza, camión o trasbordo.",
    quien: "Comercial.",
  },
  flujoForma: {
    simple: "Es la forma en que se presenta la carga: sólido a granel (como el grano), líquido (como el UAN) o carga general en bultos (como las bobinas de acero).",
    quien: "Comercial.",
  },
  flujoAlmacenaje: {
    simple: "Es el lugar de almacenamiento de la carga hasta su despacho: depósito, playa a cielo abierto, tanque, elevador o embarque directo sin almacenamiento.",
    quien: "Operaciones.",
  },
  flujoAnioInicio: {
    simple: "Es el año en que comienza a operarse esta carga.",
    quien: "Comercial.",
  },
  flujoVolAnio1: {
    simple: "Es el volumen de esta carga en su primer año de operación.",
    quien: "Comercial.",
  },
  flujoCrecimiento: {
    simple: "Es el crecimiento anual de esta carga, expresado como porcentaje sobre el año anterior.",
    cuenta: "700.000 tn con un crecimiento de 20%: 840.000 tn el segundo año y 1.008.000 tn el tercero.",
    quien: "Comercial.",
    cuidado: "Un crecimiento elevado sostenido en el tiempo genera volúmenes significativos: se recomienda definir siempre un tope.",
  },
  flujoTope: {
    simple: "Es el volumen máximo que puede alcanzar esta carga. Una vez alcanzado, el volumen se mantiene constante. Es un límite de volumen, no una tarifa.",
    quien: "Comercial y Operaciones.",
  },
  flujoTarifaMuelle: {
    simple: "Es la tarifa por el uso del muelle, expresada por tonelada. Remunera el tiempo de ocupación del muelle: los buques con operaciones más prolongadas deberían abonar más.",
    cuenta: "1.000.000 tn × 0,666 USD/tn = 666.000 dólares anuales.",
    quien: "Comercial.",
  },
  flujoTarifaEstibaje: {
    simple: "Es la tarifa por la carga o descarga del buque. Es el servicio de mayor valor, porque requiere grúas, cintas o bombas y personal de estiba.",
    cuenta: "1.000.000 tn × 12 USD/tn = 12 millones anuales.",
    quien: "Comercial, con el costo operativo como referencia.",
    cuidado: "Varía significativamente según el producto: un líquido se bombea, mientras que un sólido requiere grúa y personal en bodega.",
  },
  flujoTarifaManipuleo: {
    simple: "Es la tarifa por el movimiento de la carga dentro de la terminal: recepción, traslado interno y carga de camiones.",
    cuenta: "1.000.000 tn × 7 USD/tn = 7 millones anuales.",
    quien: "Comercial.",
  },
  flujoTarifaAlmacenaje: {
    simple: "Es la tarifa por el almacenamiento de la carga. Se determina con un precio mensual y la permanencia promedio de la mercadería.",
    cuenta: "2,5 USD por mes × 4 meses (3 rotaciones anuales) = 10 USD/tn.",
    quien: "Comercial.",
    cuidado: "Si la carga se embarca en forma directa, sin almacenamiento, corresponde 0.",
  },
  flujoTarifaCalada: {
    simple: "Es la tarifa por la extracción de muestras para el control de calidad de la carga y otros derechos menores.",
    quien: "Comercial.",
  },

  // --------------------------------------------- tarifas por tramo ---------
  tarifaConcepto: {
    simple: "Son los servicios que se facturan por tonelada bajo el criterio de tarifa escalonada.",
    quien: "Comercial.",
  },
  tarifaTramoBase: {
    simple: "Es la tarifa de lista, sin bonificación. Se aplica a la carga de terceros y al volumen que excede el operado por el titular.",
    quien: "Comercial.",
  },
  tarifaTramo: {
    simple: "Es la tarifa de cada tramo de volumen. A mayor volumen, menor es la tarifa del tramo siguiente.",
    cuenta: "Cada tramo factura únicamente las toneladas comprendidas en él, con su propia tarifa.",
    quien: "Comercial.",
  },

  // ------------------------------------------- detalle por ejercicio -------
  anioFila: {
    simple: "Es el ejercicio al que corresponde la fila.",
  },
  calcToneladas: {
    simple: "Es el volumen efectivamente operado por el negocio en el ejercicio, una vez aplicados los límites de capacidad.",
    cuidado: "Es un valor calculado por el modelo: no se carga.",
  },
  calcFacturacion: {
    simple: "Es la facturación total del negocio en el ejercicio, antes de deducir costos.",
    cuenta: "Toneladas × tarifa por tonelada.",
    cuidado: "Se recomienda contrastarla con la estimación de Comercial: ante diferencias, revisar volúmenes o tarifas.",
  },
  calcResultadoOperativo: {
    simple: "Es el resultado que genera la operación en el ejercicio: la facturación menos los costos operativos, sin considerar la inversión ni los impuestos.",
    cuenta: "Facturación 24 − costos 10 − canon 1 = 13 millones.",
    cuidado: "Un resultado negativo indica que el negocio pierde en su operación, situación que ningún beneficio impositivo compensa.",
  },

  // ------------------------------------------------- tabla del resumen -----
  resumenNegocio: {
    simple: "Es el negocio al que corresponde la fila.",
  },
  resumenInversion: {
    simple: "Es la inversión total del negocio a lo largo del proyecto, incluida su participación en el muelle y en las obras compartidas.",
  },
  resumenFacturacion: {
    simple: "Es la facturación acumulada del negocio en todo el horizonte.",
  },
  resumenResultado: {
    simple: "Es el resultado operativo acumulado del negocio en todo el horizonte, antes de inversiones e impuestos.",
  },
  resumenMargen: {
    simple: "Indica qué proporción de la facturación permanece como resultado operativo después de cubrir los costos de operación.",
    cuenta: "Resultado operativo 13 ÷ facturación 24 = 54%.",
    cuidado: "Un margen elevado no es suficiente si la inversión es significativa: debe analizarse junto con la TIR.",
  },
  resumenToneladas: {
    simple: "Es el volumen acumulado que opera el negocio en todo el horizonte.",
  },
  resumenTarifaMedia: {
    simple: "Es el ingreso promedio por tonelada operada.",
    cuenta: "Facturación total ÷ toneladas totales.",
    cuidado: "Permite contrastar las tarifas del modelo con las del mercado.",
  },
  resumenOcupacion: {
    simple: "Es la proporción del tiempo en que el negocio ocupa el muelle en su ejercicio de mayor actividad.",
    cuidado: "Se suma a la de los demás negocios: si el total supera el umbral, el volumen proyectado no puede ser absorbido por el muelle.",
  },
  resumenTIR: {
    simple: "Es el rendimiento anual que genera la inversión en este negocio, comparable con la tasa de una colocación en dólares. Una TIR de 12% indica que la inversión rinde 12% anual.",
    cuidado: "Mide la rentabilidad del negocio en forma individual. Para decidir su incorporación debe considerarse su aporte al proyecto en su conjunto.",
  },
  resumenAporte: {
    simple: "Indica en cuánto mejora o reduce la rentabilidad del proyecto la incorporación de este negocio.",
    cuenta: "Si el proyecto rinde 14% con este negocio y 11% sin él, el aporte es de +3 puntos.",
    cuidado: "Un negocio con rentabilidad individual positiva puede reducir la del conjunto si su rendimiento es inferior al del resto.",
  },

  // ---------------------------------------------------------- inversores --
  inversorNombre: {
    simple: "Es la denominación del socio.",
  },
  participacionUnidad: {
    simple: "Es la participación de cada socio en el negocio. Cada socio aporta y percibe en esa misma proporción.",
    cuenta: "TyS, con 55%, aporta 55 de cada 100 dólares invertidos y percibe 55 de cada 100 dólares distribuidos.",
    quien: "Dirección, según el acuerdo de socios.",
    cuidado: "Las participaciones de cada negocio deben totalizar 100%.",
  },
  pctFeeRecibe: {
    simple: "Es la proporción del honorario de estructuración que percibe cada socio.",
    quien: "Dirección, según el acuerdo de socios.",
    cuidado: "Debe totalizar 100% entre todos los socios.",
  },
  pctFeeDesembolsa: {
    simple: "Es la proporción del honorario de estructuración que abona cada socio.",
    quien: "Dirección, según el acuerdo de socios.",
  },
  inversorAportes: {
    simple: "Es el total de fondos aportados por el socio a lo largo del proyecto.",
  },
  inversorDistribuciones: {
    simple: "Es el total de fondos percibidos por el socio a lo largo del proyecto.",
    cuidado: "No basta con percibir más de lo aportado: también importa el momento en que se percibe. Esa dimensión temporal la mide la TIR del socio.",
  },
};
