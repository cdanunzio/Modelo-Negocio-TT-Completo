export const usd = (v: number | null | undefined, dec = 0) =>
  v === null || v === undefined || !isFinite(v)
    ? "-"
    : new Intl.NumberFormat("es-AR", { minimumFractionDigits: dec, maximumFractionDigits: dec }).format(v);

export const mm = (v: number | null | undefined, dec = 1) =>
  v === null || v === undefined || !isFinite(v) ? "-" : usd(v / 1e6, dec) + " MM";

export const pct = (v: number | null | undefined, dec = 1) =>
  v === null || v === undefined || !isFinite(v) ? "-" : usd(v * 100, dec) + "%";

export const num = (v: number | null | undefined, dec = 2) =>
  v === null || v === undefined || !isFinite(v) ? "-" : usd(v, dec);

export const fecha = (iso: string) =>
  new Date(iso).toLocaleString("es-AR", { dateStyle: "short", timeStyle: "short" });
