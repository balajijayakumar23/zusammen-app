export function getNextBirthday(dob: Date): Date {
  const today = new Date();
  const next = new Date(today.getFullYear(), dob.getMonth(), dob.getDate());
  if (next < today) next.setFullYear(today.getFullYear() + 1);
  return next;
}

export function getDaysUntil(date: Date): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(date);
  target.setHours(0, 0, 0, 0);
  return Math.round((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
}

export function getAgeTheyTurn(dob: Date, nextBirthday: Date): number {
  return nextBirthday.getFullYear() - dob.getFullYear();
}

export function monthName(month: number): string {
  return new Date(2000, month, 1).toLocaleString("en-US", { month: "long" });
}
