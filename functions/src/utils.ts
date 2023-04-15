export function range(start: number, end: number) {
  return Array(end - start + 1)
    .fill(0)
    .map((_, idx) => start + idx);
}

export function format1inchSwap(swap: any): any {
  const tx = swap.tx;
  return [[tx.to, tx.data, tx.value], swap.toToken.address];
}
