export function calculateFine(
  dueDate: string,
  ratePerDay: number,
  today: Date = new Date()
): { overdueDays: number; amount: number; isOverdue: boolean } {
  const due = new Date(dueDate);
  due.setHours(0, 0, 0, 0);
  const now = new Date(today);
  now.setHours(0, 0, 0, 0);
  const diffMs = now.getTime() - due.getTime();
  const overdueDays = Math.max(0, Math.floor(diffMs / 86400000));
  return {
    overdueDays,
    amount: overdueDays * ratePerDay,
    isOverdue: overdueDays > 0,
  };
}
