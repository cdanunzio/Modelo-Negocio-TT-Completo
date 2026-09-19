"""
Segunda mitad del control del Excel.

Toma el libro que escribió `verificar-excel.ts`, lo hace recalcular por
LibreOffice y compara cada celda contra lo que calculó el motor. Además
controla que las celdas de cálculo sean fórmulas de verdad y no números
pegados: si alguien exporta un valor donde debería haber una fórmula, falla.

Uso: python3 scripts/verificar-excel.py /tmp/modelo.xlsx
"""
import json
import subprocess
import sys
import warnings
from pathlib import Path

import openpyxl

warnings.filterwarnings("ignore")

TOLERANCIA_RELATIVA = 1e-6
TOLERANCIA_ABSOLUTA = 0.01


def recalcular(origen: Path) -> Path:
    """LibreOffice abre el libro, recalcula y lo vuelve a guardar con los valores."""
    destino = origen.parent / "recalculado"
    destino.mkdir(exist_ok=True)
    subprocess.run(
        ["soffice", "--headless", "--calc", "--convert-to", "xlsx", "--outdir", str(destino), str(origen)],
        check=True, capture_output=True, timeout=600,
    )
    return destino / origen.name


def celdas_de(hoja, concepto: str):
    """Devuelve (fila de fórmulas, fila de valores) para un concepto de la columna A."""
    for fila in hoja.iter_rows(min_row=1, max_row=hoja.max_row, min_col=1, max_col=1):
        if fila[0].value == concepto:
            return fila[0].row
    return None


def main() -> int:
    ruta = Path(sys.argv[1] if len(sys.argv) > 1 else "/tmp/modelo.xlsx")
    esperado = json.loads(Path(str(ruta).replace(".xlsx", "") + ".esperado.json").read_text("utf-8"))
    anios = esperado["anios"]

    con_formulas = openpyxl.load_workbook(ruta)
    calculado = openpyxl.load_workbook(recalcular(ruta), data_only=True)

    fallas: list[str] = []
    celdas_controladas = 0
    formulas_controladas = 0

    for entrada in esperado["filas"]:
        hoja_nombre = entrada["hoja"]
        if hoja_nombre not in con_formulas.sheetnames:
            fallas.append(f"falta la hoja {hoja_nombre}")
            continue
        hf = con_formulas[hoja_nombre]
        hv = calculado[hoja_nombre]
        fila = celdas_de(hf, entrada["concepto"])
        if fila is None:
            fallas.append(f"{hoja_nombre}: no está la fila «{entrada['concepto']}»")
            continue

        for j, esperado_valor in enumerate(entrada["valores"]):
            col = 2 + j  # columna B en adelante
            formula = hf.cell(fila, col).value
            obtenido = hv.cell(fila, col).value

            if not (isinstance(formula, str) and formula.startswith("=")):
                fallas.append(
                    f"{hoja_nombre} · {entrada['concepto']} · {anios[j] if j < len(anios) else j}: "
                    f"no es una fórmula (es {formula!r})"
                )
                continue
            formulas_controladas += 1

            if esperado_valor is None:
                continue
            if obtenido is None or isinstance(obtenido, str):
                obtenido = 0.0
            celdas_controladas += 1
            escala = max(abs(esperado_valor), abs(obtenido), 1.0)
            if abs(obtenido - esperado_valor) > max(TOLERANCIA_ABSOLUTA, escala * TOLERANCIA_RELATIVA):
                fallas.append(
                    f"{hoja_nombre} · {entrada['concepto']} · "
                    f"{anios[j] if j < len(anios) else j}: planilla {obtenido:,.4f} "
                    f"vs motor {esperado_valor:,.4f}"
                )

    print(f"\nCeldas comparadas: {celdas_controladas}  ·  fórmulas verificadas: {formulas_controladas}")
    if fallas:
        print(f"\n{len(fallas)} diferencia(s):")
        for f in fallas[:40]:
            print("  FALLA", f)
        if len(fallas) > 40:
            print(f"  … y {len(fallas) - 40} más")
        return 1
    print("El Excel reproduce el modelo en todas las celdas controladas.\n")
    return 0


if __name__ == "__main__":
    sys.exit(main())
