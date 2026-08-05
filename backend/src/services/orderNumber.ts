function pad(num: number, size: number): string {
  return num.toString().padStart(size, '0');
}

/** research.md「6. 注文番号の採番方式」: ORD-YYYYMMDD-NNNN */
export function generateOrderNumber(date: Date, sequenceInDay: number): string {
  const y = date.getFullYear();
  const m = pad(date.getMonth() + 1, 2);
  const d = pad(date.getDate(), 2);
  return `ORD-${y}${m}${d}-${pad(sequenceInDay, 4)}`;
}
