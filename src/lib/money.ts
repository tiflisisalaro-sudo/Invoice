export function gelToTetri(gel: number): number {
  return Math.round(gel * 100);
}

export function tetriToGel(tetri: number): number {
  return tetri / 100;
}

export function formatGel(tetri: number): string {
  return tetriToGel(tetri).toFixed(2);
}

export function lineTotalTetri(qty: number, unitTetri: number): number {
  return Math.round(qty * unitTetri);
}

/** VAT included in price: vat = total - total/(1+rate) */
export function vatIncludedTetri(totalTetri: number, vatRate: number): number {
  return Math.round(totalTetri - totalTetri / (1 + vatRate));
}
